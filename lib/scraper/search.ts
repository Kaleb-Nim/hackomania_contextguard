import { getFirecrawl } from "./firecrawl-client";
import { embedText } from "../ai/embedding";
import { searchByTopicsAndEmbedding } from "../clickhouse/rag";
import type { RagSource } from "../clickhouse/rag";
import type { ScrapedSource } from "../types";

const DOMAINS = [
  "site:pofmaoffice.gov.sg",
  "site:channelnewsasia.com",
  "site:moh.gov.sg",
];

const MAX_CONTENT_LENGTH = 2000;
const MAX_TOTAL_SOURCES = 15;

export async function searchHistoricalSources(
  queries: string[],
  onSource?: (source: ScrapedSource) => void
): Promise<ScrapedSource[]> {
  const sources: ScrapedSource[] = [];
  const seenUrls = new Set<string>();
  let stopSearch = false;

  const allPromises = [];
  for (const query of queries) {
    for (const domain of DOMAINS) {
      if (stopSearch) break;
      const p = searchSingle(`${query} ${domain}`).then((result) => {
        if (stopSearch) return [];
        for (const source of result) {
          if (seenUrls.has(source.url)) continue;
          seenUrls.add(source.url);
          sources.push(source);
          onSource?.(source);
          if (sources.length >= MAX_TOTAL_SOURCES) {
            stopSearch = true;
            break;
          }
        }
        return result;
      }).catch((err) => {
        console.error("Search single error:", err);
        return [];
      });
      allPromises.push(p);
    }
  }

  // Wait for all initiated searches to complete
  await Promise.allSettled(allPromises);

  return sources;
}

async function searchSingle(query: string): Promise<ScrapedSource[]> {
  try {
    const result = await getFirecrawl().search(query, { limit: 3 });

    if (!result || !result.web || result.web.length === 0) return [];

    return result.web
      .filter(
        (item): item is { url: string; title?: string; description?: string } =>
          "url" in item && typeof (item as { url?: string }).url === "string"
      )
      .map((item) => ({
        url: item.url,
        title: item.title ?? item.url,
        content: (item.description ?? "").slice(0, MAX_CONTENT_LENGTH),
        domain: new URL(item.url).hostname,
      }));
  } catch {
    return [];
  }
}

/**
 * Search for similar articles in ClickHouse using hybrid search
 * (topic filtering + vector similarity). Returns enriched RagSource
 * objects with credibility scores and topic metadata.
 */
export async function searchClickHouseRAG(
  text: string,
  topics: string[],
  onSource?: (source: ScrapedSource) => void
): Promise<RagSource[]> {
  try {
    const embedding = await embedText(text);
    const ragResults = await searchByTopicsAndEmbedding(embedding, topics, 15);

    // Stream each as a ScrapedSource for the UI
    for (const r of ragResults) {
      onSource?.({
        url: r.url,
        title: r.title,
        content: r.content.slice(0, MAX_CONTENT_LENGTH),
        domain: r.domain,
      });
    }

    return ragResults;
  } catch (error) {
    console.error("ClickHouse RAG search error:", error);
    return [];
  }
}


