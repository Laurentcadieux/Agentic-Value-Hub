/**
 * Provider-independent AI service layer.
 *
 * Define new providers by implementing `AgentProvider`. The factory
 * `getAgentProvider()` selects one based on the `AI_PROVIDER` env var.
 */

export type ChatRole = 'system' | 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface AgentRequest {
  /** Conversation history, oldest first. */
  messages: ChatMessage[]
  /** Optional structured instructions or system prompt. */
  system?: string
  /** Optional sampling temperature (0..2). */
  temperature?: number
  /** Optional max output tokens. */
  maxTokens?: number
  /** Provider-specific metadata passthrough. */
  metadata?: Record<string, unknown>
}

export interface AgentResponse {
  /** The assistant's message content. */
  content: string
  /** The role, always 'assistant'. */
  role: 'assistant'
  /** Raw provider identifier (e.g. model name). */
  model?: string
  /** Provider-returned usage statistics, if any. */
  usage?: {
    promptTokens?: number
    completionTokens?: number
    totalTokens?: number
  }
  /** Provider-returned finish reason, if any. */
  finishReason?: string
}

export interface AgentProvider {
  /** Stable identifier for this provider (e.g. 'openai', 'anthropic'). */
  readonly name: string
  /** Run a chat completion request and return the assistant response. */
  chat(request: AgentRequest): Promise<AgentResponse>
}

/**
 * Factory returning the configured AgentProvider based on `AI_PROVIDER`.
 * Throws if the requested provider is not implemented.
 *
 * NOTE: Concrete providers are wired in Phase 1. Phase 0 returns a stub
 * that surfaces a clear error when chat() is actually invoked.
 */
export function getAgentProvider(): AgentProvider {
  const providerName = process.env.AI_PROVIDER ?? 'stub'
  // Phase 1: switch on providerName to return a concrete implementation.
  return {
    name: providerName,
    async chat(_request: AgentRequest): Promise<AgentResponse> {
      throw new Error(
        `AI provider '${providerName}' is not implemented in Phase 0. ` +
          'Wire a concrete provider in src/lib/ai/providers/.',
      )
    },
  }
}
