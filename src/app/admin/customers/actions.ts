'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from '@/lib/repositories/customer-repository'
import { requireAdminAction } from '@/lib/admin-auth'

/**
 * Phase 7 — Customer CRUD server actions.
 *
 * Used by the admin customer create/edit/delete forms. Each action enforces
 * the admin authorization guard (mirroring the page guard) before mutating.
 * On success the relevant admin paths are revalidated and the user is
 * redirected to the customer list or detail page.
 */

const customerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required').max(200),
  website: z.string().max(500),
  industry: z.string().max(200),
  employeeRange: z.string().max(100),
  country: z.string().max(100),
})

function readForm(formData: FormData) {
  return {
    companyName: String(formData.get('companyName') ?? '').trim(),
    website: String(formData.get('website') ?? '').trim(),
    industry: String(formData.get('industry') ?? '').trim(),
    employeeRange: String(formData.get('employeeRange') ?? '').trim(),
    country: String(formData.get('country') ?? '').trim(),
  }
}

function nullIfEmpty(value: string): string | null {
  return value.length > 0 ? value : null
}

function describeError(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join(', ')
}

export async function createCustomerAction(formData: FormData) {
  const auth = await requireAdminAction()
  if (!auth.authorized) throw new Error(auth.reason ?? 'Unauthorized')

  const parsed = customerSchema.safeParse(readForm(formData))
  if (!parsed.success) throw new Error(describeError(parsed.error))

  const d = parsed.data
  const customer = await createCustomer({
    companyName: d.companyName,
    website: nullIfEmpty(d.website),
    industry: nullIfEmpty(d.industry),
    employeeRange: nullIfEmpty(d.employeeRange),
    country: nullIfEmpty(d.country),
  })

  revalidatePath('/admin/customers')
  revalidatePath('/admin')
  redirect(`/admin/customers/${customer.id}`)
}

export async function updateCustomerAction(id: string, formData: FormData) {
  const auth = await requireAdminAction()
  if (!auth.authorized) throw new Error(auth.reason ?? 'Unauthorized')

  const parsed = customerSchema.safeParse(readForm(formData))
  if (!parsed.success) throw new Error(describeError(parsed.error))

  const d = parsed.data
  await updateCustomer(id, {
    companyName: d.companyName,
    website: nullIfEmpty(d.website),
    industry: nullIfEmpty(d.industry),
    employeeRange: nullIfEmpty(d.employeeRange),
    country: nullIfEmpty(d.country),
  })

  revalidatePath('/admin/customers')
  revalidatePath(`/admin/customers/${id}`)
  revalidatePath('/admin')
  redirect(`/admin/customers/${id}`)
}

export async function deleteCustomerAction(id: string) {
  const auth = await requireAdminAction()
  if (!auth.authorized) throw new Error(auth.reason ?? 'Unauthorized')

  await deleteCustomer(id)

  revalidatePath('/admin/customers')
  revalidatePath('/admin')
  redirect('/admin/customers')
}
