/**
 * DEMO DATA — clearly labeled.
 *
 * These TypeScript arrays stand in for the Prisma-backed data layer during
 * Phase 1 of the public website. Nothing here is read from the database; real
 * news and use cases will come from src/repositories in a later phase. All
 * images use deterministic placeholder URLs (picsum.photos seeds) so the
 * editorial layout renders consistently without external image hosting setup.
 */

export interface DemoNewsItem {
  slug: string
  headline: string
  summary: string
  analysis: string
  whyItMatters: string
  sourceName: string
  sourceUrl: string
  publishedAt: string // ISO 8601
  imageUrl: string
  categories: string[]
  tags: string[]
  companies: string[]
  industries: string[]
  businessFunctions: string[]
  technologies: string[]
  featured?: boolean
}

export interface DemoUseCase {
  slug: string
  title: string
  industry: string
  businessFunction: string
  problem: string
  description: string
  agentPattern: string
  automationPattern: string
  valueDrivers: string[]
  systems: string[]
  technologies: string[]
  automationPotential: number // 0-100
  complexity: string
  risks: string
  controls: string
  featured?: boolean
}

export interface DemoTaxonomyItem {
  slug: string
  name: string
  description: string
  useCaseCount: number
  newsCount: number
}

const img = (seed: string) => `https://picsum.photos/seed/${seed}/800/450`

// --- NEWS --------------------------------------------------------------------

export const demoNews: DemoNewsItem[] = [
  {
    slug: 'openai-launches-agentic-operator',
    headline: 'OpenAI Unveils Operator, an Agent That Books Travel and Shops the Web',
    summary:
      'The model maker shipped a research preview of an agent that can navigate browsers, fill forms and complete multi-step tasks on behalf of users, signaling a shift from chat to action.',
    analysis:
      'Operator wraps a vision-language model around a controlled browser session. The system decomposes a high-level goal into a plan, executes it against live websites, and recovers from errors by re-reading the page. Early benchmarks show it completing roughly 38% of real-world web tasks unaided.',
    whyItMatters:
      'Browser-capable agents turn the open web into an API. For enterprises, that means automating work in systems that expose no integration surface area — legacy portals, partner sites and ad-hoc tools.',
    sourceName: 'TechBrief',
    sourceUrl: 'https://example.com/openai-operator',
    publishedAt: '2026-09-18T09:30:00Z',
    imageUrl: img('openai-operator'),
    categories: ['Agentic AI', 'Technology'],
    tags: ['browser automation', 'agents', 'product launch'],
    companies: ['OpenAI'],
    industries: ['Technology'],
    businessFunctions: ['IT Operations'],
    technologies: ['Browser Automation', 'LLMs & Foundation Models'],
    featured: true,
  },
  {
    slug: 'anthropic-ships-computer-use-api',
    headline: 'Anthropic Ships Computer Use API for Autonomous Desktop Agents',
    summary:
      'Developers can now let Claude move the cursor, click and type across operating systems, opening a path to automating desktop workflows that resist traditional scripting.',
    analysis:
      'The API exposes screen coordinates, keyboard events and screenshot capture. Anthropic pairs it with a responsible-scaling policy and recommends sandboxed execution environments for any production deployment.',
    whyItMatters:
      'Desktop automation has been stuck on brittle RPA record-and-playback. An agent that interprets the screen can adapt to UI changes without script maintenance.',
    sourceName: 'AI Frontier',
    sourceUrl: 'https://example.com/anthropic-computer-use',
    publishedAt: '2026-09-16T13:00:00Z',
    imageUrl: img('anthropic-cu'),
    categories: ['Agentic AI', 'Technology'],
    tags: ['desktop automation', 'agents', 'API'],
    companies: ['Anthropic'],
    industries: ['Technology'],
    businessFunctions: ['IT Operations'],
    technologies: ['Multimodal AI', 'Agent Orchestration'],
    featured: true,
  },
  {
    slug: 'goldman-sachs-deploys-back-office-agents',
    headline: 'Goldman Sachs Deploys AI Agents Across Back-Office Operations',
    summary:
      'The bank reports that autonomous agents now handle reconciliation and exception management across multiple settlement desks, cutting manual review time significantly.',
    analysis:
      'The rollout pairs an orchestration layer with existing trade-processing systems. Agents draft resolution recommendations for breaks, route ambiguous cases to humans, and log every action for audit.',
    whyItMatters:
      'A regulated financial institution publicly running agents in production is a signal that controls, not capability, are the gating factor for enterprise adoption.',
    sourceName: 'FinWire',
    sourceUrl: 'https://example.com/goldman-agents',
    publishedAt: '2026-09-14T08:00:00Z',
    imageUrl: img('goldman-agents'),
    categories: ['Enterprise Automation', 'Industries'],
    tags: ['financial services', 'reconciliation', 'case study'],
    companies: ['Goldman Sachs'],
    industries: ['Financial Services'],
    businessFunctions: ['Finance & Accounting'],
    technologies: ['Agent Orchestration', 'Function Calling'],
    featured: true,
  },
  {
    slug: 'siemens-agentic-predictive-maintenance',
    headline: 'Siemens Cuts Downtime 30% With Agentic Predictive Maintenance',
    summary:
      'A connected-factory pilot lets agents ingest sensor streams, diagnose likely failure modes and dispatch technicians with a prepared work order before a line stops.',
    analysis:
      'Agents fuse time-series sensor data with equipment manuals and maintenance history, then rank probable root causes and propose interventions. The system escalates low-confidence cases to reliability engineers.',
    whyItMatters:
      'Predictive maintenance has promised ROI for a decade but stalled on the last mile — turning a prediction into an action. Agents close that gap.',
    sourceName: 'Industrial Tech Review',
    sourceUrl: 'https://example.com/siemens-maintenance',
    publishedAt: '2026-09-12T10:15:00Z',
    imageUrl: img('siemens-maint'),
    categories: ['Enterprise Automation', 'Industries'],
    tags: ['manufacturing', 'predictive maintenance', 'IoT'],
    companies: ['Siemens'],
    industries: ['Manufacturing'],
    businessFunctions: ['Supply Chain & Operations'],
    technologies: ['Agent Orchestration', 'Retrieval-Augmented Generation (RAG)'],
  },
  {
    slug: 'unilever-marketing-campaign-agents',
    headline: 'Unilever Automates Campaign Optimization With Always-On Agents',
    summary:
      'Brand teams now run agents that monitor live ad performance, reallocate spend across channels and draft creative variations around the clock.',
    analysis:
      'The agents operate inside guardrails — budget caps, brand-safety filters and human approval gates for new creative. Marketers approve or reject proposals, and the agent learns from the outcome.',
    whyItMatters:
      'Marketing is an early high-value beachhead: data is plentiful, feedback is fast, and the cost of a wrong move is bounded by a daily spend cap.',
    sourceName: 'Marketing Week',
    sourceUrl: 'https://example.com/unilever-agents',
    publishedAt: '2026-09-10T07:45:00Z',
    imageUrl: img('unilever-mkt'),
    categories: ['Enterprise Automation', 'Markets'],
    tags: ['marketing', 'optimization', 'case study'],
    companies: ['Unilever'],
    industries: ['Retail & E-commerce'],
    businessFunctions: ['Sales & Marketing'],
    technologies: ['Function Calling', 'LLMs & Foundation Models'],
  },
  {
    slug: 'google-deepmind-project-mariner',
    headline: 'Google DeepMind Previews Project Mariner for Browser Agents',
    summary:
      'A prototype agent running inside Chrome can complete multi-page research tasks, extract structured data and fill long forms while showing its reasoning in a side panel.',
    analysis:
      'Mariner leans on DOM understanding plus vision, giving it resilience on pages that render content dynamically. Google emphasizes an on-device escalation model for sensitive actions.',
    whyItMatters:
      'Bundling agents into the browser billions of people already use could lower the integration cost of automation to near zero for many workflows.',
    sourceName: 'AI Frontier',
    sourceUrl: 'https://example.com/mariner',
    publishedAt: '2026-09-08T16:20:00Z',
    imageUrl: img('mariner'),
    categories: ['Agentic AI', 'Technology'],
    tags: ['browser automation', 'agents', 'research'],
    companies: ['Google'],
    industries: ['Technology'],
    businessFunctions: ['IT Operations'],
    technologies: ['Browser Automation', 'Multimodal AI'],
  },
  {
    slug: 'jpmorgan-automates-trade-surveillance',
    headline: 'JPMorgan Automates Trade Surveillance With Agentic AI',
    summary:
      'A compliance pilot has agents reviewing flagged trades, gathering context across systems and drafting surveillance narratives for human reviewers.',
    analysis:
      'Agents pull from order-management, communications and reference-data systems, then apply regulatory rule logic to produce an evidence-backed recommendation. Humans remain the final approver.',
    whyItMatters:
      'Surveillance is a control function where auditability is non-negotiable. Agentic workflows that produce a full rationale are well suited to it.',
    sourceName: 'FinWire',
    sourceUrl: 'https://example.com/jpmorgan-surveillance',
    publishedAt: '2026-09-06T11:05:00Z',
    imageUrl: img('jpm-survey'),
    categories: ['Enterprise Automation', 'Industries'],
    tags: ['compliance', 'financial services', 'case study'],
    companies: ['JPMorgan Chase'],
    industries: ['Financial Services'],
    businessFunctions: ['Legal & Compliance'],
    technologies: ['Retrieval-Augmented Generation (RAG)', 'Agent Orchestration'],
  },
  {
    slug: 'maersk-tests-autonomous-container-rerouting',
    headline: 'Maersk Tests Autonomous Agents for Container Re-Routing',
    summary:
      'When port congestion spikes, agents propose alternative routings across ocean and rail networks, balancing cost, transit time and customer commitments.',
    analysis:
      'The system models the supply chain as a graph and lets agents simulate candidate plans against live disruption data. A planner approves the plan before any execution.',
    whyItMatters:
      'Logistics resilience is a board-level concern. Agents that re-plan continuously turn a monthly exercise into a near-real-time capability.',
    sourceName: 'Supply Chain Daily',
    sourceUrl: 'https://example.com/maersk-reroute',
    publishedAt: '2026-09-04T06:30:00Z',
    imageUrl: img('maersk'),
    categories: ['Enterprise Automation', 'Industries'],
    tags: ['logistics', 'supply chain', 'case study'],
    companies: ['Maersk'],
    industries: ['Logistics & Supply Chain'],
    businessFunctions: ['Supply Chain & Operations'],
    technologies: ['Agent Orchestration', 'Function Calling'],
  },
  {
    slug: 'multimodal-agents-approach-human-web-tasks',
    headline: 'Research: Multimodal Agents Approach Human-Level Performance on Web Tasks',
    summary:
      'A benchmark of realistic web errands shows frontier multimodal agents completing tasks at roughly 70% of human speed and accuracy, up from under 20% a year ago.',
    analysis:
      'The gains come from better grounding, longer action histories and improved error recovery. Researchers caution that reliability on safety-sensitive tasks still lags.',
    whyItMatters:
      'Tracking the capability frontier lets enterprises time their pilots to when an agent can actually finish a job end to end, not just attempt it.',
    sourceName: 'AI Frontier',
    sourceUrl: 'https://example.com/multimodal-benchmark',
    publishedAt: '2026-09-02T14:00:00Z',
    imageUrl: img('multimodal'),
    categories: ['Research', 'Agentic AI'],
    tags: ['benchmark', 'multimodal', 'research'],
    companies: [],
    industries: ['Technology'],
    businessFunctions: [],
    technologies: ['Multimodal AI', 'LLMs & Foundation Models'],
  },
  {
    slug: 'eli-lilly-accelerates-drug-discovery',
    headline: 'Eli Lilly Accelerates Drug Discovery With Agentic Workflows',
    summary:
      'Research teams orchestrate agents to mine literature, propose candidate molecules and design experiments, compressing early-stage discovery cycles.',
    analysis:
      'Agents act as tireless research associates: gathering evidence, maintaining a living hypothesis graph and flagging contradictions for scientists to resolve.',
    whyItMatters:
      'Discovery is a long-cycle, high-value problem where even modest acceleration compounds into significant pipeline value over time.',
    sourceName: 'BioBrief',
    sourceUrl: 'https://example.com/eli-lilly-discovery',
    publishedAt: '2026-08-30T09:00:00Z',
    imageUrl: img('eli-lilly'),
    categories: ['Enterprise Automation', 'Industries'],
    tags: ['healthcare', 'drug discovery', 'case study'],
    companies: ['Eli Lilly'],
    industries: ['Healthcare'],
    businessFunctions: ['Research & Development'],
    technologies: ['Retrieval-Augmented Generation (RAG)', 'Agent Orchestration'],
  },
]

// --- USE CASES ---------------------------------------------------------------

export const demoUseCases: DemoUseCase[] = [
  {
    slug: 'automated-invoice-processing',
    title: 'Autonomous Invoice Processing',
    industry: 'Financial Services',
    businessFunction: 'Finance & Accounting',
    problem:
      'Accounts payable teams manually key invoice data, match it to purchase orders and chase approvals — a high-volume, exception-prone process.',
    description:
      'An agent ingests invoices from email and portals, extracts structured fields, three-way matches against POs and goods receipts, and routes exceptions with a prepared resolution note to the right approver.',
    agentPattern: 'Goal-directed workflow with human-in-the-loop approval gates',
    automationPattern: 'Document understanding + system orchestration + exception routing',
    valueDrivers: ['Labor savings', 'Cycle-time reduction', 'Error reduction', 'Early-pay discounts'],
    systems: ['ERP', 'Email', 'Document management', 'Approval workflow'],
    technologies: ['Retrieval-Augmented Generation (RAG)', 'Function Calling', 'Agent Orchestration'],
    automationPotential: 82,
    complexity: 'Medium',
    risks: 'Misread invoice fields, duplicate payments, approval bypass on edge cases.',
    controls: 'Confidence-threshold routing to humans, duplicate-detection checks, full audit log.',
    featured: true,
  },
  {
    slug: 'customer-support-triage',
    title: 'Customer Support Triage and Resolution',
    industry: 'Technology',
    businessFunction: 'Customer Service',
    problem:
      'Support queues swell with repetitive tickets; agents spend most of their time classifying and drafting replies instead of solving hard cases.',
    description:
      'An agent classifies incoming tickets, retrieves relevant knowledge and prior resolutions, drafts a response, and resolves simple cases directly while escalating complex ones with a summary.',
    agentPattern: 'Retrieval-augmented responder with escalation',
    automationPattern: 'Intent classification + knowledge retrieval + draft-and-approve',
    valueDrivers: ['First-response time', 'Cost per ticket', 'Agent productivity', 'CSAT'],
    systems: ['Helpdesk', 'Knowledge base', 'CRM', 'Chat'],
    technologies: ['Retrieval-Augmented Generation (RAG)', 'LLMs & Foundation Models', 'Function Calling'],
    automationPotential: 68,
    complexity: 'Medium',
    risks: 'Hallucinated answers, tone issues, over-resolution of sensitive cases.',
    controls: 'Citation requirement, sensitive-topic guardrails, human review for low-confidence.',
    featured: true,
  },
  {
    slug: 'it-helpdesk-resolution',
    title: 'L1 IT Helpdesk Resolution',
    industry: 'Technology',
    businessFunction: 'IT Operations',
    problem:
      'L1 helpdesks drown in password resets, access requests and basic troubleshooting, delaying harder work.',
    description:
      'An agent handles common L1 requests through guided conversations, executes approved remediation scripts and opens tickets with full context when escalation is needed.',
    agentPattern: 'Conversational resolver with tool use',
    automationPattern: 'Intent routing + tool execution + ticket creation',
    valueDrivers: ['Resolution time', 'Labor savings', 'Employee experience'],
    systems: ['ITSM', 'Identity provider', 'Knowledge base'],
    technologies: ['Function Calling', 'Agent Orchestration', 'LLMs & Foundation Models'],
    automationPotential: 75,
    complexity: 'Medium',
    risks: 'Unauthorized access changes, over-execution of remediation actions.',
    controls: 'Principle-of-least-privilege tools, approval for write actions, audit trail.',
    featured: true,
  },
  {
    slug: 'sales-lead-qualification',
    title: 'Automated Sales Lead Qualification',
    industry: 'Retail & E-commerce',
    businessFunction: 'Sales & Marketing',
    problem:
      'Inbound leads sit unworked; reps spend hours researching and qualifying instead of selling.',
    description:
      'An agent enriches inbound leads, scores them against an ideal profile, drafts personalized outreach and books meetings, handing off warm conversations to reps.',
    agentPattern: 'Research-and-act sales assistant',
    automationPattern: 'Enrichment + scoring + outreach + handoff',
    valueDrivers: ['Pipeline velocity', 'Rep productivity', 'Conversion rate'],
    systems: ['CRM', 'Marketing automation', 'Calendar', 'Enrichment APIs'],
    technologies: ['Function Calling', 'LLMs & Foundation Models', 'Agent Orchestration'],
    automationPotential: 60,
    complexity: 'Medium',
    risks: 'Off-brand outreach, over-messaging, data-quality issues.',
    controls: 'Send-volume caps, brand-voice guardrails, human approval for first touch.',
  },
  {
    slug: 'procurement-vendor-onboarding',
    title: 'Procurement Vendor Onboarding',
    industry: 'Manufacturing',
    businessFunction: 'Procurement',
    problem:
      'Onboarding a new vendor means collecting documents, running compliance checks and setting up master data across systems — slow and error-prone.',
    description:
      'An agent collects vendor paperwork, runs KYB and compliance screens, validates data against source documents and creates the vendor record once checks pass.',
    agentPattern: 'Documented onboarding workflow with compliance gates',
    automationPattern: 'Collection + verification + screening + system-of-record write',
    valueDrivers: ['Cycle-time reduction', 'Compliance', 'Labor savings'],
    systems: ['Procurement', 'Compliance screening', 'ERP', 'Document management'],
    technologies: ['Retrieval-Augmented Generation (RAG)', 'Function Calling', 'Agent Orchestration'],
    automationPotential: 55,
    complexity: 'High',
    risks: 'Compliance gaps, fraud, incorrect master data.',
    controls: 'Mandatory compliance gates, human sign-off, dual-control writes.',
  },
  {
    slug: 'hr-employee-onboarding',
    title: 'HR Employee Onboarding Orchestration',
    industry: 'Technology',
    businessFunction: 'Human Resources',
    problem:
      'New-hire onboarding touches HRIS, IT, facilities and payroll; missed handoffs create a poor first day.',
    description:
      'An agent orchestrates the onboarding checklist across systems, provisions access per role, schedules orientation and escalates blockers to the right owner.',
    agentPattern: 'Cross-system orchestrator with task tracking',
    automationPattern: 'Checklist execution + provisioning + escalation',
    valueDrivers: ['Time-to-productivity', 'Employee experience', 'Error reduction'],
    systems: ['HRIS', 'Identity provider', 'Ticketing', 'Facilities'],
    technologies: ['Agent Orchestration', 'Function Calling', 'LLMs & Foundation Models'],
    automationPotential: 70,
    complexity: 'Medium',
    risks: 'Over-provisioning access, missed compliance steps.',
    controls: 'Role-based access templates, provisioning approvals, completion audit.',
  },
  {
    slug: 'regulatory-reporting-automation',
    title: 'Regulatory Reporting Automation',
    industry: 'Financial Services',
    businessFunction: 'Legal & Compliance',
    problem:
      'Regulatory reports demand data assembled across systems under tight deadlines, with heavy manual reconciliation.',
    description:
      'An agent assembles reporting data from source systems, validates it against rule logic, drafts the report with a full evidence trail and routes it for sign-off.',
    agentPattern: 'Evidence-backed report builder with validation',
    automationPattern: 'Data assembly + rule validation + drafting + approval',
    valueDrivers: ['Compliance', 'Labor savings', 'Cycle-time reduction'],
    systems: ['Regulatory reporting', 'Data warehouse', 'Workflow'],
    technologies: ['Retrieval-Augmented Generation (RAG)', 'Function Calling', 'Agent Orchestration'],
    automationPotential: 50,
    complexity: 'High',
    risks: 'Incorrect data, missed filings, auditability gaps.',
    controls: 'Rule-engine validation, human sign-off, immutable audit log.',
  },
  {
    slug: 'field-service-dispatch',
    title: 'Field Service Dispatch',
    industry: 'Energy & Utilities',
    businessFunction: 'Supply Chain & Operations',
    problem:
      'Dispatchers manually match jobs to technicians by skill, location and parts availability — slow under volume.',
    description:
      'An agent ingests service requests, optimizes technician assignments against constraints, and notifies technicians with a prepared job packet.',
    agentPattern: 'Constraint-optimizing dispatcher',
    automationPattern: 'Assignment optimization + notification + handoff',
    valueDrivers: ['Utilization', 'First-time-fix rate', 'Response time'],
    systems: ['Field service management', 'Inventory', 'Routing'],
    technologies: ['Agent Orchestration', 'Function Calling', 'LLMs & Foundation Models'],
    automationPotential: 65,
    complexity: 'High',
    risks: 'Suboptimal assignments, safety/compliance breaches.',
    controls: 'Constraint validation, dispatcher override, safety-rule checks.',
  },
]

// --- TAXONOMIES --------------------------------------------------------------

export const demoIndustries: DemoTaxonomyItem[] = [
  { slug: 'financial-services', name: 'Financial Services', description: 'Banks, insurers and capital-markets firms automating high-volume, highly-regulated work.', useCaseCount: 14, newsCount: 9 },
  { slug: 'healthcare', name: 'Healthcare', description: 'Providers and life-sciences companies applying agents to clinical and administrative workflows.', useCaseCount: 11, newsCount: 6 },
  { slug: 'manufacturing', name: 'Manufacturing', description: 'Connected factories and supply chains using agents for maintenance, quality and planning.', useCaseCount: 13, newsCount: 7 },
  { slug: 'retail-ecommerce', name: 'Retail & E-commerce', description: 'Retailers automating merchandising, marketing and fulfillment with agentic workflows.', useCaseCount: 12, newsCount: 5 },
  { slug: 'logistics-supply-chain', name: 'Logistics & Supply Chain', description: 'Movers of goods re-planning networks and exceptions in near real time.', useCaseCount: 9, newsCount: 6 },
  { slug: 'technology', name: 'Technology', description: 'Software and platform companies building and deploying agent infrastructure.', useCaseCount: 15, newsCount: 11 },
  { slug: 'energy-utilities', name: 'Energy & Utilities', description: 'Operators automating dispatch, asset health and grid operations.', useCaseCount: 7, newsCount: 4 },
  { slug: 'telecommunications', name: 'Telecommunications', description: 'Carriers automating network operations and customer care at scale.', useCaseCount: 8, newsCount: 5 },
  { slug: 'media', name: 'Media', description: 'Publishers and studios automating content operations and audience engagement.', useCaseCount: 6, newsCount: 4 },
  { slug: 'public-sector', name: 'Public Sector', description: 'Government agencies automating case work and service delivery with guardrails.', useCaseCount: 7, newsCount: 3 },
]

export const demoFunctions: DemoTaxonomyItem[] = [
  { slug: 'finance-accounting', name: 'Finance & Accounting', description: 'Invoice processing, reconciliation, close and reporting.', useCaseCount: 12, newsCount: 6 },
  { slug: 'customer-service', name: 'Customer Service', description: 'Triage, resolution and escalation across channels.', useCaseCount: 11, newsCount: 5 },
  { slug: 'it-operations', name: 'IT Operations', description: 'L1 support, provisioning and incident response.', useCaseCount: 10, newsCount: 7 },
  { slug: 'sales-marketing', name: 'Sales & Marketing', description: 'Lead qualification, outreach and campaign optimization.', useCaseCount: 9, newsCount: 5 },
  { slug: 'human-resources', name: 'Human Resources', description: 'Onboarding, case management and policy guidance.', useCaseCount: 7, newsCount: 3 },
  { slug: 'procurement', name: 'Procurement', description: 'Sourcing, vendor onboarding and contract review.', useCaseCount: 8, newsCount: 4 },
  { slug: 'legal-compliance', name: 'Legal & Compliance', description: 'Surveillance, reporting and contract analysis.', useCaseCount: 8, newsCount: 6 },
  { slug: 'supply-chain-operations', name: 'Supply Chain & Operations', description: 'Planning, dispatch and exception management.', useCaseCount: 9, newsCount: 5 },
  { slug: 'research-development', name: 'Research & Development', description: 'Literature review, hypothesis generation and experiment design.', useCaseCount: 6, newsCount: 4 },
]

export const demoTechnologies: DemoTaxonomyItem[] = [
  { slug: 'llms-foundation-models', name: 'LLMs & Foundation Models', description: 'The reasoning engines behind plan generation and language understanding.', useCaseCount: 28, newsCount: 15 },
  { slug: 'browser-automation', name: 'Browser Automation', description: 'Agents that operate web UIs when no API exists.', useCaseCount: 12, newsCount: 8 },
  { slug: 'agent-orchestration', name: 'Agent Orchestration', description: 'Frameworks that coordinate tools, memory and multi-step execution.', useCaseCount: 24, newsCount: 10 },
  { slug: 'function-calling', name: 'Function Calling', description: 'Structured tool use that lets agents act on systems.', useCaseCount: 20, newsCount: 7 },
  { slug: 'rag', name: 'Retrieval-Augmented Generation (RAG)', description: 'Grounding agent answers in enterprise knowledge.', useCaseCount: 22, newsCount: 9 },
  { slug: 'multimodal-ai', name: 'Multimodal AI', description: 'Vision and language together for screen and document understanding.', useCaseCount: 14, newsCount: 8 },
  { slug: 'vector-databases', name: 'Vector Databases', description: 'Semantic memory and retrieval at scale.', useCaseCount: 10, newsCount: 5 },
  { slug: 'rpa-integration', name: 'RPA Integration', description: 'Bridging agents with existing robotic process automation.', useCaseCount: 9, newsCount: 4 },
]

// --- HELPERS -----------------------------------------------------------------

export function getNewsBySlug(slug: string): DemoNewsItem | undefined {
  return demoNews.find((n) => n.slug === slug)
}

export function getUseCaseBySlug(slug: string): DemoUseCase | undefined {
  return demoUseCases.find((u) => u.slug === slug)
}

export function getIndustryBySlug(slug: string): DemoTaxonomyItem | undefined {
  return demoIndustries.find((i) => i.slug === slug)
}

export function getFunctionBySlug(slug: string): DemoTaxonomyItem | undefined {
  return demoFunctions.find((f) => f.slug === slug)
}

export function getTechnologyBySlug(slug: string): DemoTaxonomyItem | undefined {
  return demoTechnologies.find((t) => t.slug === slug)
}

/** News items whose industries array includes the given industry name. */
export function getNewsForIndustry(industryName: string): DemoNewsItem[] {
  return demoNews.filter((n) => n.industries.includes(industryName))
}

/** Use cases whose industry field matches the given industry name. */
export function getUseCasesForIndustry(industryName: string): DemoUseCase[] {
  return demoUseCases.filter((u) => u.industry === industryName)
}

/** Use cases whose businessFunction matches the given function name. */
export function getUseCasesForFunction(functionName: string): DemoUseCase[] {
  return demoUseCases.filter((u) => u.businessFunction === functionName)
}

/** Use cases whose technologies array includes the given technology name. */
export function getUseCasesForTechnology(technologyName: string): DemoUseCase[] {
  return demoUseCases.filter((u) => u.technologies.includes(technologyName))
}

/** Most recent news first. */
export function getNewsSortedByDate(): DemoNewsItem[] {
  return [...demoNews].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  )
}

export function getFeaturedNews(): DemoNewsItem[] {
  return demoNews.filter((n) => n.featured)
}

export function getFeaturedUseCases(): DemoUseCase[] {
  return demoUseCases.filter((u) => u.featured)
}
