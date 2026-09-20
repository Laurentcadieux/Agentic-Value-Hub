'use client'

import type { ChatConversationSummary } from './types'

/** Compact relative-time formatter for the conversation sidebar. */
function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const min = Math.round(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.round(min / 60)
  if (hr < 24) return `${hr}h ago`
  const day = Math.round(hr / 24)
  if (day < 7) return `${day}d ago`
  return new Date(iso).toLocaleDateString([], { month: 'short', day: 'numeric' })
}

/**
 * ConversationList — sidebar of past conversations with a "New conversation"
 * button. Selecting a conversation loads it into the chat panel.
 */
export function ConversationList({
  conversations,
  activeId,
  onSelect,
  onNew,
  loading,
}: {
  conversations: ChatConversationSummary[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  loading: boolean
}) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 md:w-64 lg:w-72">
      <div className="p-3">
        <button
          type="button"
          onClick={onNew}
          className="inline-flex w-full items-center justify-center rounded-lg bg-brand-red px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          + New conversation
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-3">
        {loading && conversations.length === 0 ? (
          <p className="px-2 py-4 text-sm text-neutral-400">Loading conversations…</p>
        ) : conversations.length === 0 ? (
          <p className="px-2 py-4 text-sm text-neutral-400">
            No conversations yet. Start a new one to ask the Advisor.
          </p>
        ) : (
          <ul className="space-y-1">
            {conversations.map((c) => {
              const isActive = c.id === activeId
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className={`block w-full rounded-md px-3 py-2 text-left transition ${
                      isActive
                        ? 'bg-brand-blue/10 text-brand-blue ring-1 ring-brand-blue/30'
                        : 'text-neutral-700 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800'
                    }`}
                  >
                    <span className="block truncate text-sm font-medium">
                      {c.title || 'New conversation'}
                    </span>
                    <span className="mt-0.5 block text-[11px] text-neutral-400">
                      {relativeTime(c.updatedAt)}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </aside>
  )
}
