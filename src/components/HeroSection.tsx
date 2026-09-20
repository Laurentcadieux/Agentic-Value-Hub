import Link from 'next/link'
import type { DemoNewsItem } from '@/lib/demo-data'
import { NewsCard } from './NewsCard'

/**
 * HeroSection — a newspaper front-page hero that combines the required Phase 1
 * brand messaging (tagline + subheading + primary/secondary CTAs) with a
 * La Presse-style featured-story layout: one large lead story beside a stack
 * of secondary stories.
 */
export function HeroSection({
  tagline,
  subheading,
  lead,
  secondary,
}: {
  tagline: string
  subheading: string
  lead?: DemoNewsItem
  secondary?: DemoNewsItem[]
}) {
  return (
    <section className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Brand messaging */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-sans text-xs font-bold uppercase tracking-[0.25em] text-brand-red">
            The Agentic Value Hub
          </p>
          <h1 className="mt-3 font-headline text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
            {tagline}
          </h1>
          <p className="mt-5 text-base text-neutral-600 dark:text-neutral-300 sm:text-lg">
            {subheading}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/ask-ai"
              className="inline-flex items-center justify-center rounded bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Ask the AI Advisor
            </Link>
            <Link
              href="/use-cases"
              className="inline-flex items-center justify-center rounded border border-neutral-900 px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white dark:border-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
            >
              Explore Use Cases
            </Link>
          </div>
        </div>

        {/* Featured stories */}
        {lead ? (
        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <NewsCard item={lead!} variant="featured" />
          </div>
          <aside className="lg:border-l lg:border-neutral-200 lg:pl-8 dark:lg:border-neutral-800">
            <p className="mb-4 border-b-2 border-neutral-900 pb-2 font-sans text-xs font-bold uppercase tracking-wider dark:border-neutral-100">
              Also today
            </p>
            <div className="space-y-6">
              {(secondary ?? []).map((item) => (
                <NewsCard key={item.slug} item={item} variant="horizontal" />
              ))}
            </div>
          </aside>
        </div>
        ) : null}
      </div>
    </section>
  )
}
