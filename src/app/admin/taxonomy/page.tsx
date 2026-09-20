import Link from 'next/link'
import { getTaxonomyOverview, type TaxonomyBucket } from '@/services/admin-service'

/**
 * Phase 7 — /admin/taxonomy
 *
 * The taxonomy (industries, business functions, technologies, categories) is
 * stored as string arrays on News and as scalar/array fields on UseCase —
 * there is no dedicated taxonomy table. This page aggregates the distinct
 * values in use across both entities, with per-source counts, giving admins
 * a single overview to spot gaps, typos, and dominant topics.
 */
export const dynamic = 'force-dynamic'

export default async function TaxonomyPage() {
  const overview = await getTaxonomyOverview()

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-headline text-xl font-bold">Taxonomy</h2>
        <p className="mt-1 font-sans text-sm text-neutral-500 dark:text-neutral-400">
          Distinct industries, functions, technologies, and categories in use
          across news and use cases.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TaxonomyPanel title="Industries" buckets={overview.industries} />
        <TaxonomyPanel title="Business functions" buckets={overview.businessFunctions} />
        <TaxonomyPanel title="Technologies" buckets={overview.technologies} />
        <TaxonomyPanel title="Categories" buckets={overview.categories} />
      </div>

      <p className="mt-8 font-sans text-xs text-neutral-500 dark:text-neutral-400">
        Counts are derived from existing News and UseCase records. To add or
        rename a taxonomy value, update the underlying news or use-case
        records.{' '}
        <Link href="/admin/news" className="text-brand-blue hover:underline">
          Manage news
        </Link>{' '}
        ·{' '}
        <Link href="/admin/use-cases" className="text-brand-blue hover:underline">
          Manage use cases
        </Link>
      </p>
    </section>
  )
}

function TaxonomyPanel({
  title,
  buckets,
}: {
  title: string
  buckets: TaxonomyBucket[]
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-headline text-lg font-bold">{title}</h3>
        <span className="font-sans text-xs text-neutral-500 dark:text-neutral-400">
          {buckets.length} distinct value{buckets.length === 1 ? '' : 's'}
        </span>
      </div>
      {buckets.length === 0 ? (
        <p className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
          No values recorded yet.
        </p>
      ) : (
        <ul className="divide-y divide-neutral-200 font-sans text-sm dark:divide-neutral-800">
          {buckets.slice(0, 50).map((b) => (
            <li key={b.value} className="flex items-center justify-between py-2">
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                {b.value}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                <span className="tabular-nums">{b.newsCount}</span> news ·{' '}
                <span className="tabular-nums">{b.useCaseCount}</span> use cases ·{' '}
                <span className="tabular-nums font-semibold text-neutral-700 dark:text-neutral-300">
                  {b.total}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
