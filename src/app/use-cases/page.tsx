import type { Metadata } from 'next'
import { PageHeader } from '@/components/PageHeader'
import { UseCasesExplorer } from '@/components/UseCasesExplorer'

export const metadata: Metadata = {
  title: 'Enterprise AI Use Cases',
  description:
    'Search and filter a catalog of enterprise agentic AI use cases — the problem, the agent pattern, the value drivers and the controls, for each.',
  alternates: { canonical: '/use-cases' },
}

export default function UseCasesPage() {
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
