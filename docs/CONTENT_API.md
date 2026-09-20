# Content API — Agent Integration Guide

This document describes how AI agents can populate content (news, use cases) via the API.

## Base URL

```
Production: https://agenticvaluehub.com
Local:      http://localhost:3000
```

## Authentication

### News Ingestion
All content ingestion requires a Bearer token:

```
Authorization: Bearer <NEWS_INGEST_API_KEY>
```

The `NEWS_INGEST_API_KEY` is set server-side (never exposed to frontend).

### User/Session APIs (Ideas, Conversations)
Require an authenticated session cookie (Auth.js). Not for agent use — agents use the ingestion API.

---

## 1. News Ingestion API

### POST /api/v1/news

Ingest a news article. The pipeline:
1. Validates Bearer token
2. Validates request schema (Zod)
3. Normalizes canonical URL (strips tracking params)
4. Calculates content fingerprint (SHA-256 of headline + summary + source_url)
5. Checks for duplicates (by content_hash, then canonical_url)
6. Sanitizes content (strips HTML, caps field lengths)
7. Creates ingestion audit entry (IngestionEvent)
8. Returns result

#### Request

```bash
curl -X POST https://agenticvaluehub.com/api/v1/news \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "OpenAI launches new enterprise agent framework",
    "summary": "Original summary written by the ingestion pipeline. Not copyrighted content from the source.",
    "analysis": "This development matters for enterprise automation teams because...",
    "why_it_matters": "Enterprise leaders should evaluate this for their BOAT strategy.",
    "source_name": "TechCrunch",
    "source_url": "https://techcrunch.com/example-article",
    "published_at": "2026-09-20T10:00:00Z",
    "categories": ["Agentic AI", "Enterprise AI"],
    "tags": ["agents", "orchestration", "framework"],
    "companies": ["OpenAI"],
    "industries": ["Technology"],
    "business_functions": ["IT Operations"],
    "technologies": ["AI Agents", "LLM Orchestration"]
  }'
```

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `headline` | string | ✅ | Article headline (max 500 chars) |
| `summary` | string | ✅ | Original summary (NOT copied content, max 5000 chars) |
| `analysis` | string | ❌ | Business analysis (max 5000 chars) |
| `why_it_matters` | string | ❌ | Why enterprise leaders should care (max 2000 chars) |
| `source_name` | string | ✅ | Publisher name |
| `source_url` | string | ✅ | Original article URL |
| `published_at` | ISO 8601 | ✅ | Publication timestamp |
| `categories` | string[] | ❌ | e.g. ["Agentic AI", "Automation"] |
| `tags` | string[] | ❌ | e.g. ["agents", "orchestration"] |
| `companies` | string[] | ❌ | Companies mentioned |
| `industries` | string[] | ❌ | e.g. ["Finance", "Healthcare"] |
| `business_functions` | string[] | ❌ | e.g. ["IT Operations", "Finance"] |
| `technologies` | string[] | ❌ | e.g. ["AI Agents", "RPA"] |

#### Success Response (201)

```json
{
  "success": true,
  "news_id": "uuid-here",
  "status": "published"
}
```

#### Duplicate Response (409)

```json
{
  "success": false,
  "error": "duplicate",
  "message": "Content with this fingerprint or URL already exists",
  "existing_id": "uuid-here"
}
```

#### Error Responses

| Status | Meaning |
|--------|---------|
| 401 | Missing or invalid Bearer token |
| 422 | Validation error (missing required fields) |
| 409 | Duplicate detected |
| 500 | Server error |

#### Audit Log

Every ingestion attempt creates an `IngestionEvent` record:
```json
{
  "id": "uuid",
  "source": "api",
  "request_id": "uuid",
  "status": "success | duplicate | error",
  "payload_metadata": { "headline": "...", "source_url": "..." },
  "error_message": null,
  "created_at": "2026-09-20T10:00:00Z"
}
```

---

## 2. News Query API

### GET /api/v1/news

List news articles with filtering and pagination.

```bash
# All news (paginated)
curl https://agenticvaluehub.com/api/v1/news?page=1&limit=20

# Filter by category
curl https://agenticvaluehub.com/api/v1/news?category=Agentic+AI

# Filter by company
curl https://agenticvaluehub.com/api/v1/news?company=OpenAI

# Search by keyword
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
| `q` | — | Keyword search |

### GET /api/v1/news/:id

Get a single news article by ID.

---

## 3. Use Case API

### GET /api/v1/use-cases

List use cases with filtering.

```bash
# All use cases
curl https://agenticvaluehub.com/api/v1/use-cases

# Filter by industry
curl https://agenticvaluehub.com/api/v1/use-cases?industry=Finance

# Filter by business function
curl https://agenticvaluehub.com/api/v1/use-cases?business_function=IT+Operations

# Keyword search
curl https://agenticvaluehub.com/api/v1/use-cases?q=invoice+processing
```

### GET /api/v1/use-cases/:id

Get a single use case with related news.

### GET /api/v1/use-cases/:id/related

Get related use cases (similarity-based).

---

## 4. Search API

### GET /api/v1/search

Search across news and use cases.

```bash
curl https://agenticvaluehub.com/api/v1/search?q=agentic+automation
```

---

## 5. Health Check

### GET /api/health

```bash
curl https://agenticvaluehub.com/api/health
# → {"status":"ok","timestamp":"2026-09-20T17:39:47.561Z"}
```

---

## Agent Integration Pattern

For an AI agent that automatically grows content:

```
1. Agent reads news sources (RSS, APIs, web scraping)
2. Agent writes original summary (NOT copied content)
3. Agent adds analysis and why_it_matters
4. Agent POSTs to /api/v1/news with Bearer auth
5. API deduplicates, sanitizes, stores
6. Agent checks response — if duplicate, skip
7. Agent logs to IngestionEvent (automatic)
```

### Example Agent Script (Python)

```python
import requests
import json
from datetime import datetime

API_BASE = "https://agenticvaluehub.com"
API_KEY = "your-ingest-key"

def ingest_news(headline, summary, source_name, source_url, **kwargs):
    payload = {
        "headline": headline,
        "summary": summary,
        "source_name": source_name,
        "source_url": source_url,
        "published_at": datetime.utcnow().isoformat() + "Z",
        **kwargs
    }
    response = requests.post(
        f"{API_BASE}/api/v1/news",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json"
        },
        json=payload
    )
    if response.status_code == 201:
        print(f"✅ Ingested: {response.json()['news_id']}")
    elif response.status_code == 409:
        print(f"⏭️ Duplicate — skipped")
    else:
        print(f"❌ Error {response.status_code}: {response.text}")
    return response.json()

# Example usage
ingest_news(
    headline="UiPath announces agentic automation platform",
    summary="UiPath launched a new agentic automation platform combining AI agents with traditional RPA for enterprise workflows.",
    analysis="This positions UiPath as a leader in the BOAT category, bridging RPA and agentic AI.",
    why_it_matters="Enterprise automation teams should evaluate this for hybrid human-agent workflows.",
    source_name="UiPath Blog",
    source_url="https://uipath.com/blog/example",
    categories=["Agentic Automation", "Enterprise AI"],
    tags=["uipath", "rpa", "agents"],
    companies=["UiPath"],
    technologies=["AI Agents", "RPA"]
)
```

---

## Database Schema (for reference)

### Tables

| Table | Purpose | Populated By |
|-------|---------|-------------|
| `news` | News articles | Ingestion API (agents) |
| `use_cases` | Enterprise use case knowledge base | Admin UI or API (agents) |
| `news_use_cases` | Links news to related use cases | Admin or auto-linking |
| `ingestion_events` | Audit log of all ingestion attempts | Automatic |
| `customers` | Companies using the platform | Registration |
| `users` | Platform users | Registration |
| `ideas` | Automation opportunity ideas | Users via Idea Lab |
| `conversations` | AI Advisor conversations | Users via Ask AI |
| `messages` | Chat messages | Users via Ask AI |

### Connection

```
postgresql://avh:avh_prod_2026@192.168.0.111:5432/avh
```

PostgreSQL 16 with pgvector extension for semantic search.
