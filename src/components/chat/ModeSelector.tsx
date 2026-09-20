'use client'

import { MODES } from '@/lib/ai/prompts'
import type { ConversationMode } from '@/lib/ai/state-machine'

/**
 * ModeSelector — the four LEARN / EXPLORE / IDEATE / ASSESS tabs.
 * Selecting a mode frames the next conversation; the active conversation keeps
 * its own mode. The selected mode's description is shown beneath the tabs.
 */
export function ModeSelector({
  mode,
  onChange,
  disabled,
}: {
  mode: ConversationMode
  onChange: (mode: ConversationMode) => void
  disabled?: boolean
}) {
  const active = MODES.find((m) => m.id === mode) ?? MODES[0]

  return (
    <div className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div
        role="tablist"
        aria-label="Advisor mode"
        className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-3 pt-3"
      >
        {MODES.map((m) => {
          const isActive = m.id === mode
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={disabled}
              onClick={() => onChange(m.id)}
              className={`shrink-0 rounded-t-lg border-b-2 px-3 py-2 text-sm font-medium transition disabled:opacity-50 ${
                isActive
                  ? 'border-brand-blue text-brand-blue'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
              }`}
            >
              {m.label}
            </button>
          )
        })}
      </div>
      <p className="mx-auto max-w-3xl px-3 pb-2 text-xs text-neutral-500 dark:text-neutral-400">
        {active.description}
      </p>
    </div>
  )
}
