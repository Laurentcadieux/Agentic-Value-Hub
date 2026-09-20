import type { Metadata } from 'next'
import { getNewsSortedByDate } from '@/lib/demo-data'
import { NewsCard } from '@/components/NewsCard'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'News & Agentic Intelligence',
  description:
    'The latest news and analysis on agentic AI and enterprise automation — product launches, research, and case studies from across the market.',
  alternates: { canonical: '/news' },
}

export default function NewsPage() {
  const news = getNewsSortedByDate()
  const lead = news[0]
  const rest = news.slice(1)

  return (
    <>
      <PageHeader
        kicker="Agentic Intelligence"
        title="News & Analysis"
        description="Track what is happening in agentic automation — product launches, research breakthroughs, and enterprise case studies, with analysis on why each matters."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {lead ? (
          <div className="border-b border-neutral-200 pb-10 dark:border-neutral-800">
            <NewsCard item={lead} variant="featured" />
          </div>
        ) : null}
        <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((item) => (
            <NewsCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </>
  )
}
