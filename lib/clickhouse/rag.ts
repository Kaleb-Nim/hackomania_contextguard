import clickhouseClient from "../clickhouse";

export interface RagSource {
    url: string;
    title: string;
    content: string;
    domain: string;
    score: number;
    topics: string[];
    credibility_score: number;
}

/**
 * Perform vector similarity search against the article_embeddings table.
 * Returns the top-K most similar articles by cosine distance.
 */
export async function searchByEmbedding(
    embedding: number[],
    limit: number = 10,
    maxDistance: number = 0.5
): Promise<RagSource[]> {
    try {
        const embeddingStr = `[${embedding.join(",")}]`;

        const result = await clickhouseClient.query({
            query: `
        SELECT
          title, url, content, domain, topics, credibility_score,
          cosineDistance(embedding, ${embeddingStr}) AS score
        FROM article_embeddings
        WHERE length(embedding) > 0
        ORDER BY score ASC
        LIMIT {limit:UInt32}
      `,
            query_params: { limit },
            format: "JSONEachRow",
        });

        const rows = await result.json<RagSource>();
        return rows.filter((r) => r.score <= maxDistance);
    } catch (error) {
        console.error("ClickHouse RAG search error:", error);
        return [];
    }
}

/**
 * Hybrid search: combines topic-based SQL filtering with vector similarity.
 * Articles that match ANY of the given topics are boosted (searched first),
 * then we fall back to pure vector search for the remainder.
 */
export async function searchByTopicsAndEmbedding(
    embedding: number[],
    topics: string[],
    limit: number = 15,
    maxDistance: number = 0.5
): Promise<RagSource[]> {
    try {
        const embeddingStr = `[${embedding.join(",")}]`;

        // Phase 1: Topic-filtered vector search (structured + semantic)
        const topicResult = await clickhouseClient.query({
            query: `
        SELECT
          title, url, content, domain, topics, credibility_score,
          cosineDistance(embedding, ${embeddingStr}) AS score
        FROM article_embeddings
        WHERE length(embedding) > 0
          AND hasAny(topics, {topics:Array(String)})
        ORDER BY score ASC
        LIMIT {limit:UInt32}
      `,
            query_params: { topics, limit },
            format: "JSONEachRow",
        });

        const topicRows = await topicResult.json<RagSource>();
        const seenUrls = new Set(topicRows.map((r) => r.url));

        // Phase 2: Pure vector search for additional results not in Phase 1
        const remaining = limit - topicRows.length;
        let vectorRows: RagSource[] = [];
        if (remaining > 0) {
            const vectorResult = await clickhouseClient.query({
                query: `
          SELECT
            title, url, content, domain, topics, credibility_score,
            cosineDistance(embedding, ${embeddingStr}) AS score
          FROM article_embeddings
          WHERE length(embedding) > 0
          ORDER BY score ASC
          LIMIT {limit:UInt32}
        `,
                query_params: { limit: remaining + topicRows.length },
                format: "JSONEachRow",
            });

            vectorRows = (await vectorResult.json<RagSource>()).filter(
                (r) => !seenUrls.has(r.url)
            );
        }

        // Merge: topic-matched results first (they're more relevant), then vector
        const merged = [...topicRows, ...vectorRows.slice(0, remaining)];
        return merged.filter((r) => r.score <= maxDistance);
    } catch (error) {
        console.error("ClickHouse hybrid RAG search error:", error);
        // Fall back to pure vector search
        return searchByEmbedding(embedding, limit, maxDistance);
    }
}
