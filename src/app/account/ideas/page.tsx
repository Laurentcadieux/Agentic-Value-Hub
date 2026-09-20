import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listIdeasByCustomer } from '@/services/idea-service'

/**
 * /account/ideas — the authenticated user's ideas, scoped to their customer
 * (tenant). Connects to the existing Phase 5 idea service.
 */
export const dynamic = 'force-dynamic'

const STATUS_TONE: Record<string, string> = {
  DRAFT: 'border-neutral-300 bg-neutral-50 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400',
  SUBMITTED:
    'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300',
  UNDER_REVIEW:
    'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200',
  APPROVED:
    'border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-950 dark:text-green-200',
  REJECTED:
    'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950 dark:text-red-300',
  ARCHIVED:
    'border-neutral-300 bg-neutral-50 text-neutral-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-500',
}

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function AccountIdeasPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.customerId) return null

  const ideas = await listIdeasByCustomer(session.user.customerId)

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-headline text-xl font-bold">My Ideas</h2>
        <Link
          href="/idea-lab"
          className="text-sm font-medium text-neutral-600 underline hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          New idea →
        </Link>
      </div>

      {ideas.length === 0 ? (
        <p className="mt-6 rounded-md border border-dashed border-neutral-300 p-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No ideas yet. Start one in the{' '}
          <Link href="/idea-lab" className="font-medium underline">
            Idea Lab
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-neutral-200 dark:divide-neutral-800">
          {ideas.map((idea) => (
            <li key={idea.id} className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-medium">{idea.title}</h3>
                  <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    Updated {new Date(idea.updatedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_TONE[idea.status] ?? STATUS_TONE.DRAFT
                    }`}
                  >
                    {idea.status.replace(/_/g, ' ').toLowerCase()}
                  </span>
                  <span className="text-sm font-semibold">
                    {formatCurrency(idea.valueScore)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
