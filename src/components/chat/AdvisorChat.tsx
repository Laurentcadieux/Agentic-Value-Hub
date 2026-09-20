'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatMessage } from './ChatMessage'
import { ChatInput } from './ChatInput'
import { ModeSelector } from './ModeSelector'
import { ConversationList } from './ConversationList'
import { getMode } from '@/lib/ai/prompts'
import type { ConversationMode } from '@/lib/ai/state-machine'
import type {
  ChatConversation,
  ChatConversationSummary,
  ChatMessage as ChatMessageType,
} from './types'

function summarize(conv: ChatConversation): ChatConversationSummary {
  return {
    id: conv.id,
    conversationType: conv.conversationType,
    mode: conv.mode,
    stage: conv.stage,
    title: conv.title,
    summary: conv.summary,
    createdAt: conv.createdAt,
    updatedAt: conv.createdAt,
  }
}

/**
 * AdvisorChat — full-page client container for the AI Advisor.
 *
 * State:
 *  - `mode`         selected advisor mode (used for new conversations)
 *  - `conversations` past conversations (sidebar)
 *  - `activeId` / `messages` the currently open conversation
 *
 * All persistence goes through the REST API under /api/v1/conversations; this
 * component never imports server-only code (Prisma/provider) so it stays in
 * the client bundle.
 */
export function AdvisorChat({ customerId }: { customerId: string }) {
  const [mode, setMode] = useState<ConversationMode>('LEARN')
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/v1/conversations?customerId=${encodeURIComponent(customerId)}`,
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load conversations')
      setConversations((data.conversations ?? []) as ChatConversationSummary[])
    } catch (e) {
      // Non-fatal: the sidebar just stays empty.
      setConversations([])
      console.error(e)
    } finally {
      setListLoading(false)
    }
  }, [customerId])

  useEffect(() => {
    void fetchConversations()
  }, [fetchConversations])

  // Auto-scroll to the newest message.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length, sending])

  async function createConversation(
    useMode: ConversationMode,
  ): Promise<ChatConversation> {
    const res = await fetch('/api/v1/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, mode: useMode }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Failed to start conversation')
    return data.conversation as ChatConversation
  }

  async function loadConversation(id: string) {
    setError(null)
    setShowSidebar(false)
    try {
      const res = await fetch(
        `/api/v1/conversations/${encodeURIComponent(id)}?customerId=${encodeURIComponent(customerId)}`,
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load conversation')
      const conv = data.conversation as ChatConversation
      setActiveId(conv.id)
      setMessages(conv.messages ?? [])
      if (conv.mode) setMode(conv.mode)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load conversation')
    }
  }

  async function handleNew() {
    setError(null)
    try {
      const conv = await createConversation(mode)
      setActiveId(conv.id)
      setMessages(conv.messages ?? [])
      setConversations((prev) => [summarize(conv), ...prev.filter((c) => c.id !== conv.id)])
      setShowSidebar(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start conversation')
    }
  }

  async function handleSend(content: string) {
    setError(null)
    setSending(true)

    // Optimistic user bubble for responsiveness.
    const optimistic: ChatMessageType = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content,
      metadata: { mode },
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    try {
      let convId = activeId
      if (!convId) {
        const conv = await createConversation(mode)
        convId = conv.id
        setActiveId(convId)
        // Replace the optimistic list with the greeting + optimistic message.
        setMessages([...(conv.messages ?? []), optimistic])
        setConversations((prev) => [summarize(conv), ...prev.filter((c) => c.id !== convId)])
      }

      const res = await fetch(
        `/api/v1/conversations/${encodeURIComponent(convId)}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, customerId }),
        },
      )
      const data = await res.json()
      if (!res.ok) {
        // Roll back the optimistic bubble on failure.
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
        throw new Error(data.error ?? 'Failed to send message')
      }
      setMessages((data.messages ?? []) as ChatMessageType[])
      // Refresh the sidebar to pick up any title update.
      void fetchConversations()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const modeCfg = getMode(mode)
  const hasMessages = messages.length > 0

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col md:flex-row">
      {/* Sidebar (toggleable on mobile) */}
      <div
        className={`${
          showSidebar ? 'block' : 'hidden'
        } absolute inset-y-14 left-0 z-40 w-72 md:static md:block md:w-64 md:z-auto lg:w-72`}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={(id) => void loadConversation(id)}
          onNew={() => void handleNew()}
          loading={listLoading}
        />
      </div>

      {/* Backdrop for the mobile sidebar */}
      {showSidebar ? (
        <button
          type="button"
          aria-label="Close conversations"
          onClick={() => setShowSidebar(false)}
          className="absolute inset-0 top-14 z-30 bg-black/30 md:hidden"
        />
      ) : null}

      {/* Main chat panel */}
      <div className="flex min-w-0 flex-1 flex-col">
        <ModeSelector mode={mode} onChange={setMode} disabled={sending} />

        <button
          type="button"
          onClick={() => setShowSidebar((v) => !v)}
          className="flex items-center gap-2 self-start px-3 py-2 text-sm text-brand-blue md:hidden"
        >
          ☰ Conversations
        </button>

        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
          <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
            {hasMessages ? (
              messages.map((m) => <ChatMessage key={m.id} message={m} />)
            ) : (
              <div className="rounded-lg border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
                <p className="font-headline text-lg font-semibold">
                  {modeCfg.label} mode
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-neutral-600 dark:text-neutral-300">
                  {modeCfg.description}
                </p>
                <p className="mt-4 text-sm text-neutral-500">
                  {`Type a message below to start a new conversation in ${modeCfg.label} mode. The Advisor will walk you through a structured discovery and produce an opportunity card.`}
                </p>
              </div>
            )}
            {sending ? (
              <div className="flex justify-start">
                <div className="rounded-lg bg-neutral-100 px-4 py-3 text-sm text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  <span className="inline-flex gap-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400 [animation-delay:150ms]" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-neutral-400 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>

        {error ? (
          <div className="mx-auto w-full max-w-3xl px-4">
            <div className="mb-2 flex items-center justify-between rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        ) : null}

        <ChatInput onSend={(c) => void handleSend(c)} disabled={sending} mode={mode} />
      </div>
    </div>
  )
}
