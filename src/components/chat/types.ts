/**
 * Client-safe shapes for the AI Advisor chat UI.
 *
 * These mirror the DTOs returned by `src/services/ai-service.ts` but contain
 * NO server-only imports (no Prisma, no provider). Importing the service into
 * a client component would pull Prisma into the browser bundle, so the UI
 * consumes these plain interfaces and talks to the API over fetch instead.
 */

export type ChatRole = 'USER' | 'ASSISTANT' | 'SYSTEM'
export type ConversationMode = 'LEARN' | 'EXPLORE' | 'IDEATE' | 'ASSESS'

export interface ChatMessageMetadata {
  mode?: ConversationMode
  stage?: string
  progress?: { current: number; total: number; percent: number }
  demoMode?: boolean
  opportunityCardReady?: boolean
  offeredSave?: boolean
  savedIdeaId?: string
  useCaseRefs?: string[]
  newsRefs?: string[]
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  metadata: ChatMessageMetadata | null
  createdAt: string
}

export interface ChatConversationSummary {
  id: string
  conversationType: string
  mode: ConversationMode
  stage: string
  title: string | null
  summary: string | null
  createdAt: string
  updatedAt: string
}

export interface ChatConversation extends ChatConversationSummary {
  messages: ChatMessage[]
  ideaId: string | null
  userId: string | null
}
