import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * GET /api/health
 * Liveness/readiness probe used by PM2, the load balancer, and Uptime Kuma.
 * Rate limited per IP so an exposed endpoint cannot be abused.
 *
 * Configurable via env (optional):
 *   RATE_LIMIT_HEALTH_PER_MIN — health endpoint ceiling per IP (default 60)
 */
const HEALTH_LIMIT = Number(process.env.RATE_LIMIT_HEALTH_PER_MIN ?? 60)
const WINDOW_MS = 60_000

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const result = rateLimit({
    key: `health:${ip}`,
    limit: HEALTH_LIMIT,
    windowMs: WINDOW_MS,
  })

  if (!result.success) {
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
    return NextResponse.json(
      { status: 'rate_limited' },
      {
        status: 429,
        headers: {
          'retry-after': String(retryAfter),
          'x-ratelimit-limit': String(result.limit),
          'x-ratelimit-remaining': '0',
          'x-ratelimit-reset': String(result.reset),
        },
      },
    )
  }

  return NextResponse.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    {
      headers: {
        'x-ratelimit-limit': String(result.limit),
        'x-ratelimit-remaining': String(result.remaining),
        'x-ratelimit-reset': String(result.reset),
      },
    },
  )
}
