import Link from 'next/link'
import type { DemoNewsItem, DemoTaxonomyItem, DemoUseCase } from '@/lib/demo-data'
import { NewsCard } from './NewsCard'
import { PageHeader } from './PageHeader'
import { UseCaseCard } from './UseCaseCard'

/**
 * TaxonomyList — listing page for a taxonomy (industries / functions /
 * technologies): a PageHeader plus a grid of link cards.
 */
export function TaxonomyList({
  kicker,
  title,
  description,
  items,
  basePath,
}: {
  kicker: string
  title: string
  description: string
  items: DemoTaxonomyItem[]
  basePath: string
}) {
  return (
    <>
      <PageHeader kicker={kicker} title={title} description={description} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.slug}
              href={`${basePath}/${item.slug}`}
              className="group block border border-neutral-200 p-5 transition hover:border-neutral-900 hover:shadow-sm dark:border-neutral-800 dark:hover:border-neutral-100"
            >
              <h2 className="font-headline text-xl font-bold group-hover:text-brand-red">
                {item.name}
              </h2>
              <p className="mt-1 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                {item.description}
              </p>
              <p className="mt-3 font-sans text-xs text-neutral-500 dark:text-neutral-500">
                {item.useCaseCount} use cases &middot; {item.newsCount} stories
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}

/**
 * TaxonomyDetail — detail page for a single taxonomy item: its description,
 * related use cases, and related news.
 */
export function TaxonomyDetail({
  kicker,
  name,
  description,
  breadcrumb,
  useCases,
  news,
}: {
  kicker: string
  name: string
  description: string
  breadcrumb: { label: string; href: string }
  useCases: DemoUseCase[]
  news: DemoNewsItem[]
}) {
  const hasContent = useCases.length > 0 || news.length > 0
  return (
    <>
      <PageHeader
        kicker={kicker}
        title={name}
        description={description}
        breadcrumb={breadcrumb}
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {hasContent ? (
          <div className="space-y-12">
            {useCases.length > 0 ? (
              <section>
                <h2 className="mb-6 border-b-2 border-neutral-900 pb-2 font-headline text-2xl font-bold dark:border-neutral-100">
                  Use cases
                </h2>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {useCases.map((useCase) => (
                    <UseCaseCard key={useCase.slug} useCase={useCase} />
                  ))}
                </div>
              </section>
            ) : null}

            {news.length > 0 ? (
              <section>
                <h2 className="mb-6 border-b-2 border-neutral-900 pb-2 font-headline text-2xl font-bold dark:border-neutral-100">
                  Related news
                </h2>
                <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                  {news.map((item) => (
                    <NewsCard key={item.slug} item={item} />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No demo use cases or news are tagged for this entry yet.
          </p>
        )}
      </div>
    </>
  )
}
