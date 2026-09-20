import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * Account area layout. Enforces a real (validated) session server-side —
 * middleware already gates on cookie presence, this re-verifies the JWT and
 * redirects to /login if invalid/expired. Renders the account sub-nav.
 */
export const dynamic = 'force-dynamic'

const NAV = [
  { href: '/account', label: 'Profile' },
  { href: '/account/ideas', label: 'My Ideas' },
  { href: '/account/conversations', label: 'Conversations' },
]

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/login?callbackUrl=/account')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="font-headline text-3xl font-bold">Account</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          {session.user.email}
        </p>
      </header>

      <nav className="mb-8 flex flex-wrap gap-x-8 gap-y-2 border-b border-neutral-200 dark:border-neutral-800">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="-mb-px border-b-2 border-transparent px-1 py-3 text-sm font-medium text-neutral-600 hover:border-neutral-900 hover:text-neutral-900 dark:text-neutral-400 dark:hover:border-neutral-100 dark:hover:text-neutral-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  )
}
