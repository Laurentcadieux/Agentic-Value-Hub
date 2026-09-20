# Agentic Value Hub — Project Plan

**Tagline:** Turn AI agents into business value.

**Product Flow:** NEWS → KNOWLEDGE → USE CASE → AI CONVERSATION → IDEA → VALUE ASSESSMENT → CUSTOMER OPPORTUNITY

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + TypeScript 5.7 |
| Styling | Tailwind CSS 4 |
| Database | PostgreSQL 16 + pgvector |
| ORM | Prisma 6 |
| Auth | Auth.js (NextAuth v5) |
| Validation | Zod |
| Testing | Vitest (unit) + Playwright (E2E) |
| AI | Provider-independent (abstract interface) |

## Architecture

```
UI → API/Server Actions → Services → Repositories → PostgreSQL
UI → AI Service → Knowledge Retrieval → Model Provider
```

## Phase Tracking

### PHASE 0 — FOUNDATION
**Status:** 🟡 IN PROGRESS

**Checklist:**
- [ ] Next.js TypeScript project structure
- [ ] Tailwind CSS configuration
- [ ] Folder architecture (src/app, src/lib, src/repositories, src/services)
- [ ] Prisma ORM + PostgreSQL configuration
- [ ] Database schema (all models from spec)
- [ ] Environment variable validation (Zod)
- [ ] Testing framework (Vitest)
- [ ] Linting (ESLint) + Formatting (Prettier)
- [ ] .env.example with all placeholders
- [ ] README + architecture docs
- [ ] npm install passes
- [ ] prisma generate passes
- [ ] tsc --noEmit passes
- [ ] next lint passes
- [ ] Health API endpoint (/api/health)
- [ ] News ingestion API stub (/api/v1/news POST with auth)
- [ ] AI provider abstraction interface
- [ ] Value calculation function
- [ ] Prisma seed script (DEMO data)

**Files to create:**
- package.json, tsconfig.json, next.config.ts
- tailwind.config.ts, postcss.config.mjs
- src/app/globals.css, layout.tsx, page.tsx
- prisma/schema.prisma, prisma/seed.ts
- src/lib/prisma.ts, src/lib/env.ts
- src/lib/ai/provider.ts, src/lib/value/calculate.ts
- src/repositories/index.ts, src/services/index.ts
- .env.example, vitest.config.ts, .eslintrc.json, .prettierrc
- src/app/api/health/route.ts
- src/app/api/v1/news/route.ts

**Acceptance:** All checks pass. No type errors. No lint errors.

---

### PHASE 1 — PUBLIC WEBSITE
**Status:** ⬜ NOT STARTED

**Checklist:**
- [ ] Homepage with hero, AI input, sections
- [ ] Navigation component (responsive)
- [ ] /news listing page
- [ ] /news/[slug] detail page
- [ ] /use-cases listing page
- [ ] /use-cases/[slug] detail page
- [ ] /industries + /industries/[slug]
- [ ] /functions + /functions/[slug]
- [ ] /technologies + /technologies/[slug]
- [ ] /about page
- [ ] /methodology page
- [ ] Footer component
- [ ] SEO framework (metadata, OpenGraph, sitemap.xml, robots.txt)
- [ ] Responsive design (mobile-first)
- [ ] Dark mode support

**Acceptance:** All public pages render. SEO metadata present. Lighthouse mobile score > 90.

---

### PHASE 2 — NEWS PLATFORM
**Status:** ⬜ NOT STARTED

**Checklist:**
- [ ] News schema fully implemented in DB
- [ ] POST /api/v1/news ingestion endpoint
- [ ] Bearer token authentication
- [ ] Zod request validation
- [ ] Canonical URL normalization
- [ ] Duplicate detection (content_hash)
- [ ] Content sanitization
- [ ] Ingestion audit log (IngestionEvent)
- [ ] Publication workflow
- [ ] Source links (no copyrighted content)
- [ ] Admin news management (/admin/news)
- [ ] GET /api/v1/news (list with pagination)
- [ ] GET /api/v1/news/:id
- [ ] Structured error responses

**Acceptance:** Can POST news via API with auth. Duplicates rejected. Audit log created.

---

### PHASE 3 — KNOWLEDGE BASE
**Status:** ⬜ NOT STARTED

**Checklist:**
- [ ] Use-case database fully populated
- [ ] Keyword search endpoint
- [ ] Filter by industry, function, technology, pattern, complexity, value
- [ ] pgvector extension enabled
- [ ] Embeddings generation pipeline
- [ ] Semantic search endpoint
- [ ] Related use cases (similarity)
- [ ] Related news linking
- [ ] Admin use-case management (/admin/use-cases)
- [ ] GET /api/v1/use-cases with filters
- [ ] GET /api/v1/use-cases/:id

**Acceptance:** Can search use cases by keyword and semantically. Related items returned.

---

### PHASE 4 — AI ADVISOR
**Status:** ⬜ NOT STARTED

**Checklist:**
- [ ] Full-page chat UI (/ask-ai)
- [ ] AgentProvider interface implementation
- [ ] Knowledge retrieval (RAG from use cases + news)
- [ ] Persistent conversations (DB-backed)
- [ ] LEARN mode
- [ ] EXPLORE mode
- [ ] IDEATE mode
- [ ] ASSESS mode
- [ ] Conversation state machine
- [ ] Server-side validation of AI outputs
- [ ] Prompt injection defense
- [ ] Customer data scoping
- [ ] POST /api/v1/conversations
- [ ] GET /api/v1/conversations/:id
- [ ] POST /api/v1/conversations/:id/messages

**Acceptance:** Can chat in all 4 modes. Conversations persist. AI cites knowledge base.

---

### PHASE 5 — IDEA LAB
**Status:** ⬜ NOT STARTED

**Checklist:**
- [ ] /idea-lab page
- [ ] Guided ideation flow
- [ ] Structured data extraction from conversation
- [ ] Opportunity Card generation
- [ ] ROI/value engine (calculateOpportunityValue)
- [ ] Assumptions tracking
- [ ] Save idea (POST /api/v1/ideas)
- [ ] Edit idea (PATCH /api/v1/ideas/:id)
- [ ] Resume assessment
- [ ] Customer linkage
- [ ] POST /api/v1/ideas/:id/assess
- [ ] /account/ideas listing
- [ ] /account/ideas/[id] detail

**Acceptance:** Can create, assess, save, and edit ideas. Opportunity Card generated.

---

### PHASE 6 — ACCOUNTS
**Status:** ⬜ NOT STARTED

**Checklist:**
- [ ] Auth.js configuration
- [ ] /login page
- [ ] /account profile page
- [ ] User registration
- [ ] Company/customer creation
- [ ] My Ideas page
- [ ] Conversation history
- [ ] Tenant authorization (users see only their customer's data)
- [ ] Admin role authorization
- [ ] Session management

**Acceptance:** Users can register, login, view their data. Tenant isolation enforced.

---

### PHASE 7 — ADMINISTRATION
**Status:** ⬜ NOT STARTED

**Checklist:**
- [ ] /admin dashboard
- [ ] /admin/news management
- [ ] /admin/use-cases management
- [ ] /admin/customers
- [ ] /admin/ideas
- [ ] /admin/taxonomy (industries, functions, technologies)
- [ ] /admin/ingestion monitoring
- [ ] Admin authorization (role-based)

**Acceptance:** Admin can manage all content. Non-admins blocked from /admin.

---

### PHASE 8 — PRODUCTION
**Status:** ⬜ NOT STARTED

**Checklist:**
- [ ] US deployment configuration (My_Hybrid_infra integration)
- [ ] Production PostgreSQL setup
- [ ] Database backups
- [ ] Secrets management (no NEXT_PUBLIC_ secrets)
- [ ] Rate limiting on public APIs
- [ ] Security headers
- [ ] Privacy pages (/privacy, /terms)
- [ ] Monitoring (Uptime Kuma integration)
- [ ] Analytics
- [ ] Accessibility validation (WCAG 2.1 AA)
- [ ] Performance testing
- [ ] Production build passes
- [ ] Standalone output for containerized deployment

**Acceptance:** App deployed to Proxmox via infra repo. SSL working. Backups configured.

---

## Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 15 App Router | Full-stack, SSR, server actions, API routes |
| ORM | Prisma 6 | Type-safe, great migrations, pgvector support |
| Database | PostgreSQL 16 + pgvector | Semantic search required |
| Auth | Auth.js v5 | Next.js native, abstracted |
| Validation | Zod | Type-safe schemas for API + forms |
| Testing | Vitest + Playwright | Unit + E2E |
| Styling | Tailwind CSS 4 | Spec requirement |
| AI Provider | Abstracted interface | Vendor-independent per spec |
| IDs | UUID (string) | Spec requires UUID, no sequential IDs |
| Layer separation | UI → API → Services → Repos → DB | Spec requirement |

## Database Models Summary

| Model | Purpose | Key Fields |
|-------|---------|------------|
| Customer | Company | companyName, industry, employeeRange |
| User | App user | email, role, customerId |
| Idea | Automation opportunity | problem, process, value estimate |
| Conversation | AI chat session | type, ideaId, userId |
| Message | Chat message | role, content, metadata |
| UseCase | Knowledge base entry | industry, function, agentPattern |
| News | Agentic intelligence | headline, analysis, sourceUrl |
| NewsUseCase | Link table | relevanceScore |
| IngestionEvent | Audit log | source, status, error |

## API Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /api/health | GET | none | Health check |
| /api/v1/news | GET | none | List news |
| /api/v1/news/:id | GET | none | Get news item |
| /api/v1/news | POST | Bearer | Ingest news |
| /api/v1/use-cases | GET | none | List use cases |
| /api/v1/use-cases/:id | GET | none | Get use case |
| /api/v1/ideas | POST | session | Create idea |
| /api/v1/ideas/:id | GET | session | Get idea |
| /api/v1/ideas/:id | PATCH | session | Update idea |
| /api/v1/ideas/:id/assess | POST | session | Assess idea |
| /api/v1/conversations | POST | session | Create conversation |
| /api/v1/conversations/:id | GET | session | Get conversation |
| /api/v1/conversations/:id/messages | POST | session | Send message |
| /api/v1/search | GET | none | Search all |

## Infrastructure Integration

This app deploys via [My_Hybrid_infra](https://github.com/Laurentcadieux/My_Hybrid_infra):

```
Internet → DO Nginx (shared, SSL) → Proxmox VM (Next.js standalone)
                                      └── PostgreSQL (separate VM or same)
```

- DO Nginx edge handles SSL + reverse proxy (already running)
- Proxmox VM runs Next.js standalone build
- PostgreSQL on same or separate Proxmox VM
- WireGuard VPN for DO ↔ Proxmox connectivity
- Terraform creates VMs, Ansible deploys the app
