import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getIdea } from '@/services/idea-service'
import { OpportunityCardView } from '@/components/idea/OpportunityCard'
import { ValueSummary } from '@/components/idea/ValueSummary'

export const dynamic = 'force-dynamic'

const dateFmt = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

/**
 * /account/ideas/[id] — idea detail with its opportunity card and value
 * assessment. Placeholder auth until Phase 6.
 */
export default async function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let result: Awaited<ReturnType<typeof getIdea>>
  try {
    result = await getIdea(id)
  } catch (err) {
    console.error('account.idea detail error', err)
    return (
      <section>
        <p className="rounded border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          Could not reach the database to load this idea.
        </p>
      </section>
    )
  }

  if (!result) {
    notFound()
  }

  const { record, opportunityCard, valueResult } = result

  return (
    <section className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm">
        <Link
          href="/account/ideas"
          className="font-sans text-xs font-medium text-neutral-500 hover:text-brand-red dark:text-neutral-400"
        >
          &larr; My Ideas
        </Link>
      </nav>

      <header className="border-b border-neutral-200 pb-4 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-neutral-100 px-2 py-0.5 font-sans text-xs font-bold uppercase tracking-wider text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            {record.status}
          </span>
          <span className="font-sans text-xs text-neutral-500 dark:text-neutral-400">
            Updated {dateFmt.format(record.updatedAt)}
          </span>
        </div>
        <h2 className="mt-2 font-headline text-3xl font-bold leading-tight">{record.title}</h2>
        <p className="mt-1 font-sans text-xs text-neutral-500 dark:text-neutral-400">
          Idea ID: <span className="font-mono">{record.id}</span>
        </p>
      </header>

      {opportunityCard ? (
        <OpportunityCardView card={opportunityCard} />
      ) : (
        <p className="rounded border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          This idea has no structured opportunity card yet.
        </p>
      )}

      {valueResult ? <ValueSummary result={valueResult} /> : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/idea-lab"
          className="rounded border border-neutral-900 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white dark:border-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
        >
          New idea
        </Link>
      </div>
    </section>
  )
}