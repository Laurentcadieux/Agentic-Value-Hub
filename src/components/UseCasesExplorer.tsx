'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { UseCaseCard, type UseCaseCardData } from '@/components/UseCaseCard'

/**
 * Interactive use-case explorer: keyword + semantic search, faceted filters
 * and pagination, backed by /api/v1/use-cases. Shows an empty state when the
 * API is unavailable or returns no results.
 */

interface Facets {
  industries: string[]
  businessFunctions: string[]
  technologies: string[]
  agentPatterns: string[]
  automationPatterns: string[]
  complexities: string[]
  valueDrivers: string[]
}

interface SearchResult {
  items: UseCaseCardData[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  semantic: boolean
  scores?: number[]
  facets?: Facets
}

const EMPTY_FACETS: Facets = {
  industries: [],
  businessFunctions: [],
  technologies: [],
  agentPatterns: [],
  automationPatterns: [],
  complexities: [],
  valueDrivers: [],
}

interface Filters {
  industry: string
  businessFunction: string
  technology: string
  agentPattern: string
  automationPattern: string
  complexity: string
  valueDriver: string
}

const EMPTY_FILTERS: Filters = {
  industry: '',
  businessFunction: '',
  technology: '',
  agentPattern: '',
  automationPattern: '',
  complexity: '',
  valueDriver: '',
}

const EMPTY_RESULT: SearchResult = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 12,
  totalPages: 1,
  semantic: false,
  facets: EMPTY_FACETS,
}

const PAGE_SIZE = 12

export function UseCasesExplorer() {
  const [q, setQ] = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS)
  const [semantic, setSemantic] = useState(false)
  const [page, setPage] = useState(1)
  const [data, setData] = useState<SearchResult | null>(null)
  const [loading, setLoading] = useState(true)

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQ(q)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length + (debouncedQ ? 1 : 0),
    [filters, debouncedQ],
  )

  const buildUrl = useCallback(() => {
    const sp = new URLSearchParams()
    sp.set('page', String(page))
    sp.set('pageSize', String(PAGE_SIZE))
    sp.set('facets', 'true')
    if (debouncedQ) sp.set('q', debouncedQ)
    if (semantic && debouncedQ) sp.set('semantic', 'true')
    for (const [k, v] of Object.entries(filters)) {
      if (v) sp.set(k, v)
    }
    return `/api/v1/use-cases?${sp.toString()}`
  }, [debouncedQ, filters, page, semantic])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(buildUrl())
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return (await res.json()) as SearchResult
      })
      .then((result) => {
        if (!cancelled) {
          setData(result)
          setLoading(false)
        }
      })
      .catch(() => {
        // API unavailable — show empty state instead of demo data.
        if (!cancelled) {
          setData({ ...EMPTY_RESULT, page, pageSize: PAGE_SIZE })
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [buildUrl, filters, debouncedQ, page])

  const facets = data?.facets ?? EMPTY_FACETS
  const items = data?.items ?? []
  const totalPages = data?.totalPages ?? 1

  function updateFilter(key: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  function resetAll() {
    setQ('')
    setDebouncedQ('')
    setFilters(EMPTY_FILTERS)
    setSemantic(false)
    setPage(1)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Search + semantic toggle */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search use cases by keyword…"
            aria-label="Search use cases"
            className="w-full rounded border border-neutral-300 bg-white px-4 py-2.5 text-sm shadow-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
          <input
            type="checkbox"
            checked={semantic}
            onChange={(e) => setSemantic(e.target.checked)}
            className="h-4 w-4 rounded border-neutral-300 text-brand-blue focus:ring-brand-blue"
          />
          Semantic search
        </label>
      </div>

      {/* Filter row */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <FilterSelect label="Industry" value={filters.industry} options={facets.industries} onChange={(v) => updateFilter('industry', v)} />
        <FilterSelect label="Business function" value={filters.businessFunction} options={facets.businessFunctions} onChange={(v) => updateFilter('businessFunction', v)} />
        <FilterSelect label="Technology" value={filters.technology} options={facets.technologies} onChange={(v) => updateFilter('technology', v)} />
        <FilterSelect label="Agent pattern" value={filters.agentPattern} options={facets.agentPatterns} onChange={(v) => updateFilter('agentPattern', v)} />
        <FilterSelect label="Automation pattern" value={filters.automationPattern} options={facets.automationPatterns} onChange={(v) => updateFilter('automationPattern', v)} />
        <FilterSelect label="Complexity" value={filters.complexity} options={facets.complexities} onChange={(v) => updateFilter('complexity', v)} />
        <FilterSelect label="Value driver" value={filters.valueDriver} options={facets.valueDrivers} onChange={(v) => updateFilter('valueDriver', v)} />
        <button
          type="button"
          onClick={resetAll}
          disabled={activeFilterCount === 0}
          className="self-end rounded border border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Reset{activeFilterCount ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      {/* Results */}
      {loading ? (
        <p className="py-16 text-center text-sm text-neutral-500">Loading use cases…</p>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-neutral-500">No use cases match your search.</p>
          <button
            type="button"
            onClick={resetAll}
            className="mt-3 rounded bg-brand-red px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
            {data?.total ?? 0} use case{(data?.total ?? 0) === 1 ? '' : 's'}
            {data?.semantic ? ' · semantic ranking' : ''}
          </p>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((useCase) => (
              <UseCaseCard key={useCase.slug} useCase={useCase} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded border border-neutral-300 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-neutral-700"
              >
                Previous
              </button>
              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded border border-neutral-300 px-4 py-2 text-sm font-medium disabled:opacity-40 dark:border-neutral-700"
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: string[]
  onChange: (v: string) => void
}) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}
