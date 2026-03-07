import { firecrawl } from "./firecrawl-client";
import type { ScrapedSource } from "../types";

const DOMAINS = [
  "site:pofmaoffice.gov.sg",
  "site:channelnewsasia.com",
  "site:moh.gov.sg",
];

const MAX_CONTENT_LENGTH = 2000;
const MAX_TOTAL_SOURCES = 15;

export async function searchHistoricalSources(
  queries: string[]
): Promise<ScrapedSource[]> {
  const allPromises: Promise<ScrapedSource[]>[] = [];

  for (const query of queries) {
    for (const domain of DOMAINS) {
      allPromises.push(searchSingle(`${query} ${domain}`));
    }
  }

  const results = await Promise.allSettled(allPromises);
  const sources: ScrapedSource[] = [];
  const seenUrls = new Set<string>();

  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    for (const source of result.value) {
      if (seenUrls.has(source.url)) continue;
      seenUrls.add(source.url);
      sources.push(source);
      if (sources.length >= MAX_TOTAL_SOURCES) return sources;
    }
  }

  return sources;
}

async function searchSingle(query: string): Promise<ScrapedSource[]> {
  try {
    const result = await firecrawl.search(query, { limit: 3 });

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
