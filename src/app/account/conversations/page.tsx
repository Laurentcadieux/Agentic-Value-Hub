import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listConversations } from '@/lib/repositories/conversation-repository'

/**
 * /account/conversations — the authenticated user's AI conversation history,
 * scoped to their customer (tenant) and narrowed to their own user id.
 * Connects to the existing Phase 4 conversation repository.
 */
export const dynamic = 'force-dynamic'

const TYPE_LABEL: Record<string, string> = {
  DISCOVERY: 'Discovery',
  REFINEMENT: 'Refinement',
  VALIDATION: 'Validation',
}

export default async function AccountConversationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const conversations = await listConversations(
    session.user.customerId,
    session.user.id,
    100,
  )

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-xl font-bold">Conversations</h2>
        <a
          href="/ask-ai"
          className="text-sm font-medium text-neutral-600 underline hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          Start a conversation →
        </a>
      </div>

      {conversations.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No conversations yet.{' '}
          <a href="/ask-ai" className="font-medium underline">
            Ask the AI advisor
          </a>{' '}
          to begin.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 dark:divide-neutral-800">
          {conversations.map((c) => (
            <li key={c.id} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">{c.title ?? 'Untitled conversation'}</h3>
                  {c.summary ? (
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                      {c.summary}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    {new Date(c.updatedAt).toLocaleString()}
                  </p>
                </div>
                <span className="inline-flex shrink-0 rounded-full border border-neutral-300 px-2.5 py-0.5 text-xs font-medium text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
                  {TYPE_LABEL[c.conversationType] ?? c.conversationType}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
