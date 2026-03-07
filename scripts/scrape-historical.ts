/**
 * Historical deep scraper: Scrapes Singapore subreddits (r/singapore,
 * r/singaporeraw, r/SGExams), HardwareZone, and news sites with
 * year-specific queries to get data going back as far as possible.
 *
 * Usage:  npx tsx scripts/scrape-historical.ts
 */

import "dotenv/config";
import FirecrawlApp from "@mendable/firecrawl-js";
import clickhouseClient, { ensureTable } from "../lib/clickhouse";
import { embedText } from "../lib/ai/embedding";

// ─── Configuration ───────────────────────────────────────────────

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY ?? "";
const MAX_CONTENT_LENGTH = 3000;
const API_DELAY_MS = 1500;

// ─── Year-Specific Search Queries ────────────────────────────────
// By anchoring queries to specific years and events, search engines
// return older, more historical content rather than recent results.

const SEARCH_QUERIES = [
    // ─── Reddit r/singaporeraw ───────────────────────────────
    "site:reddit.com/r/singaporeraw POFMA fake news",
    "site:reddit.com/r/singaporeraw misinformation rumour",
    "site:reddit.com/r/singaporeraw government lie cover up",
    "site:reddit.com/r/singaporeraw COVID vaccine conspiracy",
    "site:reddit.com/r/singaporeraw scam fraud Singapore",
    "site:reddit.com/r/singaporeraw propaganda media bias",
    "site:reddit.com/r/singaporeraw WhatsApp viral forward",

    // ─── Reddit r/singapore (year-anchored) ──────────────────
    "site:reddit.com/r/singapore POFMA 2019",
    "site:reddit.com/r/singapore COVID misinformation 2020",
    "site:reddit.com/r/singapore fake news WhatsApp 2020",
    "site:reddit.com/r/singapore circuit breaker rumour 2020",
    "site:reddit.com/r/singapore POFMA correction 2021",
    "site:reddit.com/r/singapore vaccination misinformation 2021",
    "site:reddit.com/r/singapore TraceTogether privacy 2021",
    "site:reddit.com/r/singapore POFMA 2022",
    "site:reddit.com/r/singapore misinformation 2023",
    "site:reddit.com/r/singapore scam hoax 2024",
    "site:reddit.com/r/singapore fake news 2025",

    // ─── Reddit r/SGExams (student community) ────────────────
    "site:reddit.com/r/SGExams fake news misinformation",
    "site:reddit.com/r/SGExams POFMA scam",

    // ─── HardwareZone EDMW (year-anchored) ───────────────────
    "site:hardwarezone.com.sg POFMA correction 2019",
    "site:hardwarezone.com.sg COVID panic buying 2020",
    "site:hardwarezone.com.sg fake news viral 2020",
    "site:hardwarezone.com.sg vaccine rumour 2021",
    "site:hardwarezone.com.sg misinformation 2022",
    "site:hardwarezone.com.sg scam hoax 2023",
    "site:hardwarezone.com.sg fake news 2024",

    // ─── CNA (year-anchored) ─────────────────────────────────
    "site:channelnewsasia.com POFMA correction direction 2019",
    "site:channelnewsasia.com DORSCON orange misinformation 2020",
    "site:channelnewsasia.com circuit breaker fake news 2020",
    "site:channelnewsasia.com COVID vaccine misinformation 2021",
    "site:channelnewsasia.com online falsehood Singapore 2022",
    "site:channelnewsasia.com misinformation Singapore 2023",
    "site:channelnewsasia.com deepfake scam Singapore 2024",

    // ─── Straits Times (year-anchored) ───────────────────────
    "site:straitstimes.com POFMA correction 2019",
    "site:straitstimes.com panic buying hoard 2020",
    "site:straitstimes.com COVID misinformation POFMA 2020",
    "site:straitstimes.com fake news correction 2021",
    "site:straitstimes.com online falsehood Singapore 2022",
    "site:straitstimes.com misinformation deepfake 2023",
    "site:straitstimes.com election misinformation 2025",

    // ─── Mothership (year-anchored) ──────────────────────────
    "site:mothership.sg POFMA correction 2019",
    "site:mothership.sg COVID rumour viral 2020",
    "site:mothership.sg fake news Singapore 2021",
    "site:mothership.sg misinformation scam 2022",
    "site:mothership.sg POFMA 2023",

    // ─── TODAY Online ────────────────────────────────────────
    "site:todayonline.com POFMA 2019 2020",
    "site:todayonline.com misinformation fake news 2021 2022",
    "site:todayonline.com online falsehood Singapore 2023",

    // ─── POFMA Office (all cases) ────────────────────────────
    "site:pofmaoffice.gov.sg correction direction 2019",
    "site:pofmaoffice.gov.sg correction direction 2020",
    "site:pofmaoffice.gov.sg correction direction 2021",
    "site:pofmaoffice.gov.sg correction direction 2022",
    "site:pofmaoffice.gov.sg correction direction 2023",

    // ─── Specific historical events ──────────────────────────
    "Singapore DORSCON orange panic buying February 2020 misinformation",
    "Singapore circuit breaker April 2020 fake news rumour",
    "Singapore dormitory outbreak migrant workers xenophobia 2020",
    "Singapore GE2020 election POFMA misinformation",
    "Singapore COVID vaccine rollout misinformation 2021",
    "Singapore TraceTogether data controversy 2022",
    "Singapore 4G leadership misinformation 2023",
    "Singapore deepfake scam AI misinformation 2024",
    "Singapore FICA foreign interference 2021",
];

// ─── Helpers ─────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
    return new Promise((r) => setTimeout(r, ms));
}

function extractDomain(url: string): string {
    try { return new URL(url).hostname; } catch { return "unknown"; }
}

function classifyCredibility(domain: string): number {
    if (domain.endsWith(".gov.sg") || domain.includes("channelnewsasia") || domain.includes("straitstimes")) return 0.9;
    if (domain.includes("mothership.sg") || domain.includes("todayonline")) return 0.8;
    if (domain.includes("hardwarezone") || domain.includes("reddit.com")) return 0.4;
    return 0.5;
}

function extractTopics(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const topics: Record<string, string[]> = {
        "COVID-19": ["covid", "coronavirus", "pandemic", "dorscon", "circuit breaker"],
        "POFMA": ["pofma", "correction direction", "online falsehood"],
        "Fake News": ["fake news", "misinformation", "disinformation", "false claim"],
        "Panic Buying": ["panic buy", "hoard", "shortage", "empty shelves"],
        "Vaccination": ["vaccine", "vaccination", "anti-vax", "mrna", "booster"],
        "Racial Tensions": ["racial", "xenophob", "racism", "ethnic"],
        "Migrant Workers": ["migrant worker", "dormitor", "foreign worker"],
        "Elections": ["election", "ge2020", "ge2025", "voting", "political"],
        "Scams": ["scam", "phishing", "fraud", "hoax", "deepfake"],
        "Health Misinfo": ["fake cure", "unproven", "herbal", "home remed"],
        "WhatsApp Rumours": ["whatsapp", "forwarded", "voice note", "viral"],
        "Social Media": ["twitter", "facebook", "telegram", "tiktok"],
        "TraceTogether": ["tracetogether", "privacy", "surveillance"],
        "Foreign Interference": ["fica", "foreign interference", "influence operation"],
    };
    const matched: string[] = [];
    for (const [topic, kws] of Object.entries(topics)) {
        if (kws.some((kw) => text.includes(kw))) matched.push(topic);
    }
    return matched.length > 0 ? matched : ["Singapore", "General"];
}

// ─── Scrape & Ingest ─────────────────────────────────────────────

interface Article {
    url: string;
    title: string;
    content: string;
    domain: string;
    topics: string[];
    credibility_score: number;
}

async function main() {
    console.log("════════════════════════════════════════════════════════");
    console.log("  ContextGuard — Historical Deep Scraper");
    console.log("  Targeting: r/singaporeraw, r/singapore, r/SGExams,");
    console.log("  HardwareZone, CNA, ST, Mothership, POFMA (2019-2025)");
    console.log("════════════════════════════════════════════════════════\n");

    await ensureTable();
    console.log("✅ ClickHouse table ready.\n");

    // Check existing URLs to avoid duplicates
    const existingResult = await clickhouseClient.query({
        query: "SELECT url FROM article_embeddings",
        format: "JSONEachRow",
    });
    const existingRows = await existingResult.json<{ url: string }>();
    const existingUrls = new Set(existingRows.map((r) => r.url));
    console.log(`📋 ${existingUrls.size} existing articles (will skip duplicates)\n`);

    const firecrawl = new FirecrawlApp({ apiKey: FIRECRAWL_API_KEY });
    const articles: Article[] = [];
    const seenUrls = new Set<string>(existingUrls);

    // ── Search Phase ──
    console.log(`🔍 Running ${SEARCH_QUERIES.length} historical search queries...\n`);

    for (let i = 0; i < SEARCH_QUERIES.length; i++) {
        const query = SEARCH_QUERIES[i];
        const progress = `[${i + 1}/${SEARCH_QUERIES.length}]`;
        process.stdout.write(`  ${progress} "${query.slice(0, 65)}"...`);

        try {
            const result = await firecrawl.search(query, { limit: 5 });

            if (!result?.web?.length) {
                console.log(" → 0 new");
                await sleep(API_DELAY_MS);
                continue;
            }

            let added = 0;
            for (const item of result.web) {
                const url = (item as { url?: string }).url;
                const title = (item as { title?: string }).title;
                const desc = (item as { description?: string }).description;

                if (!url || seenUrls.has(url)) continue;
                seenUrls.add(url);

                const content = (desc ?? "").slice(0, MAX_CONTENT_LENGTH);
                if (content.length < 50) continue;

                const domain = extractDomain(url);
                articles.push({
                    url,
                    title: title ?? url,
                    content,
                    domain,
                    topics: extractTopics(title ?? "", content),
                    credibility_score: classifyCredibility(domain),
                });
                added++;
            }
            console.log(` → ${added} new`);
        } catch (err) {
            console.log(` → Error: ${err}`);
        }

        await sleep(API_DELAY_MS);
    }

    console.log(`\n📋 Total new articles to ingest: ${articles.length}\n`);

    if (articles.length === 0) {
        console.log("⚠️  No new articles found. Everything was already in ClickHouse.");
        process.exit(0);
    }

    // ── Embed & Insert Phase ──
    console.log("📦 Embedding and inserting...\n");
    let success = 0, failed = 0;

    for (const article of articles) {
        try {
            const embedding = await embedText(`${article.title}\n\n${article.content}`);

            await clickhouseClient.insert({
                table: "article_embeddings",
                values: [{
                    url: article.url,
                    title: article.title,
                    content: article.content,
                    domain: article.domain,
                    topics: article.topics,
                    credibility_score: article.credibility_score,
                    embedding,
                }],
                format: "JSONEachRow",
            });

            success++;
            if (success % 10 === 0 || success === articles.length) {
                console.log(`  ✅ ${success}/${articles.length} inserted`);
            }
        } catch (err) {
            failed++;
            console.error(`  ❌ ${article.title.slice(0, 50)}: ${err}`);
        }
        await sleep(300);
    }

    console.log(`\n📊 Results: ${success} inserted, ${failed} failed`);

    // ── Verification ──
    const countResult = await clickhouseClient.query({
        query: "SELECT count() AS total FROM article_embeddings",
        format: "JSONEachRow",
    });
    const [{ total }] = await countResult.json<{ total: string }>();

    const domainResult = await clickhouseClient.query({
        query: "SELECT domain, count() AS cnt FROM article_embeddings GROUP BY domain ORDER BY cnt DESC LIMIT 15",
        format: "JSONEachRow",
    });
    const domains = await domainResult.json<{ domain: string; cnt: string }>();

    console.log(`\n📈 Total articles in ClickHouse: ${total}`);
    console.log("\n📊 By domain:");
    for (const d of domains) {
        console.log(`  ${String(d.cnt).padStart(4)} — ${d.domain}`);
    }

    console.log("\n✅ Historical deep scrape complete!");
    process.exit(0);
}

main().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
