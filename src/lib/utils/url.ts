/**
 * Canonical URL normalization for news deduplication.
 *
 * Two articles that point at the same underlying page but differ only in
 * tracking parameters, "www." prefix, default port, trailing slash, fragment
 * or query-string order should normalize to the same canonical string so the
 * ingestion pipeline can detect URL-level duplicates.
 *
 * Pure, synchronous, side-effect free. Returns `null` for empty/blank input.
 * Falls back to a trimmed, slash-normalized string for non-absolute URLs.
 */

const TRACKING_PARAMS = new Set<string>([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'utm_name',
  'utm_referrer',
  'fbclid',
  'gclid',
  'gclsrc',
  'dclid',
  'msclkid',
  'mc_cid',
  'mc_eid',
  'ml_subscriber',
  'ml_subscriber_hash',
  'ref',
  'ref_src',
  'ref_url',
  'referrer',
  'source',
  '_ga',
  '_gl',
  'igshid',
  'yclid',
  'spm',
  'via',
  'oq',
  'spm',
  'wt_zmc',
  'hsCtaTracking',
])

/** Tracking-param families matched by prefix (covers the full utm_* namespace). */
const TRACKING_PREFIXES = ['utm_']

export function isTrackingParam(name: string): boolean {
  const lower = name.toLowerCase()
  if (TRACKING_PARAMS.has(lower)) return true
  return TRACKING_PREFIXES.some((prefix) => lower.startsWith(prefix))
}

function normalizePath(pathname: string): string {
  // Collapse runs of slashes to one.
  let path = pathname.replace(/\/{2,}/g, '/')
  // Strip a trailing slash unless the path is exactly "/".
  if (path.length > 1 && path.endsWith('/')) {
    path = path.replace(/\/+$/, '')
  }
  return path
}

/**
 * Normalize a URL to its canonical form.
 *
 * - lowercase host
 * - strip leading "www."
 * - strip default port (80 for http, 443 for https)
 * - drop the fragment
 * - remove tracking query params (utm_*, fbclid, ref, gclid, ...)
 * - re-emit remaining query params in sorted order (deterministic)
 * - collapse duplicate slashes and trim a trailing slash from the path
 */
export function normalizeCanonicalUrl(input: string | null | undefined): string | null {
  if (input == null) return null
  const trimmed = input.trim()
  if (trimmed === '') return null

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    // Not an absolute URL — return a best-effort trimmed, slash-normalized form.
    return normalizePath(trimmed) || null
  }

  // Host normalization.
  let host = url.hostname.toLowerCase()
  if (host.startsWith('www.')) {
    host = host.slice(4)
  }
  url.hostname = host

  // Strip default ports.
  if ((url.protocol === 'http:' && url.port === '80') ||
      (url.protocol === 'https:' && url.port === '443')) {
    url.port = ''
  }

  // Drop fragment.
  url.hash = ''

  // Strip tracking params, keep the rest in a stable (sorted) order.
  const kept: Array<[string, string]> = []
  url.searchParams.forEach((value, name) => {
    if (!isTrackingParam(name)) {
      kept.push([name, value])
    }
  })
  kept.sort((a, b) => {
    if (a[0] !== b[0]) return a[0].localeCompare(b[0])
    return a[1].localeCompare(b[1])
  })
  url.search = ''
  for (const [name, value] of kept) {
    url.searchParams.append(name, value)
  }

  // Path normalization.
  url.pathname = normalizePath(url.pathname)

  return url.toString()
}
