import { NextResponse } from "next/server";
import { extractTopics } from "@/lib/ai/extract-topics";
import { searchHistoricalSources } from "@/lib/scraper/search";
import { analyzeAndPredict } from "@/lib/ai/analyze-and-predict";
import { DEMO_SCENARIO, DEMO_SOURCES } from "@/data/demo-scenario";
import type { AnalyzeResponse } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const { text } = (await request.json()) as { text: string };

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Announcement text is required" },
        { status: 400 }
      );
    }

    // Step 1: Extract topics and search queries
    const topics = await extractTopics(text);

    // Step 2: Search historical sources
    const sources = await searchHistoricalSources(topics.searchQueries);

    // Step 3: Analyze and generate predictions
    const result = await analyzeAndPredict(text, sources, topics);

    // Build deduplicated source list for the animation
    const seenUrls = new Set<string>();
    const allSources: { label: string; url: string }[] = [];
    for (const prediction of result.predictions) {
      for (const s of prediction.sources) {
        if (!seenUrls.has(s.url)) {
          seenUrls.add(s.url);
          allSources.push(s);
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

    return NextResponse.json(response);
  } catch (error) {
    console.error("Analyze API error:", error);

    // Fallback to demo data
    const fallback: AnalyzeResponse = {
      predictions: DEMO_SCENARIO.predictions,
      historicalPatterns: DEMO_SCENARIO.historicalPatterns,
      communityLeadersCount: DEMO_SCENARIO.communityLeadersCount,
      constituencies: DEMO_SCENARIO.constituencies,
      sources: DEMO_SOURCES,
      fallback: true,
    };

    return NextResponse.json(fallback);
  }
}
