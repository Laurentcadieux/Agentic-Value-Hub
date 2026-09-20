import { getIngestionEvents, type IngestionEventItem } from '@/services/admin-service'

/**
 * Phase 7 — /admin/ingestion
 * Ingestion event log, filterable by source and status.
 */
export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ source?: string; status?: string; skip?: string }>

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
  if (s === 'skipped' || s === 'duplicate')
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
  return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
}

function summarizePayload(payload: IngestionEventItem['payloadMetadata']): string {
  if (payload == null) return '—'
  try {
    return JSON.stringify(payload)
  } catch {
    return '—'
  }
}

export default async function IngestionPage({ searchParams }: { searchParams: SearchParams }) {
  const { source, status, skip } = await searchParams
  const skipNum = Number(skip ?? '0')
  const safeSkip = Number.isFinite(skipNum) && skipNum > 0 ? Math.floor(skipNum) : 0
  const take = 25

  const { items, total } = await getIngestionEvents({
    skip: safeSkip,
    take,
    source: source || undefined,
    status: status || undefined,
  })

  const hasPrev = safeSkip > 0
  const hasNext = safeSkip + take < total

  function pageHref(direction: 'prev' | 'next'): string {
    const params = new URLSearchParams()
    if (source) params.set('source', source)
    if (status) params.set('status', status)
    const nextSkip = direction === 'prev' ? Math.max(0, safeSkip - take) : safeSkip + take
    params.set('skip', String(nextSkip))
    return `/admin/ingestion?${params.toString()}`
  }

  return (
    <section>
      <div className="mb-6">
        <h2 className="font-headline text-xl font-bold">Ingestion</h2>
        <p className="mt-1 font-sans text-sm text-neutral-500 dark:text-neutral-400">
          {total} ingestion event{total === 1 ? '' : 's'} recorded.
        </p>
      </div>

      {/* Filters */}
      <form className="mb-6 flex flex-wrap items-center gap-2" role="search">
        <input
          type="search"
          name="source"
          defaultValue={source ?? ''}
          placeholder="Filter by source…"
          className="rounded border border-neutral-300 bg-white px-3 py-1.5 font-sans text-sm text-neutral-900 focus:border-brand-red focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="rounded border border-neutral-300 bg-white px-3 py-1.5 font-sans text-sm text-neutral-900 focus:border-brand-red focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
        >
          <option value="">All statuses</option>
          <option value="success">success</option>
          <option value="error">error</option>
          <option value="skipped">skipped</option>
          <option value="duplicate">duplicate</option>
        </select>
        <button
          type="submit"
          className="rounded border border-neutral-300 px-3 py-1.5 font-sans text-sm text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Filter
        </button>
      </form>

      {/* List */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 font-sans text-xs uppercase tracking-wider text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Request ID</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-neutral-500 dark:text-neutral-400">
                  No ingestion events found.
                </td>
              </tr>
            ) : (
              items.map((e) => (
                <tr
                  key={e.id}
                  className="align-top bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                >
                  <td className="px-4 py-3 font-medium text-neutral-900 dark:text-neutral-100">
                    {e.source}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 font-sans text-xs font-medium ${statusClass(
                        e.status,
                      )}`}
                    >
                      {e.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500 dark:text-neutral-400">
                    {e.requestId ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                    {formatDate(e.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    {e.errorMessage ? (
                      <span className="font-sans text-xs text-red-600 dark:text-red-400">
                        {e.errorMessage}
                      </span>
                    ) : (
                      <details className="font-sans text-xs text-neutral-500 dark:text-neutral-400">
                        <summary className="cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-200">
                          View payload
                        </summary>
                        <pre className="mt-1 max-w-md overflow-x-auto whitespace-pre-wrap break-words">
                          {summarizePayload(e.payloadMetadata)}
                        </pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(hasPrev || hasNext) && (
        <div className="mt-4 flex items-center justify-between font-sans text-sm">
          {hasPrev ? (
            <a
              href={pageHref('prev')}
              className="rounded border border-neutral-300 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              &larr; Previous
            </a>
          ) : (
            <span />
          )}
          <span className="text-neutral-500 dark:text-neutral-400">
            {safeSkip + 1}–{Math.min(safeSkip + take, total)} of {total}
          </span>
          {hasNext ? (
            <a
              href={pageHref('next')}
              className="rounded border border-neutral-300 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
            >
              Next &rarr;
            </a>
          ) : (
            <span />
          )}
        </div>
      )}
    </section>
  )
}
