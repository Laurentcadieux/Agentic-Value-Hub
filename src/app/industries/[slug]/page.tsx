import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  demoIndustries,
  getIndustryBySlug,
  getNewsForIndustry,
  getUseCasesForIndustry,
} from '@/lib/demo-data'
import { TaxonomyDetail } from '@/components/Taxonomy'
import { siteConfig } from '@/lib/seo'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return demoIndustries.map((i) => ({ slug: i.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const item = getIndustryBySlug(slug)
  if (!item) return { title: 'Industry not found' }
  return {
    title: `${item.name} — Agentic AI`,
    description: item.description,
    alternates: { canonical: `/industries/${slug}` },
    openGraph: {
      type: 'website',
      url: `${siteConfig.url}/industries/${slug}`,
      title: `${item.name} — Agentic AI`,
      description: item.description,
    },
  }
}

export default async function IndustryDetailPage({ params }: Params) {
  const { slug } = await params
  const item = getIndustryBySlug(slug)
  if (!item) notFound()

  return (
    <TaxonomyDetail
      kicker="Industry"
      name={item.name}
      description={item.description}
      breadcrumb={{ label: 'Industries', href: '/industries' }}
      useCases={getUseCasesForIndustry(item.name)}
      news={getNewsForIndustry(item.name)}
    />
  )
}
