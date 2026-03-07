import { genAI } from "./client";
import type {
  ScrapedSource,
  TopicExtraction,
  RumourPrediction,
  HistoricalPattern,
} from "../types";

interface AnalysisResult {
  predictions: RumourPrediction[];
  historicalPatterns: HistoricalPattern[];
  communityLeadersCount: number;
  constituencies: number;
}

export async function analyzeAndPredict(
  text: string,
  sources: ScrapedSource[],
  topics: TopicExtraction
): Promise<AnalysisResult> {
  const sourcesContext =
    sources.length > 0
      ? sources
          .map(
            (s, i) =>
              `[Source ${i + 1}] ${s.title}\nURL: ${s.url}\nDomain: ${s.domain}\n${s.content}\n`
          )
          .join("\n---\n")
      : "No historical sources were retrieved. Use your knowledge of Singapore's misinformation landscape to generate predictions.";

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await model.generateContent(
    `You are ContextGuard, Singapore's rumour pre-mortem prediction engine. Given an official government announcement and historical misinformation sources, predict the false narratives that will likely emerge.

## Announcement
${text}

## Extracted Context
- Topics: ${topics.topics.join(", ")}
- Affected Communities: ${topics.affectedCommunities.join(", ")}
- Emotional Triggers: ${topics.emotionalTriggers.join(", ")}

## Historical Sources
${sourcesContext}

## Instructions
Generate a JSON response with:

1. **historicalPatterns**: 3-5 historically similar events with similarity scores (0-100). Base these on the scraped sources and Singapore's misinformation history.

2. **predictions**: 3-5 predicted false narratives, each with:
   - id: sequential number starting at 1
   - risk: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
   - riskScore: 0-100
   - title: concise rumour title
   - channel: likely spread channel (e.g., "Mandarin WhatsApp groups", "English Twitter/X")
   - trigger: emotional trigger driving the rumour
   - historicalMatch: specific historical precedent with date
   - timeToSpread: estimated time (e.g., "~4-6 hours")
   - demographicRisk: most vulnerable demographic
   - counterNarratives: object with keys "en", "zh", "ms", "ta" — each a 2-3 sentence counter-narrative in that language
   - sources: array of {label, url} — use real URLs from the scraped sources when available, or well-known Singapore government URLs
   - policyRecommendations: array of 1-2 specific policy actions

3. **communityLeadersCount**: estimated number of community leaders to alert (500-2000 range, contextually appropriate)
4. **constituencies**: estimated number of affected constituencies (10-30 range)

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
