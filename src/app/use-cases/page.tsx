import type { Metadata } from 'next'
import { demoUseCases, getFeaturedUseCases } from '@/lib/demo-data'
import { UseCaseCard } from '@/components/UseCaseCard'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Enterprise AI Use Cases',
  description:
    'A catalog of enterprise agentic AI use cases — the problem, the agent pattern, the value drivers and the controls, for each.',
  alternates: { canonical: '/use-cases' },
}

export default function UseCasesPage() {
  const featured = getFeaturedUseCases()
  const featuredSlugs = new Set(featured.map((u) => u.slug))
  const rest = demoUseCases.filter((u) => !featuredSlugs.has(u.slug))

  return (
    <>
      <PageHeader
        kicker="Use Cases"
        title="Enterprise Agentic AI Use Cases"
        description="Each use case captures the problem, the agent and automation pattern, the value drivers, the automation potential and the controls you need to run it safely."
      />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {featured.length > 0 ? (
          <section className="mb-12">
            <h2 className="mb-6 border-b-2 border-neutral-900 pb-2 font-headline text-2xl font-bold dark:border-neutral-100">
              Featured
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((useCase) => (
                <UseCaseCard key={useCase.slug} useCase={useCase} />
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="mb-6 border-b-2 border-neutral-900 pb-2 font-headline text-2xl font-bold dark:border-neutral-100">
            All use cases
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((useCase) => (
              <UseCaseCard key={useCase.slug} useCase={useCase} />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
