import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { findNewsById } from '@/lib/repositories/news-repository'
import { NewsForm } from '../NewsForm'
import { updateNewsAction } from '../actions'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  return { title: `Edit article ${id}` }
}

/** Format a stored Date as the value a datetime-local input expects (YYYY-MM-DDTHH:mm). */
function toDatetimeLocal(date: Date): string {
  return date.toISOString().slice(0, 16)
}

export default async function EditNewsPage({ params }: Params) {
  const { id } = await params
  const news = await findNewsById(id)
  if (!news) notFound()

  const initialValues = {
    slug: news.slug,
    headline: news.headline,
    summary: news.summary ?? '',
    analysis: news.analysis ?? '',
    whyItMatters: news.whyItMatters ?? '',
    sourceName: news.sourceName ?? '',
    sourceUrl: news.sourceUrl ?? '',
    canonicalUrl: news.canonicalUrl ?? '',
    publishedAt: news.publishedAt ? toDatetimeLocal(news.publishedAt) : '',
    imageUrl: news.imageUrl ?? '',
    categories: news.categories.join(', '),
    tags: news.tags.join(', '),
    companies: news.companies.join(', '),
    industries: news.industries.join(', '),
    businessFunctions: news.businessFunctions.join(', '),
    technologies: news.technologies.join(', '),
    status: news.status,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-headline text-2xl font-bold">Edit article</h1>
        <Link
          href="/admin/news"
          className="font-sans text-sm text-neutral-500 hover:text-brand-red dark:text-neutral-400"
        >
          &larr; Back to list
        </Link>
      </div>
      <NewsForm
        action={updateNewsAction}
        mode="edit"
        id={id}
        initialValues={initialValues}
      />
    </div>
  )
}
