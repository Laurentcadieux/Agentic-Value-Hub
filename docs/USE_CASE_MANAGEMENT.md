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

**Public vs Authenticated views:**

The API stores all data but only shows **generic** information publicly. Sensitive fields are hidden without auth:

| Field | Public (no auth) | Authenticated |
|-------|:----------------:|:------------:|
| title, subtitle, description | ✅ | ✅ |
| problem, solution, conclusion | ✅ | ✅ |
| keyTakeaways, imageUrl, author | ✅ | ✅ |
| industry, businessFunction | ✅ | ✅ |
| technologies, valueDrivers | ✅ | ✅ |
| agentPattern, automationPattern | ✅ | ✅ |
| automationPotential, complexity | ✅ | ✅ |
| ctaLabel, ctaUrl, isFeatured | ✅ | ✅ |
| status, slug, dates | ✅ | ✅ |
| **risks** | ❌ Hidden | ✅ |
| **controls** | ❌ Hidden | ✅ |
| **systems** | ❌ Hidden | ✅ |
| **sourceRefs** | ❌ Hidden | ✅ |
| **customerId** | ❌ Hidden | ✅ |

---

## Full Use Case Schema

Only `title` is required. All other fields are optional.

### Core Content

| Field | Type | Required | Example | Description |
|-------|------|:--------:|---------|-------------|
| `title` | string | ✅ | "Automated Invoice Processing with AI Agents" | Clear, descriptive title (max 300 chars) |
| `subtitle` | string | ❌ | "Cut invoice processing time by 80% with agentic AI" | One-line summary under title |
| `description` | string | ❌ | "AI agents extract, validate, and route invoices..." | Full description of the use case |
| `problem` | string | ❌ | "Manual invoice processing takes 15 min per invoice..." | The problem being solved |
| `solution` | string | ❌ | "Multi-agent system: extraction agent + validation agent..." | How AI agents solve the problem |
| `conclusion` | string | ❌ | "Organizations see ROI within 3 months..." | Closing summary |

### Enhanced Presentation

| Field | Type | Required | Example | Description |
|-------|------|:--------:|---------|-------------|
| `keyTakeaways` | string[] | ❌ | `["80% faster processing", "67% fewer errors"]` | 3-5 scannable bullet points |
| `imageUrl` | string (URL) | ❌ | "https://agenticvaluehub.com/uploads/uuid.jpg" | Use case image |
| `author` | string | ❌ | "Enterprise AI Scout" | Author/agent name |
| `readingTimeMinutes` | int | ❌ | `4` | Estimated read time |
| `isFeatured` | boolean | ❌ | `true` | Show on homepage |
| `ctaLabel` | string | ❌ | "Explore related news" | CTA button text |
| `ctaUrl` | string (URL) | ❌ | "https://agenticvaluehub.com/news" | CTA button link |

### Classification

| Field | Type | Required | Example | Description |
|-------|------|:--------:|---------|-------------|
| `industry` | string | ❌ | "Finance" | Industry vertical |
| `businessFunction` | string | ❌ | "Accounts Payable" | Business function |
| `technologies` | string[] | ❌ | `["AI Agents", "OCR", "RPA"]` | Technologies used (AI/automation types) |
| `techStack` | string[] | ❌ | `["UiPath", "Pega", "Power Automate"]` | Specific tools/platforms used |
| `valueDrivers` | string[] | ❌ | `["Cost reduction", "Accuracy"]` | Value drivers |
| `agentPattern` | string | ❌ | "Multi-agent orchestration" | AI agent pattern |
| `automationPattern` | string | ❌ | "Straight-through processing" | Automation pattern |
| `automationPotential` | float | ❌ | `85` | 0-100 score |
| `endToEndAutomationSuccess` | float | ❌ | `78` | End-to-end automation success rate (0-100) |
| `agenticPercentage` | float | ❌ | `65` | How much AI handles unstructured data (0-100) |
| `boatCapabilities` | string[] | ❌ | `["Agentic Automation", "Business Process Orchestration"]` | Gartner BOAT capabilities this use case maps to |
| `complexity` | string | ❌ | "Medium" | Implementation complexity |

### Gartner BOAT Capabilities

Valid values for `boatCapabilities`:

| Capability | Description |
|-----------|-------------|
| Business Process Orchestration | Coordinating multi-step processes across systems, teams, and time |
| Enterprise Connectivity | Integrating with core systems (ERP, CRM, legacy) |
| Low-Code Development | Enabling business and IT to build workflows without full custom dev |
| Agentic Automation | Orchestrating AI agents alongside deterministic automation |
| Case Management | Managing unstructured work with context and audit trails |
| Robotic Process Automation | Automating repetitive tasks by mimicking user actions |
| Intelligent Document Processing | Extracting data from unstructured/semi-structured documents |
| Collaborative Workflow Management | Managing collaborative human workflows |
| Document Management | Managing document lifecycle and content |
| Platform Governance and Operations | Governing and operating the automation platform |

### Submitter Info (self-service — sensitive, hidden from public)

| Field | Type | Public | Example | Description |
|-------|------|:------:|---------|-------------|
| `submitterName` | string | ❌ Hidden | "Jane Smith" | Name of person who submitted |
| `submitterCompany` | string | ❌ Hidden | "Acme Corp" | Company of submitter |
| `submitterDepartment` | string | ❌ Hidden | "IT Operations" | Department of submitter |
| `submitterEmail` | string | ❌ Hidden | "jane@acme.com" | Contact email for follow-up |

### Sensitive (authenticated only — hidden from public)

| Field | Type | Public | Description |
|-------|------|:------:|-------------|
| `risks` | string | ❌ Hidden | Risk assessment |
| `controls` | string | ❌ Hidden | Control measures |
| `systems` | string[] | ❌ Hidden | Systems involved |
| `sourceRefs` | JSON | ❌ Hidden | Source references |
| `customerId` | string | ❌ Hidden | Owning customer |
| `submitterName` | string | ❌ Hidden | Who submitted this use case |
| `submitterCompany` | string | ❌ Hidden | Submitter's company |
| `submitterDepartment` | string | ❌ Hidden | Submitter's department |
| `submitterEmail` | string | ❌ Hidden | Submitter's contact email |

### Auto-Generated

| Field | How it's set |
|-------|-------------|
| `id` | UUID auto-generated |
| `slug` | From title (auto if not provided) |
| `status` | Defaults to `DRAFT` |
| `createdAt` | Timestamp on creation |
| `updatedAt` | Timestamp on update |

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

**Full:**
```json
{
  "title": "Automated Invoice Processing with AI Agents",
  "subtitle": "Cut invoice processing time by 80% with agentic AI",
  "description": "AI agents extract, validate, and route invoices without human intervention...",
  "problem": "Manual invoice processing takes 15 min per invoice with 12% error rate.",
  "solution": "Multi-agent system: extraction agent (OCR) + validation agent (rules + ML) + routing agent (ERP integration).",
  "conclusion": "Organizations see ROI within 3 months. Start with high-volume, low-complexity invoices.",
  "keyTakeaways": [
    "80% faster processing (15 min → 3 min)",
    "67% fewer errors",
    "ROI within 3 months",
    "Best for high-volume, low-complexity invoices"
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
  "valueDrivers": ["Cost reduction", "Accuracy", "Speed"],
  "agentPattern": "Multi-agent orchestration",
  "automationPattern": "Straight-through processing",
  "automationPotential": 85,
  "complexity": "Medium",
  "risks": "Vendor lock-in, OCR accuracy on handwritten invoices",
  "controls": "Human-in-the-loop for amounts over $10K, monthly accuracy audits",
  "systems": ["SAP", "QuickBooks", "Custom OCR API"],
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

**Without auth:** Returns generic fields only (no risks, controls, systems, sourceRefs).
**With auth:** Returns all fields.

### 3. Get Single Use Case

```
GET /api/v1/use-cases/:id    (by ID or slug)
```

**Without auth:** Generic view (no sensitive fields).
**With auth:** Full data including risks, controls, systems, sourceRefs.

### 4. Update Use Case

```
PATCH /api/v1/use-cases/:id
Authorization: Bearer <API_KEY>
```

Send only fields to change:
```json
{
  "title": "Updated title",
  "status": "PUBLISHED",
  "automationPotential": 90
}
```

### 5. Delete Use Case

```
DELETE /api/v1/use-cases/:id
Authorization: Bearer <API_KEY>
```

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
| `technologies` | AI Agents, RPA, OCR, BOAT, etc. |
| `valueDrivers` | Cost reduction, Accuracy, Speed, Compliance |
| `agentPattern` | Multi-agent, Single-agent, Orchestration |
| `automationPattern` | Straight-through, Human-in-the-loop, Hybrid |
| `automationPotential` | 0-100 score based on complexity + volume |
| `complexity` | Low, Medium, High |
| `risks` | Vendor lock-in, accuracy edge cases, integration |
| `controls` | Human-in-the-loop thresholds, audit cadence |
| `systems` | ERP, CRM, custom APIs involved |

---

## Status Management

| Status | When to use |
|--------|-------------|
| `DRAFT` | Default — not visible publicly |
| `PUBLISHED` | Visible on website and public API |
| `ARCHIVED` | Old/outdated, hidden |

---

## Image Upload

Same as news — see [News Management Guide](./NEWS_MANAGEMENT.md#image-upload):

```bash
curl -X POST $BASE/api/v1/upload \
  -H "Authorization: Bearer $API_KEY" \
  -F "file=@/path/to/image.jpg"
```

Use the returned URL as `imageUrl` when creating or updating a use case.

---

## Endpoints Summary

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/api/v1/use-cases` | ✅ | Create use case |
| GET | `/api/v1/use-cases` | ❌/✅ | List (generic without auth, full with auth) |
| GET | `/api/v1/use-cases/:id` | ❌/✅ | Get single (generic/auth) |
| PATCH | `/api/v1/use-cases/:id` | ✅ | Update use case |
| DELETE | `/api/v1/use-cases/:id` | ✅ | Delete use case |
| GET | `/api/v1/use-cases/:id/related` | ❌ | Related use cases |

---

## Database

```
Host: 192.168.0.111:5432
Database: avh
User: avh
Tables: use_cases, news_use_cases
```

### Direct DB Access

```bash
PGPASSWORD=avh_prod_2026 psql -h 192.168.0.111 -U avh -d avh -c "SELECT COUNT(*) FROM use_cases;"
PGPASSWORD=avh_prod_2026 psql -h 192.168.0.111 -U avh -d avh -c "DELETE FROM use_cases;"
PGPASSWORD=avh_prod_2026 psql -h 192.168.0.111 -U avh -d avh -c "SELECT id, title, status FROM use_cases ORDER BY \"createdAt\" DESC LIMIT 10;"
```
