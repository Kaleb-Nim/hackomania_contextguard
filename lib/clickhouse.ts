import { createClient } from "@clickhouse/client";

const clickhouseClient = createClient({
  url: process.env.CLICKHOUSE_HOST ?? "http://localhost:8123",
  username: process.env.CLICKHOUSE_USER ?? "default",
  password: process.env.CLICKHOUSE_PASSWORD ?? "",
  database: process.env.CLICKHOUSE_DB ?? "default",
  request_timeout: 60_000,
  keep_alive: { enabled: true },
});

export default clickhouseClient;

/**
 * Ensures the article_embeddings table exists in ClickHouse.
 * Safe to call multiple times (IF NOT EXISTS).
 */
export async function ensureTable(): Promise<void> {
  await clickhouseClient.command({
    query: `
      CREATE TABLE IF NOT EXISTS article_embeddings (
        id          UUID DEFAULT generateUUIDv4(),
        url         String,
        title       String,
        content     String,
        domain      String,
        scraped_at  DateTime DEFAULT now(),
        topics      Array(String),
        credibility_score Float32 DEFAULT 0.5,
        embedding   Array(Float32)
      )
      ENGINE = MergeTree()
      ORDER BY scraped_at
    `,
  });
}
