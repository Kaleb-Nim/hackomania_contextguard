import { anthropic } from "./client";
import type { TopicExtraction } from "../types";

export async function extractTopics(text: string): Promise<TopicExtraction> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an expert analyst for Singapore's government misinformation response team. Given the following official announcement, extract:

1. **topics**: Key topics/themes (e.g., "COVID-19", "DORSCON", "panic buying")
2. **affectedCommunities**: Language/ethnic communities likely affected (e.g., "Mandarin-speaking elderly", "Malay community", "Tamil-speaking workers")
3. **emotionalTriggers**: Emotional triggers that could fuel rumours (e.g., "supply scarcity anxiety", "institutional distrust")
4. **searchQueries**: 3-5 search queries optimized for finding historically similar misinformation events on Singapore government and news sites (POFMA, CNA, MOH). Make queries specific and include terms like "POFMA", "correction", "false", "misinformation", or "fact check".

Respond ONLY with valid JSON matching this schema:
{
  "topics": string[],
  "affectedCommunities": string[],
  "emotionalTriggers": string[],
  "searchQueries": string[]
}

Announcement:
${text}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type");
  }

  return JSON.parse(content.text) as TopicExtraction;
}
