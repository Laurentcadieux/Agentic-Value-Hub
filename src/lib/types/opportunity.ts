/**
 * Shared opportunity-card types for the Idea Lab (Phase 5).
 *
 * The Prisma `Idea` model only exposes `title`, `description` (String?) and
 * `valueScore`. Because we cannot modify the schema in this phase, the full
 * structured Opportunity Card is serialized as JSON inside `description`.
 * These types are imported by repositories, services, API routes and UI
 * components alike, so they live in a dependency-free module.
 */

export type Complexity = 'Low' | 'Medium' | 'High'

/**
 * The structured opportunity card generated from an ideation conversation.
 * Mirrors the spec's Idea Lab card fields.
 */
export interface OpportunityCard {
  title: string
  problem: string
  currentProcess: string
  proposedAgenticSolution: string
  businessFunction: string
  industry: string
  systems: string[]
  automationPattern: string
  /** 0..100 — fractional automation potential expressed as a percentage. */
  automationPotential: number
  /** Annual transaction/task volume. */
  annualVolume: number
  /** Current annual effort in person-hours. */
  currentAnnualEffort: number
  /** Estimated annual hours saved by full automation. */
  estimatedAutomatableHours: number
  /** Estimated annual capacity (labor) value in currency units. */
  estimatedCapacityValue: number
  /** Estimated annual financial benefit in currency units. */
  potentialFinancialBenefits: number
  complexity: Complexity
  risks: string[]
  requiredControls: string[]
  assumptions: string[]
  nextSteps: string[]
}

/**
 * Tunable inputs for the ROI / value engine. These are the knobs an assessor
 * can override when running /assess; defaults are applied by the service.
 */
export interface IdeaValueInputs {
  /** Fully-loaded hourly labor cost in the project currency. */
  hourlyCost: number
  /** Fractional reduction in error rate, 0..1. */
  errorReductionRate: number
  /** Baseline annual cost of the errors being reduced. */
  errorCostBaseline: number
  /** Confidence in successful execution/delivery, 0..1. */
  executionConfidence: number
  /** Rollout horizon in years (used for discounting). */
  timeHorizonYears: number
  /** Annual discount rate applied beyond year 1, 0..1. */
  discountRate: number
}
