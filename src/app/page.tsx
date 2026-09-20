import Link from 'next/link'
import {
  demoFunctions,
  demoIndustries,
  demoTechnologies,
} from '@/lib/demo-data'
import { HeroSection } from '@/components/HeroSection'
import { AIInputSection } from '@/components/AIInputSection'
import { SectionHeader } from '@/components/SectionHeader'
import { NewsCard } from '@/components/NewsCard'
import { TrendingSidebar } from '@/components/TrendingSidebar'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

function ExploreGrid({
  items,
  basePath,
}: {
  items: { slug: string; name: string; description: string; useCaseCount: number; newsCount: number }[]
  basePath: string
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`${basePath}/${item.slug}`}
          className="group rounded-lg border border-neutral-200 p-4 transition hover:border-brand-red dark:border-neutral-800 dark:hover:border-brand-red"
        >
          <h3 className="font-headline text-sm font-bold group-hover:text-brand-red">
            {item.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-500">
            {item.description}
          </p>
          <p className="mt-2 font-sans text-xs text-neutral-500 dark:text-neutral-500">
            {item.useCaseCount} use cases &middot; {item.newsCount} stories
          </p>
        </Link>
      ))}
    </div>
  )
}

export default async function Home() {
  // Fetch news from database
  let lead: any = null
  let secondary: any[] = []
  let gridNews: any[] = []
  let mostRead: any[] = []

  try {
    const dbNews = await prisma.news.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { publishedAt: 'desc' },
      take: 12,
    })

    if (dbNews.length > 0) {
      lead = dbNews[0]
      secondary = dbNews.slice(1, 4)
      gridNews = dbNews.slice(4, 10)
      mostRead = dbNews.slice(0, 4)
    }
  } catch {
    // DB not available — show empty state
  }

  return (
    <>
      {/* 1. Hero */}
      {lead ? (
        <HeroSection
          tagline="Turn AI agents into business value."
          subheading="Track what is happening in agentic automation. Discover enterprise use cases. Turn your own opportunities into quantified business cases."
          lead={lead ?? undefined}
          secondary={secondary ?? []}
        />
      ) : (
        <HeroSection
          tagline="Turn AI agents into business value."
          subheading="Track what is happening in agentic automation. Discover enterprise use cases. Turn your own opportunities into quantified business cases."
          lead={undefined}
          secondary={[]}
        />
      )}

      {/* 2. AI Idea input */}
      <AIInputSection />

      {/* 3. Latest Agentic Intelligence (news grid + sidebar) */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader title="Latest Agentic Intelligence" href="/news" />
        {gridNews.length > 0 ? (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
                {gridNews.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
              <div className="mt-8">
                <Link href="/news" className="inline-flex items-center gap-1 font-sans text-sm font-semibold text-brand-red hover:underline">
                  Read more news &rarr;
                </Link>
              </div>
            </div>
            <div className="lg:border-l lg:border-neutral-200 lg:pl-8 dark:lg:border-neutral-800">
              <TrendingSidebar mostRead={mostRead ?? []} trendingUseCases={[]} />
            </div>
          </div>
        ) : (
          <p className="py-20 text-center text-neutral-500">No news articles published yet.</p>
        )}
      </section>

      {/* 4. Explore by Business Function */}
      <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeader title="Explore by Business Function" href="/functions" />
          <ExploreGrid items={demoFunctions.slice(0, 6)} basePath="/functions" />
        </div>
      </section>

      {/* 5. Explore by Industry */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader title="Explore by Industry" href="/industries" />
        <ExploreGrid items={demoIndustries.slice(0, 6)} basePath="/industries" />
      </section>

      {/* 6. Explore by Technology */}
      <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeader title="Explore by Technology" href="/technologies" />
          <ExploreGrid items={demoTechnologies.slice(0, 6)} basePath="/technologies" />
        </div>
      </section>

      {/* 7. Newsletter */}
      <NewsletterSection />
    </>
  )
}

import { NewsletterSection } from '@/components/NewsletterSection'
