/**
 * News repository — the only place that issues Prisma queries against the
 * `news` and `ingestion_events` tables. Services and route handlers depend on
 * these functions; nothing should reach for `prisma` directly for news data.
 */

import { News, NewsStatus, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export type { News } from '@prisma/client'

export interface NewsListFilters {
  /** Case-insensitive text search across headline and summary. */
  q?: string
  category?: string
  tag?: string
  company?: string
  industry?: string
  technology?: string
  status?: string
  limit?: number
  offset?: number
}

export interface NewsListResult {
  items: News[]
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

export interface NewsStats {
  total: number
  published: number
  draft: number
  archived: number
}

function clampLimit(limit: number | undefined): number {
  const n = typeof limit === 'number' && Number.isFinite(limit) ? limit : 20
  return Math.min(Math.max(Math.trunc(n), 1), 100)
}

function clampOffset(offset: number | undefined): number {
  const n = typeof offset === 'number' && Number.isFinite(offset) ? offset : 0
  return Math.max(Math.trunc(n), 0)
}

function buildWhere(filters: NewsListFilters): Prisma.NewsWhereInput {
  const where: Prisma.NewsWhereInput = {}
  if (filters.category) where.categories = { has: filters.category }
  if (filters.tag) where.tags = { has: filters.tag }
  if (filters.company) where.companies = { has: filters.company }
  if (filters.industry) where.industries = { has: filters.industry }
  if (filters.technology) where.technologies = { has: filters.technology }
  if (filters.status) where.status = filters.status as NewsStatus
  if (filters.q && filters.q.trim() !== '') {
    const term = filters.q.trim()
    where.OR = [
      { headline: { contains: term, mode: 'insensitive' } },
      { summary: { contains: term, mode: 'insensitive' } },
    ]
  }
  return where
}

/** Paginated, filtered list of news items — most recent first. */
export async function findNews(filters: NewsListFilters = {}): Promise<NewsListResult> {
  const limit = clampLimit(filters.limit)
  const offset = clampOffset(filters.offset)
  const where = buildWhere(filters)

  const [items, total] = await prisma.$transaction([
    prisma.news.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { ingestedAt: 'desc' }],
      skip: offset,
      take: limit,
    }),
    prisma.news.count({ where }),
  ])

  return {
    items,
    total,
    limit,
    offset,
    hasMore: offset + items.length < total,
  }
}

export async function findNewsById(id: string): Promise<News | null> {
  return prisma.news.findUnique({ where: { id } })
}

export async function findNewsBySlug(slug: string): Promise<News | null> {
  return prisma.news.findUnique({ where: { slug } })
}

/** First news item matching a canonical URL, if any. */
export async function findByCanonicalUrl(canonicalUrl: string): Promise<News | null> {
  return prisma.news.findFirst({ where: { canonicalUrl } })
}

/** News item matching a content hash (contentHash has a unique constraint). */
export async function findByContentHash(contentHash: string): Promise<News | null> {
  return prisma.news.findUnique({ where: { contentHash } })
}

export async function createNews(data: Prisma.NewsCreateInput): Promise<News> {
  return prisma.news.create({ data })
}

export async function updateNews(id: string, data: Prisma.NewsUpdateInput): Promise<News> {
  return prisma.news.update({ where: { id }, data })
}

export async function deleteNews(id: string): Promise<News> {
  return prisma.news.delete({ where: { id } })
}

export async function getNewsStats(): Promise<NewsStats> {
  const [total, published, draft, archived] = await Promise.all([
    prisma.news.count(),
    prisma.news.count({ where: { status: 'PUBLISHED' } }),
    prisma.news.count({ where: { status: 'DRAFT' } }),
    prisma.news.count({ where: { status: 'ARCHIVED' } }),
  ])
  return { total, published, draft, archived }
}

export async function getRecentIngestionEvents(limit = 10) {
  return prisma.ingestionEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: Math.min(Math.max(Math.trunc(limit), 1), 100),
  })
}

export async function createIngestionEvent(
  data: Prisma.IngestionEventCreateInput,
) {
  return prisma.ingestionEvent.create({ data })
}
