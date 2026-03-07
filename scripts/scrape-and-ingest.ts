/**
 * Live web scraper: Scrapes HardwareZone forums, Singapore subreddits,
 * and news articles about misinformation, then embeds and inserts into ClickHouse.
 *
 * Usage:  npx tsx scripts/scrape-and-ingest.ts
 */

import "dotenv/config";
import FirecrawlApp from "@mendable/firecrawl-js";
import clickhouseClient, { ensureTable } from "../lib/clickhouse";
import { embedText } from "../lib/ai/embedding";

// ─── Configuration ───────────────────────────────────────────────

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY ?? "";

const MAX_CONTENT_LENGTH = 3000;

// Delay between Firecrawl API calls to respect rate limits
const API_DELAY_MS = 1500;

// ─── Data Sources ────────────────────────────────────────────────

/** Firecrawl search queries — each targets a specific source + topic */
const SEARCH_QUERIES = [
    // HardwareZone EDMW — Singapore's most active forum
    "site:hardwarezone.com.sg misinformation rumour Singapore",
    "site:hardwarezone.com.sg POFMA fake news correction",
    "site:hardwarezone.com.sg COVID panic buying Singapore",
    "site:hardwarezone.com.sg vaccine misinformation Singapore",
    "site:hardwarezone.com.sg government conspiracy Singapore",

    // Reddit r/singapore
    "site:reddit.com/r/singapore misinformation fake news",
    "site:reddit.com/r/singapore POFMA correction direction",
    "site:reddit.com/r/singapore COVID rumour panic",
    "site:reddit.com/r/singapore scam hoax viral",

    // CNA / Straits Times — news about misinfo
    "site:channelnewsasia.com POFMA misinformation Singapore",
    "site:channelnewsasia.com fake news correction Singapore",
    "site:channelnewsasia.com COVID misinformation Singapore",

    // Straits Times
    "site:straitstimes.com POFMA correction direction Singapore",
    "site:straitstimes.com misinformation fake news Singapore",

    // Mothership — popular SG news
    "site:mothership.sg POFMA fake news",
    "site:mothership.sg misinformation rumour viral",

    // POFMA Office
    "site:pofmaoffice.gov.sg correction direction",

    // TODAY Online
    "site:todayonline.com misinformation Singapore POFMA",
    "site:todayonline.com fake news viral Singapore",
];

/** Direct URLs to scrape — high-value pages with known misinfo context */
const DIRECT_URLS = [
    // POFMA correction cases
    "https://www.pofmaoffice.gov.sg/regulations/protection-from-online-falsehoods-and-manipulation-act/",
    // HardwareZone EDMW forum threads on misinfo (popular threads)
    "https://forums.hardwarezone.com.sg/forums/eat-drink-man-woman.16/",
];

// ─── Helpers ─────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

function extractDomain(url: string): string {
    try {
        return new URL(url).hostname;
    } catch {
        return "unknown";
    }
}

function classifyCredibility(domain: string): number {
    // Government / official sources: high credibility
    if (
        domain.endsWith(".gov.sg") ||
        domain.includes("channelnewsasia") ||
        domain.includes("straitstimes")
    ) {
        return 0.9;
    }
    // Established SG media
    if (
        domain.includes("mothership.sg") ||
        domain.includes("todayonline")
    ) {
        return 0.8;
    }
    // Forums / Reddit — community content (lower baseline, but useful for RAG)
    if (
        domain.includes("hardwarezone") ||
        domain.includes("reddit.com")
    ) {
        return 0.4;
    }
    return 0.5;
}

function extractTopicsFromContent(
    title: string,
    content: string
): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const topicKeywords: Record<string, string[]> = {
        "COVID-19": ["covid", "coronavirus", "pandemic", "dorscon", "circuit breaker"],
        "POFMA": ["pofma", "correction direction", "online falsehood"],
        "Fake News": ["fake news", "misinformation", "disinformation", "false claim"],
        "Panic Buying": ["panic buy", "hoard", "shortage", "empty shelves"],
        "Vaccination": ["vaccine", "vaccination", "anti-vax", "mrna", "booster"],
        "Racial Harmony": ["racial", "xenophob", "racism", "ethnic"],
        "Migrant Workers": ["migrant worker", "dormitor", "foreign worker"],
        "Elections": ["election", "ge2020", "ge2025", "voting", "political"],
        "Scams": ["scam", "phishing", "fraud", "hoax"],
        "Health Misinformation": ["fake cure", "unproven remed", "traditional medicine", "herbal"],
        "WhatsApp Rumours": ["whatsapp", "forwarded message", "voice note", "viral message"],
        "Social Media": ["twitter", "facebook", "telegram", "tiktok", "instagram"],
    };

    const matched: string[] = [];
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
        if (keywords.some((kw) => text.includes(kw))) {
            matched.push(topic);
        }
    }
    return matched.length > 0 ? matched : ["Singapore", "General"];
}

// ─── Scrape via Firecrawl Search ─────────────────────────────────

interface ScrapedArticle {
    url: string;
    title: string;
    content: string;
    domain: string;
    topics: string[];
    credibility_score: number;
}

async function scrapeViaSearch(
    firecrawl: FirecrawlApp
): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];
    const seenUrls = new Set<string>();

    console.log(
        `\n🔍 Running ${SEARCH_QUERIES.length} search queries via Firecrawl...\n`
    );

    for (const query of SEARCH_QUERIES) {
        console.log(`  🔎 "${query}"`);

        try {
            const result = await firecrawl.search(query, { limit: 5 });

            if (!result?.web?.length) {
                console.log(`     → No results`);
                continue;
            }

            let added = 0;
            for (const item of result.web) {
                const url = (item as { url?: string }).url;
                const title = (item as { title?: string }).title;
                const description = (item as { description?: string }).description;

                if (!url || seenUrls.has(url)) continue;
                seenUrls.add(url);

                const domain = extractDomain(url);
                const content = (description ?? "").slice(0, MAX_CONTENT_LENGTH);
                if (content.length < 50) continue; // skip empty results

                articles.push({
                    url,
                    title: title ?? url,
                    content,
                    domain,
                    topics: extractTopicsFromContent(title ?? "", content),
                    credibility_score: classifyCredibility(domain),
                });
                added++;
            }

            console.log(`     → ${added} new articles`);
        } catch (err) {
            console.error(`     → Error: ${err}`);
        }

        await sleep(API_DELAY_MS);
    }

    return articles;
}

// ─── Scrape Direct URLs ──────────────────────────────────────────

async function scrapeDirectUrls(
    firecrawl: FirecrawlApp
): Promise<ScrapedArticle[]> {
    const articles: ScrapedArticle[] = [];

    console.log(
        `\n🌐 Scraping ${DIRECT_URLS.length} direct URLs via Firecrawl...\n`
    );

    for (const url of DIRECT_URLS) {
        console.log(`  🔗 ${url}`);
        try {
            const result = await firecrawl.scrape(url, {
                formats: ["markdown"],
            });

            if (!result?.markdown) {
                console.log(`     → No content extracted`);
                continue;
            }

            const domain = extractDomain(url);
            const content = result.markdown.slice(0, MAX_CONTENT_LENGTH);
            const title =
                (result as { metadata?: { title?: string } }).metadata?.title ??
                url;

            articles.push({
                url,
                title,
                content,
                domain,
                topics: extractTopicsFromContent(title, content),
                credibility_score: classifyCredibility(domain),
            });

            console.log(`     → ✅ ${content.length} chars`);
        } catch (err) {
            console.error(`     → Error: ${err}`);
        }

        await sleep(API_DELAY_MS);
    }

    return articles;
}

// ─── Embed & Insert into ClickHouse ──────────────────────────────

async function embedAndInsert(articles: ScrapedArticle[]): Promise<void> {
    console.log(`\n📦 Embedding and inserting ${articles.length} articles...\n`);

    let success = 0;
    let failed = 0;

    for (const article of articles) {
        try {
            const textToEmbed = `${article.title}\n\n${article.content}`;
            const embedding = await embedText(textToEmbed);

            await clickhouseClient.insert({
                table: "article_embeddings",
                values: [
                    {
                        url: article.url,
                        title: article.title,
                        content: article.content,
                        domain: article.domain,
                        topics: article.topics,
                        credibility_score: article.credibility_score,
                        embedding,
                    },
                ],
                format: "JSONEachRow",
            });

            success++;
            console.log(
                `  ✅ [${success}/${articles.length}] ${article.title.slice(0, 60)}...`
            );
        } catch (err) {
            failed++;
            console.error(
                `  ❌ [${success + failed}/${articles.length}] ${article.title.slice(0, 40)}: ${err}`
            );
        }

        // Small delay to avoid overwhelming Gemini embedding API
        await sleep(500);
    }

    console.log(`\n📊 Results: ${success} inserted, ${failed} failed`);
}

// ─── Verification Query ──────────────────────────────────────────

async function verifyIngestion(): Promise<void> {
    console.log("\n🔍 Running verification queries...\n");

    // Count total rows
    const countResult = await clickhouseClient.query({
        query: "SELECT count() AS total FROM article_embeddings",
        format: "JSONEachRow",
    });
    const [{ total }] = await countResult.json<{ total: string }>();
    console.log(`  📈 Total articles in ClickHouse: ${total}`);

    // Domain breakdown
    const domainResult = await clickhouseClient.query({
        query: `SELECT domain, count() AS cnt
            FROM article_embeddings
            GROUP BY domain
            ORDER BY cnt DESC
            LIMIT 10`,
        format: "JSONEachRow",
    });
    const domains = await domainResult.json<{
        domain: string;
        cnt: string;
    }>();
    console.log("\n  📊 Articles by domain:");
    for (const d of domains) {
        console.log(`     ${d.cnt.toString().padStart(4)} — ${d.domain}`);
    }

    // Semantic search test
    const testEmbedding = await embedText(
        "COVID-19 panic buying supermarket shortage Singapore WhatsApp rumour"
    );
    const embStr = `[${testEmbedding.join(",")}]`;

    const searchResult = await clickhouseClient.query({
        query: `
      SELECT title, domain, cosineDistance(embedding, ${embStr}) AS score
      FROM article_embeddings
      WHERE length(embedding) > 0
      ORDER BY score ASC
      LIMIT 5
    `,
        format: "JSONEachRow",
    });
    const rows = await searchResult.json<{
        title: string;
        domain: string;
        score: number;
    }>();

    console.log("\n  🎯 Top 5 RAG results for 'COVID panic buying rumour':");
    for (const row of rows) {
        console.log(
            `     ${row.score.toFixed(4)} — ${row.title.slice(0, 70)} (${row.domain})`
        );
    }
}

// ─── Main ────────────────────────────────────────────────────────

async function main() {
    console.log("═══════════════════════════════════════════════════════");
    console.log("  ContextGuard — Web Forum & News Scraper + Ingestion ");
    console.log("═══════════════════════════════════════════════════════\n");

    // 1. Ensure table
    console.log("🔧 Ensuring ClickHouse table exists...");
    await ensureTable();
    console.log("✅ Table ready.");

    // 2. Initialize Firecrawl
    const firecrawl = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });

    // 3. Scrape from search queries
    const searchArticles = await scrapeViaSearch(firecrawl);

    // 4. Scrape direct URLs
    const directArticles = await scrapeDirectUrls(firecrawl);

    // 5. Combine all articles
    const allArticles = [...searchArticles, ...directArticles];
    console.log(`\n📋 Total scraped: ${allArticles.length} unique articles`);

    if (allArticles.length === 0) {
        console.log("⚠️  No articles scraped. Exiting.");
        process.exit(0);
    }

    // 6. Embed and insert
    await embedAndInsert(allArticles);

    // 7. Verify
    await verifyIngestion();

    console.log("\n✅ Scrape and ingestion complete!");
    process.exit(0);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
