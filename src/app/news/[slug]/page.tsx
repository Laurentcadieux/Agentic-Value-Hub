import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNewsBySlug, demoUseCases } from '@/lib/demo-data'
import { CategoryBadge } from '@/components/CategoryBadge'
import { DemoImage } from '@/components/DemoImage'
import { UseCaseCard } from '@/components/UseCaseCard'
import { siteConfig } from '@/lib/seo'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params

  try {
    const article = await prisma.news.findUnique({ where: { slug } })
    if (article) {
      return {
        title: article.headline,
        description: article.summary ?? '',
        alternates: { canonical: `/news/${slug}` },
        openGraph: {
          type: 'article',
          url: `${siteConfig.url}/news/${slug}`,
          title: article.headline,
          description: article.summary ?? '',
          images: article.imageUrl ? [{ url: article.imageUrl, alt: article.headline }] : [],
        },
      }
    }
  } catch {}

  const item = getNewsBySlug(slug)
  if (!item) return { title: 'Article not found' }
  return {
    title: item.headline,
    description: item.summary,
    alternates: { canonical: `/news/${slug}` },
    openGraph: {
      type: 'article',
      url: `${siteConfig.url}/news/${slug}`,
      title: item.headline,
      description: item.summary,
      images: [{ url: item.imageUrl, alt: item.headline }],
    },
  }
}

function formatDate(date: Date | string | null): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export default async function NewsArticlePage({ params }: Params) {
  const { slug } = await params

  let article: any = null

  try {
    article = await prisma.news.findUnique({ where: { slug } })
  } catch {}

  if (article) {
    return (
      <article>
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-4">
            <Link href="/news" className="font-sans text-xs font-medium text-neutral-500 hover:text-brand-red dark:text-neutral-400">
              &larr; News
            </Link>
          </nav>

          {article.categories?.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {article.categories.map((category: string) => (
                <CategoryBadge key={category} category={category} />
              ))}
            </div>
          )}

          <h1 className="mt-3 font-headline text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
            {article.headline}
          </h1>

          {/* Subtitle / deck */}
          {article.subtitle && (
            <p className="mt-3 text-xl font-medium text-neutral-700 dark:text-neutral-300">
              {article.subtitle}
            </p>
          )}

          {article.summary && (
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
              {article.summary}
            </p>
          )}

          {/* Byline */}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-neutral-200 py-3 font-sans text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            {article.author && (
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {article.author}
              </span>
            )}
            {article.sourceName && (
              <span className={article.author ? '' : 'font-semibold text-neutral-900 dark:text-neutral-100'}>
                {article.sourceName}
              </span>
            )}
            {article.publishedAt && (
              <>
                <span aria-hidden="true">&middot;</span>
                <time dateTime={article.publishedAt.toISOString()}>
                  {formatDate(article.publishedAt)}
                </time>
              </>
            )}
            {article.readingTimeMinutes && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span>{article.readingTimeMinutes} min read</span>
              </>
            )}
            {article.companies?.length > 0 && (
              <>
                <span aria-hidden="true">&middot;</span>
                <span>{article.companies.join(', ')}</span>
              </>
            )}
            {article.isFeatured && (
              <span className="ml-auto rounded bg-brand-red/10 px-2 py-0.5 font-bold text-brand-red">
                ★ Featured
              </span>
            )}
          </div>
        </div>

        {/* Hero image */}
        {article.imageUrl && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <img
              src={article.imageUrl}
              alt={article.headline}
              className="aspect-[16/9] w-full rounded object-cover"
            />
          </div>
        )}

        {/* Key takeaways */}
        {article.keyTakeaways?.length > 0 && (
          <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="mb-4 font-headline text-sm font-bold uppercase tracking-wider text-brand-red">
                Key Takeaways
              </h2>
              <ul className="space-y-3">
                {article.keyTakeaways.map((takeaway: string, i: number) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {takeaway}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Body content */}
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="prose-editorial">
            {article.analysis && (
              <>
                <h2 className="font-headline text-xl font-bold">Analysis</h2>
                <p>{article.analysis}</p>
              </>
            )}

            {/* Pull quotes */}
            {article.pullQuotes?.length > 0 && (
              <div className="my-8 space-y-6">
                {article.pullQuotes.map((quote: string, i: number) => (
                  <blockquote key={i} className="border-l-4 border-brand-red pl-6">
                    <p className="font-headline text-xl font-medium italic text-neutral-800 dark:text-neutral-200">
                      &ldquo;{quote}&rdquo;
                    </p>
                  </blockquote>
                ))}
              </div>
            )}

            {article.whyItMatters && (
              <>
                <h2 className="mt-8 font-headline text-xl font-bold">Why it matters</h2>
                <p>{article.whyItMatters}</p>
              </>
            )}

            {article.conclusion && (
              <>
                <h2 className="mt-8 font-headline text-xl font-bold">Bottom line</h2>
                <p>{article.conclusion}</p>
              </>
            )}
          </div>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <span key={tag} className="rounded bg-neutral-100 px-2 py-1 font-sans text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          {article.ctaLabel && article.ctaUrl && (
            <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
              <Link
                href={article.ctaUrl}
                className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 font-sans text-sm font-semibold text-white transition hover:bg-brand-red dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-brand-red dark:hover:text-white"
              >
                {article.ctaLabel}
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          )}

          {/* Source link */}
          {article.sourceUrl && (
            <p className="mt-6 font-sans text-xs text-neutral-500 dark:text-neutral-400">
              Source:{' '}
              <a href={article.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">
                {article.sourceName || 'Original article'}
              </a>
            </p>
          )}
        </div>
      </article>
    )
  }

  // Fall back to demo data
  const item = getNewsBySlug(slug)
  if (!item) notFound()

  const relatedUseCases = demoUseCases

  return (
    <article>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-4">
          <Link href="/news" className="font-sans text-xs font-medium text-neutral-500 hover:text-brand-red dark:text-neutral-400">
            &larr; News
          </Link>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {item.categories.map((category) => (
            <CategoryBadge key={category} category={category} />
          ))}
        </div>

        <h1 className="mt-3 font-headline text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          {item.headline}
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
          {item.summary}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 border-y border-neutral-200 py-3 font-sans text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">{item.sourceName}</span>
          <span aria-hidden="true">&middot;</span>
          <time dateTime={item.publishedAt}>{formatDate(item.publishedAt)}</time>
          {item.companies.length > 0 && (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{item.companies.join(', ')}</span>
            </>
          )}
          <span className="ml-auto rounded bg-amber-100 px-2 py-0.5 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">DEMO</span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <DemoImage src={item.imageUrl} alt={item.headline} className="aspect-[16/9] w-full rounded object-cover" />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="prose-editorial">
          <h2 className="font-headline text-xl font-bold">Analysis</h2>
          <p>{item.analysis}</p>
          <h2 className="mt-8 font-headline text-xl font-bold">Why it matters</h2>
          <p>{item.whyItMatters}</p>
        </div>

        {item.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span key={tag} className="rounded bg-neutral-100 px-2 py-1 font-sans text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {item.sourceUrl && (
          <p className="mt-6 font-sans text-xs text-neutral-500 dark:text-neutral-400">
            Source:{' '}
            <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">
              {item.sourceName}
            </a>
          </p>
        )}
      </div>

      {relatedUseCases.length > 0 && (
        <section className="border-t border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            <h2 className="mb-6 font-headline text-2xl font-bold">Related use cases</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedUseCases.map((useCase) => (
                <UseCaseCard key={useCase.slug} useCase={useCase} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  )
}
