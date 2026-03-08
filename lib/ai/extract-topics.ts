import { anthropic, genAI } from "./client";
import { SchemaType } from "@google/generative-ai";
import type { TopicExtraction } from "../types";

const EXTRACT_PROMPT = `You are an expert analyst for Singapore's government misinformation response team. Given the following official announcement, extract:

1. **topics**: Key topics/themes (e.g., "COVID-19", "DORSCON", "panic buying")
2. **affectedCommunities**: Language/ethnic communities likely affected (e.g., "Mandarin-speaking elderly", "Malay community", "Tamil-speaking workers")
3. **emotionalTriggers**: Emotional triggers that could fuel rumours (e.g., "supply scarcity anxiety", "institutional distrust")
4. **searchQueries**: 3-5 search queries optimized for finding historically similar misinformation events on Singapore government and news sites (POFMA, CNA, MOH). Make queries specific and include terms like "POFMA", "correction", "false", "misinformation", or "fact check".

Respond ONLY with valid JSON matching this exact schema:
{
  "topics": [string],
  "affectedCommunities": [string],
  "emotionalTriggers": [string],
  "searchQueries": [string]
}`;

export async function extractTopics(text: string): Promise<TopicExtraction> {
  // Primary: Anthropic
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `${EXTRACT_PROMPT}\n\nAnnouncement:\n${text}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type === "text") {
      return JSON.parse(content.text) as TopicExtraction;
    }
  } catch (error) {
    console.error("Anthropic extractTopics failed, falling back to Gemini:", error);
  }

  // Fallback: Gemini
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          topics: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          affectedCommunities: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          emotionalTriggers: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
          searchQueries: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
        },
        required: ["topics", "affectedCommunities", "emotionalTriggers", "searchQueries"],
      },
    },
  });

  const result = await model.generateContent(
    `You are an expert analyst for Singapore's government misinformation response team. Given the following official announcement, extract:

1. **topics**: Key topics/themes (e.g., "COVID-19", "DORSCON", "panic buying")
2. **affectedCommunities**: Language/ethnic communities likely affected (e.g., "Mandarin-speaking elderly", "Malay community", "Tamil-speaking workers")
3. **emotionalTriggers**: Emotional triggers that could fuel rumours (e.g., "supply scarcity anxiety", "institutional distrust")
4. **searchQueries**: 3-5 search queries optimized for finding historically similar misinformation events on Singapore government and news sites (POFMA, CNA, MOH). Make queries specific and include terms like "POFMA", "correction", "false", "misinformation", or "fact check".

Announcement:
${text}`
  );

  return JSON.parse(result.response.text()) as TopicExtraction;
}
