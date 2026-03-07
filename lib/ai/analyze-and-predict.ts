import { genAI } from "./client";
import type {
  ScrapedSource,
  TopicExtraction,
  RumourPrediction,
  HistoricalPattern,
  RagSource,
} from "../types";

interface AnalysisResult {
  predictions: RumourPrediction[];
  historicalPatterns: HistoricalPattern[];
  communityLeadersCount: number;
  constituencies: number;
}

/**
 * Format RAG sources with credibility and topic metadata so the LLM
 * can weigh them appropriately.
 */
function formatRagContext(ragSources: RagSource[]): string {
  if (ragSources.length === 0) return "No historical RAG sources available.";

  return ragSources
    .map((s, i) => {
      const credLabel =
        s.credibility_score >= 0.9
          ? "HIGH (Official/Govt)"
          : s.credibility_score >= 0.7
            ? "MEDIUM (Established Media)"
            : "LOW (Community/Forum)";

      return [
        `[RAG ${i + 1}] ${s.title}`,
        `URL: ${s.url}`,
        `Domain: ${s.domain} | Credibility: ${credLabel} (${s.credibility_score})`,
        `Topics: ${s.topics.join(", ")}`,
        `Similarity: ${(1 - s.score).toFixed(2)} (cosine)`,
        s.content,
      ].join("\n");
    })
    .join("\n---\n");
}

function formatLiveContext(sources: ScrapedSource[]): string {
  if (sources.length === 0) return "No live web sources retrieved.";

  return sources
    .map(
      (s, i) =>
        `[Live ${i + 1}] ${s.title}\nURL: ${s.url}\nDomain: ${s.domain}\n${s.content}`
    )
    .join("\n---\n");
}

export async function analyzeAndPredict(
  text: string,
  liveSources: ScrapedSource[],
  ragSources: RagSource[],
  topics: TopicExtraction
): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(
    `You are ContextGuard, Singapore's rumour pre-mortem prediction engine. Given an official government announcement, historical misinformation data from our RAG database, and live web sources, predict the false narratives that will likely emerge.

## Announcement
${text}

## Extracted Context
- Topics: ${topics.topics.join(", ")}
- Affected Communities: ${topics.affectedCommunities.join(", ")}
- Emotional Triggers: ${topics.emotionalTriggers.join(", ")}

## Historical RAG Database (${ragSources.length} sources from ClickHouse)
These are semantically similar articles from our curated database of Singapore misinformation cases (2019-2025), including POFMA corrections, forum discussions from HardwareZone & Reddit, and news articles. Each source has a credibility score and topic tags. PRIORITISE these sources for historical pattern matching — they are pre-vetted and topic-relevant.

${formatRagContext(ragSources)}

## Live Web Sources (${liveSources.length} sources from Firecrawl)
These are freshly scraped from government and news sites. Use these to supplement the RAG sources with the latest context.

${formatLiveContext(liveSources)}

## Instructions
Generate a JSON response with:

1. **historicalPatterns**: 3-5 historically similar events with similarity scores (0-100). Base these PRIMARILY on the RAG database sources above — they contain real POFMA cases, forum discussions, and news coverage of past misinformation events in Singapore. Reference specific sources by their RAG number (e.g., "Based on RAG 3...").

2. **predictions**: 3-5 predicted false narratives, each with:
   - id: sequential number starting at 1
   - risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
   - riskScore: 0-100
   - title: concise rumour title
   - channel: likely spread channel (e.g., "Mandarin WhatsApp groups", "English Twitter/X")
   - trigger: emotional trigger driving the rumour
   - historicalMatch: specific historical precedent with date — cite the RAG sources that inform this
   - timeToSpread: estimated time (e.g., "~4-6 hours")
   - demographicRisk: most vulnerable demographic
   - counterNarratives: object with keys "en", "zh", "ms", "ta" — each a 2-3 sentence counter-narrative in that language
   - sources: array of {label, url} — use real URLs from the RAG and live sources. Prefer HIGH credibility sources (gov.sg, MOH, CNA) for counter-narrative backing
   - policyRecommendations: array of 1-2 specific policy actions

3. **communityLeadersCount**: estimated number of community leaders to alert (500-2000 range, contextually appropriate)
4. **constituencies**: estimated number of affected constituencies (10-30 range)

IMPORTANT: Use the credibility scores to weight your analysis. HIGH credibility sources (gov.sg, MOH) should anchor counter-narratives. LOW credibility sources (forums, Reddit) reveal what rumours actually look like in the wild. Cross-reference both to make accurate predictions.

Order predictions by riskScore descending. Ensure counter-narratives are culturally appropriate and in natural language for each community.

Respond ONLY with valid JSON matching this exact schema:
{
  "historicalPatterns": [{"event": string, "similarity": number}],
  "predictions": [RumourPrediction],
  "communityLeadersCount": number,
  "constituencies": number
}`
  );

  return JSON.parse(result.response.text()) as AnalysisResult;
}
