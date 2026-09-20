import type { NextConfig } from 'next'

/**
 * Security headers applied to every route. These are reinforced at the edge
 * by deploy/avh-nginx.conf.
 *
 * The Content-Security-Policy allows 'unsafe-inline' for scripts and styles
 * because Next.js emits inline runtime chunks and the theme-init script in
 * src/app/layout.tsx. To go stricter, move to a nonce-based CSP generated in
 * middleware and drop 'unsafe-inline' from script-src — see docs/SECURITY.md
 * for the upgrade path.
 */
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'off' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // 'unsafe-inline' required for Next.js inline runtime + theme script.
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
]

// Phase 1: typedRoutes disabled for build stability across the many dynamic
// [slug] links in the public website. Phase 0 deps and schema are untouched.
// Phase 8: standalone output (containerized deployment) + security headers.
const nextConfig: NextConfig = {
  output: 'standalone',
  // Do not advertise the framework.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
