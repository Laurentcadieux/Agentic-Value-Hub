/**
 * rate-limit.ts — lightweight in-memory rate limiter for API routes and
 * middleware. Uses a sliding-window log per key (typically a client IP).
 *
 * Single-process assumption: in-memory state lives in the Node.js / Edge
 * process that imports this module. With one Next.js standalone server
 * (PM2 fork mode, single instance, or a single container) this is
 * sufficient and correct. For horizontal scaling, replace the `buckets`
 * Map with a shared store (Redis, Upstash) using the same function
 * signature — see docs/SECURITY.md.
 */

interface RateLimitOptions {
  /** Bucket key, usually `<route>:<client-ip>`. */
  key: string
  /** Maximum number of requests allowed within the window. */
  limit: number
  /** Window size in milliseconds. */
  windowMs: number
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  /** Epoch milliseconds when the window resets for this key. */
  reset: number
}

/** Per-key list of request timestamps inside the active window. */
const buckets = new Map<string, number[]>()

/**
 * Prune expired buckets so the Map cannot grow unbounded under abuse.
 * Anything older than the prune horizon (10 min, covers any reasonable
 * window) is discarded. Runs at most once per minute.
 */
const PRUNE_INTERVAL_MS = 60_000
const PRUNE_HORIZON_MS = 10 * 60_000
let lastPrune = 0

function prune(now: number): void {
  if (now - lastPrune < PRUNE_INTERVAL_MS) return
  lastPrune = now
  const cutoff = now - PRUNE_HORIZON_MS
  for (const [key, timestamps] of buckets) {
    const recent = timestamps.filter((t) => t > cutoff)
    if (recent.length === 0) {
      buckets.delete(key)
    } else {
      buckets.set(key, recent)
    }
  }
}

/**
 * Apply a sliding-window rate limit. Returns whether the request is
 * allowed plus standard `X-RateLimit-*` metadata for response headers.
 */
export function rateLimit({
  key,
  limit,
  windowMs,
}: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  prune(now)

  const windowStart = now - windowMs
  const existing = buckets.get(key) ?? []
  const recent = existing.filter((t) => t > windowStart)

  if (recent.length >= limit) {
    // Reject: the oldest hit in the window determines the reset time.
    const reset = recent[0] + windowMs
    buckets.set(key, recent)
    return { success: false, limit, remaining: 0, reset }
  }

  recent.push(now)
  buckets.set(key, recent)
  return {
    success: true,
    limit,
    remaining: Math.max(0, limit - recent.length),
    reset: now + windowMs,
  }
}

/**
 * Extract the client IP from a Request-like object, preferring the first
 * `X-Forwarded-For` entry (set by Nginx in production). Falls back to
 * `X-Real-IP` and then to a sentinel so the limiter still functions
 * behind a misconfigured or missing proxy header.
 */
export function getClientIp(request: { headers: Headers }): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return 'unknown'
}
