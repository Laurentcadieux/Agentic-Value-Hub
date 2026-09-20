import Link from 'next/link'
import { getDashboardStats } from '@/services/admin-service'

/**
 * Phase 7 — /admin
 * Admin dashboard: aggregate entity stats + recent ingestion events.
 */
export const dynamic = 'force-dynamic'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function statusClass(status: string): string {
  const s = status.toLowerCase()
  if (s === 'success' || s === 'ok' || s === 'published')
    return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
  if (s === 'error' || s === 'failed' || s === 'failure')
    return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
  return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats()

  const cards = [
    { label: 'News', value: stats.newsCount, href: '/admin/news' },
    { label: 'Use cases', value: stats.useCaseCount, href: '/admin/use-cases' },
    { label: 'Ideas', value: stats.ideaCount, href: '/admin/ideas' },
    { label: 'Users', value: stats.userCount, href: '/admin/customers' },
    { label: 'Customers', value: stats.customerCount, href: '/admin/customers' },
    { label: 'Conversations', value: stats.conversationCount, href: '/admin/ideas' },
    {
      label: 'Ingestion events',
      value: stats.ingestionEventCount,
      href: '/admin/ingestion',
    },
  ]

  return (
    <section>
      <h2 className="mb-6 font-headline text-xl font-bold">Dashboard</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-brand-red hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="font-headline text-3xl font-bold tabular-nums">
              {c.value}
            </div>
            <div className="mt-1 font-sans text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {c.label}
            </div>
          </Link>
        ))}
      </div>

      {/* Recent ingestion events */}
      <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-headline text-lg font-bold">Recent ingestion events</h3>
          <Link
            href="/admin/ingestion"
            className="font-sans text-xs font-medium text-brand-blue hover:underline"
          >
            View all &rarr;
          </Link>
        </div>
        {stats.recentIngestionEvents.length === 0 ? (
          <p className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
            No ingestion events recorded yet.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 font-sans text-sm dark:divide-neutral-800">
            {stats.recentIngestionEvents.map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${statusClass(
                      e.status,
                    )}`}
                  >
                    {e.status}
                  </span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {e.source}
                  </span>
                  {e.errorMessage ? (
                    <span className="text-xs text-red-600 dark:text-red-400">
                      {e.errorMessage}
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {formatDate(e.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quick links */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <QuickLink href="/admin/customers" label="Customers" />
        <QuickLink href="/admin/ideas" label="Ideas" />
        <QuickLink href="/admin/taxonomy" label="Taxonomy" />
        <QuickLink href="/admin/ingestion" label="Ingestion" />
        <QuickLink href="/admin/news" label="News" />
        <QuickLink href="/admin/use-cases" label="Use cases" />
      </div>
    </section>
  )
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-neutral-200 px-4 py-3 text-center font-sans text-sm font-medium text-neutral-700 transition hover:border-brand-red hover:text-brand-red dark:border-neutral-800 dark:text-neutral-300"
    >
      {label}
    </Link>
  )
}
