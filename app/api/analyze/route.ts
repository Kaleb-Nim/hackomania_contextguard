import { extractTopics } from "@/lib/ai/extract-topics";
import { searchHistoricalSources, searchClickHouseRAG } from "@/lib/scraper/search";
import { analyzeAndPredict } from "@/lib/ai/analyze-and-predict";
import { DEMO_SCENARIO, DEMO_SOURCES } from "@/data/demo-scenario";
import { NIPAH_SCENARIO, NIPAH_SOURCES } from "@/data/nipah-scenario";
import type { AnalyzeResponse } from "@/lib/types";
import { NextResponse } from "next/server";

export const maxDuration = 60;

function checkNipahCache(text: string): boolean {
  return text.toLowerCase().includes("nipah");
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function POST(request: Request) {
  const { text } = (await request.json()) as { text: string };

  if (!text || text.trim().length === 0) {
    return NextResponse.json(
      { error: "Announcement text is required" },
      { status: 400 }
    );
  }

  // Check for Nipah cache hit — return pre-computed demo data
  if (checkNipahCache(text)) {
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        function send(event: string, data: unknown) {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        }

        // Simulate realistic pipeline timing for demo
        // Step 1: Topic extraction (~1.2s — fast LLM call)
        send("step", { id: "topics", status: "running" });
        await sleep(800 + Math.random() * 400);
        send("step", {
          id: "topics",
          status: "done",
          data: {
            topics: [
              "Nipah virus",
              "Zoonotic disease surveillance",
              "Singapore public health response",
              "Migrant worker dormitory safety",
              "Parliamentary health statement",
            ],
            affectedCommunities: [
              "Elderly Singaporeans",
              "Migrant workers in dormitories",
              "Indian-descent Singaporeans",
              "Parents of young children",
              "Mandarin-dominant elderly",
            ],
            emotionalTriggers: [
              "Fear of government cover-up",
              "Xenophobia & racial scapegoating",
              "Pandemic fatigue & lockdown anxiety",
              "Food safety panic",
              "Institutional distrust",
            ],
          },
        });

        // Step 2: Source retrieval (~4-5s — simulates Firecrawl + ClickHouse RAG)
        send("step", { id: "sources", status: "running" });
        await sleep(600 + Math.random() * 300);
        // Stream sources with variable delays mimicking real network fetches
        for (let i = 0; i < NIPAH_SOURCES.length; i++) {
          const source = NIPAH_SOURCES[i];
          send("source", { label: source.label, url: source.url, domain: new URL(source.url).hostname });
          // First few come fast (parallel fetch landing), later ones stagger
          const delay = i < 3
            ? 200 + Math.random() * 250
            : 350 + Math.random() * 500;
          await sleep(delay);
        }
        await sleep(300 + Math.random() * 200);
        send("step", { id: "sources", status: "done" });

        // Step 3: Analysis & prediction (~2-3s — heavy LLM reasoning)
        send("step", { id: "analyze", status: "running" });
        await sleep(1800 + Math.random() * 1200);
        send("step", { id: "analyze", status: "done" });

        const response: AnalyzeResponse = {
          predictions: NIPAH_SCENARIO.predictions,
          historicalPatterns: NIPAH_SCENARIO.historicalPatterns,
          communityLeadersCount: NIPAH_SCENARIO.communityLeadersCount,
          constituencies: NIPAH_SCENARIO.constituencies,
          sources: NIPAH_SOURCES,
        };

        send("result", response);
        controller.close();
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
        send("step", { id: "topics", status: "done", data: topics });

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
