import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { demoUseCases, getUseCaseBySlug } from '@/lib/demo-data'
import { siteConfig } from '@/lib/seo'
import { useCaseService, normalizePotential } from '@/services/usecase-service'
import type { UseCaseDTO, RelatedResult } from '@/services/usecase-service'
import type { News } from '@prisma/client'

export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ slug: string }> }

/** Normalized view model shared by the DB and demo render paths. */
interface DetailView {
  slug: string
  title: string
  industry: string | null
  businessFunction: string | null
  problem: string | null
  description: string | null
  agentPattern: string | null
  automationPattern: string | null
  complexity: string | null
  automationPotential: number | null
  valueDrivers: string[]
  systems: string[]
  technologies: string[]
  risks: string | null
  controls: string | null
  isDemo: boolean
  related: Array<{ slug: string; title: string; businessFunction: string | null; industry: string | null; automationPotential: number | null }>
  relatedNews: Array<{ slug: string; headline: string; sourceName: string | null; publishedAt: string | null; summary: string | null }>
}

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

/** Fetch from the service, returning null when the DB is unavailable. */
async function safeGetBySlug(slug: string) {
  try {
    return await useCaseService.getBySlug(slug)
  } catch {
    return null
  }
}

async function safeGetRelated(slug: string): Promise<RelatedResult> {
  try {
    return await useCaseService.getRelated(slug, 4)
  } catch {
    return { useCases: [], news: [] }
  }
}

function mapDtoToRelated(u: UseCaseDTO): DetailView['related'][number] {
  return {
    slug: u.slug,
    title: u.title,
    businessFunction: u.businessFunction,
    industry: u.industry,
    automationPotential: u.automationPotential,
  }
}

function mapNewsToRelated(n: News): DetailView['relatedNews'][number] {
  return {
    slug: n.slug,
    headline: n.headline,
    sourceName: n.sourceName,
    publishedAt: n.publishedAt ? new Date(n.publishedAt).toISOString() : null,
    summary: n.summary,
  }
}

/** Related demo use cases by structural overlap. */
function relatedDemoUseCases(slug: string): DetailView['related'] {
  const source = getUseCaseBySlug(slug)
  if (!source) return []
  return demoUseCases
    .filter((u) => u.slug !== slug)
    .map((u) => {
      let score = 0
      if (u.industry === source.industry) score += 3
      if (u.businessFunction === source.businessFunction) score += 4
      score += u.technologies.filter((t) => source.technologies.includes(t)).length * 1.5
      score += u.valueDrivers.filter((v) => source.valueDrivers.includes(v)).length
      return { u, score }
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ u }) => ({
      slug: u.slug,
      title: u.title,
      businessFunction: u.businessFunction,
      industry: u.industry,
      automationPotential: u.automationPotential,
    }))
}

/** Related demo news by industry/function/technology overlap. */
function relatedDemoNews(_slug: string): DetailView['relatedNews'] {
  return []
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const useCase = await safeGetBySlug(slug)
  if (useCase) {
    return {
      title: useCase.title,
      description: useCase.description ?? useCase.problem ?? undefined,
      alternates: { canonical: `/use-cases/${slug}` },
      openGraph: {
        type: 'article',
        url: `${siteConfig.url}/use-cases/${slug}`,
        title: useCase.title,
        description: useCase.description ?? undefined,
      },
    }
  }
  const demo = getUseCaseBySlug(slug)
  if (!demo) return { title: 'Use case not found' }
  return {
    title: demo.title,
    description: demo.description,
    alternates: { canonical: `/use-cases/${slug}` },
    openGraph: {
      type: 'article',
      url: `${siteConfig.url}/use-cases/${slug}`,
      title: demo.title,
      description: demo.description,
    },
  }
}

async function loadView(slug: string): Promise<DetailView | null> {
  const useCase = await safeGetBySlug(slug)
  if (useCase) {
    const related = await safeGetRelated(slug)
    return {
      slug: useCase.slug,
      title: useCase.title,
      industry: useCase.industry,
      businessFunction: useCase.businessFunction,
      problem: useCase.problem,
      description: useCase.description,
      agentPattern: useCase.agentPattern,
      automationPattern: useCase.automationPattern,
      complexity: useCase.complexity,
      automationPotential: normalizePotential(useCase.automationPotential),
      valueDrivers: useCase.valueDrivers,
      systems: useCase.systems,
      technologies: useCase.technologies,
      risks: useCase.risks,
      controls: useCase.controls,
      isDemo: false,
      related: related.useCases.map(mapDtoToRelated),
      relatedNews: related.news.map(mapNewsToRelated),
    }
  }

  // Fallback to Phase 1 demo data when the DB is unavailable.
  const demo = getUseCaseBySlug(slug)
  if (!demo) return null
  return {
    slug: demo.slug,
    title: demo.title,
    industry: demo.industry,
    businessFunction: demo.businessFunction,
    problem: demo.problem,
    description: demo.description,
    agentPattern: demo.agentPattern,
    automationPattern: demo.automationPattern,
    complexity: demo.complexity,
    automationPotential: demo.automationPotential,
    valueDrivers: demo.valueDrivers,
    systems: demo.systems,
    technologies: demo.technologies,
    risks: demo.risks,
    controls: demo.controls,
    isDemo: true,
    related: relatedDemoUseCases(slug),
    relatedNews: relatedDemoNews(slug),
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
  const view = await loadView(slug)
  if (!view) notFound()

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
          {view.businessFunction ? (
            <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-blue">
              {view.businessFunction}
            </span>
          ) : null}
          {view.businessFunction && view.industry ? (
            <span className="font-sans text-xs text-neutral-400">&middot;</span>
          ) : null}
          {view.industry ? (
            <span className="font-sans text-xs text-neutral-500 dark:text-neutral-400">
              {view.industry}
            </span>
          ) : null}
          {view.isDemo ? (
            <span className="ml-auto rounded bg-amber-100 px-2 py-0.5 font-sans text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              DEMO
            </span>
          ) : null}
        </div>

        <h1 className="mt-3 font-headline text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          {view.title}
        </h1>
        {view.description ? (
          <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">{view.description}</p>
        ) : null}
      </div>

      {view.problem ? (
        <div className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="rounded border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-brand-red">
              The problem
            </h2>
            <p className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">{view.problem}</p>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Agent pattern">{view.agentPattern ?? '—'}</Field>
          <Field label="Automation pattern">{view.automationPattern ?? '—'}</Field>
          <Field label="Complexity">{view.complexity ?? '—'}</Field>
          <Field label="Automation potential">
            {view.automationPotential != null ? (
              <span className="font-semibold">{view.automationPotential}%</span>
            ) : (
              '—'
            )}
          </Field>
        </div>

        <div className="mt-8 space-y-6">
          {view.valueDrivers.length > 0 ? (
            <Field label="Value drivers">
              <ul className="flex flex-wrap gap-2">
                {view.valueDrivers.map((driver) => (
                  <li
                    key={driver}
                    className="rounded bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
                  >
                    {driver}
                  </li>
                ))}
              </ul>
            </Field>
          ) : null}

          {view.systems.length > 0 ? (
            <Field label="Systems involved">
              <ul className="flex flex-wrap gap-2">
                {view.systems.map((system) => (
                  <li
                    key={system}
                    className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                  >
                    {system}
                  </li>
                ))}
              </ul>
            </Field>
          ) : null}

          {view.technologies.length > 0 ? (
            <Field label="Technologies">
              <ul className="flex flex-wrap gap-2">
                {view.technologies.map((tech) => (
                  <li key={tech}>
                    <Link
                      href={`/technologies/${tech.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
                      className="rounded bg-brand-blue/10 px-2 py-1 text-xs font-medium text-brand-blue hover:underline dark:bg-brand-blue/20"
                    >
                      {tech}
                    </Link>
                  </li>
                ))}
              </ul>
            </Field>
          ) : null}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Risks">{view.risks ?? '—'}</Field>
            <Field label="Controls">{view.controls ?? '—'}</Field>
          </div>
        </div>

        {/* Related use cases */}
        {view.related.length > 0 ? (
          <section className="mt-12 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <h2 className="mb-4 font-headline text-2xl font-bold">Related use cases</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {view.related.map((u) => (
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
        {view.relatedNews.length > 0 ? (
          <section className="mt-10 border-t border-neutral-200 pt-6 dark:border-neutral-800">
            <h2 className="mb-4 font-headline text-2xl font-bold">Related news</h2>
            <ul className="space-y-3">
              {view.relatedNews.map((n) => (
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
