import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  demoNews,
  demoTechnologies,
  getTechnologyBySlug,
  getUseCasesForTechnology,
} from '@/lib/demo-data'
import { TaxonomyDetail } from '@/components/Taxonomy'
import { siteConfig } from '@/lib/seo'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return demoTechnologies.map((t) => ({ slug: t.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const item = getTechnologyBySlug(slug)
  if (!item) return { title: 'Technology not found' }
  return {
    title: `${item.name} — Agentic AI`,
    description: item.description,
    alternates: { canonical: `/technologies/${slug}` },
    openGraph: {
      type: 'website',
      url: `${siteConfig.url}/technologies/${slug}`,
      title: `${item.name} — Agentic AI`,
      description: item.description,
    },
  }
}

export default async function TechnologyDetailPage({ params }: Params) {
  const { slug } = await params
  const item = getTechnologyBySlug(slug)
  if (!item) notFound()

  const news = demoNews.filter((n) => n.technologies.includes(item.name))

  return (
    <TaxonomyDetail
      kicker="Technology"
      name={item.name}
      description={item.description}
      breadcrumb={{ label: 'Technologies', href: '/technologies' }}
      useCases={getUseCasesForTechnology(item.name)}
      news={news}
    />
  )
}
