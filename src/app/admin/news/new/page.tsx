import type { Metadata } from 'next'
import { NewsForm } from '../NewsForm'
import { createNewsAction } from '../actions'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'New article' }

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-headline text-2xl font-bold">New article</h1>
      <NewsForm action={createNewsAction} mode="create" />
    </div>
  )
}
