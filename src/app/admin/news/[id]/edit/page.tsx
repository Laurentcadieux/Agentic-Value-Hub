import { redirect } from 'next/navigation'

type Params = { params: Promise<{ id: string }> }

/**
 * Convenience alias: /admin/news/:id/edit redirects to /admin/news/:id,
 * which hosts the editor form.
 */
export default async function EditRedirectPage({ params }: Params) {
  const { id } = await params
  redirect(`/admin/news/${id}`)
}
