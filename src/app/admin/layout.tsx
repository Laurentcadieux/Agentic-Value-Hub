import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * Phase 7 — Admin layout.
 *
 * Wraps every /admin/* route with:
 *  - role-based authorization (see src/lib/admin-auth.ts)
 *  - a shared admin sidebar
 *  - a development-mode banner when admin auth is disabled
 *
 * Force-dynamic: admin pages query the database and must never be statically
 * rendered at build time (no DB connection is available during `next build`).
 */
export const dynamic = 'force-dynamic'

const adminNav = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/news', label: 'News' },
  { href: '/admin/use-cases', label: 'Use Cases' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/ideas', label: 'Ideas' },
  { href: '/admin/taxonomy', label: 'Taxonomy' },
  { href: '/admin/ingestion', label: 'Ingestion' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ctx = await requireAdmin()

  if (!ctx.authorized) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-red-300 bg-red-50 p-6 text-center dark:border-red-900 dark:bg-red-950/40">
          <h1 className="font-headline text-2xl font-bold text-red-700 dark:text-red-300">
            Access denied
          </h1>
          <p className="mt-3 text-sm text-red-700 dark:text-red-300">
            {ctx.reason ??
              'Admin authorization is required to view this page.'}
          </p>
          <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-400">
            Provide a Bearer token or <code>admin_token</code> cookie matching
            the <code>ADMIN_API_KEY</code> environment variable.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900"
          >
            Back to site
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            Administration
          </p>
          <h1 className="font-headline text-2xl font-bold">Admin Console</h1>
        </div>
        <Link
          href="/"
          className="font-sans text-xs font-medium text-neutral-500 hover:text-brand-red dark:text-neutral-400"
        >
          &larr; View public site
        </Link>
      </div>

      {ctx.devMode ? (
        <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          <strong className="font-semibold">Development mode:</strong>{' '}
          admin authorization is disabled because <code>ADMIN_API_KEY</code> is
          not set. Configure it to enforce role-based access.
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[200px_1fr]">
        <nav
          aria-label="Admin sections"
          className="rounded-lg border border-neutral-200 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-900"
        >
          <ul className="space-y-1">
            {adminNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded px-3 py-2 font-sans text-sm font-medium text-neutral-700 transition hover:bg-neutral-200 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  )
}
