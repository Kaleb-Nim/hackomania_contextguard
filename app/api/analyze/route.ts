import { extractTopics } from "@/lib/ai/extract-topics";
import { searchHistoricalSources, searchClickHouseRAG } from "@/lib/scraper/search";
import { analyzeAndPredict } from "@/lib/ai/analyze-and-predict";
import { DEMO_SCENARIO, DEMO_SOURCES } from "@/data/demo-scenario";
import type { AnalyzeResponse } from "@/lib/types";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: Request) {
  const { text } = (await request.json()) as { text: string };

  if (!text || text.trim().length === 0) {
    return NextResponse.json(
      { error: "Announcement text is required" },
      { status: 400 }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      function send(event: string, data: unknown) {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      }

      try {
        // Step 1: Extract topics
        send("step", { id: "topics", status: "running" });
        const topics = await extractTopics(text);
        send("step", { id: "topics", status: "done" });

        // Step 2: Search sources — Firecrawl + ClickHouse RAG in parallel
        send("step", { id: "sources", status: "running" });

        const seenUrls = new Set<string>();
        const onSource = (source: { title: string; url: string; domain: string }) => {
          if (!seenUrls.has(source.url)) {
            seenUrls.add(source.url);
            send("source", { label: source.title, url: source.url, domain: source.domain });
          }
        };

        const [firecrawlSources, ragSources] = await Promise.all([
          searchHistoricalSources(topics.searchQueries, onSource),
          searchClickHouseRAG(text, topics.topics, onSource),
        ]);

        // Deduplicate Firecrawl sources (RAG sources stay separate for the LLM)
        const mergedUrls = new Set<string>(ragSources.map(r => r.url));
        const dedupedFirecrawl = firecrawlSources.filter((s) => {
          if (mergedUrls.has(s.url)) return false;
          mergedUrls.add(s.url);
          return true;
        });

        send("step", { id: "sources", status: "done" });

        // Step 3: Analyze and predict — pass RAG and live sources separately
        send("step", { id: "analyze", status: "running" });
        const result = await analyzeAndPredict(text, dedupedFirecrawl, ragSources, topics);
        send("step", { id: "analyze", status: "done" });

        // Build deduplicated source list from predictions
        const dedupUrls = new Set<string>();
        const allSources: { label: string; url: string }[] = [];
        // Include any Firecrawl + RAG sources already streamed
        for (const s of [...dedupedFirecrawl, ...ragSources]) {
          if (!dedupUrls.has(s.url)) {
            dedupUrls.add(s.url);
            allSources.push({ label: s.title, url: s.url });
          }
        }
        // Add prediction sources and stream any new ones
        for (const prediction of result.predictions) {
          for (const s of prediction.sources) {
            if (!dedupUrls.has(s.url)) {
              dedupUrls.add(s.url);
              allSources.push(s);
              send("source", { label: s.label, url: s.url, domain: new URL(s.url).hostname });
            }
          }
        }

        const response: AnalyzeResponse = {
          predictions: result.predictions,
          historicalPatterns: result.historicalPatterns,
          communityLeadersCount: result.communityLeadersCount,
          constituencies: result.constituencies,
          sources: allSources,
        };

        send("result", response);
      } catch (error) {
        console.error("Analyze API error:", error);

        const fallback: AnalyzeResponse = {
          predictions: DEMO_SCENARIO.predictions,
          historicalPatterns: DEMO_SCENARIO.historicalPatterns,
          communityLeadersCount: DEMO_SCENARIO.communityLeadersCount,
          constituencies: DEMO_SCENARIO.constituencies,
          sources: DEMO_SOURCES,
          fallback: true,
        };

        send("result", fallback);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
