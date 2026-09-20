import { getStage, type ConversationStage } from '@/lib/ai/state-machine'
import type { ChatMessage } from './types'

/**
 * ChatMessage — a single message bubble in the Advisor conversation.
 * Assistant messages render left-aligned with stage/progress metadata badges;
 * user messages render right-aligned.
 */
export function ChatMessage({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'USER'
  const meta = message.metadata
  const stageDef = meta?.stage ? getStage(meta.stage as ConversationStage) : null
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`flex max-w-[85%] flex-col gap-1 rounded-lg px-4 py-3 text-sm leading-relaxed sm:max-w-[75%] ${
          isUser
            ? 'bg-brand-blue text-white'
            : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
        }`}
      >
        {!isUser ? (
          <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wide opacity-70">
            <span>Advisor</span>
            {stageDef ? (
              <span className="rounded bg-black/10 px-1.5 py-0.5 dark:bg-white/10">
                {`Stage ${meta?.progress?.current ?? ''}/${meta?.progress?.total ?? ''} · ${stageDef.label}`}
              </span>
            ) : null}
            {meta?.demoMode ? (
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-amber-700 dark:text-amber-300">
                Demo mode
              </span>
            ) : null}
            {meta?.opportunityCardReady ? (
              <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-300">
                Opportunity card
              </span>
            ) : null}
            {meta?.savedIdeaId ? (
              <span className="rounded bg-brand-red/20 px-1.5 py-0.5 text-brand-red">
                Saved to Idea Lab
              </span>
            ) : null}
          </div>
        ) : null}
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div className={`text-right text-[10px] opacity-50`}>{time}</div>
      </div>
    </div>
  )
}
