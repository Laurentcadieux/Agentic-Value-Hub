import type { Metadata } from 'next'
import { demoIndustries } from '@/lib/demo-data'
import { TaxonomyList } from '@/components/Taxonomy'

export const metadata: Metadata = {
  title: 'Industries',
  description:
    'Agentic AI use cases and news, organized by industry — from financial services to the public sector.',
  alternates: { canonical: '/industries' },
}

export default function IndustriesPage() {
  return (
    <TaxonomyList
      kicker="Industries"
      title="Explore by Industry"
      description="Agentic automation looks different in every sector. Browse use cases and news by industry to find what applies to you."
      items={demoIndustries}
      basePath="/industries"
    />
  )
}
