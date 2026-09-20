import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCustomerById } from '@/lib/repositories/customer-repository'
import { deleteCustomerAction, updateCustomerAction } from '../actions'
import { ConfirmButton } from '@/components/ConfirmButton'

/**
 * Phase 7 — /admin/customers/[id]
 * Customer detail, edit form, and delete action, plus related users/ideas.
 */
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default async function CustomerDetailPage({ params }: Params) {
  const { id } = await params
  const customer = await getCustomerById(id)
  if (!customer) notFound()

  const updateAction = updateCustomerAction.bind(null, customer.id)
  const deleteAction = deleteCustomerAction.bind(null, customer.id)

  return (
    <section>
      <nav aria-label="Breadcrumb" className="mb-4">
        <Link
          href="/admin/customers"
          className="font-sans text-xs font-medium text-neutral-500 hover:text-brand-red dark:text-neutral-400"
        >
          &larr; Customers
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Detail */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-headline text-xl font-bold">{customer.companyName}</h2>
          <dl className="mt-4 space-y-2 font-sans text-sm">
            <DetailRow label="Website" value={customer.website} href={customer.website} />
            <DetailRow label="Industry" value={customer.industry} />
            <DetailRow label="Employee range" value={customer.employeeRange} />
            <DetailRow label="Country" value={customer.country} />
            <DetailRow label="Created" value={formatDate(customer.createdAt.toISOString())} />
            <DetailRow label="Updated" value={formatDate(customer.updatedAt.toISOString())} />
          </dl>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Users" value={customer.users.length} />
            <Stat label="Ideas" value={customer.ideas.length} />
            <Stat label="Use cases" value={customer._count.useCases} />
            <Stat label="News" value={customer._count.news} />
          </div>
        </div>

        {/* Edit + delete */}
        <div className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-4 font-headline text-lg font-bold">Edit customer</h3>
          <form action={updateAction} className="space-y-4">
            <FormField
              label="Company name"
              name="companyName"
              defaultValue={customer.companyName}
              required
            />
            <FormField
              label="Website"
              name="website"
              defaultValue={customer.website ?? ''}
              placeholder="https://example.com"
            />
            <FormField label="Industry" name="industry" defaultValue={customer.industry ?? ''} />
            <FormField
              label="Employee range"
              name="employeeRange"
              defaultValue={customer.employeeRange ?? ''}
              placeholder="1,000-5,000"
            />
            <FormField label="Country" name="country" defaultValue={customer.country ?? ''} />
            <button
              type="submit"
              className="rounded bg-brand-red px-4 py-2 font-sans text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Save changes
            </button>
          </form>

          <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <h3 className="mb-2 font-headline text-base font-bold text-red-600 dark:text-red-400">
              Danger zone
            </h3>
            <p className="mb-3 font-sans text-xs text-neutral-500 dark:text-neutral-400">
              Deleting a customer cascades to its users, ideas, and
              conversations. This cannot be undone.
            </p>
            <form action={deleteAction}>
              <ConfirmButton
                label={`Delete ${customer.companyName}`}
                confirm={`Delete customer "${customer.companyName}"? This permanently removes related users, ideas, and conversations.`}
                className="rounded border border-red-300 bg-red-50 px-4 py-2 font-sans text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              />
            </form>
          </div>
        </div>
      </div>

      {/* Related users */}
      <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-4 font-headline text-lg font-bold">Users ({customer.users.length})</h3>
        {customer.users.length === 0 ? (
          <p className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
            No users for this customer.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 font-sans text-sm dark:divide-neutral-800">
            {customer.users.map((u) => (
              <li key={u.id} className="flex items-center justify-between py-2">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {u.email}
                </span>
                <span className="text-neutral-500 dark:text-neutral-400">
                  {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                  {' · '}
                  {u.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Related ideas */}
      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-4 font-headline text-lg font-bold">
          Ideas ({customer.ideas.length})
        </h3>
        {customer.ideas.length === 0 ? (
          <p className="font-sans text-sm text-neutral-500 dark:text-neutral-400">
            No ideas for this customer.
          </p>
        ) : (
          <ul className="divide-y divide-neutral-200 font-sans text-sm dark:divide-neutral-800">
            {customer.ideas.map((idea) => (
              <li key={idea.id} className="flex items-center justify-between py-2">
                <Link
                  href={`/admin/ideas/${idea.id}`}
                  className="font-medium text-neutral-900 hover:text-brand-red dark:text-neutral-100"
                >
                  {idea.title}
                </Link>
                <span className="text-neutral-500 dark:text-neutral-400">
                  {idea.status}
                  {idea.valueScore != null ? ` · score ${idea.valueScore.toFixed(1)}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function DetailRow({
  label,
  value,
  href,
}: {
  label: string
  value: string | null
  href?: string | null
}) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="text-right text-neutral-900 dark:text-neutral-100">
        {value ? (
          href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-blue hover:underline"
            >
              {value}
            </a>
          ) : (
            value
          )
        ) : (
          '—'
        )}
      </dd>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-center dark:border-neutral-800 dark:bg-neutral-950">
      <div className="font-headline text-xl font-bold">{value}</div>
      <div className="font-sans text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </div>
    </div>
  )
}

function FormField({
  label,
  name,
  defaultValue,
  required,
  placeholder,
}: {
  label: string
  name: string
  defaultValue?: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-sans text-xs font-medium text-neutral-600 dark:text-neutral-400">
        {label}
        {required ? <span className="text-brand-red"> *</span> : null}
      </span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded border border-neutral-300 bg-white px-3 py-2 font-sans text-sm text-neutral-900 focus:border-brand-red focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
      />
    </label>
  )
}
