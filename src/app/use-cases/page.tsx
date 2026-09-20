import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { UseCasesExplorer } from '@/components/UseCasesExplorer'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Enterprise AI Use Cases',
  description:
    'Search and filter a catalog of enterprise agentic AI use cases — the problem, the agent pattern, the value drivers and the controls, for each.',
  alternates: { canonical: '/use-cases' },
}

export const dynamic = 'force-dynamic'

export default async function UseCasesPage() {
  let count = 0
  try {
    const published = await prisma.useCase.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { createdAt: 'desc' },
    })
    count = published.length
  } catch {
    // DB unavailable — treat as empty.
  }

  if (count === 0) {
    return (
      <>
        <PageHeader
          kicker="Use Cases"
          title="Enterprise Agentic AI Use Cases"
          description="Search by keyword or semantics, filter by industry, function, technology, pattern, complexity and value driver. Each use case captures the problem, the agent and automation pattern, the value drivers and the controls."
        />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="py-20 text-center text-neutral-500">No use cases published yet.</p>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        kicker="Use Cases"
        title="Enterprise Agentic AI Use Cases"
        description="Search by keyword or semantics, filter by industry, function, technology, pattern, complexity and value driver. Each use case captures the problem, the agent and automation pattern, the value drivers and the controls."
      />
      <UseCasesExplorer />
    </>
  )
}
