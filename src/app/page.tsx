import Link from 'next/link'
import {
  demoFunctions,
  demoIndustries,
  demoTechnologies,
  getFeaturedNews,
  getFeaturedUseCases,
  getNewsSortedByDate,
} from '@/lib/demo-data'
import { HeroSection } from '@/components/HeroSection'
import { AIInputSection } from '@/components/AIInputSection'
import { NewsCard } from '@/components/NewsCard'
import { UseCaseCard } from '@/components/UseCaseCard'
import { NewsletterSection } from '@/components/NewsletterSection'
import { SectionHeader } from '@/components/SectionHeader'
import { TrendingSidebar } from '@/components/TrendingSidebar'
import type { DemoTaxonomyItem } from '@/lib/demo-data'

function ExploreGrid({
  items,
  basePath,
}: {
  items: DemoTaxonomyItem[]
  basePath: string
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.slug}
          href={`${basePath}/${item.slug}`}
          className="group block border border-neutral-200 p-4 transition hover:border-neutral-900 hover:shadow-sm dark:border-neutral-800 dark:hover:border-neutral-100"
        >
          <h3 className="font-headline text-lg font-bold group-hover:text-brand-red">
            {item.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
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

export default function Home() {
  const sortedNews = getNewsSortedByDate()
  const featured = getFeaturedNews()
  const lead = featured[0] ?? sortedNews[0]
  const secondary = (featured.length > 1 ? featured.slice(1) : sortedNews.slice(1, 3)).slice(0, 3)

  // Main news grid: everything except items already shown in the hero.
  const heroSlugs = new Set([lead.slug, ...secondary.map((n) => n.slug)])
  const gridNews = sortedNews.filter((n) => !heroSlugs.has(n.slug)).slice(0, 6)
  const mostRead = [...sortedNews].sort(() => 0).slice(0, 4)

  const trendingUseCases = getFeaturedUseCases()
  const featuredOpportunities = getFeaturedUseCases()

  return (
    <>
      {/* 1. Hero */}
      <HeroSection
        tagline="Turn AI agents into business value."
        subheading="Track what is happening in agentic automation. Discover enterprise use cases. Turn your own opportunities into quantified business cases."
        lead={lead}
        secondary={secondary}
      />

      {/* 2. AI Idea input */}
      <AIInputSection />

      {/* 3. Latest Agentic Intelligence (news grid + sidebar) */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader title="Latest Agentic Intelligence" href="/news" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2">
              {gridNews.map((item) => (
                <NewsCard key={item.slug} item={item} />
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/news"
                className="inline-flex items-center gap-1 font-sans text-sm font-semibold text-brand-red hover:underline"
              >
                Read more news &rarr;
              </Link>
            </div>
          </div>
          <div className="lg:border-l lg:border-neutral-200 lg:pl-8 dark:lg:border-neutral-800">
            <TrendingSidebar mostRead={mostRead} trendingUseCases={trendingUseCases} />
          </div>
        </div>
      </section>

      {/* 4. Trending Use Cases */}
      <section className="border-y border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeader title="Trending Use Cases" href="/use-cases" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {trendingUseCases.map((useCase) => (
              <UseCaseCard key={useCase.slug} useCase={useCase} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Explore by Business Function */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader title="Explore by Business Function" href="/functions" />
        <ExploreGrid items={demoFunctions.slice(0, 6)} basePath="/functions" />
      </section>

      {/* 6. Explore by Industry */}
      <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeader title="Explore by Industry" href="/industries" />
          <ExploreGrid items={demoIndustries.slice(0, 6)} basePath="/industries" />
        </div>
      </section>

      {/* 7. Explore by Technology */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <SectionHeader title="Explore by Technology" href="/technologies" />
        <ExploreGrid items={demoTechnologies.slice(0, 6)} basePath="/technologies" />
      </section>

      {/* 8. Featured Automation Opportunities */}
      <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <SectionHeader
            title="Featured Automation Opportunities"
            href="/idea-lab"
            actionLabel="Submit your idea"
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredOpportunities.map((useCase) => (
              <UseCaseCard key={useCase.slug} useCase={useCase} />
            ))}
          </div>
        </div>
      </section>

      {/* 9. Newsletter / Updates */}
      <NewsletterSection />
    </>
  )
}
