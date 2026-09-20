import type { Metadata } from 'next'
import { demoFunctions } from '@/lib/demo-data'
import { TaxonomyList } from '@/components/Taxonomy'

export const metadata: Metadata = {
  title: 'Business Functions',
  description:
    'Agentic AI use cases and news, organized by business function — finance, customer service, IT, HR and more.',
  alternates: { canonical: '/functions' },
}

export default function FunctionsPage() {
  return (
    <TaxonomyList
      kicker="Business Functions"
      title="Explore by Business Function"
      description="The same agentic patterns recur across functions. Find what is working in yours and borrow the playbook."
      items={demoFunctions}
      basePath="/functions"
    />
  )
}
