# News API — Complete Integration Guide

This document describes the News ingestion API, how data flows from external agents (like the [Journalist pipeline](https://github.com/Laurentcadieux/Agentic-Value-Hub-journalist)) into the database, and where each field lands in PostgreSQL.

---

## Architecture

```
Journalist Agents (15 agents)
  │  RSS feeds, YouTube channels, web scraping
  │  AI summarization + image generation
  │
  ▼
POST /api/v1/news (Bearer auth)
  │
  ├── Validate schema (Zod)
  ├── Normalize canonical URL
  ├── Calculate content hash (SHA-256)
  ├── Check duplicates (hash + canonical URL)
  ├── Sanitize content (strip HTML, cap lengths)
  ├── Create IngestionEvent (audit log)
  └── Create News record
         │
         ▼
PostgreSQL (192.168.0.111:5432)
  ├── news table           ← article data
  ├── ingestion_events     ← audit trail
  └── news_use_cases       ← links to knowledge base
```

---

## Base URL

```
Production: https://agenticvaluehub.com
Local:      http://localhost:3000
```

## Authentication

All content ingestion requires a Bearer token:

```
Authorization: Bearer <NEWS_INGEST_API_KEY>
```

The `NEWS_INGEST_API_KEY` is set server-side in the `.env` file on the AVH VM (192.168.0.110). It is never exposed to the frontend or in `NEXT_PUBLIC_*` variables.

---

## POST /api/v1/news — Ingest News Article

### Request

```bash
curl -X POST https://agenticvaluehub.com/api/v1/news \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "OpenAI launches new enterprise agent framework",
    "summary": "Original summary written by the ingestion pipeline. Not copyrighted content.",
    "analysis": "Business implications for enterprise automation leaders.",
    "why_it_matters": "Enterprise leaders should evaluate this for their BOAT strategy.",
    "source_name": "TechCrunch",
    "source_url": "https://techcrunch.com/example-article",
    "published_at": "2026-09-20T10:00:00Z",
    "categories": ["Agentic AI", "Enterprise AI"],
    "tags": ["agents", "orchestration"],
    "companies": ["OpenAI"],
    "industries": ["Technology"],
    "business_functions": ["IT Operations"],
    "technologies": ["AI Agents", "LLM Orchestration"],
    "image_url": "https://cdn.agenticvaluehub.com/images/uuid.jpg"
  }'
```

### Request Fields

| Field | Type | Required | Max Length | Description |
|-------|------|----------|------------|-------------|
| `headline` | string | ✅ | 500 | Article headline |
| `summary` | string | ✅ | 5000 | Original summary (NOT copied content) |
| `analysis` | string | ❌ | 5000 | Business analysis |
| `why_it_matters` | string | ❌ | 2000 | Why enterprise leaders should care |
| `source_name` | string | ✅ | 255 | Publisher name |
| `source_url` | string | ✅ | 2048 | Original article URL |
| `published_at` | ISO 8601 | ✅ | — | **Original publication date** (not ingestion date) |
| `image_url` | string | ❌ | 2048 | URL to generated/associated image |
| `categories` | string[] | ❌ | — | e.g. ["Agentic AI", "Automation"] |
| `tags` | string[] | ❌ | — | e.g. ["agents", "orchestration"] |
| `companies` | string[] | ❌ | — | Companies mentioned |
| `industries` | string[] | ❌ | — | e.g. ["Finance", "Healthcare"] |
| `business_functions` | string[] | ❌ | — | e.g. ["IT Operations", "Finance"] |
| `technologies` | string[] | ❌ | — | e.g. ["AI Agents", "RPA"] |

### Processing Pipeline

```
1. Auth: validate Bearer token against NEWS_INGEST_API_KEY
2. Validate: Zod schema validation (required fields, types, max lengths)
3. Normalize URL:
   - Strip tracking params (utm_*, fbclid, ref, gclid)
   - Lowercase hostname
   - Remove www. prefix
   - Remove default port (:80/:443)
   - Remove fragment (#...)
   - Sort remaining query params
   - Remove trailing slash
4. Content hash: SHA-256(headline | summary | source_url)
5. Duplicate check:
   a. Check by content_hash → if match: 409 duplicate
   b. Check by canonical_url → if match: 409 duplicate
6. Sanitize:
   - Strip HTML tags from all text fields
   - Decode HTML entities
   - Cap field lengths
7. Create IngestionEvent (audit trail — always, even on failure)
8. Create News record (status: PUBLISHED)
9. Return response
```

### Success Response (201)

```json
{
  "success": true,
  "news_id": "uuid-here",
  "status": "published"
}
```

### Duplicate Response (409)

```json
{
  "success": false,
  "error": "duplicate",
  "message": "Content with this fingerprint or URL already exists",
  "existing_id": "uuid-here"
}
```

### Error Responses

| Status | Meaning | Body |
|--------|---------|------|
| 401 | Missing/invalid Bearer token | `{ "error": "unauthorized" }` |
| 422 | Validation error | `{ "error": "validation", "details": [...] }` |
| 409 | Duplicate detected | `{ "success": false, "error": "duplicate", "existing_id": "..." }` |
| 429 | Rate limited | `{ "error": "rate_limited", "retry_after": 60 }` |
| 500 | Server error | `{ "error": "internal_error" }` |

---

## GET /api/v1/news — List Articles

```bash
# All news (paginated)
curl https://agenticvaluehub.com/api/v1/news?page=1&limit=20

# Filter by category
curl https://agenticvaluehub.com/api/v1/news?category=Agentic+AI

# Filter by company
curl https://agenticvaluehub.com/api/v1/news?company=OpenAI

# Keyword search
curl https://agenticvaluehub.com/api/v1/news?q=orchestration
```

Query params:

| Param | Default | Description |
|-------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 20 | Items per page (max 100) |
| `category` | — | Filter by category |
| `tag` | — | Filter by tag |
| `company` | — | Filter by company |
| `q` | — | Keyword search (headline + summary) |

---

## GET /api/v1/news/:id — Single Article

```bash
curl https://agenticvaluehub.com/api/v1/news/uuid-here
```

---

## Where Data Lands in the Database

### Database Connection

```
postgresql://avh:***@192.168.0.111:5432/avh
```

### Table: `news`

All ingested articles are stored in the `news` table. Here's how each API field maps to the database:

| API Field | DB Column | Type | Notes |
|-----------|----------|------|-------|
| (auto) | `id` | UUID | Auto-generated, primary key |
| (auto from headline) | `slug` | VARCHAR | URL-friendly slug, unique |
| `headline` | `headline` | VARCHAR(500) | Article headline |
| `summary` | `summary` | TEXT | Original summary |
| `analysis` | `analysis` | TEXT | Business analysis |
| `why_it_matters` | `whyItMatters` | TEXT | Enterprise relevance |
| `source_name` | `sourceName` | VARCHAR(255) | Publisher |
| `source_url` | `sourceUrl` | VARCHAR(2048) | Original URL |
| (normalized) | `canonicalUrl` | VARCHAR(2048) | Normalized URL (dedup key) |
| `published_at` | `publishedAt` | TIMESTAMP | **Original publication date** |
| (auto) | `ingestedAt` | TIMESTAMP | When the API received it |
| `image_url` | `imageUrl` | VARCHAR(2048) | Generated image URL |
| `categories` | `categories` | TEXT[] | PostgreSQL array |
| `tags` | `tags` | TEXT[] | PostgreSQL array |
| `companies` | `companies` | TEXT[] | PostgreSQL array |
| `industries` | `industries` | TEXT[] | PostgreSQL array |
| `business_functions` | `businessFunctions` | TEXT[] | PostgreSQL array |
| `technologies` | `technologies` | TEXT[] | PostgreSQL array |
| (calculated) | `contentHash` | VARCHAR(64) | SHA-256 fingerprint, unique |
| (auto) | `status` | ENUM | PUBLISHED, DRAFT, ARCHIVED |
| (auto) | `createdAt` | TIMESTAMP | Record creation time |
| (auto) | `updatedAt` | TIMESTAMP | Last update time |

### Table: `ingestion_events`

Every API call (success, duplicate, or error) creates an audit record:

| DB Column | Type | Description |
|----------|------|-------------|
| `id` | UUID | Auto-generated |
| `source` | VARCHAR | "api" (or future: "admin", "manual") |
| `requestId` | VARCHAR | Unique request identifier |
| `status` | VARCHAR | "success", "duplicate", "error" |
| `payloadMetadata` | JSON | { headline, source_url, content_hash } |
| `errorMessage` | TEXT | Error details (if failed) |
| `createdAt` | TIMESTAMP | When the event occurred |

### Table: `news_use_cases`

Links news articles to related use cases (many-to-many):

| DB Column | Type | Description |
|----------|------|-------------|
| `newsId` | UUID | FK → news.id |
| `useCaseId` | UUID | FK → use_cases.id |
| `relevanceScore` | FLOAT | 0-1 similarity score |

---

## Historical Data Support

The API preserves the **original publication date** from the source:

- `published_at` = when the original article was published (from RSS, web meta tags, or YouTube)
- `ingestedAt` = when the journalist agent processed and submitted it
- `createdAt` = when the database record was created

This allows backfilling historical content — agents can submit articles from months ago, and they'll appear with the correct date in the news feed.

---

## Rate Limiting

- All `/api` routes are rate-limited per-IP
- News ingestion: 30 requests/minute per IP
- Response headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- When exceeded: 429 with `Retry-After` header

---

## Journalist Pipeline Integration

The [Agentic Value Hub Journalist](https://github.com/Laurentcadieux/Agentic-Value-Hub-journalist) repo contains 15 AI journalist agents that use this API:

```
15 Journalist Agents
  ├── Enterprise AI Watcher     → POST /api/v1/news
  ├── Agentic AI Scout          → POST /api/v1/news
  ├── Automation Tracker        → POST /api/v1/news
  ├── BOAT Observer             → POST /api/v1/news
  ├── Investment Monitor        → POST /api/v1/news
  ├── Research Digest           → POST /api/v1/news
  ├── Governance Reporter       → POST /api/v1/news
  ├── Industry Vertical         → POST /api/v1/news
  ├── Integration Intel         → POST /api/v1/news
  ├── Market Pulse              → POST /api/v1/news
  ├── Canada Focus              → POST /api/v1/news
  ├── EU Focus                  → POST /api/v1/news
  ├── Security                  → POST /api/v1/news
  ├── Governance & Policy       → POST /api/v1/news
  └── US Focus                  → POST /api/v1/news
```

Each agent:
1. Fetches content from RSS feeds, YouTube channels, and web sources
2. Writes original summaries (never copies copyrighted content)
3. Generates standardized images (1200×630)
4. Preserves original publication dates (historical backfilling)
5. POSTs to `/api/v1/news` with Bearer auth
6. Handles 409 (duplicate) gracefully — skips and continues

---

## Querying Ingested Data

### From the public website

- `/news` — browse all news (sorted by publishedAt desc)
- `/news/[slug]` — read single article with analysis
- `/api/v1/news?q=keyword` — search API

### From the admin panel

- `/admin/news` — manage all articles (edit, archive, delete)
- `/admin/ingestion` — monitor ingestion events (audit log)

### Direct database query (for analytics)

```sql
-- Articles by category
SELECT categories, COUNT(*) FROM news WHERE status = 'PUBLISHED' GROUP BY categories;

-- Articles per source
SELECT source_name, COUNT(*) FROM news GROUP BY source_name ORDER BY count DESC;

-- Ingestion success rate
SELECT status, COUNT(*) FROM ingestion_events GROUP BY status;

-- Recent duplicates
SELECT payload_metadata, error_message, created_at
FROM ingestion_events WHERE status = 'duplicate' ORDER BY created_at DESC LIMIT 10;
```
