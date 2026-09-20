import Link from 'next/link'
import { IdeaStatus } from '@prisma/client'
import { listAllIdeas } from '@/services/admin-service'

/**
 * Phase 7 — /admin/ideas
 * All ideas across customers, with search + status filter.
 */
export const dynamic = 'force-dynamic'

type SearchParams = Promise<{
  q?: string
  status?: string
  customerId?: string
}>

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: 'All', value: '' },
  ...Object.values(IdeaStatus).map((s) => ({ label: s, value: s })),
]

function statusClass(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
    case 'REJECTED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
    case 'ARCHIVED':
      return 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
    case 'UNDER_REVIEW':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
    case 'SUBMITTED':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
    default:
      return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default async function IdeasPage({ searchParams }: { searchParams: SearchParams }) {
  const { q, status, customerId } = await searchParams
  const search = q?.trim() ?? ''
  const { items, total } = await listAllIdeas({
    search: search || undefined,
    status: status || undefined,
    customerId: customerId || undefined,
    take: 100,
  })

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-headline text-xl font-bold">Ideas</h2>
        <p className="mt-1 font-sans text-sm text-neutral-500 dark:text-neutral-400">
          {total} idea{total === 1 ? '' : 's'}
          {search ? ` matching “${search}”` : ''}
          {status ? ` · ${status}` : ''}
        </p>
      </div>

      {/* Search + status filter */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <form className="flex items-center gap-2" role="search">
          <input
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search ideas…"
            className="rounded border border-neutral-300 bg-white px-3 py-1.5 font-sans text-sm text-neutral-900 focus:border-brand-red focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
          />
          <button
            type="submit"
            className="rounded border border-neutral-300 px-3 py-1.5 font-sans text-sm text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Search
          </button>
        </form>
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map((f) => {
            const params = new URLSearchParams()
            if (search) params.set('q', search)
            if (f.value) params.set('status', f.value)
            const href = `/admin/ideas${params.toString() ? `?${params.toString()}` : ''}`
            const active = (status ?? '') === f.value
            return (
              <Link
                key={f.value || 'all'}
                href={href}
                className={`rounded px-2.5 py-1 font-sans text-xs font-medium transition ${
                  active
                    ? 'bg-brand-red text-white'
                    : 'border border-neutral-300 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
              >
                {f.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 font-sans text-xs uppercase tracking-wider text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Score</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-neutral-500 dark:text-neutral-400">
                  No ideas found.
                </td>
              </tr>
            ) : (
              items.map((idea) => (
                <tr
                  key={idea.id}
                  className="bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/ideas/${idea.id}`}
                      className="font-medium text-neutral-900 hover:text-brand-red dark:text-neutral-100"
                    >
                      {idea.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {idea.customer ? (
                      <Link
                        href={`/admin/customers/${idea.customer.id}`}
                        className="text-neutral-600 hover:text-brand-red dark:text-neutral-300"
                      >
                        {idea.customer.companyName}
                      </Link>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {idea.user
                      ? [idea.user.firstName, idea.user.lastName].filter(Boolean).join(' ') ||
                        idea.user.email
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 font-sans text-xs font-medium ${statusClass(
                        idea.status,
                      )}`}
                    >
                      {idea.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-neutral-600 dark:text-neutral-300">
                    {idea.valueScore != null ? idea.valueScore.toFixed(1) : '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                    {formatDate(idea.createdAt.toISOString())}
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
