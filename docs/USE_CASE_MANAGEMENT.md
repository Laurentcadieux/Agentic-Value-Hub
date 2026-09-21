# Use Case Management Guide — AI-Friendly Reference

> **Purpose:** Single source of truth for AI agents to create, read, update, and delete use cases on Agentic Value Hub. Use cases are enterprise AI/automation patterns — problems, solutions, and value drivers for agentic AI.

## Quick Start

```bash
BASE=https://agenticvaluehub.com
API_KEY=LUZ26Le0KX6sZU9x_H5F6wY1XTN6Fff5gZGJQfAG44g

# Minimal use case
curl -X POST $BASE/api/v1/use-cases \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title": "Automated Invoice Processing with AI Agents"}'
```

---

## Authentication

| Operation | Auth Required |
|-----------|:------------:|
| GET (list, single) | ❌ No (public/generic view) |
| GET (full data) | ✅ Yes (returns sensitive fields) |
| POST (create) | ✅ Yes |
| PATCH (update) | ✅ Yes |
| DELETE | ✅ Yes |

Send token as:
```
Authorization: Bearer <API_KEY>
```

---

## Field Visibility Guide

> **The API stores ALL data but only shows generic information publicly.** Sensitive fields (submitter info, risks, controls, systems, sourceRefs) are hidden without auth. The website only renders public fields.

### 🟢 Public Fields (visible on website + public API)

| Field | Type | Required | Example | Website Renders | Description |
|-------|------|:--------:|---------|:---------------:|-------------|
| `title` | string | ✅ | "Automated Invoice Processing with AI Agents" | ✅ Title (h1) | Clear, descriptive title (max 300 chars) |
| `subtitle` | string | ❌ | "Cut invoice processing time by 80%" | ✅ Under title | One-line summary |
| `description` | string | ❌ | "AI agents extract, validate, and route invoices..." | ✅ Body | Full description |
| `problem` | string | ❌ | "Manual processing takes 15 min per invoice..." | ✅ "Problem" section | The problem being solved |
| `solution` | string | ❌ | "Multi-agent system: extraction + validation + routing agents" | ✅ "Solution" section | How AI agents solve the problem |
| `conclusion` | string | ❌ | "Organizations see ROI within 3 months..." | ✅ "Bottom line" section | Closing summary |
| `keyTakeaways` | string[] | ❌ | `["80% faster processing", "67% fewer errors"]` | ✅ Numbered list box | 3-5 scannable bullets |
| `imageUrl` | string (URL) | ❌ | "https://agenticvaluehub.com/uploads/uuid.jpg" | ✅ Hero image | Use case image |
| `author` | string | ❌ | "Enterprise AI Scout" | ✅ Byline | Author/agent name |
| `readingTimeMinutes` | int | ❌ | `4` | ✅ "4 min read" | Estimated read time |
| `isFeatured` | boolean | ❌ | `true` | ✅ ★ badge | Show on homepage |
| `ctaLabel` | string | ❌ | "Explore related news" | ✅ CTA button | CTA button text |
| `ctaUrl` | string (URL) | ❌ | "https://agenticvaluehub.com/news" | ✅ CTA link | CTA button link |
| `industry` | string | ❌ | "Finance" | ✅ Badge | Industry vertical |
| `businessFunction` | string | ❌ | "Accounts Payable" | ✅ Badge | Business function |
| `technologies` | string[] | ❌ | `["AI Agents", "OCR", "RPA"]` | ✅ Tags (neutral) | AI/automation types |
| `techStack` | string[] | ❌ | `["UiPath", "Pega", "Power Automate"]` | ✅ Tags (indigo) | Specific tools/platforms |
| `valueDrivers` | string[] | ❌ | `["Cost reduction", "Accuracy"]` | ✅ Tags | Value drivers |
| `agentPattern` | string | ❌ | "Multi-agent orchestration" | ✅ Detail page | AI agent pattern |
| `automationPattern` | string | ❌ | "Straight-through processing" | ✅ Detail page | Automation pattern |
| `automationPotential` | float | ❌ | `85` | ✅ Progress bar (green) | 0-100 score |
| `endToEndAutomationSuccess` | float | ❌ | `78` | ✅ Progress bar (blue) | End-to-end success rate (0-100) |
| `agenticPercentage` | float | ❌ | `65` | ✅ Progress bar (red) | AI handling unstructured data (0-100) |
| `boatCapabilities` | string[] | ❌ | `["Agentic Automation", "Business Process Orchestration"]` | ✅ BOAT badges | Gartner BOAT capabilities |
| `complexity` | string | ❌ | "Medium" | ✅ Badge | Implementation complexity |
| `slug` | string | ❌ | "automated-invoice-processing" | ✅ URL | Auto from title |
| `status` | enum | ❌ | `PUBLISHED` | ❌ (controls visibility) | PUBLISHED, DRAFT, ARCHIVED |
| `createdAt` | timestamp | auto | — | ❌ | Auto timestamp |
| `updatedAt` | timestamp | auto | — | ❌ | Auto timestamp |

### 🔴 Sensitive Fields (NOT visible on website — hidden from public API, visible only with auth)

| Field | Type | Example | Website Renders | Public API | Auth API | Description |
|-------|------|---------|:---------------:|:----------:|:--------:|-------------|
| `submitterName` | string | "Jane Smith" | ❌ Never | ❌ Hidden | ✅ | Who submitted this use case |
| `submitterCompany` | string | "Acme Corp" | ❌ Never | ❌ Hidden | ✅ | Submitter's company |
| `submitterDepartment` | string | "IT Operations" | ❌ Never | ❌ Hidden | ✅ | Submitter's department |
| `submitterEmail` | string | "jane@acme.com" | ❌ Never | ❌ Hidden | ✅ | Submitter's contact email |
| `risks` | string | "Vendor lock-in risk..." | ❌ Never | ❌ Hidden | ✅ | Risk assessment |
| `controls` | string | "Human-in-the-loop for >$10K" | ❌ Never | ❌ Hidden | ✅ | Control measures |
| `systems` | string[] | `["SAP", "QuickBooks"]` | ❌ Never | ❌ Hidden | ✅ | Systems involved |
| `sourceRefs` | JSON | `{"url": "..."}` | ❌ Never | ❌ Hidden | ✅ | Source references |
| `customerId` | string | "uuid" | ❌ Never | ❌ Hidden | ✅ | Owning customer |

### Auto-Generated

| Field | How it's set |
|-------|-------------|
| `id` | UUID auto-generated |
| `slug` | From title (auto if not provided) |
| `status` | Defaults to `DRAFT` — set `PUBLISHED` to show on website |
| `createdAt` | Timestamp on creation |
| `updatedAt` | Timestamp on update |

---

## Gartner BOAT Capabilities

Valid values for `boatCapabilities`. Each maps to a Gartner-defined BOAT platform capability:

| Capability | Description |
|-----------|-------------|
| Business Process Orchestration | Coordinating multi-step processes across systems, teams, and time, including processes that pause, resume, and adapt |
| Enterprise Connectivity | Integrating with core systems (ERP, CRM, legacy applications) where enterprise data lives |
| Low-Code Development | Enabling business and IT teams to build workflows without full custom development |
| Agentic Automation | Orchestrating AI agents alongside deterministic, rules-based automation within governed processes |
| Case Management | Managing unstructured work with context, audit trails, and adaptive routing |
| Robotic Process Automation | Automating repetitive tasks by mimicking user actions on existing interfaces |
| Intelligent Document Processing | Extracting data from unstructured and semi-structured documents |
| Collaborative Workflow Management | Managing collaborative human workflows with task assignment and tracking |
| Document Management | Managing document lifecycle, versioning, and content |
| Platform Governance and Operations | Governing and operating the automation platform (audit, monitoring, security) |

**Reference:** Gartner introduced BOAT in 2024, formalized it in 2025 with the first Magic Quadrant evaluating 20 vendors (UiPath, Pega, Appian, ServiceNow, Microsoft, etc.). The 2026 Critical Capabilities report evaluates vendors across 5 use cases and 10 capabilities.

---

## Metrics Explained

| Metric | Color | What It Measures | How to Calculate |
|--------|-------|-----------------|-----------------|
| `automationPotential` | 🟢 Green | Overall automation potential of this process | Based on volume, repetitiveness, rule-following, and exception rate |
| `endToEndAutomationSuccess` | 🔵 Blue | Success rate of end-to-end automated execution without human intervention | (Fully automated cases / Total cases) × 100 |
| `agenticPercentage` | 🔴 Red | How much of the process requires AI to handle unstructured data (vs. deterministic rules) | (Unstructured decision points / Total decision points) × 100 |

**Why agenticPercentage matters:** A high score means the use case genuinely needs AI agents (not just RPA). A low score means deterministic automation may suffice. This distinguishes "agentic" use cases from traditional RPA.

---

## Operations

### 1. Create Use Case

```
POST /api/v1/use-cases
Authorization: Bearer <API_KEY>
Content-Type: application/json
```

**Minimal:**
```json
{
  "title": "Automated Invoice Processing with AI Agents"
}
```

**Full (with all fields):**
```json
{
  "title": "Automated Invoice Processing with AI Agents",
  "subtitle": "Cut invoice processing time by 80% with multi-agent automation",
  "description": "AI agents extract, validate, and route invoices without human intervention, integrating with ERP systems for straight-through processing.",
  "problem": "Manual invoice processing takes 15 minutes per invoice with a 12% error rate. Finance teams spend 60% of their time on data entry.",
  "solution": "A multi-agent system: an extraction agent (OCR + NLP) reads invoices, a validation agent cross-checks against PO records, and a routing agent submits to the ERP.",
  "conclusion": "Organizations see ROI within 3 months. Start with high-volume, low-complexity invoices and expand as accuracy improves.",
  "keyTakeaways": [
    "80% faster processing (15 min → 3 min per invoice)",
    "67% error reduction (12% to 4%)",
    "ROI within 3 months for high-volume operations",
    "Best starting point: high-volume, low-complexity invoices"
  ],
  "imageUrl": "https://agenticvaluehub.com/uploads/uuid.jpg",
  "author": "Enterprise AI Scout",
  "readingTimeMinutes": 4,
  "isFeatured": true,
  "ctaLabel": "See related news",
  "ctaUrl": "https://agenticvaluehub.com/news?q=invoice",
  "industry": "Finance",
  "businessFunction": "Accounts Payable",
  "technologies": ["AI Agents", "OCR", "RPA"],
  "techStack": ["UiPath", "Pega Infinity", "Azure OpenAI"],
  "valueDrivers": ["Cost reduction", "Accuracy", "Speed"],
  "agentPattern": "Multi-agent orchestration",
  "automationPattern": "Straight-through processing",
  "automationPotential": 85,
  "endToEndAutomationSuccess": 78,
  "agenticPercentage": 65,
  "boatCapabilities": [
    "Business Process Orchestration",
    "Agentic Automation",
    "Intelligent Document Processing"
  ],
  "complexity": "Medium",
  "risks": "Vendor lock-in risk with OCR provider. Accuracy drops on handwritten invoices.",
  "controls": "Human-in-the-loop for invoices over $10K. Monthly accuracy audits.",
  "systems": ["SAP", "QuickBooks", "Custom OCR API"],
  "submitterName": "Jane Smith",
  "submitterCompany": "Acme Corp",
  "submitterDepartment": "IT Operations",
  "submitterEmail": "jane@acme.com",
  "status": "PUBLISHED"
}
```

**Responses:**

| Code | Body | Meaning |
|------|------|---------|
| 201 | `{...useCase}` | Created |
| 409 | `{"error": "Slug already exists"}` | Duplicate slug |
| 422 | `{"error": "Validation failed", "issues": {...}}` | Invalid |
| 401 | `{"error": "Unauthorized"}` | Bad token |

### 2. List Use Cases

```
GET /api/v1/use-cases?page=1&pageSize=12&q=invoice&industry=Finance
```

**Query params:**

| Param | Default | Description |
|-------|---------|-------------|
| `page` | 1 | Page number |
| `pageSize` | 12 | Items per page (max 100) |
| `q` | — | Keyword search |
| `industry` | — | Filter by industry |
| `businessFunction` | — | Filter by business function |
| `technology` | — | Filter by technology |
| `agentPattern` | — | Filter by agent pattern |
| `automationPattern` | — | Filter by automation pattern |
| `complexity` | — | Filter by complexity |
| `valueDriver` | — | Filter by value driver |
| `status` | PUBLISHED | PUBLISHED, DRAFT, ARCHIVED, ALL |
| `orderBy` | newest | newest, oldest, potential, title |
| `facets` | false | Set to true for facet counts |

**Without auth:** Returns public fields only (no submitter info, risks, controls, systems, sourceRefs).
**With auth:** Returns ALL fields including sensitive ones.

### 3. Get Single Use Case

```
GET /api/v1/use-cases/:id    (by ID or slug)
```

**Without auth:** Public view (no sensitive fields).
**With auth:** Full data including submitter info, risks, controls, systems.

### 4. Update Use Case

```
PATCH /api/v1/use-cases/:id
Authorization: Bearer <API_KEY>
```

Send only fields to change — unspecified fields remain unchanged:
```json
{
  "title": "Updated title",
  "status": "PUBLISHED",
  "automationPotential": 90,
  "techStack": ["UiPath", "Power Automate"]
}
```

### 5. Delete Use Case

```
DELETE /api/v1/use-cases/:id
Authorization: Bearer <API_KEY>
```

Response: `{"success": true}`

---

## AI Agent Workflow

```
1. Generate use case content (title, problem, solution, etc.)
2. (Optional) Upload image → get URL
3. POST /api/v1/use-cases with all fields + imageUrl
4. If 409 → slug exists, try PATCH or use a different slug
5. If 201 → success
```

### Field Generation Strategies

| Field | Strategy |
|-------|---------|
| `title` | Clear, specific. "Automate [process] with [technology]" |
| `subtitle` | One sentence: outcome + method |
| `problem` | Current state: time, cost, error rate |
| `solution` | Agent architecture: what agents do what |
| `conclusion` | ROI timeline + recommendation |
| `keyTakeaways` | 3-5 quantified outcomes |
| `industry` | Finance, Healthcare, Manufacturing, etc. |
| `businessFunction` | Accounts Payable, IT Ops, Customer Service, etc. |
| `technologies` | AI Agents, RPA, OCR, BOAT, etc. (AI/automation types) |
| `techStack` | Specific products: UiPath, Pega, Power Automate, ServiceNow, etc. |
| `valueDrivers` | Cost reduction, Accuracy, Speed, Compliance |
| `agentPattern` | Multi-agent, Single-agent, Orchestration |
| `automationPattern` | Straight-through, Human-in-the-loop, Hybrid |
| `automationPotential` | 0-100 score based on complexity + volume |
| `endToEndAutomationSuccess` | (Fully automated / Total) × 100 |
| `agenticPercentage` | (Unstructured decisions / Total decisions) × 100 |
| `boatCapabilities` | Map to Gartner BOAT capabilities (see table above) |
| `complexity` | Low, Medium, High |
| `risks` | Vendor lock-in, accuracy edge cases, integration |
| `controls` | Human-in-the-loop thresholds, audit cadence |
| `systems` | ERP, CRM, custom APIs involved |
| `submitterName` | Name of the person submitting (self-service) |
| `submitterCompany` | Company name (self-service) |
| `submitterDepartment` | Department (self-service) |
| `submitterEmail` | Contact email (self-service) |

---

## Status Management

| Status | When to use | Visible on website? |
|--------|-------------|:-------------------:|
| `DRAFT` | Default — not ready for public view | ❌ No |
| `PUBLISHED` | Visible on website and public API | ✅ Yes |
| `ARCHIVED` | Old/outdated, hidden from listings | ❌ No |

---

## Image Upload

Same as news — see [News Management Guide](./NEWS_MANAGEMENT.md#image-upload):

```bash
curl -X POST $BASE/api/v1/upload \
  -H "Authorization: Bearer $API_KEY" \
  -F "file=@/path/to/image.jpg"
```

Returns: `{"success": true, "url": "https://agenticvaluehub.com/uploads/uuid.jpg"}`

Use the returned URL as `imageUrl` when creating or updating a use case.

Supported: JPG, PNG, WebP, GIF, SVG (max 10MB)

---

## Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/api/v1/use-cases` | ✅ | Create use case |
| GET | `/api/v1/use-cases` | ❌/✅ | List (public fields without auth, all with auth) |
| GET | `/api/v1/use-cases/:id` | ❌/✅ | Get single (public/auth) |
| PATCH | `/api/v1/use-cases/:id` | ✅ | Update use case |
| DELETE | `/api/v1/use-cases/:id` | ✅ | Delete use case |
| GET | `/api/v1/use-cases/:id/related` | ❌ | Related use cases |
| POST | `/api/v1/upload` | ✅ | Upload image |

---

## Database

```
Host: 192.168.0.111:5432
Database: avh
User: avh
Tables: use_cases, news_use_cases
```

### Direct DB Access (for debugging)

```bash
PGPASSWORD=avh_prod_2026 psql -h 192.168.0.111 -U avh -d avh -c "SELECT COUNT(*) FROM use_cases;"
PGPASSWORD=avh_prod_2026 psql -h 192.168.0.111 -U avh -d avh -c "DELETE FROM use_cases;"
PGPASSWORD=avh_prod_2026 psql -h 192.168.0.111 -U avh -d avh -c "SELECT id, title, status FROM use_cases ORDER BY \"createdAt\" DESC LIMIT 10;"
```

### Table: `use_cases` — All Columns

| Column | Type | Nullable | Default | Public? |
|--------|------|----------|---------|:-------:|
| `id` | text | NOT NULL | UUID | ✅ |
| `slug` | text | NOT NULL | — | ✅ |
| `title` | text | NOT NULL | — | ✅ |
| `subtitle` | text | — | — | ✅ |
| `description` | text | — | — | ✅ |
| `problem` | text | — | — | ✅ |
| `solution` | text | — | — | ✅ |
| `conclusion` | text | — | — | ✅ |
| `keyTakeaways` | text[] | — | — | ✅ |
| `imageUrl` | text | — | — | ✅ |
| `author` | text | — | — | ✅ |
| `readingTimeMinutes` | integer | — | — | ✅ |
| `ctaLabel` | text | — | — | ✅ |
| `ctaUrl` | text | — | — | ✅ |
| `isFeatured` | boolean | NOT NULL | false | ✅ |
| `industry` | text | — | — | ✅ |
| `businessFunction` | text | — | — | ✅ |
| `agentPattern` | text | — | — | ✅ |
| `automationPattern` | text | — | — | ✅ |
| `valueDrivers` | text[] | — | — | ✅ |
| `technologies` | text[] | — | — | ✅ |
| `techStack` | text[] | — | — | ✅ |
| `boatCapabilities` | text[] | — | — | ✅ |
| `automationPotential` | double precision | — | — | ✅ |
| `endToEndAutomationSuccess` | double precision | — | — | ✅ |
| `agenticPercentage` | double precision | — | — | ✅ |
| `complexity` | text | — | — | ✅ |
| `risks` | text | — | — | ❌ Hidden |
| `controls` | text | — | — | ❌ Hidden |
| `systems` | text[] | — | — | ❌ Hidden |
| `sourceRefs` | jsonb | — | — | ❌ Hidden |
| `submitterName` | text | — | — | ❌ Hidden |
| `submitterCompany` | text | — | — | ❌ Hidden |
| `submitterDepartment` | text | — | — | ❌ Hidden |
| `submitterEmail` | text | — | — | ❌ Hidden |
| `status` | UseCaseStatus | NOT NULL | DRAFT | ✅ (controls visibility) |
| `customerId` | text | — | — | ❌ Hidden |
| `createdAt` | timestamp | NOT NULL | now() | ✅ |
| `updatedAt` | timestamp | NOT NULL | — | ✅ |
