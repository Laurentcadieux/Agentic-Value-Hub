import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { siteConfig } from '@/lib/seo'
import { useCaseService, normalizePotential } from '@/services/usecase-service'
import type { UseCaseDTO, RelatedResult } from '@/services/usecase-service'
import type { News } from '@prisma/client'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

function formatDate(value: string | Date | null | undefined): string | null {
  if (!value) return null
  try {
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return null
  }
}

/** Fetch related use cases + news from the service, returning empty on failure. */
async function safeGetRelated(slug: string): Promise<RelatedResult> {
  try {
    return await useCaseService.getRelated(slug, 4)
  } catch {
    return { useCases: [], news: [] }
  }
}

function mapDtoToRelated(u: UseCaseDTO) {
  return {
    slug: u.slug,
    title: u.title,
    businessFunction: u.businessFunction,
    industry: u.industry,
    automationPotential: u.automationPotential,
  }
}

function mapNewsToRelated(n: News) {
  return {
    slug: n.slug,
    headline: n.headline,
    sourceName: n.sourceName,
    publishedAt: n.publishedAt ? new Date(n.publishedAt).toISOString() : null,
    summary: n.summary,
  }
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  let useCase = null
  try {
    useCase = await prisma.useCase.findUnique({ where: { slug } })
  } catch {
    // DB unavailable — leave metadata minimal.
  }
  if (!useCase) return { title: 'Use case not found' }
  return {
    title: useCase.title,
    description: useCase.description ?? useCase.problem ?? undefined,
    alternates: { canonical: `/use-cases/${slug}` },
    openGraph: {
      type: 'article',
      url: `${siteConfig.url}/use-cases/${slug}`,
      title: useCase.title,
      description: useCase.description ?? undefined,
      images: useCase.imageUrl ? [{ url: useCase.imageUrl, alt: useCase.title }] : [],
    },
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {label}
      </h3>
      <div className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">{children}</div>
    </div>
  )
}

export default async function UseCaseDetailPage({ params }: Params) {
  const { slug } = await params

  let useCase = null
  try {
    useCase = await prisma.useCase.findUnique({ where: { slug } })
  } catch {
    // DB unavailable — treat as not found.
  }
  if (!useCase) notFound()

  const related = await safeGetRelated(slug)
  const relatedUseCases = related.useCases.map(mapDtoToRelated)
  const relatedNews = related.news.map(mapNewsToRelated)
  const automationPotential = normalizePotential(useCase.automationPotential)

  return (
    <article>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-4">
          <Link
            href="/use-cases"
            className="font-sans text-xs font-medium text-neutral-500 hover:text-brand-red dark:text-neutral-400"
          >
            &larr; Use Cases
          </Link>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {useCase.businessFunction ? (
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-blue">
              {useCase.businessFunction}
            </span>
          ) : null}
          {useCase.businessFunction && useCase.industry ? (
            <span className="font-sans text-xs text-neutral-400">&middot;</span>
          ) : null}
          {useCase.industry ? (
            <span className="font-sans text-xs text-neutral-500 dark:text-neutral-400">
              {useCase.industry}
            </span>
          ) : null}
          {useCase.isFeatured ? (
            <span className="ml-auto rounded bg-brand-red/10 px-2 py-0.5 font-sans text-xs font-bold text-brand-red">
              ★ Featured
            </span>
          ) : null}
        </div>

        <h1 className="mt-3 font-headline text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          {useCase.title}
        </h1>

        {useCase.subtitle ? (
          <p className="mt-3 text-xl font-medium text-neutral-700 dark:text-neutral-300">
            {useCase.subtitle}
          </p>
        ) : null}

        {useCase.description ? (
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">{useCase.description}</p>
        ) : null}

        {/* Byline */}
        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-y border-neutral-200 py-3 font-sans text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
          {useCase.author ? (
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {useCase.author}
            </span>
          ) : null}
          {formatDate(useCase.createdAt) ? (
            <>
              {useCase.author ? <span aria-hidden="true">&middot;</span> : null}
              <time dateTime={new Date(useCase.createdAt).toISOString()}>
                {formatDate(useCase.createdAt)}
              </time>
            </>
          ) : null}
          {useCase.readingTimeMinutes ? (
            <>
              <span aria-hidden="true">&middot;</span>
              <span>{useCase.readingTimeMinutes} min read</span>
            </>
          ) : null}
        </div>
      </div>

      {/* Hero image */}
      {useCase.imageUrl ? (
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <img
            src={useCase.imageUrl}
            alt={useCase.title}
            className="aspect-[16/9] w-full rounded object-cover"
          />
        </div>
      ) : null}

      {/* Key takeaways */}
      {useCase.keyTakeaways && useCase.keyTakeaways.length > 0 ? (
        <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="mb-4 font-headline text-sm font-bold uppercase tracking-wider text-brand-red">
              Key Takeaways
            </h2>
            <ol className="space-y-3">
              {useCase.keyTakeaways.map((takeaway, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-brand-red text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {takeaway}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : null}

      {/* Problem */}
      {useCase.problem ? (
        <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="rounded border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-brand-red">
              The problem
            </h2>
            <p className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">{useCase.problem}</p>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Agent pattern">{useCase.agentPattern ?? '—'}</Field>
          <Field label="Automation pattern">{useCase.automationPattern ?? '—'}</Field>
          <Field label="Complexity">{useCase.complexity ?? '—'}</Field>
          <Field label="Automation potential">
            {automationPotential != null ? (
              <span className="font-semibold">{automationPotential}%</span>
            ) : (
              '—'
            )}
          </Field>
        </div>

        {useCase.valueDrivers.length > 0 ? (
          <div className="mt-8">
            <Field label="Value drivers">
              <ul className="flex flex-wrap gap-2">
                {useCase.valueDrivers.map((driver) => (
                  <li
                    key={driver}
                    className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                  >
                    {driver}
                  </li>
                ))}
              </ul>
            </Field>
          </div>
        ) : null}

        {useCase.technologies.length > 0 ? (
          <div className="mt-6">
            <Field label="Technologies">
              <ul className="flex flex-wrap gap-2">
                {useCase.technologies.map((tech) => (
                  <li key={tech}>
                    <Link
                      href={`/technologies/${tech
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)/g, '')}`}
                      className="rounded bg-brand-blue/10 px-2 py-1 text-xs font-medium text-brand-blue hover:underline dark:bg-brand-blue/20"
                    >
                      {tech}
                    </Link>
                  </li>
                ))}
              </ul>
            </Field>
          </div>
        ) : null}

        {/* Solution */}
        {useCase.solution ? (
          <section className="mt-10 prose-editorial">
            <h2 className="font-headline text-xl font-bold">Solution</h2>
            <p className="whitespace-pre-line">{useCase.solution}</p>
          </section>
        ) : null}

        {/* Conclusion */}
        {useCase.conclusion ? (
          <section className="mt-8 prose-editorial">
            <h2 className="font-headline text-xl font-bold">Bottom line</h2>
            <p className="whitespace-pre-line">{useCase.conclusion}</p>
          </section>
        ) : null}

        {/* CTA */}
        {useCase.ctaLabel && useCase.ctaUrl ? (
          <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <Link
              href={useCase.ctaUrl}
              className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 font-sans text-sm font-semibold text-white transition hover:bg-brand-red dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-brand-red dark:hover:text-white"
            >
              {useCase.ctaLabel}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        ) : null}

        {/* Related use cases */}
        {relatedUseCases.length > 0 ? (
          <section className="mt-12 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <h2 className="mb-4 font-headline text-2xl font-bold">Related use cases</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {relatedUseCases.map((u) => (
                <Link
                  key={u.slug}
                  href={`/use-cases/${u.slug}`}
                  className="group block border-l-2 border-neutral-200 pl-3 hover:border-brand-red dark:border-neutral-700"
                >
                  {u.businessFunction ? (
                    <span className="font-sans text-xs font-semibold uppercase tracking-wider text-brand-blue">
                      {u.businessFunction}
                    </span>
                  ) : null}
                  <h3 className="mt-1 text-sm font-bold group-hover:text-brand-red">{u.title}</h3>
                  {u.industry ? (
                    <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                      {u.industry}
                      {u.automationPotential != null ? ` · ${u.automationPotential}% potential` : ''}
                    </span>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Related news */}
        {relatedNews.length > 0 ? (
          <section className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <h2 className="mb-4 font-headline text-2xl font-bold">Related news</h2>
            <ul className="space-y-3">
              {relatedNews.map((n) => (
                <li key={n.slug} className="border-l-2 border-brand-blue pl-3">
                  <Link
                    href={`/news/${n.slug}`}
                    className="text-sm font-semibold hover:text-brand-red"
                  >
                    {n.headline}
                  </Link>
                  <div className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                    {n.sourceName ?? 'Source'}
                    {formatDate(n.publishedAt) ? ` · ${formatDate(n.publishedAt)}` : ''}
                  </div>
                  {n.summary ? (
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
                      {n.summary}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <Link
            href="/idea-lab"
            className="inline-flex items-center justify-center rounded bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Turn this into your business case &rarr;
          </Link>
        </div>
      </div>
    </article>
  )
}
