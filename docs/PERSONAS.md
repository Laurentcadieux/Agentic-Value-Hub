# User Personas

This document defines all personas for the Agentic Value Hub platform — who they are, what they can do, and how the system serves them.

---

## Persona Overview

```
Visitor (anonymous)
  │
  ├── Free Subscriber (registered, free tier)
  │     ├── Client User (uses AI Advisor + Idea Lab)
  │     └── Reader (browses news + use cases)
  │
  ├── Content Admin (manages news + use cases)
  │
  ├── Platform Admin (full access, manages everything)
  │
  └── API Agent (automated ingestion, Bearer token)
```

---

## 1. Visitor (Anonymous)

**Who:** Anyone browsing the internet who finds the site via search, social, or referral.

**Can:**
- Browse the homepage
- Read all news articles (/news, /news/[slug])
- Browse use cases (/use-cases, /use-cases/[slug])
- Explore by industry (/industries), function (/functions), technology (/technologies)
- Read /about and /methodology pages
- View /privacy and /terms
- Use the AI Idea input on the homepage ("What could AI automate in your business?")
- See SEO-optimized pages (Google indexable)

**Cannot:**
- Save ideas
- Start AI Advisor conversations
- Access /account or /admin
- Ingest content via API

**Authentication:** None

**Conversion path:** Visitor → clicks "Ask the AI Advisor" → prompted to register → Free Subscriber

---

## 2. Free Subscriber — Client User

**Who:** A professional who wants to explore automation opportunities for their business. Typically a business analyst, automation lead, IT manager, or operations director.

**Goal:** "Help me find where AI agents can create value in my organization."

**Can:**
- Everything a Visitor can do
- Login at /login
- Use the AI Advisor (/ask-ai) in all 4 modes:
  - LEARN — understand agentic AI concepts
  - EXPLORE — find relevant enterprise use cases
  - IDEATE — discover automation opportunities
  - ASSESS — quantify a specific business opportunity
- Save ideas to /account/ideas
- Resume assessments
- View and edit saved ideas
- View conversation history at /account/conversations
- Generate Opportunity Cards with ROI calculations
- Associate ideas with their company (Customer)

**Cannot:**
- Manage news or use cases
- Access /admin
- Ingest content via API
- See other customers' data (tenant isolation enforced)

**Authentication:** Email + password (Auth.js credentials provider)

**Role in DB:** `UserRole.MEMBER`

**Data access:** Only their own Customer's ideas, conversations, and messages

---

## 3. Free Subscriber — Reader

**Who:** Someone who wants to stay informed about agentic AI but doesn't use the advisory tools. Could be a researcher, analyst, or executive.

**Goal:** "Keep me informed about what's happening in agentic automation."

**Can:**
- Everything a Visitor can do
- Login at /login
- Subscribe to newsletter
- Save/bookmark articles (future feature)
- Personalized news feed by interests (future feature)

**Cannot:**
- Save ideas or use AI Advisor (can upgrade to Client User role)
- Access /admin
- Ingest content via API

**Authentication:** Email + password (Auth.js credentials provider)

**Role in DB:** `UserRole.VIEWER`

---

## 4. Content Admin — News Admin

**Who:** A content manager responsible for the news platform. May be a human or supervise an AI agent that ingests content.

**Goal:** "Ensure our news platform has high-quality, relevant, non-duplicate content."

**Can:**
- Everything a Free Subscriber can do
- Access /admin/news
- Create, edit, archive, delete news articles
- Review ingestion events at /admin/ingestion
- Manage news status (published, draft, archived)
- View ingestion audit logs
- Generate the NEWS_INGEST_API_KEY for agents
- Monitor duplicate detection results

**Cannot:**
- Manage use cases
- Manage customers or users
- Manage taxonomy
- Change platform settings

**Authentication:** Email + password, requires ADMIN role

**Role in DB:** `UserRole.ADMIN`

**Data access:** All news and ingestion events

---

## 5. Content Admin — Use Case Admin

**Who:** A knowledge management specialist who curates the use case database. May work with AI to generate use cases from news analysis.

**Goal:** "Build and maintain a comprehensive knowledge base of enterprise AI use cases."

**Can:**
- Everything a Free Subscriber can do
- Access /admin/use-cases
- Create, edit, archive use cases
- Set use case fields: industry, business function, agent pattern, automation pattern, technologies, value drivers, complexity, risks, controls
- Link use cases to related news
- Manage use case status (published, draft, archived)
- View related use cases and news connections

**Cannot:**
- Manage news ingestion
- Manage customers or users
- Manage taxonomy (unless also Platform Admin)

**Authentication:** Email + password, requires ADMIN role

**Role in DB:** `UserRole.ADMIN`

**Data access:** All use cases and their news links

---

## 6. Platform Admin

**Who:** The site owner or technical administrator. Full access to everything.

**Goal:** "Keep the platform running, manage users, oversee all content."

**Can:**
- Everything Content Admins can do (news + use cases)
- Access /admin (full dashboard)
- Manage customers at /admin/customers
- Manage users at /admin (view all users, change roles)
- View all ideas across all customers at /admin/ideas
- Manage taxonomy at /admin/taxonomy (industries, functions, technologies, categories)
- Monitor ingestion events at /admin/ingestion
- View platform stats (news count, use case count, ideas, users)
- Generate/regenerate API keys

**Authentication:** Email + password, requires ADMIN role

**Role in DB:** `UserRole.ADMIN`

**Data access:** Everything (all customers, all content, all users)

---

## 7. API Agent (Automated)

**Who:** An AI agent (script, service, or integration) that automatically ingests news content into the platform.

**Goal:** "Automatically populate the news platform with relevant agentic AI content from various sources."

**Can:**
- POST /api/v1/news (ingest articles with Bearer token)
- GET /api/v1/news (query existing articles)
- GET /api/v1/news/:id (fetch specific article)

**Cannot:**
- Access any UI pages
- Create/modify use cases
- Create ideas or conversations
- Access user or customer data

**Authentication:** Bearer token (`NEWS_INGEST_API_KEY`), server-side only

**How it works:**
1. Agent reads sources (RSS feeds, APIs, web scraping)
2. Agent writes original summaries (never copies copyrighted content)
3. Agent adds analysis and "why it matters"
4. Agent POSTs to /api/v1/news with Bearer auth
5. API validates, deduplicates (content hash + canonical URL), sanitizes, stores
6. API creates IngestionEvent audit record
7. Agent checks response — if 409 (duplicate), skips

**Rate limited:** Yes, per-IP rate limiting on /api routes

---

## Role Summary

| Persona | Role (DB) | Auth | Key Pages | Data Access |
|---------|-----------|------|-----------|-------------|
| Visitor | — | None | Public pages only | Public content |
| Free Subscriber — Client | MEMBER | Email/password | /ask-ai, /idea-lab, /account | Own customer's data |
| Free Subscriber — Reader | VIEWER | Email/password | /news, /use-cases | Public content |
| News Admin | ADMIN | Email/password | /admin/news, /admin/ingestion | All news + audit |
| Use Case Admin | ADMIN | Email/password | /admin/use-cases | All use cases |
| Platform Admin | ADMIN | Email/password | /admin/* | Everything |
| API Agent | — | Bearer token | /api/v1/news (POST/GET) | News ingestion only |

---

## Subscription Model

### Free Tier (current)
- Browse all public content
- Use AI Advisor (LEARN + EXPLORE modes)
- Save up to 5 ideas
- View conversation history
- Newsletter subscription

### Future: Pro Tier (not yet implemented)
- Unlimited ideas
- AI Advisor ASSESS mode with detailed ROI
- Export opportunity cards (PDF)
- Team sharing
- Priority AI processing
- Custom use case recommendations

### Future: Enterprise Tier (not yet implemented)
- Multiple users per customer
- Shared idea workspace
- Custom taxonomy
- API access for idea management
- Dedicated AI model preferences
- SSO authentication

---

## Registration Flow

```
1. Visitor arrives at homepage
2. Sees "Ask the AI Advisor" CTA
3. Clicks → /ask-ai → "Sign in to continue"
4. Redirected to /login
5. Clicks "Register" → /register
6. Fills: email, password, first name, last name, company name
7. System creates:
   - Customer (company) if not exists
   - User with role MEMBER
8. User is logged in
9. Redirected to /ask-ai
10. Can now use AI Advisor + save ideas
```

---

## AI Advisor Access by Role

| Mode | Visitor | Free Subscriber | Pro (future) |
|------|---------|-----------------|---------------|
| LEARN | Homepage input only | ✅ Full chat | ✅ Full chat |
| EXPLORE | ❌ | ✅ Full chat | ✅ Full chat |
| IDEATE | ❌ | ✅ Full chat | ✅ Full chat |
| ASSESS | ❌ | ✅ (basic ROI) | ✅ (detailed ROI + export) |

---

## Security & Access Rules

1. **Tenant isolation:** Users can only access their own Customer's ideas, conversations, and messages
2. **Admin authorization:** /admin/* routes require `UserRole.ADMIN`
3. **Session protection:** /account/* routes require authenticated session
4. **API auth:** News ingestion requires Bearer token, never exposed to frontend
5. **No secrets in client:** `NEWS_INGEST_API_KEY`, `AI_API_KEY` are server-side only
6. **Rate limiting:** All /api routes rate-limited per-IP
7. **Prompt injection defense:** AI Advisor validates all AI outputs server-side
8. **Audit trail:** Every news ingestion creates an IngestionEvent record
