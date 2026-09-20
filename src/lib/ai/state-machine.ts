/**
 * Conversation state machine for the AI Advisor.
 *
 * The advisor walks every conversation through an ordered discovery → value
 * pipeline. Each assistant turn is tagged with the stage whose question it is
 * asking; the next turn advances to `nextStage(current)`. Stage + mode are
 * persisted on each Message's `metadata` JSON column (the Conversation model
 * has no metadata field), so the state is recoverable from history alone.
 */

import type { ConversationType } from '@prisma/client'

/** The four interaction modes of the AI Advisor. */
export type ConversationMode = 'LEARN' | 'EXPLORE' | 'IDEATE' | 'ASSESS'

/** Ordered stages of the discovery → value conversation state machine. */
export type ConversationStage =
  | 'understand_problem'
  | 'identify_current_process'
  | 'identify_people_and_roles'
  | 'identify_volume'
  | 'identify_time_per_transaction'
  | 'identify_systems'
  | 'identify_exceptions'
  | 'identify_risks'
  | 'identify_controls'
  | 'propose_agentic_solution'
  | 'estimate_automation_percentage'
  | 'quantify_value'
  | 'generate_opportunity_card'
  | 'save_idea'

export interface StageDefinition {
  id: ConversationStage
  label: string
  /** What the advisor is trying to establish at this stage. */
  goal: string
  /** The question the advisor asks the user at this stage. */
  question: string
  /** Short hint shown to the advisor about how to use the answer. */
  guidance: string
  /** Stages whose answers feed into the opportunity card. */
  cardField?: string
}

export const STAGES: StageDefinition[] = [
  {
    id: 'understand_problem',
    label: 'Understand the Problem',
    goal: 'Capture the business problem or opportunity in the user’s own words.',
    question:
      'What is the process or task you want to improve, and what makes it painful today?',
    guidance: 'Restate the problem succinctly before moving on.',
    cardField: 'problem',
  },
  {
    id: 'identify_current_process',
    label: 'Current Process',
    goal: 'Map the as-is steps of the process.',
    question: 'Walk me through how the process runs today, step by step.',
    guidance: 'Identify manual handoffs and decision points.',
    cardField: 'currentProcess',
  },
  {
    id: 'identify_people_and_roles',
    label: 'People & Roles',
    goal: 'Identify who performs the work and their roles.',
    question: 'Who performs this process today, and what roles or teams are involved?',
    guidance: 'Note the most expensive / scarcest role.',
    cardField: 'peopleAndRoles',
  },
  {
    id: 'identify_volume',
    label: 'Volume',
    goal: 'Quantify how often the process runs.',
    question: 'How many transactions, cases, or instances of this process occur per week or month?',
    guidance: 'Push for a numeric range; default to conservative estimates.',
    cardField: 'volume',
  },
  {
    id: 'identify_time_per_transaction',
    label: 'Time per Transaction',
    goal: 'Estimate the effort per transaction.',
    question: 'Roughly how long does one transaction take in minutes or hours?',
    guidance: 'Separate hands-on time from waiting/handoff time.',
    cardField: 'timePerTransaction',
  },
  {
    id: 'identify_systems',
    label: 'Systems',
    goal: 'Identify the systems and data sources involved.',
    question: 'Which systems, applications, or data sources does this process touch?',
    guidance: 'Flag systems with poor API surfaces (RPA / browser agents may be needed).',
    cardField: 'systems',
  },
  {
    id: 'identify_exceptions',
    label: 'Exceptions',
    goal: 'Understand exception handling and edge cases.',
    question: 'What kinds of exceptions or edge cases come up, and how are they handled today?',
    guidance: 'High exception volume lowers straight-through automation.',
    cardField: 'exceptions',
  },
  {
    id: 'identify_risks',
    label: 'Risks',
    goal: 'Surface the risks of automating this process.',
    question: 'What could go wrong if an agent ran this process autonomously?',
    guidance: 'Capture compliance, safety, and quality risks.',
    cardField: 'risks',
  },
  {
    id: 'identify_controls',
    label: 'Controls',
    goal: 'Define the guardrails and controls required.',
    question: 'What controls, approvals, or audit trails should govern an automated version?',
    guidance: 'Prefer human-in-the-loop gates for high-risk steps.',
    cardField: 'controls',
  },
  {
    id: 'propose_agentic_solution',
    label: 'Propose Solution',
    goal: 'Propose an agentic solution grounded in retrieved use cases.',
    question: 'Based on what you have told me, here is a proposed agentic solution. Does it match your intent?',
    guidance: 'Cite retrieved use cases and news as evidence.',
    cardField: 'proposedSolution',
  },
  {
    id: 'estimate_automation_percentage',
    label: 'Automation %',
    goal: 'Estimate the share of the process an agent could handle end-to-end.',
    question: 'What percentage of this process do you estimate an agent could handle autonomously, and why?',
    guidance: 'Anchor on exception volume and control maturity.',
    cardField: 'automationPercentage',
  },
  {
    id: 'quantify_value',
    label: 'Quantify Value',
    goal: 'Quantify the annual value of automating the process.',
    question: 'Using the hours, volume, and cost figures, here is the estimated annual value. Does it look right?',
    guidance: 'Apply the value formula; state assumptions explicitly.',
    cardField: 'value',
  },
  {
    id: 'generate_opportunity_card',
    label: 'Opportunity Card',
    goal: 'Produce a structured opportunity card summarizing the case.',
    question: 'Here is your opportunity card. Review it and tell me what to adjust before we save it.',
    guidance: 'Render all prior answers as a single structured card.',
    cardField: 'opportunityCard',
  },
  {
    id: 'save_idea',
    label: 'Save Idea',
    goal: 'Persist the opportunity as an Idea in the Idea Lab.',
    question: 'Would you like to save this as an idea in the Idea Lab so you can track it?',
    guidance: 'On confirmation, create an Idea and link it to the conversation.',
    cardField: 'savedIdea',
  },
]

export const INITIAL_STAGE: ConversationStage = STAGES[0].id
export const TERMINAL_STAGE: ConversationStage = STAGES[STAGES.length - 1].id

export function getStage(id: ConversationStage): StageDefinition {
  return STAGES.find((s) => s.id === id) ?? STAGES[0]
}

export function stageIndex(id: ConversationStage): number {
  const i = STAGES.findIndex((s) => s.id === id)
  return i < 0 ? 0 : i
}

export function nextStage(id: ConversationStage): ConversationStage {
  const i = stageIndex(id)
  return STAGES[Math.min(i + 1, STAGES.length - 1)].id
}

export function isTerminal(id: ConversationStage): boolean {
  return id === TERMINAL_STAGE
}

export function progress(id: ConversationStage): {
  current: number
  total: number
  percent: number
} {
  const current = stageIndex(id) + 1
  const total = STAGES.length
  return { current, total, percent: Math.round((current / total) * 100) }
}

/**
 * Metadata stored on each Message's `metadata` JSON column. Carries the mode
 * and stage for the conversation so the state machine is fully recoverable
 * from message history alone.
 */
export interface ConversationMessageMetadata {
  mode: ConversationMode
  stage: ConversationStage
  /** Progress at the time of this message. */
  progress?: { current: number; total: number; percent: number }
  /** Ids of use cases cited in this turn (RAG evidence). */
  useCaseRefs?: string[]
  /** Ids of news items cited in this turn (RAG evidence). */
  newsRefs?: string[]
  /** True once the opportunity card has been generated. */
  opportunityCardReady?: boolean
  /** True when the advisor offered to save the idea. */
  offeredSave?: boolean
  /** Set when an Idea was created from this turn. */
  savedIdeaId?: string
  /** Whether this turn ran in demo/fallback mode (no live AI provider). */
  demoMode?: boolean
}

/** Map the 4 advisor modes onto the 3-value ConversationType enum. */
export function modeToConversationType(mode: ConversationMode): ConversationType {
  switch (mode) {
    case 'LEARN':
      return 'DISCOVERY'
    case 'EXPLORE':
      return 'DISCOVERY'
    case 'IDEATE':
      return 'REFINEMENT'
    case 'ASSESS':
      return 'VALIDATION'
  }
}

/**
 * Lossy reverse map. The authoritative mode is read from message metadata;
 * this is only a fallback when metadata is absent (e.g. legacy rows).
 */
export function conversationTypeToMode(type: ConversationType): ConversationMode {
  switch (type) {
    case 'DISCOVERY':
      return 'EXPLORE'
    case 'REFINEMENT':
      return 'IDEATE'
    case 'VALIDATION':
      return 'ASSESS'
  }
}

export function isConversationMode(value: unknown): value is ConversationMode {
  return (
    value === 'LEARN' ||
    value === 'EXPLORE' ||
    value === 'IDEATE' ||
    value === 'ASSESS'
  )
}

export function isConversationStage(value: unknown): value is ConversationStage {
  if (typeof value !== 'string') return false
  return STAGES.some((s) => s.id === value)
}
