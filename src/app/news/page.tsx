import type { Metadata } from 'next'
import { getNewsSortedByDate, type DemoNewsItem } from '@/lib/demo-data'
import { NewsCard } from '@/components/NewsCard'
import { PageHeader } from '@/components/PageHeader'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'News & Agentic Intelligence',
  description:
    'The latest news and analysis on agentic AI and enterprise automation — product launches, research, and case studies from across the market.',
  alternates: { canonical: '/news' },
}

export const dynamic = 'force-dynamic'

type DbNewsItem = {
  id: string
  slug: string
  headline: string
  summary: string | null
  sourceName: string | null
  sourceUrl: string | null
  publishedAt: Date | null
  imageUrl: string | null
  categories: string[]
  tags: string[]
}

export default async function NewsPage() {
  // Try database first, fall back to demo data
  let news: (DbNewsItem | DemoNewsItem)[] = []
  let useDb = false

  try {
    const dbNews = await prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    })
    if (dbNews.length > 0) {
      news = dbNews.map((n) => ({
        id: n.id,
        slug: n.slug,
        headline: n.headline,
        summary: n.summary,
        sourceName: n.sourceName,
        sourceUrl: n.sourceUrl,
        publishedAt: n.publishedAt,
        imageUrl: n.imageUrl,
        categories: n.categories,
        tags: n.tags,
      }))
      useDb = true
    }
  } catch {
    // DB not available, use demo data
  }

  if (!useDb) {
    // No database articles — show empty state
    return (
      <>
        <PageHeader
          kicker="Agentic Intelligence"
          title="News & Analysis"
          description="Track what is happening in agentic automation — product launches, research breakthroughs, and enterprise case studies, with analysis on why each matters."
        />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="py-20 text-center text-neutral-500">No news articles published yet.</p>
        </div>
      </>
    )
  }

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
            <NewsCard item={lead as DemoNewsItem} variant="featured" />
          </div>
        ) : null}
        {rest.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 py-10 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((item, i) => (
              <NewsCard key={useDb ? (item as DbNewsItem).id : i} item={item as DemoNewsItem} />
            ))}
          </div>
        ) : (
          <p className="py-10 text-center text-neutral-500">No news articles found.</p>
        )}
      </div>
    </>
  )
}
