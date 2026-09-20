import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { findCustomerById } from '@/lib/repositories/user-repository'

/**
 * /account — profile overview: identity, tenant and role.
 */
export const dynamic = 'force-dynamic'

function RoleBadge({ role }: { role: string }) {
  const label = role === 'ADMIN' ? 'Admin' : role === 'VIEWER' ? 'Viewer' : 'Member'
  const tone =
    role === 'ADMIN'
      ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200'
      : 'border-neutral-300 bg-neutral-50 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300'
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone}`}>
      {label}
    </span>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-neutral-200 py-4 sm:grid-cols-3 dark:border-neutral-800">
      <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="sm:col-span-2">{value}</dd>
    </div>
  )
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null

  const customer = await findCustomerById(session.user.customerId)

  return (
    <section>
      <h2 className="font-headline text-xl font-bold">Profile</h2>
      <dl className="mt-4">
        <Row label="Name" value={session.user.name || '—'} />
        <Row label="Email" value={session.user.email} />
        <Row label="Role" value={<RoleBadge role={session.user.role} />} />
        <Row label="Company" value={customer?.companyName ?? '—'} />
        <Row
          label="Customer ID"
          value={<code className="text-xs text-neutral-500">{session.user.customerId}</code>}
        />
      </dl>
    </section>
  )
}
