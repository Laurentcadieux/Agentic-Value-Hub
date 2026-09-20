/**
 * AI Advisor service.
 *
 * Orchestrates:
 *  - the conversation state machine (stage advancement + mode framing)
 *  - knowledge retrieval (RAG) from use cases + news, with a demo-data fallback
 *  - calls to the configured AgentProvider
 *  - server-side validation of user input (prompt-injection defense) and AI output
 *  - persistence of conversations, messages, and saved ideas (customer-scoped)
 *
 * When no live AI provider is configured the provider throws and the service
 * falls back to a deterministic, state-machine-driven response so the Advisor
 * is still usable in demo mode without an API key or database.
 */

import type { Conversation, Message, Prisma } from '@prisma/client'
import { getAgentProvider } from '@/lib/ai/provider'
import {
  buildRagContext,
  getMode,
  getStagePrompt,
  getSystemPrompt,
  MODES,
  toChatMessages,
  type RetrievedKnowledge,
  type RetrievedKnowledgeRef,
} from '@/lib/ai/prompts'
import {
  conversationTypeToMode,
  getStage,
  INITIAL_STAGE,
  isConversationMode,
  isConversationStage,
  modeToConversationType,
  nextStage,
  progress as progressOf,
  STAGES,
  TERMINAL_STAGE,
  type ConversationMessageMetadata,
  type ConversationMode,
  type ConversationStage,
} from '@/lib/ai/state-machine'
import {
  addMessage,
  createConversation as createConversationRow,
  createIdea,
  getConversation as getConversationRow,
  linkConversationToIdea,
  listConversations as listConversationsRow,
  updateConversation,
} from '@/lib/repositories/conversation-repository'
import { demoNews, demoUseCases } from '@/lib/demo-data'
import { calculateOpportunityValue } from '@/lib/value/calculate'
import { MAX_ASSISTANT_MESSAGE_CHARS, MAX_USER_MESSAGE_CHARS } from '@/lib/config'
import { prisma } from '@/lib/prisma'

// --- Errors -----------------------------------------------------------------

export class AdvisorError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'AdvisorError'
  }
}
export class NotFoundError extends AdvisorError {
  constructor(message = 'Conversation not found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}
export class ValidationError extends AdvisorError {
  constructor(message: string) {
    super(message, 422)
    this.name = 'ValidationError'
  }
}

// --- DTOs -------------------------------------------------------------------

export interface MessageDto {
  id: string
  conversationId: string
  role: 'USER' | 'ASSISTANT' | 'SYSTEM'
  content: string
  metadata: ConversationMessageMetadata | null
  createdAt: string
}

export interface ConversationSummaryDto {
  id: string
  conversationType: string
  mode: ConversationMode
  stage: ConversationStage
  title: string | null
  summary: string | null
  createdAt: string
  updatedAt: string
}

export interface ConversationDto extends ConversationSummaryDto {
  messages: MessageDto[]
  ideaId: string | null
  userId: string | null
}

// --- Metadata parsing -------------------------------------------------------

function parseMetadata(raw: unknown): ConversationMessageMetadata | null {
  if (!raw || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const mode = isConversationMode(obj.mode) ? obj.mode : undefined
  const stage = isConversationStage(obj.stage) ? obj.stage : undefined
  if (!mode || !stage) return null
  const meta: ConversationMessageMetadata = { mode, stage }
  if (obj.useCaseRefs && Array.isArray(obj.useCaseRefs)) {
    meta.useCaseRefs = obj.useCaseRefs.filter((x): x is string => typeof x === 'string')
  }
  if (obj.newsRefs && Array.isArray(obj.newsRefs)) {
    meta.newsRefs = obj.newsRefs.filter((x): x is string => typeof x === 'string')
  }
  if (typeof obj.opportunityCardReady === 'boolean') {
    meta.opportunityCardReady = obj.opportunityCardReady
  }
  if (typeof obj.offeredSave === 'boolean') meta.offeredSave = obj.offeredSave
  if (typeof obj.savedIdeaId === 'string') meta.savedIdeaId = obj.savedIdeaId
  if (typeof obj.demoMode === 'boolean') meta.demoMode = obj.demoMode
  if (obj.progress && typeof obj.progress === 'object') {
    const p = obj.progress as Record<string, unknown>
    if (
      typeof p.current === 'number' &&
      typeof p.total === 'number' &&
      typeof p.percent === 'number'
    ) {
      meta.progress = { current: p.current, total: p.total, percent: p.percent }
    }
  }
  return meta
}

function toMessageDto(m: Message): MessageDto {
  return {
    id: m.id,
    conversationId: m.conversationId,
    role: m.role,
    content: m.content,
    metadata: parseMetadata(m.metadata),
    createdAt: m.createdAt.toISOString(),
  }
}

function deriveMode(messages: Message[], fallbackType: Conversation['conversationType']): ConversationMode {
  for (let i = messages.length - 1; i >= 0; i--) {
    const meta = parseMetadata(messages[i].metadata)
    if (meta?.mode) return meta.mode
  }
  return conversationTypeToMode(fallbackType)
}

function deriveStage(messages: Message[]): ConversationStage {
  for (let i = messages.length - 1; i >= 0; i--) {
    const meta = parseMetadata(messages[i].metadata)
    if (meta?.stage) return meta.stage
  }
  return INITIAL_STAGE
}

// --- Prompt-injection defense / input validation ----------------------------

const INJECTION_PATTERNS = [
  /^\s*(ignore|disregard|forget)\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /^\s*system\s*:/i,
  /^\s*you\s+are\s+now\s+/i,
  /^\s*(act|pretend)\s+as\s+/i,
  /^\s*reveal|show|print\s+(your|the)\s+(system|prompt|instructions)/i,
  /^\s*<\|im_start\|>/i,
  /^\s*\[system\]/i,
]

/** Lightweight server-side input hardening. Returns the cleaned text or throws. */
export function sanitizeUserInput(content: string): string {
  const text = (content ?? '').trim()
  if (!text) throw new ValidationError('Message cannot be empty.')
  if (text.length > MAX_USER_MESSAGE_CHARS) {
    throw new ValidationError(
      `Message is too long (max ${MAX_USER_MESSAGE_CHARS} characters).`,
    )
  }
  for (const line of text.split('\n')) {
    if (INJECTION_PATTERNS.some((re) => re.test(line))) {
      throw new ValidationError(
        'Your message looks like it contains instructions meant for the model. Please rephrase as a description of your process instead.',
      )
    }
  }
  // Strip control characters that could be used to confuse output rendering.
  return text.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
}

/** Server-side output validation: clamp length, strip control chars. */
export function validateAssistantOutput(content: string): string {
  let text = (content ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
  text = text.trim()
  if (!text) {
    text =
      'I did not produce a usable response for that turn. Could you rephrase your last answer?'
  }
  if (text.length > MAX_ASSISTANT_MESSAGE_CHARS) {
    text = text.slice(0, MAX_ASSISTANT_MESSAGE_CHARS) + '…'
  }
  return text
}

// --- RAG retrieval ----------------------------------------------------------

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'for', 'to', 'of', 'in', 'on', 'at',
  'is', 'are', 'be', 'we', 'i', 'you', 'it', 'this', 'that', 'with', 'as', 'by',
  'how', 'what', 'which', 'who', 'why', 'when', 'do', 'does', 'can', 'could',
  'would', 'should', 'have', 'has', 'our', 'my', 'me', 'us', 'they', 'them',
  'their', 'process', 'system', 'data', 'want', 'need', 'help', 'like', 'about',
])

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z][a-z0-9-]{2,}/g) ?? [])
    .filter((t) => !STOPWORDS.has(t))
}

interface Scored {
  id: string
  score: number
  title: string
  reason: string
}

function scoreText(haystack: string, tokens: string[]): number {
  const h = haystack.toLowerCase()
  let score = 0
  for (const t of tokens) {
    if (!t) continue
    const idx = h.indexOf(t)
    if (idx >= 0) {
      score += idx === 0 ? 2 : 1
    }
  }
  return score
}

export async function retrieveKnowledge(
  query: string,
  customerId?: string,
): Promise<RetrievedKnowledge> {
  const tokens = tokenize(query)
  const useCases: Scored[] = []
  const news: Scored[] = []

  const topN = 3

  try {
    // Prefer the customer's published use cases + shared/public ones.
    const dbUseCases = await prisma.useCase.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          ...(customerId ? [{ customerId }] : []),
          { customerId: null },
        ],
      },
      take: 200,
    })

    for (const uc of dbUseCases) {
      const hay = [
        uc.title,
        uc.problem ?? '',
        uc.description ?? '',
        uc.industry ?? '',
        uc.businessFunction ?? '',
        ...(uc.valueDrivers ?? []),
        ...(uc.technologies ?? []),
      ].join(' ')
      const score = scoreText(hay, tokens)
      if (score > 0) {
        useCases.push({
          id: uc.id,
          score,
          title: uc.title,
          reason: [uc.industry, uc.businessFunction, uc.problem ?? '']
            .filter(Boolean)
            .join(' — '),
        })
      }
    }

    const dbNews = await prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 100,
    })

    for (const n of dbNews) {
      const hay = [
        n.headline,
        n.summary ?? '',
        n.whyItMatters ?? '',
        ...(n.industries ?? []),
        ...(n.technologies ?? []),
      ].join(' ')
      const score = scoreText(hay, tokens)
      if (score > 0) {
        news.push({
          id: n.id,
          score,
          title: n.headline,
          reason: n.summary ?? n.whyItMatters ?? '',
        })
      }
    }
  } catch {
    // DB unavailable — fall through to demo data.
  }

  // Fallback / supplement with demo data when DB yielded too few results.
  if (useCases.length < topN) {
    for (const uc of demoUseCases) {
      if (useCases.some((u) => u.title === uc.title)) continue
      const hay = [
        uc.title,
        uc.problem,
        uc.description,
        uc.industry,
        uc.businessFunction,
        ...uc.valueDrivers,
        ...uc.technologies,
      ].join(' ')
      const score = scoreText(hay, tokens)
      if (score > 0) {
        useCases.push({
          id: uc.slug,
          score,
          title: uc.title,
          reason: [uc.industry, uc.businessFunction].filter(Boolean).join(' — '),
        })
      }
    }
  }
  if (news.length < topN) {
    for (const n of demoNews) {
      if (news.some((x) => x.title === n.headline)) continue
      const hay = [
        n.headline,
        n.summary,
        n.whyItMatters,
        ...n.industries,
        ...n.technologies,
      ].join(' ')
      const score = scoreText(hay, tokens)
      if (score > 0) {
        news.push({
          id: n.slug,
          score,
          title: n.headline,
          reason: n.summary,
        })
      }
    }
  }

  useCases.sort((a, b) => b.score - a.score)
  news.sort((a, b) => b.score - a.score)

  const mapRef = (s: Scored, kind: 'useCase' | 'news'): RetrievedKnowledgeRef => ({
    id: s.id,
    kind,
    title: s.title,
    reason: s.reason,
  })

  const topUseCases = useCases.slice(0, topN).map((s) => mapRef(s, 'useCase'))
  const topNews = news.slice(0, topN).map((s) => mapRef(s, 'news'))

  return {
    useCases: topUseCases,
    news: topNews,
    contextBlock: buildRagContext({
      useCases: topUseCases,
      news: topNews,
      contextBlock: '',
    }),
  }
}

// --- Conversation creation --------------------------------------------------

export interface CreateConversationArgs {
  customerId: string
  userId?: string | null
  mode: ConversationMode
  title?: string | null
  ideaId?: string | null
}

export interface CreateConversationResult {
  conversation: ConversationDto
}

export async function createConversationWithGreeting(
  args: CreateConversationArgs,
): Promise<CreateConversationResult> {
  const modeCfg = getMode(args.mode)
  const stage = INITIAL_STAGE
  const p = progressOf(stage)
  const greeting = `${modeCfg.opening}\n\n${getStagePrompt(stage)}`

  const conversation = await createConversationRow({
    customerId: args.customerId,
    userId: args.userId ?? null,
    conversationType: modeToConversationType(args.mode),
    title: args.title ?? `${modeCfg.titlePrefix}: new conversation`,
    ideaId: args.ideaId ?? null,
  })

  const meta: ConversationMessageMetadata = { mode: args.mode, stage, progress: p }
  const message = await addMessage({
    conversationId: conversation.id,
    role: 'ASSISTANT',
    content: greeting,
    metadata: meta as unknown as Prisma.InputJsonValue,
  })

  return {
    conversation: {
      id: conversation.id,
      conversationType: conversation.conversationType,
      mode: args.mode,
      stage,
      title: conversation.title,
      summary: conversation.summary,
      createdAt: conversation.createdAt.toISOString(),
      updatedAt: conversation.updatedAt.toISOString(),
      ideaId: conversation.ideaId,
      userId: conversation.userId,
      messages: [toMessageDto(message)],
    },
  }
}

// --- Send message -----------------------------------------------------------

export interface SendMessageArgs {
  conversationId: string
  customerId: string
  content: string
}

export interface SendMessageResult {
  userMessage: MessageDto
  assistantMessage: MessageDto
  messages: MessageDto[]
  stage: ConversationStage
  mode: ConversationMode
  progress: { current: number; total: number; percent: number }
  savedIdeaId?: string
}

const CONFIRM_WORDS = ['yes', 'save', 'ok', 'okay', 'sure', 'please', 'yep', 'yeah', 'do it', 'go ahead']
const DECLINE_WORDS = ['no', 'later', 'not now', 'skip', 'revise', 'edit', 'change', 'adjust']

function looksLikeConfirmation(text: string): boolean {
  const t = text.toLowerCase()
  if (DECLINE_WORDS.some((w) => t.includes(w))) return false
  return CONFIRM_WORDS.some((w) => t.includes(w))
}

/** Parse the first plausible number out of free text (handles commas, decimals, units). */
function parseNumber(text: string): number | null {
  const match = text.match(/(\d[\d,]*\.?\d*)/)
  if (!match) return null
  const n = Number(match[1].replace(/,/g, ''))
  return Number.isFinite(n) ? n : null
}

function gatherAnswers(messages: Message[]): Record<string, string> {
  // Each assistant message carries metadata.stage = the question it asked.
  // The following user message is that stage's answer.
  const answers: Record<string, string> = {}
  let lastStage: ConversationStage | null = null
  for (const m of messages) {
    const meta = parseMetadata(m.metadata)
    if (m.role === 'ASSISTANT' && meta?.stage) {
      lastStage = meta.stage
    } else if (m.role === 'USER' && lastStage) {
      answers[lastStage] = m.content
      lastStage = null
    }
  }
  return answers
}

function buildOpportunityCard(
  mode: ConversationMode,
  messages: Message[],
  knowledge: RetrievedKnowledge | null,
): { text: string; valueScore: number | null } {
  const answers = gatherAnswers(messages)
  const get = (id: ConversationStage): string => answers[id]?.trim() ?? '—'

  // Try to derive numbers for the value estimate.
  const volume = parseNumber(get('identify_volume')) ?? 1000
  const minutes = parseNumber(get('identify_time_per_transaction')) ?? 10
  const automationPct = parseNumber(get('estimate_automation_percentage')) ?? 50
  const automationFraction = Math.min(1, Math.max(0, automationPct / 100))

  const annualHoursSaved =
    (volume * 50 * (minutes / 60) * automationFraction) || 0

  const value = calculateOpportunityValue({
    annualHoursSaved,
    hourlyCost: 50,
    errorReductionRate: 0.2,
    errorCostBaseline: 0,
    automationPotential: automationFraction || 0.5,
    executionConfidence: 0.7,
    timeHorizonYears: 1,
    discountRate: 0.1,
  })

  const useCaseTitles = knowledge?.useCases.map((u) => u.title) ?? []

  const lines = [
    'OPPORTUNITY CARD',
    '================',
    '',
    `Problem: ${get('understand_problem')}`,
    `Current process: ${get('identify_current_process')}`,
    `People & roles: ${get('identify_people_and_roles')}`,
    `Volume: ${get('identify_volume')}`,
    `Time per transaction: ${get('identify_time_per_transaction')}`,
    `Systems: ${get('identify_systems')}`,
    `Exceptions: ${get('identify_exceptions')}`,
    `Risks: ${get('identify_risks')}`,
    `Controls: ${get('identify_controls')}`,
    `Proposed agentic solution: ${get('propose_agentic_solution')}`,
    `Automation %: ${get('estimate_automation_percentage')}`,
    '',
    `Estimated annual hours saved: ${Math.round(annualHoursSaved).toLocaleString()}`,
    `Estimated annual value: $${Math.round(value.value).toLocaleString()}`,
    '(Assumptions: 50 working weeks/yr, $50/hr fully-loaded cost, 20% error reduction, 70% execution confidence, 1-year horizon, 10% discount.)',
  ]
  if (useCaseTitles.length > 0) {
    lines.push('', `Grounded in use cases: ${useCaseTitles.join('; ')}`)
  }
  return {
    text: lines.join('\n'),
    valueScore: value.value > 0 ? Math.round(value.value) : null,
  }
}

function buildDemoReply(
  mode: ConversationMode,
  nextStage: ConversationStage,
  messages: Message[],
  knowledge: RetrievedKnowledge | null,
): { text: string; demoMode: true } {
  const stageDef = getStage(nextStage)
  const ack = messages.length > 1 ? 'Thanks.' : ''
  let text = [ack, stageDef.question].filter(Boolean).join(' ')

  if (knowledge && knowledge.useCases.length > 0) {
    const titles = knowledge.useCases.slice(0, 2).map((u) => u.title).join('; ')
    text += `\n\nRelevant use cases from the Hub: ${titles}.`
  }
  if (knowledge && knowledge.news.length > 0) {
    const titles = knowledge.news.slice(0, 1).map((n) => n.title).join('; ')
    text += `\nRecent market signal: ${titles}.`
  }
  return { text, demoMode: true }
}

export async function sendMessage(args: SendMessageArgs): Promise<SendMessageResult> {
  // 1. Validate input (prompt-injection defense).
  const userContent = sanitizeUserInput(args.content)

  // 2. Load conversation (customer-scoped).
  const conversation = await getConversationRow(args.conversationId, args.customerId)
  if (!conversation) throw new NotFoundError()

  const mode = deriveMode(conversation.messages, conversation.conversationType)
  const currentStage = deriveStage(conversation.messages)

  // 3. Persist the user message.
  const userMeta: ConversationMessageMetadata = {
    mode,
    stage: currentStage,
    progress: progressOf(currentStage),
  }
  const userMessage = await addMessage({
    conversationId: conversation.id,
    role: 'USER',
    content: userContent,
    metadata: userMeta as unknown as Prisma.InputJsonValue,
  })

  // 4. Advance the state machine.
  const next = nextStage(currentStage)
  const p = progressOf(next)

  // 5. Retrieve RAG knowledge from recent context.
  const recentUserText = conversation.messages
    .filter((m) => m.role === 'USER')
    .slice(-6)
    .map((m) => m.content)
    .concat(userContent)
    .join(' ')
  const knowledge = await retrieveKnowledge(recentUserText, args.customerId).catch(() => null)

  // 6. Build provider request.
  const history = toChatMessages([
    ...conversation.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: 'USER' as const, content: userContent },
  ])
  const system = getSystemPrompt(mode, next, knowledge)

  let assistantText: string
  let demoMode = false
  try {
    const provider = getAgentProvider()
    const res = await provider.chat({
      messages: history,
      system,
      temperature: mode === 'IDEATE' ? 0.7 : 0.4,
      maxTokens: 800,
    })
    assistantText = res.content
  } catch {
    // No live provider configured (Phase 0 stub, or provider error) — use the
    // deterministic state-machine fallback so the Advisor still works.
    const demo = buildDemoReply(mode, next, conversation.messages, knowledge)
    assistantText = demo.text
    demoMode = true
  }

  // 7. Stage-specific content synthesis.
  let opportunityCardReady = false
  let offeredSave = false
  let savedIdeaId: string | undefined

  if (next === 'generate_opportunity_card') {
    const card = buildOpportunityCard(mode, [...conversation.messages, userMessage], knowledge)
    assistantText = `${assistantText}\n\n${card.text}`
    opportunityCardReady = true
  } else if (next === TERMINAL_STAGE) {
    if (currentStage === TERMINAL_STAGE) {
      // User has now responded to the save offer.
      if (looksLikeConfirmation(userContent)) {
        const card = buildOpportunityCard(
          mode,
          [...conversation.messages, userMessage],
          knowledge,
        )
        const title =
          conversation.title?.replace(/: new conversation$/i, '').trim() ||
          answers(conversation.messages, userMessage) ||
          'New agentic opportunity'
        const idea = await createIdea({
          customerId: args.customerId,
          userId: conversation.userId ?? null,
          title: title.length > 120 ? title.slice(0, 117) + '…' : title,
          description: card.text,
          valueScore: card.valueScore,
        }).catch(() => null)
        if (idea) {
          savedIdeaId = idea.id
          await linkConversationToIdea(conversation.id, args.customerId, idea.id).catch(() => {})
          assistantText = `Saved. Your opportunity is now in the Idea Lab as “${idea.title}” (value estimate: ${
            card.valueScore != null ? `$${card.valueScore.toLocaleString()}` : 'pending'
          }). You can keep refining it here or open it from the Idea Lab.`
        } else {
          assistantText =
            'I tried to save your idea but the Idea Lab is unavailable right now. You can copy the opportunity card above into the Idea Lab manually.'
        }
      } else {
        offeredSave = true
        assistantText =
          'No problem. Adjust any of your answers and I will regenerate the opportunity card. When you are happy, just say “save” and I will add it to the Idea Lab.'
      }
    } else {
      // First time reaching the terminal: offer to save.
      offeredSave = true
    }
  }

  // 8. Server-side output validation.
  assistantText = validateAssistantOutput(assistantText)

  // 9. Persist the assistant message.
  const assistantMeta: ConversationMessageMetadata = {
    mode,
    stage: next,
    progress: p,
    useCaseRefs: knowledge?.useCases.map((u) => u.id),
    newsRefs: knowledge?.news.map((n) => n.id),
    opportunityCardReady,
    offeredSave,
    savedIdeaId,
    demoMode,
  }
  const assistantMessage = await addMessage({
    conversationId: conversation.id,
    role: 'ASSISTANT',
    content: assistantText,
    metadata: assistantMeta as unknown as Prisma.InputJsonValue,
  })

  // 10. Derive a title from the first user message if the title is still the default.
  const isFirstUserMessage =
    conversation.messages.filter((m) => m.role === 'USER').length === 0
  if (isFirstUserMessage) {
    const derived = userContent.replace(/\s+/g, ' ').trim()
    if (derived) {
      await updateConversation(conversation.id, args.customerId, {
        title: (getMode(mode).titlePrefix + ': ' + derived).slice(0, 120),
      }).catch(() => {})
    }
  }

  // 11. Return the full, updated conversation as DTOs.
  const fresh = await getConversationRow(conversation.id, args.customerId)
  const allMessages = fresh ? fresh.messages : [...conversation.messages, userMessage, assistantMessage]
  return {
    userMessage: toMessageDto(userMessage),
    assistantMessage: toMessageDto(assistantMessage),
    messages: allMessages.map(toMessageDto),
    stage: next,
    mode,
    progress: p,
    savedIdeaId,
  }
}

// Helper for the title fallback above.
function answers(messages: Message[], newUser: Message): string {
  const first = [...messages, newUser].find((m) => m.role === 'USER')
  return first ? first.content.slice(0, 80) : 'New agentic opportunity'
}

// --- Read helpers -----------------------------------------------------------

export async function listConversations(
  customerId: string,
  userId?: string,
): Promise<ConversationSummaryDto[]> {
  const rows = await listConversationsRow(customerId, userId)
  return rows.map((c) => ({
    id: c.id,
    conversationType: c.conversationType,
    mode: conversationTypeToMode(c.conversationType),
    stage: INITIAL_STAGE,
    title: c.title,
    summary: c.summary,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }))
}

export async function getConversation(
  id: string,
  customerId: string,
): Promise<ConversationDto | null> {
  const row = await getConversationRow(id, customerId)
  if (!row) return null
  const mode = deriveMode(row.messages, row.conversationType)
  const stage = deriveStage(row.messages)
  return {
    id: row.id,
    conversationType: row.conversationType,
    mode,
    stage,
    title: row.title,
    summary: row.summary,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    ideaId: row.ideaId,
    userId: row.userId,
    messages: row.messages.map(toMessageDto),
  }
}

export { MODES, STAGES }
