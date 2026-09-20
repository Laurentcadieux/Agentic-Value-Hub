'use client'

import { useState, useRef, useEffect, type KeyboardEvent } from 'react'
import type { ConversationMode } from '@/lib/ai/state-machine'

/**
 * ChatInput — textarea + send button. Enter sends, Shift+Enter inserts a
 * newline. Disabled while the Advisor is generating.
 */
export function ChatInput({
  onSend,
  disabled,
  mode,
}: {
  onSend: (content: string) => void
  disabled: boolean
  mode: ConversationMode
}) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-grow the textarea up to a max height.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [value])

  const placeholder =
    mode === 'ASSESS'
      ? 'Describe the process you want to assess…'
      : mode === 'IDEATE'
        ? 'Describe the process you want to reimagine…'
        : mode === 'EXPLORE'
          ? 'Describe the process or domain you are exploring…'
          : 'Ask about agentic automation, or describe a process…'

  function submit() {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          rows={1}
          placeholder={placeholder}
          aria-label="Message the AI Advisor"
          className="max-h-40 flex-1 resize-none rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 shadow-sm outline-none transition focus:border-brand-blue disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
        />
        <button
          type="button"
          onClick={submit}
          disabled={disabled || value.trim().length === 0}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-brand-blue px-4 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {disabled ? '…' : 'Send'}
        </button>
      </div>
      <p className="mx-auto mt-1 max-w-3xl text-[11px] text-neutral-400">
        Press Enter to send · Shift+Enter for a new line
      </p>
    </div>
  )
}
