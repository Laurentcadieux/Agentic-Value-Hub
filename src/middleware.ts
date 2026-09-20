import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

/**
 * Middleware — two concerns:
 *
 *   1. Auth gate for /account and /admin pages: require a NextAuth session
 *      cookie to be present. This is a coarse first-line check only — the
 *      cookie is NOT verified here, because middleware runs in the Edge
 *      runtime and must not pull Prisma or the node-only auth modules into
 *      its bundle. Real session validation happens server-side in the
 *      protected pages and API routes via getServerSession.
 *
 *   2. Coarse per-IP rate limiting for every /api route (defense in depth;
 *      individual route handlers apply their own stricter limits). Because
 *      middleware runs in the Edge runtime and route handlers run in the Node
 *      runtime, the two counters are independent. For multi-instance
 *      deployments, both should share an external store — see docs/SECURITY.md.
 *
 * Configurable via env (optional):
 *   RATE_LIMIT_GLOBAL_PER_MIN — global /api ceiling per IP (default 120)
 */

const GLOBAL_LIMIT = Number(process.env.RATE_LIMIT_GLOBAL_PER_MIN ?? 120)
const WINDOW_MS = 60_000

/** NextAuth JWT session cookie names (dev + secure-production variants). */
const SESSION_COOKIES = [
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
]

function hasSessionCookie(request: NextRequest): boolean {
  return SESSION_COOKIES.some((name) => {
    const value = request.cookies.get(name)?.value
    return typeof value === 'string' && value.length > 0
  })
}

function isProtectedPage(pathname: string): boolean {
  return (
    pathname === '/account' ||
    pathname.startsWith('/account/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/')
  )
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Auth gate for account/admin pages ---
  if (isProtectedPage(pathname)) {
    if (!hasSessionCookie(request)) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', request.url)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // --- Rate limiting for API routes only ---
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const ip = getClientIp(request)
  const result = rateLimit({
    key: `api:${ip}`,
    limit: GLOBAL_LIMIT,
    windowMs: WINDOW_MS,
  })

  if (!result.success) {
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
    return NextResponse.json(
      { error: 'Too Many Requests' },
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

  // Forward request and annotate the response with rate-limit headers.
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-ratelimit-limit', String(result.limit))
  requestHeaders.set('x-ratelimit-remaining', String(result.remaining))
  requestHeaders.set('x-ratelimit-reset', String(result.reset))

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('x-ratelimit-limit', String(result.limit))
  response.headers.set('x-ratelimit-remaining', String(result.remaining))
  response.headers.set('x-ratelimit-reset', String(result.reset))
  return response
}

export const config = {
  // Run middleware for API routes (rate limiting) and the protected page
  // areas (auth gate). All other page loads are unaffected.
  matcher: ['/api/:path*', '/account/:path*', '/admin/:path*'],
}
