# End-to-End Flows by Persona

This document maps the complete journey for each persona — every step from entry to outcome, including pages visited, API calls made, and data created.

---

## 1. Visitor (Anonymous)

### Flow: Discover & Browse

```
Google search "agentic automation use cases"
  │
  ▼
/ (Homepage)
  ├── Reads hero: "Turn AI agents into business value"
  ├── Sees AI input: "What could AI automate in your business?"
  ├── Browses Latest Agentic Intelligence (news cards)
  ├── Browses Trending Use Cases
  ├── Explores by Business Function / Industry / Technology
  └── Sees Newsletter section
  │
  ├──▶ /news (News listing)
  │      ├── Reads headlines, summaries, categories
  │      ├── Clicks article → /news/[slug]
  │      │      ├── Reads summary + analysis + why_it_matters
  │      │      ├── Sees source link (original publisher)
  │      │      └── Sees related use cases (if linked)
  │      └── Returns to /news or homepage
  │
  ├──▶ /use-cases (Use case listing)
  │      ├── Filters by industry, function, technology
  │      ├── Keyword search
  │      ├── Clicks use case → /use-cases/[slug]
  │      │      ├── Reads problem, description, agent pattern
  │      │      ├── Sees automation potential + complexity
  │      │      └── Sees related news + related use cases
  │      └── Returns to listing
  │
  ├──▶ /industries → /industries/[slug]
  ├──▶ /functions → /functions/[slug]
  ├──▶ /technologies → /technologies/[slug]
  │
  ├──▶ /about (What is Agentic Value Hub)
  ├──▶ /methodology (How we assess value)
  │
  └──▶ Homepage AI input → types "automate invoice processing"
         ├── Clicks "Analyze My Idea"
         └── Prompted to register → /register
```

**API calls:** `GET /api/v1/news`, `GET /api/v1/use-cases`, `GET /api/v1/search`
**Data created:** None
**Exit point:** Register or leave

---

## 2. Free Subscriber — Client User

### Flow 2A: Registration

```
/register
  ├── Fills: email, password, first name, last name, company name
  ├── POST /api/auth/register
  │      ├── Creates Customer (company) if not exists
  │      ├── Creates User (role: MEMBER, linked to Customer)
  │      ├── Hashes password (scrypt)
  │      └── Returns success
  ├── Auto-login via Auth.js
  └── Redirect → /ask-ai
```

### Flow 2B: AI Advisor — Learn Mode

```
/ask-ai
  ├── Selects LEARN mode
  ├── POST /api/v1/conversations (creates conversation, type: DISCOVERY)
  │      └── Returns conversation_id
  ├── Types: "What is agentic orchestration?"
  ├── POST /api/v1/conversations/[id]/messages
  │      ├── Server creates Message (role: USER)
  │      ├── Server retrieves knowledge (RAG from use cases + news)
  │      ├── Server calls AI provider with LEARN system prompt
  │      ├── Server validates AI output (prompt injection defense)
  │      ├── Server creates Message (role: ASSISTANT)
  │      └── Returns AI response + citations
  ├── Reads response with citations
  ├── Continues conversation (multiple messages)
  └── Conversation persists in DB (can resume later)
```

### Flow 2C: AI Advisor — Ideate + Assess Mode

```
/ask-ai
  ├── Selects IDEATE mode
  ├── Conversation state machine advances through stages:
  │      1. understand_problem → "Describe a process you want to automate"
  │      2. identify_current_process → "How does it work today?"
  │      3. identify_people_and_roles → "Who is involved?"
  │      4. identify_volume → "How many transactions per year?"
  │      5. identify_time_per_transaction → "How many minutes each?"
  │      6. identify_systems → "What systems are involved?"
  │      7. identify_exceptions → "What's the exception rate?"
  │      8. identify_risks → "What risks concern you?"
  │      9. identify_controls → "What controls are needed?"
  │     10. propose_agentic_solution → AI proposes solution
  │     11. estimate_automation_percentage → AI estimates %
  │     12. quantify_value → calculates OpportunityValue
  │     13. generate_opportunity_card → structured card
  │     14. save_idea → POST /api/v1/ideas
  │
  ├── At stage 12, server calls calculateOpportunityValue():
  │      ├── currentAnnualHours = (annualVolume × minutesPerTransaction) / 60
  │      ├── automatableHours = currentAnnualHours × (automationPercent / 100)
  │      └── estimatedAnnualCapacityValue = automatableHours × laborCostPerHour
  │
  ├── At stage 14, POST /api/v1/ideas:
  │      ├── Creates Idea with all extracted data
  │      ├── Links to conversation
  │      ├── Links to Customer
  │      └── Returns idea_id
  │
  └── Redirect → /account/ideas/[id] (view saved Opportunity Card)
```

### Flow 2D: Idea Lab — Manual Ideation

```
/idea-lab
  ├── Guided form (4-step wizard):
  │      Step 1: Company + Industry + Business Function
  │      Step 2: Process + Problem + Desired Outcome
  │      Step 3: Volume + Time + People + Systems
  │      Step 4: Risks + Controls + Dependencies
  ├── Submit → POST /api/v1/ideas
  │      ├── Idea service extracts structured data
  │      ├── Calculates value (calculateOpportunityValue)
  │      ├── Creates Idea in DB
  │      └── Returns idea_id + Opportunity Card
  └── View Opportunity Card:
         ├── Title, Problem, Current Process
         ├── Proposed Agentic Solution
         ├── Automation Potential (%)
         ├── Annual Volume, Current Annual Effort
         ├── Estimated Automatable Hours
         ├── Estimated Annual Capacity Value
         ├── Complexity, Risks, Controls
         ├── Assumptions
         └── Next Steps
```

### Flow 2E: Account Management

```
/account
  ├── Profile: name, email, company
  ├── /account/ideas → list of saved ideas
  │      ├── Click idea → /account/ideas/[id]
  │      │      ├── View Opportunity Card
  │      │      ├── Edit idea → PATCH /api/v1/ideas/[id]
  │      │      ├── Re-assess → POST /api/v1/ideas/[id]/assess
  │      │      └── Resume AI conversation → /ask-ai (with conversation context)
  │      └── Create new → /idea-lab
  └── /account/conversations → conversation history
         ├── Click conversation → /ask-ai (resumes)
         └── View messages
```

**API calls:** `POST /api/v1/conversations`, `POST /api/v1/conversations/[id]/messages`, `POST /api/v1/ideas`, `GET/PATCH /api/v1/ideas/[id]`, `POST /api/v1/ideas/[id]/assess`
**Data created:** Conversations, Messages, Ideas
**Tenant isolation:** User sees only their Customer's data

---

## 3. Free Subscriber — Reader

### Flow: Browse + Subscribe

```
/ (Homepage)
  ├── Browses news, use cases (same as Visitor)
  ├── Sees Newsletter section
  ├── Enters email → newsletter signup
  │
  ├──▶ /login (existing account)
  │      └── Login → /account (profile only, no ideas)
  │
  └──▶ /register (new account)
         ├── Fills: email, password, name
         ├── Creates User (role: VIEWER)
         └── Redirect → /news (back to browsing)
```

**API calls:** `GET /api/v1/news`, `GET /api/v1/use-cases`, `GET /api/v1/search`
**Data created:** User account, newsletter subscription
**Difference from Client User:** Cannot access /ask-ai or /idea-lab (can upgrade role later)

---

## 4. Content Admin — News Admin

### Flow 4A: Ingest News via Admin UI

```
/admin/news
  ├── Views all news articles (with status badges)
  ├── Clicks "New Article" → /admin/news/new
  │      ├── Fills form: headline, summary, analysis, why_it_matters
  │      ├── Sets: source_name, source_url, published_at
  │      ├── Tags: categories, tags, companies, industries, technologies
  │      ├── Sets status: DRAFT or PUBLISHED
  │      └── Submit → Server Action (createNewsAction)
  │             ├── Sanitizes content
  │             ├── Normalizes canonical URL (strips tracking params)
  │             ├── Calculates content hash (SHA-256)
  │             ├── Checks for duplicates
  │             ├── Creates News record
  │             ├── Creates IngestionEvent (audit)
  │             └── revalidatePath(/news)
  │
  ├── Edit article → /admin/news/[id]
  │      └── Server Action (updateNewsAction)
  │
  └── Delete article → Server Action (deleteNewsAction)
```

### Flow 4B: Monitor Ingestion

```
/admin/ingestion
  ├── Views IngestionEvent log
  │      ├── Each event: source, request_id, status, timestamp
  │      ├── Status: success | duplicate | error
  │      ├── Click event → details (payload_metadata, error_message)
  │      └── Identifies patterns (duplicates, errors, sources)
  │
  └── Filters by status, source, date range
```

### Flow 4C: Generate API Key for Agent

```
/admin (dashboard)
  ├── Views platform stats (news count, recent events)
  ├── Manages NEWS_INGEST_API_KEY (set in .env, rotates as needed)
  └── Provides key to AI agent team
```

**API calls:** Server Actions (createNewsAction, updateNewsAction, deleteNewsAction), `GET /api/v1/admin/ingestion`
**Data created:** News articles, IngestionEvents
**Access:** All news across all categories

---

## 5. Content Admin — Use Case Admin

### Flow 5A: Create Use Case

```
/admin/use-cases
  ├── Views all use cases (with status)
  ├── Clicks "New Use Case" → /admin/use-cases/new
  │      ├── Fills form:
  │      │      ├── Title, Slug
  │      │      ├── Industry, Business Function
  │      │      ├── Problem, Description
  │      │      ├── Agent Pattern, Automation Pattern
  │      │      ├── Technologies (array), Systems (array)
  │      │      ├── Value Drivers (array)
  │      │      ├── Automation Potential (0-100%)
  │      │      ├── Implementation Complexity
  │      │      ├── Risks, Controls
  │      │      └── Source References
  │      ├── Sets status: DRAFT or PUBLISHED
  │      └── Submit → Server Action (createUseCase)
  │             ├── Validates all fields
  │             ├── Creates UseCase record
  │             └── revalidatePath(/use-cases)
  │
  ├── Edit use case → /admin/use-cases/[id]
  └── Delete use case
```

### Flow 5B: Link News to Use Cases

```
/admin/use-cases/[id]
  ├── Views use case detail
  ├── Links related news:
  │      ├── Selects news articles from dropdown
  │      ├── Sets relevance score (0-1)
  │      └── Creates NewsUseCase link
  └── Views existing news links
```

### Flow 5C: Review from Public Side

```
/use-cases (public listing)
  ├── Searches and filters to verify visibility
  ├── Clicks use case → /use-cases/[slug]
  │      ├── Verifies content renders correctly
  │      ├── Checks related use cases
  │      └── Checks related news
  └── Confirms SEO metadata present
```

**API calls:** Server Actions (createUseCase, updateUseCase), `GET /api/v1/use-cases`, `GET /api/v1/use-cases/[id]/related`
**Data created:** UseCases, NewsUseCases
**Access:** All use cases

---

## 6. Platform Admin

### Flow 6A: Dashboard Overview

```
/admin
  ├── Views stats: news count, use case count, ideas count, users count
  ├── Views recent ingestion events
  ├── Quick links to all admin sections
  └── Identifies issues (failed ingestions, draft content pending)
```

### Flow 6B: Manage Customers & Users

```
/admin/customers
  ├── Views all customers (companies)
  ├── Clicks customer → /admin/customers/[id]
  │      ├── Views customer details (name, industry, website)
  │      ├── Views associated users
  │      ├── Views associated ideas
  │      ├── Edits customer info
  │      └── Manages user roles (MEMBER, VIEWER, ADMIN)
  └── Creates new customer
```

### Flow 6C: Manage All Ideas

```
/admin/ideas
  ├── Views all ideas across all customers
  ├── Filters by status (DRAFT, SUBMITTED, APPROVED, etc.)
  ├── Clicks idea → /admin/ideas/[id]
  │      ├── Views full Opportunity Card
  │      ├── Reviews assessment
  │      └── Changes status (approve, reject, archive)
  └── Exports ideas (future)
```

### Flow 6D: Manage Taxonomy

```
/admin/taxonomy
  ├── Manages industries (add, edit, remove)
  ├── Manages business functions
  ├── Manages technologies
  ├── Manages news categories
  └── Manages tags
```

### Flow 6E: Full Platform Monitoring

```
/admin/ingestion
  ├── Monitors all ingestion events
  ├── Identifies error patterns
  ├── Checks API agent health (success rate, duplicates)
  └── Reviews content quality
```

**API calls:** `GET /api/v1/admin/stats`, `GET /api/v1/admin/ingestion`, Server Actions (customer, idea, taxonomy management)
**Data access:** Everything — all customers, users, ideas, content, settings

---

## 7. API Agent (Automated Content Growth)

### Flow 7A: News Ingestion Pipeline

```
Agent script runs (cron or event-triggered)
  │
  ├── 1. READ SOURCES
  │      ├── RSS feeds (TechCrunch, VentureBeat, etc.)
  │      ├── APIs (news APIs, vendor blogs)
  │      └── Web scraping (with permission)
  │
  ├── 2. PROCESS CONTENT
  │      ├── Extract headline from source
  │      ├── Write ORIGINAL summary (never copy content)
  │      ├── Generate analysis (business implications)
  │      ├── Write why_it_matters (enterprise relevance)
  │      ├── Extract entities (companies, industries, technologies)
  │      └── Classify (categories, tags)
  │
  ├── 3. INGEST VIA API
  │      POST /api/v1/news
  │      Authorization: Bearer <NEWS_INGEST_API_KEY>
  │      Body: {
  │        headline, summary, analysis, why_it_matters,
  │        source_name, source_url, published_at,
  │        categories, tags, companies, industries,
  │        business_functions, technologies
  │      }
  │      │
  │      ├── Server validates Bearer token
  │      ├── Server validates schema (Zod)
  │      ├── Server normalizes canonical URL
  │      │      ├── Strips: utm_*, fbclid, ref, gclid
  │      │      ├── Normalizes: lowercase host, remove www, sort params
  │      │      └── Removes: trailing slash, fragment
  │      ├── Server calculates content_hash
  │      │      └── SHA-256(headline | summary | source_url)
  │      ├── Server checks duplicates:
  │      │      ├── By content_hash → if match: 409 Duplicate
  │      │      └── By canonical_url → if match: 409 Duplicate
  │      ├── Server sanitizes content:
  │      │      ├── Strips HTML tags
  │      │      ├── Decodes entities
  │      │      └── Caps field lengths
  │      ├── Server creates News record (status: PUBLISHED)
  │      ├── Server creates IngestionEvent:
  │      │      ├── source: "api"
  │      │      ├── status: "success" | "duplicate" | "error"
  │      │      └── payload_metadata: { headline, source_url }
  │      └── Server returns:
  │             ├── 201: { success: true, news_id, status: "published" }
  │             ├── 409: { success: false, error: "duplicate", existing_id }
  │             ├── 401: { error: "unauthorized" }
  │             └── 422: { error: "validation", details }
  │
  ├── 4. CHECK RESPONSE
  │      ├── 201 → log success, continue
  │      ├── 409 → log duplicate, skip (already exists)
  │      ├── 401 → alert: API key invalid
  │      └── 422 → log validation error, fix payload
  │
  └── 5. REPEAT for next article
```

### Flow 7B: Query Existing Content (for dedup check before ingest)

```
GET /api/v1/news?q=orchestration&limit=50
  ├── Agent checks existing articles before ingesting
  ├── Avoids re-ingesting same stories
  └── Uses content_hash comparison
```

### Flow 7C: Link News to Use Cases (future)

```
Future: Agent analyzes new news → finds related use cases → creates NewsUseCase link
  ├── GET /api/v1/use-cases?q=<extracted_keywords>
  ├── Calculates relevance score
  └── Creates link via admin API (requires admin auth)
```

**Authentication:** Bearer token (NEWS_INGEST_API_KEY)
**Rate limiting:** Per-IP, enforced by middleware
**Audit:** Every attempt logged in IngestionEvent
**Data created:** News, IngestionEvents

---

## Cross-Persona Flow: News → Knowledge → Idea → Value

This is the fundamental product flow, showing how personas interact across the system:

```
1. API Agent ingests news            → News table
2. News Admin reviews/edits           → /admin/news
3. Use Case Admin reads news          → /admin/use-cases/new (creates use case from insight)
4. Use Case Admin links news          → NewsUseCase table
5. Client User browses use cases       → /use-cases
6. Client User uses AI Advisor        → /ask-ai (EXPLORE mode finds use cases)
7. Client User ideates               → /ask-ai (IDEATE mode generates opportunity)
8. Client User assesses               → /ask-ai (ASSESS mode calculates ROI)
9. Client User saves idea             → /account/ideas (Opportunity Card)
10. Platform Admin reviews ideas      → /admin/ideas (approves/rejects)
11. Reader browses news               → /news (stays informed)
```

**Product principle preserved:** NEWS → KNOWLEDGE → CONVERSATION → IDEA → VALUE → CUSTOMER
