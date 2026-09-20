import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { demoUseCases, getUseCaseBySlug } from '@/lib/demo-data'
import { siteConfig } from '@/lib/seo'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return demoUseCases.map((u) => ({ slug: u.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const useCase = getUseCaseBySlug(slug)
  if (!useCase) return { title: 'Use case not found' }
  return {
    title: useCase.title,
    description: useCase.description,
    alternates: { canonical: `/use-cases/${slug}` },
    openGraph: {
      type: 'article',
      url: `${siteConfig.url}/use-cases/${slug}`,
      title: useCase.title,
      description: useCase.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: useCase.title,
      description: useCase.description,
    },
  }
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
        {label}
      </h3>
      <div className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
        {children}
      </div>
    </div>
  )
}

export default async function UseCaseDetailPage({ params }: Params) {
  const { slug } = await params
  const useCase = getUseCaseBySlug(slug)
  if (!useCase) notFound()

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
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-brand-blue">
            {useCase.businessFunction}
          </span>
          <span className="font-sans text-xs text-neutral-400">&middot;</span>
          <span className="font-sans text-xs text-neutral-500 dark:text-neutral-400">
            {useCase.industry}
          </span>
          <span className="ml-auto rounded bg-amber-100 px-2 py-0.5 font-sans text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
            DEMO
          </span>
        </div>

        <h1 className="mt-3 font-headline text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          {useCase.title}
        </h1>
        <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-300">
          {useCase.description}
        </p>
      </div>

      <div className="mx-auto max-w-3xl px-4 pb-4 sm:px-6 lg:px-8">
        <div className="rounded border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-brand-red">
            The problem
          </h2>
          <p className="mt-1 text-sm text-neutral-800 dark:text-neutral-200">
            {useCase.problem}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="Agent pattern">{useCase.agentPattern}</Field>
          <Field label="Automation pattern">{useCase.automationPattern}</Field>
          <Field label="Complexity">{useCase.complexity}</Field>
          <Field label="Automation potential">
            <span className="font-semibold">{useCase.automationPotential}%</span>
          </Field>
        </div>

        <div className="mt-8 space-y-6">
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

          <Field label="Systems involved">
            <ul className="flex flex-wrap gap-2">
              {useCase.systems.map((system) => (
                <li
                  key={system}
                  className="rounded bg-neutral-100 px-2 py-1 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  {system}
                </li>
              ))}
            </ul>
          </Field>

          <Field label="Technologies">
            <ul className="flex flex-wrap gap-2">
              {useCase.technologies.map((tech) => (
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

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Field label="Risks">{useCase.risks}</Field>
            <Field label="Controls">{useCase.controls}</Field>
          </div>
        </div>

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
