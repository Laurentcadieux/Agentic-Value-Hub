import Link from 'next/link'
import type { DemoNewsItem, DemoUseCase } from '@/lib/demo-data'
import { NewsCard } from './NewsCard'
import { UseCaseCard } from './UseCaseCard'

/**
 * TrendingSidebar — the La Presse-style "most read / trending" rail that runs
 * alongside the news grid on the homepage.
 */
export function TrendingSidebar({
  mostRead,
  trendingUseCases,
}: {
  mostRead: DemoNewsItem[]
  trendingUseCases: DemoUseCase[]
}) {
  return (
    <aside className="space-y-8">
      <div>
        <p className="mb-4 border-b-2 border-brand-red pb-2 font-sans text-xs font-bold uppercase tracking-wider text-brand-red">
          Most Read
        </p>
        <ol className="space-y-4">
          {mostRead.map((item, index) => (
            <li key={item.slug} className="flex gap-3">
              <span className="font-headline text-2xl font-bold text-neutral-300 dark:text-neutral-600">
                {index + 1}
              </span>
              <div className="min-w-0">
                <NewsCard item={item} variant="compact" />
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <p className="mb-4 border-b-2 border-brand-blue pb-2 font-sans text-xs font-bold uppercase tracking-wider text-brand-blue">
          Trending Use Cases
        </p>
        <div className="space-y-4">
          {trendingUseCases.map((useCase) => (
            <UseCaseCard key={useCase.slug} useCase={useCase} variant="compact" />
          ))}
        </div>
        <Link
          href="/use-cases"
          className="mt-4 inline-block font-sans text-sm font-semibold text-brand-red hover:underline"
        >
          Browse all use cases &rarr;
        </Link>
      </div>
    </aside>
  )
}
