/**
 * Central site configuration used for SEO metadata, OpenGraph, sitemaps and
 * canonical URLs across the public website.
 */

export const siteConfig = {
  name: 'Agentic Value Hub',
  tagline: 'Turn AI agents into business value.',
  description:
    'Track what is happening in agentic automation. Discover enterprise use cases. Turn your own opportunities into quantified business cases.',
  url: 'https://agenticvaluehub.com',
  // Path-based OG image (placeholder for Phase 1).
  ogImage: '/og.png',
  twitter: '@agenticvaluehub',
  keywords: [
    'agentic AI',
    'AI agents',
    'enterprise automation',
    'business value',
    'use cases',
    'automation opportunities',
  ],
} as const

/** Build an absolute URL from a site-relative path. */
export function absoluteUrl(path: string): string {
  const root = siteConfig.url.replace(/\/$/, '')
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${root}${clean}`
}
