import Link from 'next/link'
import { listCustomers } from '@/lib/repositories/customer-repository'
import { createCustomerAction } from './actions'

/**
 * Phase 7 — /admin/customers
 * Customer list with search + inline create form.
 */
export const dynamic = 'force-dynamic'

type SearchParams = { searchParams: Promise<{ q?: string }> }

export default async function CustomersPage({ searchParams }: SearchParams) {
  const { q } = await searchParams
  const search = q?.trim() ?? ''
  const { items, total } = await listCustomers(
    search ? { search, take: 100 } : { take: 100 },
  )

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-headline text-xl font-bold">Customers</h2>
          <p className="mt-1 font-sans text-sm text-neutral-500 dark:text-neutral-400">
            {total} customer{total === 1 ? '' : 's'}
            {search ? ` matching “${search}”` : ''}
          </p>
        </div>
      </div>

      {/* Create form */}
      <div className="mb-8 rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-4 font-headline text-lg font-bold">Add customer</h3>
        <form action={createCustomerAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Company name" name="companyName" required />
          <FormField label="Website" name="website" placeholder="https://example.com" />
          <FormField label="Industry" name="industry" />
          <FormField label="Employee range" name="employeeRange" placeholder="1,000-5,000" />
          <FormField label="Country" name="country" />
          <div className="flex items-end sm:col-span-2 lg:col-span-1">
            <button
              type="submit"
              className="w-full rounded bg-brand-red px-4 py-2 font-sans text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Create customer
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 font-sans text-xs uppercase tracking-wider text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Industry</th>
              <th className="px-4 py-3">Country</th>
              <th className="px-4 py-3 text-center">Users</th>
              <th className="px-4 py-3 text-center">Ideas</th>
              <th className="px-4 py-3 text-center">Use cases</th>
              <th className="px-4 py-3 text-center">News</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-neutral-500 dark:text-neutral-400"
                >
                  No customers yet. Use the form above to add one.
                </td>
              </tr>
            ) : (
              items.map((c) => (
                <tr
                  key={c.id}
                  className="bg-white hover:bg-neutral-50 dark:bg-neutral-950 dark:hover:bg-neutral-900"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/customers/${c.id}`}
                      className="font-medium text-neutral-900 hover:text-brand-red dark:text-neutral-100"
                    >
                      {c.companyName}
                    </Link>
                    {c.website ? (
                      <span className="block font-sans text-xs text-neutral-500 dark:text-neutral-400">
                        {c.website}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {c.industry ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 dark:text-neutral-300">
                    {c.country ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-center">{c._count.users}</td>
                  <td className="px-4 py-3 text-center">{c._count.ideas}</td>
                  <td className="px-4 py-3 text-center">{c._count.useCases}</td>
                  <td className="px-4 py-3 text-center">{c._count.news}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function FormField({
  label,
  name,
  required,
  placeholder,
}: {
  label: string
  name: string
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
        placeholder={placeholder}
        required={required}
        className="w-full rounded border border-neutral-300 bg-white px-3 py-2 font-sans text-sm text-neutral-900 focus:border-brand-red focus:outline-none dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100"
      />
    </label>
  )
}
