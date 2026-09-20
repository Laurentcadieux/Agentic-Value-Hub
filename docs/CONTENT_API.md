# News API — Complete CRUD Reference

## Base URL

```
Production: https://agenticvaluehub.com
Local:      http://localhost:3000
```

## Authentication

All write operations (POST, PATCH, DELETE) require a Bearer token:

```
Authorization: Bearer <NEWS_INGEST_API_KEY>
```

The `NEWS_INGEST_API_KEY` is set server-side in `.env` on the AVH VM. It is never exposed to the frontend.

Read operations (GET) are public — no auth required.

---

## Endpoints

### 1. Create Article

```
POST /api/v1/news
```

**Auth:** Bearer token required

**Request body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `headline` | string | ✅ | Article headline (max 500 chars). Clear, factual, no clickbait. |
| `summary` | string | ❌ | Original summary (max 5000 chars). Hook-first, 2-3 short paragraphs. |
| `analysis` | string | ❌ | Business analysis (max 5000 chars). Why it matters for enterprise leaders. |
| `why_it_matters` or `whyItMatters` | string | ❌ | 1-2 sentences. What should a leader DO? (max 2000 chars) |
| `source_name` or `sourceName` | string | ❌ | Publisher name |
| `source_url` or `sourceUrl` | string | ❌ | Original article URL (must be valid URL) |
| `published_at` or `publishedAt` | ISO 8601 string | ❌ | Original publication date (e.g., "2026-09-20T10:00:00Z") |
| `image_url` or `imageUrl` | string | ❌ | Image URL (must be valid URL) |
| `categories` | string[] | ❌ | e.g., ["Agentic AI", "Enterprise AI"] |
| `tags` | string[] | ❌ | e.g., ["agents", "orchestration"] |
| `companies` | string[] | ❌ | Companies mentioned |
| `industries` | string[] | ❌ | e.g., ["Finance", "Healthcare"] |
| `business_functions` or `businessFunctions` | string[] | ❌ | e.g., ["IT Operations"] |
| `technologies` | string[] | ❌ | e.g., ["AI Agents", "RPA"] |
| `slug` | string | ❌ | URL slug (auto-generated from headline if not provided) |

**Processing pipeline:**
1. Validate Bearer token
2. Validate schema (Zod)
3. Auto-generate slug from headline (if not provided)
4. Normalize canonical URL (strip tracking params)
5. Calculate content hash (SHA-256 of headline + summary + source_url)
6. Check for duplicates (by content hash, then canonical URL)
7. Sanitize content (strip HTML, cap lengths)
8. Create IngestionEvent (audit log)
9. Store in PostgreSQL

**Example:**

```bash
curl -X POST https://agenticvaluehub.com/api/v1/news \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "AI Agents Are Quietly Taking Over Enterprise Support",
    "summary": "The boring truth about AI agents: they handle the 80% of support tickets nobody wants.",
    "analysis": "Companies report 40-60% reduction in tier-1 ticket volume with agentic AI.",
    "why_it_matters": "If you run a support team over 20 people, pilot agentic AI on low-complexity tickets this quarter.",
    "source_name": "TechCrunch",
    "source_url": "https://techcrunch.com/example",
    "published_at": "2026-09-20T10:00:00Z",
    "categories": ["Agentic AI", "Enterprise AI"],
    "tags": ["agents", "support", "automation"],
    "companies": ["OpenAI"],
    "technologies": ["AI Agents"]
  }'
```

**Success (201):**
```json
{
  "success": true,
  "news_id": "uuid-here",
  "status": "published"
}
```

**Duplicate (409):**
```json
{
  "success": false,
  "status": "duplicate",
  "error": "Duplicate content hash",
  "news_id": "existing-uuid"
}
```

**Validation error (422):**
```json
{
  "error": "Validation failed",
  "issues": { "headline": ["Required"] }
}
```

**Unauthorized (401):**
```json
{ "error": "Unauthorized" }
}
```

---

### 2. List Articles

```
GET /api/v1/news
```

**Auth:** None (public)

**Query parameters:**

| Param | Default | Description |
|-------|---------|-------------|
| `limit` | 20 | Items per page (max 100) |
| `offset` | 0 | Pagination offset |
| `category` | — | Filter by category |
| `tag` | — | Filter by tag |
| `company` | — | Filter by company |
| `industry` | — | Filter by industry |
| `technology` | — | Filter by technology |
| `status` | — | Filter by status (PUBLISHED, DRAFT, ARCHIVED) |
| `q` | — | Keyword search (headline + summary) |

**Example:**
```bash
curl https://agenticvaluehub.com/api/v1/news?limit=5&q=automation
```

---

### 3. Get Single Article

```
GET /api/v1/news/:id
```

**Auth:** None (public)

**Example:**
```bash
curl https://agenticvaluehub.com/api/v1/news/uuid-here
```

---

### 4. Update Article

```
PATCH /api/v1/news/:id
```

**Auth:** Bearer token required

**Updatable fields:**

| Field | Type | Description |
|-------|------|-------------|
| `headline` | string | New headline |
| `summary` | string | New summary |
| `analysis` | string | New analysis |
| `whyItMatters` | string | New why it matters |
| `sourceName` | string | New source name |
| `sourceUrl` | string | New source URL |
| `imageUrl` | string | New image URL |
| `categories` | string[] | Replace categories |
| `tags` | string[] | Replace tags |
| `companies` | string[] | Replace companies |
| `industries` | string[] | Replace industries |
| `businessFunctions` | string[] | Replace business functions |
| `technologies` | string[] | Replace technologies |
| `status` | string | Change status: PUBLISHED, DRAFT, ARCHIVED |

**Only provided fields are updated.** Unspecified fields remain unchanged.

**Example:**
```bash
curl -X PATCH https://agenticvaluehub.com/api/v1/news/uuid-here \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "Updated headline",
    "status": "DRAFT",
    "tags": ["updated", "tags"]
  }'
```

**Success (200):**
```json
{
  "success": true,
  "news": { ...updatedArticle }
}
```

---

### 5. Delete Article

```
DELETE /api/v1/news/:id
```

**Auth:** Bearer token required

**Example:**
```bash
curl -X DELETE https://agenticvaluehub.com/api/v1/news/uuid-here \
  -H "Authorization: Bearer YOUR_API_KEY"
```

**Success (200):**
```json
{
  "success": true,
  "deleted_id": "uuid-here"
}
```

---

## Database Schema

Articles are stored in PostgreSQL at `192.168.0.111:5432`:

```
Database: avh
User: avh
Tables: news, ingestion_events, news_use_cases
```

### Table: `news`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto) |
| `slug` | VARCHAR | URL slug (unique) |
| `headline` | VARCHAR(500) | Article headline |
| `summary` | TEXT | Summary |
| `analysis` | TEXT | Business analysis |
| `whyItMatters` | TEXT | Why it matters |
| `sourceName` | VARCHAR(255) | Publisher |
| `sourceUrl` | VARCHAR(2048) | Original URL |
| `canonicalUrl` | VARCHAR(2048) | Normalized URL (dedup) |
| `publishedAt` | TIMESTAMP | Original publication date |
| `ingestedAt` | TIMESTAMP | When ingested |
| `imageUrl` | VARCHAR(2048) | Image URL |
| `categories` | TEXT[] | Categories array |
| `tags` | TEXT[] | Tags array |
| `companies` | TEXT[] | Companies array |
| `industries` | TEXT[] | Industries array |
| `businessFunctions` | TEXT[] | Business functions array |
| `technologies` | TEXT[] | Technologies array |
| `contentHash` | VARCHAR(64) | SHA-256 fingerprint (unique) |
| `status` | ENUM | PUBLISHED, DRAFT, ARCHIVED |
| `createdAt` | TIMESTAMP | Record creation |
| `updatedAt` | TIMESTAMP | Last update |

### Table: `ingestion_events`

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Auto |
| `source` | VARCHAR | "api" or "admin" |
| `requestId` | VARCHAR | Request identifier |
| `status` | VARCHAR | success, duplicate, error |
| `payloadMetadata` | JSON | Request metadata |
| `errorMessage` | TEXT | Error details |
| `createdAt` | TIMESTAMP | Event time |

---

## Rate Limiting

- All `/api` routes: 30 requests/minute per IP
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Exceeded: 429 with `Retry-After`

---

## Status Codes Summary

| Code | Meaning |
|------|---------|
| 200 | Success (GET, PATCH, DELETE) |
| 201 | Created (POST) |
| 400 | Invalid JSON |
| 401 | Unauthorized (missing/invalid Bearer token) |
| 404 | Not found |
| 409 | Duplicate |
| 422 | Validation failed |
| 429 | Rate limited |
| 500 | Server error |
