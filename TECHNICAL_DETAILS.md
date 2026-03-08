# ContextGuard — Technical Implementation Details

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 16 (App Router) + React 19 | SSR, routing, API routes |
| **Styling** | Tailwind CSS 4 | Responsive dark-themed UI |
| **Language** | TypeScript 5 | End-to-end type safety |
| **LLM** | Google Gemini 2.5 Flash | Topic extraction, rumour prediction, counter-narrative generation |
| **Embeddings** | Gemini `embedding-001` | 768-dimensional text vectors |
| **Vector DB** | ClickHouse (MergeTree) | Stores article embeddings for RAG retrieval |
| **Web Scraping** | Firecrawl | Live source retrieval from gov.sg, CNA, MOH |
| **Messaging** | Telegram Bot API | One-click counter-narrative deployment |
| **PDF Support** | pdfjs-dist + react-pdf | Upload and parse PDF announcements |
| **Package Manager** | Bun | Fast dependency management and script runner |
| **Hosting** | Vercel | Serverless deployment |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js)                       │
│  Dashboard: paste announcement → view predictions → deploy  │
│  Real-time SSE streaming for progressive UI updates         │
└────────────────────────┬─────────────────────────────────────┘
                         │ POST /api/analyze (SSE stream)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   ANALYSIS PIPELINE                          │
│                                                              │
│  Step 1: Extract Topics ──→ Gemini 2.5 Flash (JSON schema)  │
│          ├─ Topics, affected communities                     │
│          ├─ Emotional triggers                               │
│          └─ Search queries for retrieval                     │
│                                                              │
│  Step 2: Retrieve Sources (parallel)                         │
│          ├─ Firecrawl ──→ Live web search (POFMA, CNA, MOH) │
│          └─ ClickHouse RAG ──→ Historical article vectors    │
│                                                              │
│  Step 3: Analyze & Predict ──→ Gemini 2.5 Flash             │
│          ├─ Cross-references RAG + live sources              │
│          ├─ Generates 3-8 rumour predictions                 │
│          ├─ Risk scores (0-100) + risk levels                │
│          └─ Counter-narratives in EN/ZH/MS/TA               │
└──────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                   DEPLOYMENT (Telegram)                      │
│  POST /api/telegram → sends counter-narratives to           │
│  community leader channels (chunked, 4 languages)           │
└──────────────────────────────────────────────────────────────┘
```

---

## How It Works: End-to-End Flow

### 1. Input

A comms officer pastes an official announcement (text or PDF) into the dashboard. The system accepts raw text or uploaded PDF files parsed client-side with `pdfjs-dist`.

### 2. Topic Extraction (`lib/ai/extract-topics.ts`)

The announcement is sent to **Gemini 2.5 Flash** with a structured JSON schema. The LLM extracts:

- **Topics**: Key subjects (e.g., "DORSCON Orange", "COVID-19")
- **Affected Communities**: Demographic groups at risk (e.g., "Mandarin-speaking elderly")
- **Emotional Triggers**: Psychological drivers of misinformation (e.g., "supply scarcity anxiety")
- **Search Queries**: Optimized queries for source retrieval

This step is streamed to the frontend as a `step` SSE event so the UI can display extracted topics in real-time.

### 3. Source Retrieval (parallel)

Two retrieval paths run concurrently:

#### Path A: Live Web Search (Firecrawl)

Uses the extracted search queries to scrape authoritative Singapore sources:
- `pofmaoffice.gov.sg` — POFMA correction orders
- `channelnewsasia.com` — Established media
- `moh.gov.sg` — Ministry of Health advisories

Returns up to 15 sources with URL, title, and content. Each source is streamed individually to the frontend as a `source` SSE event.

#### Path B: Historical RAG (ClickHouse + Gemini Embeddings)

1. The announcement text is embedded into a 768-dimensional vector using Gemini's `embedding-001` model
2. A hybrid search queries the `article_embeddings` table:
   - **Phase 1 (Topic-filtered)**: Filters articles matching extracted topics via `hasAny()`, then ranks by cosine distance
   - **Phase 2 (Pure vector)**: Searches remaining articles by cosine distance alone
3. Results are deduplicated by URL and merged (topic-matched articles prioritized)
4. Filter threshold: `cosineDistance <= 0.5`

**ClickHouse Table Schema:**

```sql
CREATE TABLE article_embeddings (
  id UUID DEFAULT generateUUIDv4(),
  url String,
  title String,
  content String,
  domain String,
  scraped_at DateTime DEFAULT now(),
  topics Array(String),
  credibility_score Float32 DEFAULT 0.5,
  embedding Array(Float32)  -- 768 dimensions
) ENGINE = MergeTree()
ORDER BY scraped_at
```

**Credibility Scoring:**
| Score | Source Type |
|-------|-----------|
| 0.95 | Government (MOH, Gov.sg, POFMA) |
| 0.90 | Established media (CNA, Straits Times) |
| 0.70 | Forums (HardwareZone, Reddit) |
| 0.50 | Community/unverified sources |

### 4. Rumour Prediction (`lib/ai/analyze-and-predict.ts`)

All gathered context — the announcement, RAG sources (with credibility labels), live web sources, extracted topics, communities, and triggers — is sent to **Gemini 2.5 Flash** with a structured output schema.

The LLM generates:

- **Historical Pattern Matches**: Similar past events with similarity scores (0-100)
- **Rumour Predictions** (3-8, sorted by risk score descending):
  - `risk`: CRITICAL / HIGH / MEDIUM / LOW
  - `riskScore`: 0-100
  - `title`: The predicted false narrative
  - `channel`: Likely spread vector (WhatsApp, Twitter, Telegram, etc.)
  - `trigger`: Emotional driver
  - `historicalMatch`: Reference to similar past misinformation
  - `timeToSpread`: Estimated virality window (e.g., "~4-6 hours")
  - `demographicRisk`: Vulnerable population
  - `counterNarratives`: Pre-written responses in 4 languages (EN, ZH, MS, TA)
  - `sources`: Supporting evidence with URLs
  - `policyRecommendations`: Actionable steps

The LLM is instructed to prioritize high-credibility sources for counter-narratives and use low-credibility sources to understand actual rumour language patterns.

### 5. Real-Time Streaming (SSE)

The `/api/analyze` endpoint uses **Server-Sent Events** to stream results progressively:

| Event | Payload | Purpose |
|-------|---------|---------|
| `step` | `{id, status, data?}` | Updates processing step status (pending → running → done) |
| `source` | `{label, url, domain}` | Appends a discovered source to the UI |
| `result` | Full `AnalyzeResponse` | Final predictions and historical patterns |

The frontend listens via `EventSource` and updates the UI in real-time — topics appear as they're extracted, sources populate as they're found, and rumour cards reveal with staggered animations.

### 6. Counter-Narrative Deployment (`/api/telegram`)

One-click deployment sends formatted counter-narratives (all 4 languages) to Telegram community leader channels:

- Messages are chunked at 4,000 characters (Telegram limit)
- The API fetches `getChatMemberCount` to report reach
- Returns success status with member count for the confirmation toast

---

## Project Structure

```
app/
├── page.tsx                       # Landing page
├── dashboard/page.tsx             # Main comms officer dashboard
├── api/
│   ├── analyze/route.ts           # Core SSE analysis endpoint
│   └── telegram/route.ts          # Telegram deployment endpoint
│
components/
├── AnnouncementInput.tsx          # Text/PDF input with file upload
├── ProcessingAnimation.tsx        # Real-time step visualization
├── RumourCard.tsx                 # Expandable prediction card
├── CounterNarrativeDisplay.tsx    # 4-language toggle display
├── ActionPanel.tsx                # Deploy confirmation modal
├── RiskBadge.tsx                  # Color-coded risk indicator
├── SummaryStats.tsx               # Prediction count stats
├── PatternBar.tsx                 # Historical similarity bar chart
├── LanguageToggle.tsx             # EN/ZH/MS/TA switcher
│
lib/
├── types.ts                       # Core TypeScript interfaces
├── clickhouse.ts                  # ClickHouse client config
├── clickhouse/rag.ts              # Hybrid vector + topic search
├── scraper/
│   ├── search.ts                  # Firecrawl + ClickHouse orchestration
│   └── firecrawl-client.ts        # Firecrawl API wrapper
├── ai/
│   ├── client.ts                  # Gemini API client
│   ├── extract-topics.ts          # Topic/community/trigger extraction
│   ├── analyze-and-predict.ts     # Rumour prediction engine
│   └── embedding.ts              # Gemini embedding generation
│
data/
├── demo-scenario.ts               # DORSCON Orange (COVID Feb 2020)
└── nipah-scenario.ts              # Nipah virus outbreak (Mar 2026)
│
scripts/
├── ingest.ts                      # Seed ClickHouse with articles
├── scrape-and-ingest.ts           # Scrape, embed, and ingest
└── scrape-historical.ts           # Historical event scraping
```

---

## Key Technical Decisions

1. **Gemini over Anthropic/OpenAI**: Switched to Gemini 2.5 Flash for structured JSON output with schema enforcement and fast inference speed suitable for real-time streaming.

2. **ClickHouse for vector search**: Uses ClickHouse's native `cosineDistance()` function on `Array(Float32)` columns with MergeTree engine — avoids the overhead of a dedicated vector DB while supporting hybrid topic + vector queries.

3. **SSE over WebSockets**: Server-Sent Events provide a simpler, unidirectional streaming protocol that works naturally with Next.js API routes and requires no connection management.

4. **Hybrid RAG (topic + vector)**: Pure vector search misses context-specific relevance. The two-phase approach first filters by topic overlap, then fills remaining slots with pure cosine similarity — improving precision for Singapore-specific misinformation patterns.

5. **4-language counter-narratives**: Generated in a single LLM call to maintain consistency across English, Mandarin, Bahasa Melayu, and Tamil — Singapore's four official languages.

6. **Credibility-weighted sources**: RAG sources carry credibility scores so the LLM can prioritize government/media sources for counter-narratives while using forum posts to understand actual rumour language.

---

## Environment Variables

```
GEMINI_API_KEY          # Google Gemini API key
CLICKHOUSE_HOST         # ClickHouse server URL
CLICKHOUSE_USER         # ClickHouse username
CLICKHOUSE_PASSWORD     # ClickHouse password
CLICKHOUSE_DB           # ClickHouse database name
FIRECRAWL_API_KEY       # Firecrawl web scraping API key
TELEGRAM_BOT_TOKEN      # Telegram Bot API token
```
