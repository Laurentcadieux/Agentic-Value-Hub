import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo'
import {
  demoFunctions,
  demoIndustries,
  demoTechnologies,
  demoNews,
  demoUseCases,
} from '@/lib/demo-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url
  const now = new Date()

  const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1, changeFrequency: 'hourly' },
    { path: '/news', priority: 0.9, changeFrequency: 'hourly' },
    { path: '/use-cases', priority: 0.9, changeFrequency: 'daily' },
    { path: '/industries', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/functions', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/technologies', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/ask-ai', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/idea-lab', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/methodology', priority: 0.6, changeFrequency: 'monthly' },
  ]

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))

  const newsEntries: MetadataRoute.Sitemap = demoNews.map((n) => ({
    url: `${base}/news/${n.slug}`,
    lastModified: new Date(n.publishedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const useCaseEntries: MetadataRoute.Sitemap = demoUseCases.map((u) => ({
    url: `${base}/use-cases/${u.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const makeTaxonomy = (
    basepath: string,
    items: { slug: string }[],
  ): MetadataRoute.Sitemap =>
    items.map((i) => ({
      url: `${base}${basepath}/${i.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

  return [
    ...staticEntries,
    ...newsEntries,
    ...useCaseEntries,
    ...makeTaxonomy('/industries', demoIndustries),
    ...makeTaxonomy('/functions', demoFunctions),
    ...makeTaxonomy('/technologies', demoTechnologies),
  ]
}
