import { getFirecrawl } from "./firecrawl-client";
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

  const allPromises: Promise<ScrapedSource[]>[] = [];
  for (const query of queries) {
    for (const domain of DOMAINS) {
      allPromises.push(searchSingle(`${query} ${domain}`));
    }
  }

  // Process each search as it resolves to stream sources in real time
  const pending = allPromises.map((p, i) =>
    p.then((result) => ({ index: i, result })).catch(() => ({ index: i, result: [] as ScrapedSource[] }))
  );

  for (const promise of pending) {
    const { result } = await promise;
    for (const source of result) {
      if (seenUrls.has(source.url)) continue;
      seenUrls.add(source.url);
      sources.push(source);
      onSource?.(source);
      if (sources.length >= MAX_TOTAL_SOURCES) return sources;
    }
  }

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
