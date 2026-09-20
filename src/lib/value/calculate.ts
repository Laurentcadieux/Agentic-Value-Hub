/**
 * Opportunity value calculation (spec section 9).
 *
 * value = impact * probability * timeHorizonFactor
 *
 * Where:
 *   impact           = annualHoursSaved * hourlyCost  (labor impact)
 *                     + errorReductionRate * errorCostBaseline
 *   probability      = automationPotential * executionConfidence
 *   timeHorizonFactor = discount applied for multi-year rollout
 *
 * All inputs are normalized; outputs are in the same currency unit as
 * `hourlyCost` and `errorCostBaseline`.
 */

export interface ValueInputs {
  /** Estimated annual hours saved by full automation. */
  annualHoursSaved: number
  /** Fully-loaded hourly labor cost in the same currency. */
  hourlyCost: number
  /** Fractional reduction in error rate, 0..1 (e.g. 0.2 = 20% fewer errors). */
  errorReductionRate: number
  /** Baseline annual cost of errors being reduced. */
  errorCostBaseline: number
  /** Automation potential of the task, 0..1 (from the use case). */
  automationPotential: number
  /** Confidence in successful execution/delivery, 0..1. */
  executionConfidence: number
  /** Rollout horizon in years (used for discounting). */
  timeHorizonYears: number
  /** Annual discount rate applied beyond year 1, 0..1 (e.g. 0.1 = 10%). */
  discountRate: number
}

export interface ValueResult {
  /** Labor impact component (annual). */
  laborImpact: number
  /** Error reduction impact component (annual). */
  errorImpact: number
  /** Combined annual impact before probability/discount. */
  annualImpact: number
  /** Probability factor, 0..1. */
  probability: number
  /** Time-horizon discount factor applied to the value. */
  timeHorizonFactor: number
  /** Final opportunity value (currency units). */
  value: number
}

function clamp(x: number, lo = 0, hi = 1): number {
  if (Number.isNaN(x)) return lo
  return Math.min(hi, Math.max(lo, x))
}

/**
 * Calculate the opportunity value of an automation use case.
 *
 * Formula:
 *   laborImpact    = annualHoursSaved * hourlyCost
 *   errorImpact    = errorReductionRate * errorCostBaseline
 *   annualImpact   = laborImpact + errorImpact
 *   probability    = automationPotential * executionConfidence
 *   timeHorizonFactor = sum over n in 1..timeHorizonYears of 1 / (1 + discountRate)^(n-1)
 *   value          = annualImpact * probability * timeHorizonFactor
 */
export function calculateOpportunityValue(input: ValueInputs): ValueResult {
  const annualHoursSaved = Math.max(0, input.annualHoursSaved)
  const hourlyCost = Math.max(0, input.hourlyCost)
  const errorReductionRate = clamp(input.errorReductionRate)
  const errorCostBaseline = Math.max(0, input.errorCostBaseline)
  const automationPotential = clamp(input.automationPotential)
  const executionConfidence = clamp(input.executionConfidence)
  const timeHorizonYears = Math.max(1, Math.floor(input.timeHorizonYears))
  const discountRate = clamp(input.discountRate, 0, 1)

  const laborImpact = annualHoursSaved * hourlyCost
  const errorImpact = errorReductionRate * errorCostBaseline
  const annualImpact = laborImpact + errorImpact

  const probability = automationPotential * executionConfidence

  let timeHorizonFactor = 0
  for (let n = 1; n <= timeHorizonYears; n++) {
    timeHorizonFactor += 1 / Math.pow(1 + discountRate, n - 1)
  }

  const value = annualImpact * probability * timeHorizonFactor

  return {
    laborImpact,
    errorImpact,
    annualImpact,
    probability,
    timeHorizonFactor,
    value,
  }
}
