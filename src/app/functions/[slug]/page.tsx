import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  demoFunctions,
  demoNews,
  getFunctionBySlug,
  getUseCasesForFunction,
} from '@/lib/demo-data'
import { TaxonomyDetail } from '@/components/Taxonomy'
import { siteConfig } from '@/lib/seo'

type Params = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return demoFunctions.map((f) => ({ slug: f.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const item = getFunctionBySlug(slug)
  if (!item) return { title: 'Function not found' }
  return {
    title: `${item.name} — Agentic AI`,
    description: item.description,
    alternates: { canonical: `/functions/${slug}` },
    openGraph: {
      type: 'website',
      url: `${siteConfig.url}/functions/${slug}`,
      title: `${item.name} — Agentic AI`,
      description: item.description,
    },
  }
}

export default async function FunctionDetailPage({ params }: Params) {
  const { slug } = await params
  const item = getFunctionBySlug(slug)
  if (!item) notFound()

  const news = demoNews.filter((n) => n.businessFunctions.includes(item.name))

  return (
    <TaxonomyDetail
      kicker="Business Function"
      name={item.name}
      description={item.description}
      breadcrumb={{ label: 'Business Functions', href: '/functions' }}
      useCases={getUseCasesForFunction(item.name)}
      news={news}
    />
  )
}
