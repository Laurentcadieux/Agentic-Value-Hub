import type { Metadata } from 'next'
import { demoTechnologies } from '@/lib/demo-data'
import { TaxonomyList } from '@/components/Taxonomy'

export const metadata: Metadata = {
  title: 'Technologies',
  description:
    'The technologies powering agentic AI — LLMs, browser automation, orchestration, RAG and more — with the use cases that use them.',
  alternates: { canonical: '/technologies' },
}

export default function TechnologiesPage() {
  return (
    <TaxonomyList
      kicker="Technologies"
      title="Explore by Technology"
      description="Understand the building blocks behind agentic systems and which use cases each one enables."
      items={demoTechnologies}
      basePath="/technologies"
    />
  )
}
