import Link from 'next/link'
import { listNewsForAdmin } from '@/services/admin-service'

/**
 * Phase 7 — /admin/news
 * News management list (status, source, customer, ingestion time).
 */
export const dynamic = 'force-dynamic'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function statusClass(status: string): string {
  switch (status) {
    case 'PUBLISHED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
    case 'ARCHIVED':
      return 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
    default:
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
  }
}

export default async function AdminNewsPage() {
  const { items, total } = await listNewsForAdmin(0, 100)

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-headline text-xl font-bold">News</h2>
        <p className="mt-1 font-sans text-sm text-neutral-500 dark:text-neutral-400">
          {total} news item{total === 1 ? '' : 's'}.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 font-sans text-xs uppercase tracking-wider text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3">Headline</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Ingested</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-neutral-500 dark:text-neutral-400">
                  No news items yet.
                </td>
              </tr>
            ) : (
              items.map((n) => (
                <tr
                  key={n.id}
                  className="bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/news/${n.slug}`}
                      className="font-medium text-neutral-900 hover:text-brand-red dark:text-neutral-100"
                    >
                      {n.headline}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {n.sourceName ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 font-sans text-xs font-medium ${statusClass(
                        n.status,
                      )}`}
                    >
                      {n.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {n.customer ? n.customer.companyName : '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                    {formatDate(n.ingestedAt.toISOString())}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
