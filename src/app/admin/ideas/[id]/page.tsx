import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getIdeaById } from '@/services/admin-service'

/**
 * Phase 7 — /admin/ideas/[id]
 * Idea detail: full description, value score, status, customer/owner links,
 * and related conversations.
 */
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default async function IdeaDetailPage({ params }: Params) {
  const { id } = await params
  const idea = await getIdeaById(id)
  if (!idea) notFound()

  return (
    <section>
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link
          href="/admin/ideas"
          className="font-sans text-xs font-medium text-neutral-500 hover:text-brand-red dark:text-neutral-400"
        >
          &larr; Ideas
        </Link>
      </nav>

      <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2 className="font-headline text-2xl font-bold">{idea.title}</h2>
          <span className="inline-block rounded bg-neutral-100 px-2.5 py-1 font-sans text-xs font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
            {idea.status}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 font-sans text-sm sm:grid-cols-2">
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">Customer</dt>
            <dd className="text-neutral-900 dark:text-neutral-100">
              {idea.customer ? (
                <Link
                  href={`/admin/customers/${idea.customer.id}`}
                  className="hover:text-brand-red"
                >
                  {idea.customer.companyName}
                </Link>
              ) : (
                '—'
              )}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">Owner</dt>
            <dd className="text-neutral-900 dark:text-neutral-100">
              {idea.user
                ? [idea.user.firstName, idea.user.lastName].filter(Boolean).join(' ') ||
                  idea.user.email
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">Value score</dt>
            <dd className="text-neutral-900 dark:text-neutral-100">
              {idea.valueScore != null ? idea.valueScore.toFixed(1) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-neutral-500 dark:text-neutral-400">Created</dt>
            <dd className="text-neutral-900 dark:text-neutral-100">
              {formatDate(idea.createdAt.toISOString())}
            </dd>
          </div>
        </dl>

        {idea.description ? (
          <div className="mt-6">
            <h3 className="font-headline text-base font-bold">Description</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-neutral-700 dark:text-neutral-300">
              {idea.description}
            </p>
          </div>
        ) : null}
      </div>

      {/* Related conversations */}
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-4 font-headline text-lg font-bold">
          Conversations ({idea.conversations.length})
        </h3>
        {idea.conversations.length === 0 ? (
          <p className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
            No conversations linked to this idea.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 font-sans text-sm dark:divide-neutral-800">
            {idea.conversations.map((c) => (
              <li key={c.id} className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {c.title ?? 'Untitled conversation'}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {c.conversationType} · {formatDate(c.createdAt.toISOString())}
                  </span>
                </div>
                {c.summary ? (
                  <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    {c.summary}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
