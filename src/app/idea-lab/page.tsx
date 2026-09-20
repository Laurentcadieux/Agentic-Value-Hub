import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Idea Lab',
  description:
    'Submit a process, problem or opportunity and the Idea Lab helps shape it into a quantified business case.',
  alternates: { canonical: '/idea-lab' },
}

type SearchParams = { searchParams: Promise<{ idea?: string }> }

export default async function IdeaLabPage({ searchParams }: SearchParams) {
  const { idea } = await searchParams

  return (
    <>
      <PageHeader
        kicker="Tools"
        title="Idea Lab"
        description="Bring a rough idea and leave with a structured business case: the problem, the agent pattern, the value drivers and the controls."
      />
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        {idea ? (
          <section className="rounded border border-neutral-200 p-6 dark:border-neutral-800">
            <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-brand-red">
              Your idea
            </h2>
            <p className="mt-2 text-lg text-neutral-800 dark:text-neutral-200">
              {idea}
            </p>
            <div className="mt-6 rounded border border-dashed border-neutral-300 p-4 text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              <span className="mr-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                PLACEHOLDER
              </span>
              AI analysis, use-case matching and value scoring arrive in a later
              phase. Your idea has been captured locally for this session.
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/use-cases"
                className="inline-flex items-center justify-center rounded border border-neutral-900 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-900 hover:text-white dark:border-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-100 dark:hover:text-neutral-900"
              >
                Browse matching use cases
              </Link>
              <Link
                href="/methodology"
                className="inline-flex items-center justify-center rounded px-5 py-2.5 text-sm font-semibold text-brand-red hover:underline"
              >
                How we score value &rarr;
              </Link>
            </div>
          </section>
        ) : (
          <section className="rounded border border-dashed border-neutral-300 p-8 text-center dark:border-neutral-700">
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              PLACEHOLDER
            </span>
            <p className="mt-4 text-neutral-600 dark:text-neutral-300">
              Describe an idea from the homepage prompt or the Ask the AI Advisor
              page, and it will appear here as the seed for a business case.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center justify-center rounded bg-brand-red px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Describe an idea &rarr;
            </Link>
          </section>
        )}
      </div>
    </>
  )
}
