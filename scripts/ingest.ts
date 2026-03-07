/**
 * Ingestion script: Seeds the ClickHouse article_embeddings table with
 * historical misinformation articles for RAG.
 *
 * Usage:  npx tsx scripts/ingest.ts
 */

import "dotenv/config";
import clickhouseClient, { ensureTable } from "../lib/clickhouse";
import { embedText } from "../lib/ai/embedding";

interface SeedArticle {
    url: string;
    title: string;
    content: string;
    domain: string;
    topics: string[];
    credibility_score: number;
}

// Seed data: key Singapore misinformation cases
const SEED_ARTICLES: SeedArticle[] = [
    {
        url: "https://www.pofmaoffice.gov.sg/regulations/protection-from-online-falsehoods-and-manipulation-act/",
        title: "POFMA — Protection from Online Falsehoods and Manipulation Act",
        content:
            "The Protection from Online Falsehoods and Manipulation Act (POFMA) empowers the government to order corrections or takedowns of online falsehoods that are against the public interest. Since its enactment in 2019, POFMA has been used to address a wide range of misinformation including false claims about COVID-19, elections, racial harmony, and national security. The Act targets statements of fact, not opinions, and requires platforms to carry correction notices alongside the original content.",
        domain: "pofmaoffice.gov.sg",
        topics: ["POFMA", "misinformation", "regulation", "online falsehoods"],
        credibility_score: 0.95,
    },
    {
        url: "https://www.gov.sg/article/no-need-to-panic-buy-singapore-has-sufficient-supply-of-food-and-essential-items",
        title: "Gov.sg — No Need to Panic Buy",
        content:
            "When Singapore raised the DORSCON level to Orange on 7 February 2020, panic buying swept through supermarkets. Long queues formed at FairPrice, Sheng Siong, and Cold Storage outlets. Shelves of rice, instant noodles, toilet paper, and canned food were emptied within hours. The government issued assurances that national stockpiles were sufficient and supply chains remained intact. Despite official messaging, viral WhatsApp voice notes in Mandarin and Hokkien spread false claims of supply shortages, exacerbating the situation.",
        domain: "gov.sg",
        topics: [
            "DORSCON Orange",
            "panic buying",
            "supply shortage",
            "COVID-19",
            "WhatsApp misinformation",
        ],
        credibility_score: 0.95,
    },
    {
        url: "https://www.channelnewsasia.com/singapore/covid-19-supermarkets-restock-shelves-panic-buying-dorscon-orange-941711",
        title: "CNA — Supermarkets Restock Shelves After Panic Buying",
        content:
            "Following the DORSCON Orange upgrade, major supermarket chains in Singapore worked overnight to restock shelves. FairPrice CEO confirmed that supply chains from regional partners remained unaffected. However, misinformation about rice shortages continued to circulate on social media and messaging platforms. The government deployed targeted messaging in Mandarin, Malay, and Tamil through community leaders and grassroots organisations. Within 48 hours, purchasing patterns returned to normal levels.",
        domain: "channelnewsasia.com",
        topics: [
            "panic buying",
            "supermarket restocking",
            "DORSCON",
            "supply chain",
            "misinformation response",
        ],
        credibility_score: 0.9,
    },
    {
        url: "https://www.moh.gov.sg/covid-19",
        title: "MOH — COVID-19 Situation Reports and Case Updates",
        content:
            "The Ministry of Health publishes daily COVID-19 situation reports including confirmed case counts, community cases, imported cases, and cluster information. Throughout the pandemic, false claims about suppressed case numbers circulated on Twitter/X, Reddit, and Telegram channels. Multiple POFMA correction directions were issued against individuals and platforms spreading false claims about the true number of COVID-19 cases in Singapore. MOH's transparent reporting was internationally recognised by the WHO.",
        domain: "moh.gov.sg",
        topics: [
            "COVID-19",
            "case reporting",
            "transparency",
            "POFMA correction",
            "suppressed numbers",
        ],
        credibility_score: 0.95,
    },
    {
        url: "https://www.moh.gov.sg/covid-19/vaccination",
        title: "MOH — COVID-19 Vaccination Programme",
        content:
            "Singapore's national vaccination programme rolled out in phases starting December 2020. Misinformation about vaccine side effects, fertility impacts, and microchip conspiracies spread rapidly through Chinese-language Facebook groups and Tamil WhatsApp groups. POFMA corrections were issued for false claims including that mRNA vaccines alter DNA. The Health Sciences Authority (HSA) issued safety alerts about unproven COVID remedies including herbal cures and miracle supplements being sold online. The government launched multilingual campaigns featuring community leaders and healthcare workers.",
        domain: "moh.gov.sg",
        topics: [
            "vaccination",
            "anti-vax misinformation",
            "mRNA",
            "POFMA",
            "herbal remedies",
            "fake cures",
        ],
        credibility_score: 0.95,
    },
    {
        url: "https://www.mom.gov.sg/covid-19/advisory-on-safe-distancing-measures",
        title: "MOM — Advisory on Migrant Workers During COVID-19",
        content:
            "The dormitory outbreaks in April 2020 resulted in tens of thousands of migrant worker infections. Xenophobic narratives blaming migrant workers for COVID spread circulated across all language communities in Singapore. False claims suggested that migrant workers were deliberately violating safe-distancing rules. The government emphasised that the virus does not discriminate by nationality and that the living conditions in dormitories — not the workers themselves — were the primary factor. POFMA was used against posts scapegoating specific racial groups.",
        domain: "mom.gov.sg",
        topics: [
            "migrant workers",
            "dormitory outbreak",
            "xenophobia",
            "racial scapegoating",
            "POFMA",
        ],
        credibility_score: 0.95,
    },
    {
        url: "https://www.hsa.gov.sg/consumer-safety/articles/covid19_unproven_claims",
        title: "HSA — Safety Alert on Unproven COVID-19 Claims",
        content:
            "The Health Sciences Authority issued alerts about unproven COVID-19 products being sold online including miracle mineral solutions, colloidal silver, and traditional Chinese medicine formulations falsely marketed as cures. Several sellers were prosecuted under the Health Products Act. Misinformation about home remedies including garlic water, warm lemon water, and specific dietary supplements circulated widely through elderly community WhatsApp groups. HSA collaborated with MOH to issue corrections in multiple languages.",
        domain: "hsa.gov.sg",
        topics: [
            "fake cures",
            "unproven remedies",
            "health misinformation",
            "HSA enforcement",
            "TCM misinformation",
        ],
        credibility_score: 0.95,
    },
    {
        url: "https://www.channelnewsasia.com/singapore/circuit-breaker-covid-19-misinformation-pofma-2020-1234567",
        title: "CNA — Circuit Breaker Announcement and Misinformation Wave",
        content:
            "When Singapore announced its 'Circuit Breaker' measures in April 2020, a wave of misinformation followed. False claims included that the military would enforce the lockdown, that Singapore was running out of hospital beds, and that specific housing estates were quarantine zones. Forwarded messages in multiple languages created panic, particularly among elderly residents. The government used SMS, TV, and grassroots networks to counter false narratives. Multiple POFMA directions were issued within the first 72 hours of the announcement.",
        domain: "channelnewsasia.com",
        topics: [
            "Circuit Breaker",
            "lockdown misinformation",
            "military enforcement",
            "hospital capacity",
            "POFMA",
        ],
        credibility_score: 0.9,
    },
    {
        url: "https://www.straitstimes.com/singapore/politics/ge2020-pofma-correction-directions-issued",
        title: "ST — POFMA Corrections During GE2020",
        content:
            "During Singapore's 2020 General Election, POFMA correction directions were issued against false statements about government policy including public housing, CPF, and population matters. Misinformation spread through WhatsApp groups, Facebook pages, and alternative news platforms. False claims about political parties' positions and personal attacks based on fabricated information circulated rapidly. The elections demonstrated how political misinformation can spread across ethnic and language community lines in Singapore's multicultural context.",
        domain: "straitstimes.com",
        topics: [
            "GE2020",
            "election misinformation",
            "POFMA",
            "political falsehoods",
            "CPF",
            "public housing",
        ],
        credibility_score: 0.9,
    },
    {
        url: "https://www.channelnewsasia.com/singapore/racial-harmony-pofma-misinformation-singapore",
        title: "CNA — Racial Harmony and Online Misinformation in Singapore",
        content:
            "Singapore has faced multiple instances of racially charged misinformation targeting its multicultural society. False claims about preferential treatment for specific ethnic groups, fabricated quotes from political leaders about racial policies, and manipulated images of racial incidents have circulated online. POFMA has been used to address cases where false racial narratives threatened social cohesion. Community leaders from Chinese, Malay, Indian, and Eurasian communities have been mobilised to counter divisive narratives through grassroots channels.",
        domain: "channelnewsasia.com",
        topics: [
            "racial harmony",
            "racial misinformation",
            "social cohesion",
            "POFMA",
            "multicultural",
        ],
        credibility_score: 0.9,
    },
];

async function ingest() {
    console.log("🔧 Ensuring article_embeddings table exists...");
    await ensureTable();
    console.log("✅ Table ready.\n");

    console.log(`📥 Ingesting ${SEED_ARTICLES.length} seed articles...\n`);

    for (const article of SEED_ARTICLES) {
        console.log(`  🔄 Embedding: "${article.title}"...`);

        try {
            const embedding = await embedText(
                `${article.title}\n\n${article.content}`
            );

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

            console.log(`  ✅ Inserted (embedding dim: ${embedding.length})`);
        } catch (err) {
            console.error(`  ❌ Failed: ${err}`);
        }
    }

    // Verify: run a test query
    console.log("\n🔍 Running test query...");
    const testEmbedding = await embedText(
        "COVID-19 panic buying supermarket shortage Singapore"
    );
    const embStr = `[${testEmbedding.join(",")}]`;

    const result = await clickhouseClient.query({
        query: `
      SELECT title, domain,
             cosineDistance(embedding, ${embStr}) AS score
      FROM article_embeddings
      WHERE length(embedding) > 0
      ORDER BY score ASC
      LIMIT 5
    `,
        format: "JSONEachRow",
    });

    const rows = await result.json<{
        title: string;
        domain: string;
        score: number;
    }>();

    console.log("\n📊 Top 5 results for 'COVID-19 panic buying':");
    for (const row of rows) {
        console.log(
            `   ${(row.score).toFixed(4)} — ${row.title} (${row.domain})`
        );
    }

    console.log("\n✅ Ingestion complete!");
    process.exit(0);
}

ingest().catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
});
