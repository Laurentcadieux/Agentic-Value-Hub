/**
 * Idea service (Phase 5) — business logic for the Idea Lab.
 *
 * Responsibilities:
 *   1. Extract structured data from an ideation conversation / raw idea text
 *      (`extractOpportunityCard`, `extractFromConversation`).
 *   2. Generate the Opportunity Card (heuristic, since the AI provider is a
 *      stub until Phase 4 is fully wired).
 *   3. Drive the ROI / value engine via `calculateOpportunityValue`
 *      (`buildValueInputs`, `calculateIdeaValue`).
 *   4. Persist ideas through `ideaRepository`, ensuring the placeholder
 *      customer exists so the FK constraint is satisfied for the demo.
 */

import type { ChatMessage } from '@/lib/ai/provider'
import {
  calculateOpportunityValue,
  type ValueInputs,
  type ValueResult,
} from '@/lib/value/calculate'
import type { Complexity, IdeaValueInputs, OpportunityCard } from '@/lib/types/opportunity'
import {
  ideaRepository,
  type IdeaCreateInput,
  type IdeaRecord,
  type IdeaUpdateInput,
} from '@/lib/repositories/idea-repository'
import { prisma } from '@/lib/prisma'

/** Input collected from the guided ideation flow / API create body. */
export interface IdeationInput {
  title?: string
  rawIdea: string
  businessFunction?: string
  industry?: string
  currentProcess?: string
  systems?: string[]
  annualVolume?: number
  currentAnnualEffort?: number
  automationPotential?: number
  complexity?: Complexity | string
}

/** Default value-engine inputs applied when the assessor provides no overrides. */
export const DEFAULT_VALUE_INPUTS: IdeaValueInputs = {
  hourlyCost: 50,
  errorReductionRate: 0.2,
  errorCostBaseline: 0,
  executionConfidence: 0.8,
  timeHorizonYears: 3,
  discountRate: 0.1,
}

const COMPLEXITIES: Complexity[] = ['Low', 'Medium', 'High']

function clampPot(x: number): number {
  if (Number.isNaN(x)) return 50
  return Math.min(100, Math.max(0, Math.round(x)))
}

function numOr(x: number | undefined, fallback: number): number {
  if (x === undefined || Number.isNaN(x)) return fallback
  return Math.max(0, x)
}

function normalizeComplexity(x?: string): Complexity {
  const c = (x ?? 'Medium').trim()
  const match = COMPLEXITIES.find((cc) => cc.toLowerCase() === c.toLowerCase())
  return match ?? 'Medium'
}

function defaultPotentialForComplexity(complexity: Complexity): number {
  if (complexity === 'Low') return 80
  if (complexity === 'High') return 45
  return 65
}

function deriveTitle(raw: string, title?: string): string {
  const explicit = title?.trim()
  if (explicit) return explicit.slice(0, 200)
  const cleaned = raw.trim().replace(/\s+/g, ' ')
  if (!cleaned) return 'Untitled opportunity'
  if (cleaned.length <= 80) return cleaned
  return `${cleaned.slice(0, 77)}...`
}

const PATTERN_BY_FUNCTION: Record<string, string> = {
  'Finance & Accounting': 'Document Processing Agent',
  'Customer Service': 'Conversational Triage Agent',
  'IT Operations': 'Observability & Remediation Agent',
  'Sales & Marketing': 'Campaign & Lead Optimization Agent',
  'Human Resources': 'Case Management Agent',
  Procurement: 'Sourcing & Review Agent',
  'Legal & Compliance': 'Surveillance & Reporting Agent',
  'Supply Chain & Operations': 'Exception Dispatch Agent',
  'Research & Development': 'Literature Review Agent',
}

function derivePattern(businessFunction: string): string {
  return PATTERN_BY_FUNCTION[businessFunction] ?? 'Task Automation Agent'
}

function deriveSolution(
  businessFunction: string,
  problem: string,
  pattern: string,
): string {
  const domain = businessFunction && businessFunction !== 'General' ? businessFunction : 'this process'
  const trimmedProblem = problem && problem !== 'Problem to be defined.' ? problem : 'the work'
  return (
    `A ${pattern} that handles ${trimmedProblem.toLowerCase()} within ${domain.toLowerCase()}. ` +
    'The agent decomposes the work into discrete steps, executes them against the ' +
    'systems of record, escalates low-confidence cases to a human reviewer, and ' +
    'logs every action for audit.'
  )
}

function estimateEffort(annualVolume: number): number {
  // Heuristic: ~12 minutes of handling per unit, converted to hours.
  return Math.round((annualVolume * 12) / 60)
}

function buildAssumptions(
  card: Omit<OpportunityCard, 'assumptions'>,
  valueInputs: IdeaValueInputs,
): string[] {
  const list: string[] = [
    `Hourly labor cost assumed at $${valueInputs.hourlyCost} (fully-loaded).`,
    `Automation potential estimated at ${card.automationPotential}%.`,
    `Execution confidence assumed at ${Math.round(valueInputs.executionConfidence * 100)}%.`,
    `Value discounted over a ${valueInputs.timeHorizonYears}-year horizon at ${Math.round(valueInputs.discountRate * 100)}%.`,
    'Current process metrics are self-reported and should be validated before committing.',
  ]
  if (card.annualVolume > 0) {
    list.push(`Annual volume estimated at ${card.annualVolume.toLocaleString()} units.`)
  }
  return list
}

const DEFAULT_RISKS = [
  'Process variability may reduce achievable automation potential.',
  'Upstream system or schema changes can break agent steps.',
  'Poor data quality degrades agent accuracy and confidence.',
  'Scope creep during pilot can delay time to value.',
]

const DEFAULT_CONTROLS = [
  'Human-in-the-loop approval for high-impact or low-confidence actions.',
  'Full audit logging of every agent action and decision.',
  'Bounded pilot scope with explicit success criteria.',
  'Fallback to the manual process on agent failure.',
]

const DEFAULT_NEXT_STEPS = [
  'Validate current process metrics (volume, effort, error rate).',
  'Run a bounded pilot against one team or system.',
  'Define success criteria and required controls with stakeholders.',
  'Measure outcomes, iterate, then scale.',
]

/**
 * Extract a structured Opportunity Card from the guided ideation input.
 * Heuristic — the AI provider remains a stub until Phase 4 is fully wired,
 * so we derive fields deterministically from the user's answers.
 */
export function extractOpportunityCard(input: IdeationInput): OpportunityCard {
  const rawIdea = input.rawIdea.trim()
  const title = deriveTitle(rawIdea, input.title)
  const problem = rawIdea || 'Problem to be defined.'
  const businessFunction = input.businessFunction?.trim() || 'General'
  const industry = input.industry?.trim() || 'Cross-Industry'
  const currentProcess =
    input.currentProcess?.trim() || 'No current process described by the submitter.'
  const systems = input.systems && input.systems.length > 0 ? input.systems : []
  const complexity = normalizeComplexity(input.complexity)
  const automationPotential = clampPot(
    input.automationPotential ?? defaultPotentialForComplexity(complexity),
  )
  const annualVolume = Math.round(numOr(input.annualVolume, 0))
  const currentAnnualEffort = Math.round(numOr(input.currentAnnualEffort, estimateEffort(annualVolume)))
  const automatableFraction = automationPotential / 100
  const estimatedAutomatableHours = Math.round(currentAnnualEffort * automatableFraction)
  const hourlyCost = DEFAULT_VALUE_INPUTS.hourlyCost
  const estimatedCapacityValue = Math.round(estimatedAutomatableHours * hourlyCost)
  const potentialFinancialBenefits = estimatedCapacityValue
  const automationPattern = derivePattern(businessFunction)
  const proposedAgenticSolution = deriveSolution(businessFunction, problem, automationPattern)

  const cardWithoutAssumptions = {
    title,
    problem,
    currentProcess,
    proposedAgenticSolution,
    businessFunction,
    industry,
    systems,
    automationPattern,
    automationPotential,
    annualVolume,
    currentAnnualEffort,
    estimatedAutomatableHours,
    estimatedCapacityValue,
    potentialFinancialBenefits,
    complexity,
    risks: DEFAULT_RISKS,
    requiredControls: DEFAULT_CONTROLS,
    nextSteps: DEFAULT_NEXT_STEPS,
  }

  return {
    ...cardWithoutAssumptions,
    assumptions: buildAssumptions(cardWithoutAssumptions, DEFAULT_VALUE_INPUTS),
  }
}

/**
 * Extract a partial card from an AI conversation transcript. Phase 4 will
 * replace this with model-driven structured output; for now we surface the
 * user messages as the problem statement so the contract is in place.
 */
export function extractFromConversation(messages: ChatMessage[]): Partial<OpportunityCard> {
  const userText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join('\n\n')
    .trim()
  if (!userText) return {}
  return {
    problem: userText,
    title: deriveTitle(userText),
  }
}

/** Build the value-engine inputs from a card plus optional assessor overrides. */
export function buildValueInputs(
  card: OpportunityCard,
  overrides?: Partial<IdeaValueInputs>,
): ValueInputs {
  const merged: IdeaValueInputs = { ...DEFAULT_VALUE_INPUTS, ...overrides }
  return {
    annualHoursSaved: card.estimatedAutomatableHours,
    hourlyCost: merged.hourlyCost,
    errorReductionRate: merged.errorReductionRate,
    errorCostBaseline: merged.errorCostBaseline,
    automationPotential: card.automationPotential / 100,
    executionConfidence: merged.executionConfidence,
    timeHorizonYears: merged.timeHorizonYears,
    discountRate: merged.discountRate,
  }
}

/** Pure value calculation from a stored card (no DB access). */
export function calculateIdeaValue(
  card: OpportunityCard,
  overrides?: Partial<IdeaValueInputs>,
): ValueResult {
  return calculateOpportunityValue(buildValueInputs(card, overrides))
}

/** Shape returned by the create/update/assess service methods. */
export interface IdeaServiceResult {
  record: IdeaRecord
  opportunityCard: OpportunityCard | null
  valueResult: ValueResult | null
}

function toServiceResult(record: IdeaRecord, overrides?: Partial<IdeaValueInputs>): IdeaServiceResult {
  const card = record.opportunityCard
  return {
    record,
    opportunityCard: card,
    valueResult: card ? calculateIdeaValue(card, overrides) : null,
  }
}

/**
 * Ensure the placeholder customer exists so the ideas FK constraint holds in
 * the demo (no real auth yet). Idempotent.
 */
async function ensureCustomer(customerId: string): Promise<void> {
  await prisma.customer.upsert({
    where: { id: customerId },
    create: { id: customerId, companyName: 'Demo Customer' },
    update: {},
  })
}

/** Create an idea from guided ideation input and return the generated card + value. */
export async function createIdea(
  input: IdeationInput,
  session: { customerId: string; userId?: string | null },
): Promise<IdeaServiceResult> {
  await ensureCustomer(session.customerId)
  const card = extractOpportunityCard(input)
  const valueResult = calculateIdeaValue(card)
  const createInput: IdeaCreateInput = {
    customerId: session.customerId,
    userId: session.userId ?? null,
    title: card.title,
    opportunityCard: card,
    valueScore: valueResult.value,
    status: 'DRAFT',
  }
  const record = await ideaRepository.create(createInput)
  return { record, opportunityCard: card, valueResult }
}

/** Load an idea by id with its derived value result. */
export async function getIdea(id: string): Promise<IdeaServiceResult | null> {
  const record = await ideaRepository.findById(id)
  if (!record) return null
  return toServiceResult(record)
}

/**
 * Edit an idea. Fields are merged with the stored opportunity card and the
 * card / value are re-derived. Implements PATCH /api/v1/ideas/:id.
 */
export async function updateIdea(
  id: string,
  patch: Partial<IdeationInput> & { status?: IdeaRecord['status'] },
): Promise<IdeaServiceResult | null> {
  const existing = await ideaRepository.findById(id)
  if (!existing) return null
  const existingCard = existing.opportunityCard
  const merged: IdeationInput = {
    title: patch.title ?? existing.title,
    rawIdea: patch.rawIdea ?? existingCard?.problem ?? existing.title,
    businessFunction: patch.businessFunction ?? existingCard?.businessFunction,
    industry: patch.industry ?? existingCard?.industry,
    currentProcess: patch.currentProcess ?? existingCard?.currentProcess,
    systems: patch.systems ?? existingCard?.systems,
    annualVolume: patch.annualVolume ?? existingCard?.annualVolume,
    currentAnnualEffort: patch.currentAnnualEffort ?? existingCard?.currentAnnualEffort,
    automationPotential: patch.automationPotential ?? existingCard?.automationPotential,
    complexity: patch.complexity ?? existingCard?.complexity,
  }
  const card = extractOpportunityCard(merged)
  const valueResult = calculateIdeaValue(card)
  const updateInput: IdeaUpdateInput = {
    title: card.title,
    opportunityCard: card,
    valueScore: valueResult.value,
    status: patch.status ?? existing.status,
  }
  const record = await ideaRepository.update(id, updateInput)
  return { record, opportunityCard: card, valueResult }
}

/**
 * Re-assess an idea: re-run the ROI engine with optional value-input
 * overrides (and an optional automationPotential override that also updates
 * the card). Implements POST /api/v1/ideas/:id/assess.
 */
export async function assessIdea(
  id: string,
  overrides: Partial<IdeaValueInputs> & { automationPotential?: number } = {},
): Promise<IdeaServiceResult | null> {
  const existing = await ideaRepository.findById(id)
  if (!existing) return null
  let card = existing.opportunityCard
  if (!card) {
    // No structured card yet — synthesize a minimal one from the title.
    card = extractOpportunityCard({ rawIdea: existing.title })
  }
  if (overrides.automationPotential !== undefined) {
    card = { ...card, automationPotential: clampPot(overrides.automationPotential) }
  }
  const { automationPotential: _ap, ...valueOverrides } = overrides
  void _ap
  const valueResult = calculateIdeaValue(card, valueOverrides)
  const record = await ideaRepository.update(id, {
    opportunityCard: card,
    valueScore: valueResult.value,
  })
  return { record, opportunityCard: card, valueResult }
}

/** List ideas for a customer (newest first). */
export async function listIdeasByCustomer(customerId: string): Promise<IdeaRecord[]> {
  return ideaRepository.findManyByCustomer(customerId)
}
