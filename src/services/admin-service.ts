import { prisma } from '@/lib/prisma'
import { Prisma, type IdeaStatus } from '@prisma/client'

/**
 * Phase 7 — Admin service.
 *
 * Aggregates cross-entity stats for the admin dashboard and provides the
 * admin-only queries that span customers (ideas, taxonomy, ingestion,
 * news, use cases). Customer CRUD lives in the customer repository; this
 * module focuses on aggregate/oversight queries.
 */

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------

export interface IngestionEventSummary {
  id: string
  source: string
  status: string
  errorMessage: string | null
  createdAt: string
}

export interface DashboardStats {
  newsCount: number
  useCaseCount: number
  ideaCount: number
  userCount: number
  customerCount: number
  conversationCount: number
  ingestionEventCount: number
  recentIngestionEvents: IngestionEventSummary[]
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    newsCount,
    useCaseCount,
    ideaCount,
    userCount,
    customerCount,
    conversationCount,
    ingestionEventCount,
    recentIngestionEvents,
  ] = await Promise.all([
    prisma.news.count(),
    prisma.useCase.count(),
    prisma.idea.count(),
    prisma.user.count(),
    prisma.customer.count(),
    prisma.conversation.count(),
    prisma.ingestionEvent.count(),
    prisma.ingestionEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        source: true,
        status: true,
        errorMessage: true,
        createdAt: true,
      },
    }),
  ])

  return {
    newsCount,
    useCaseCount,
    ideaCount,
    userCount,
    customerCount,
    conversationCount,
    ingestionEventCount,
    recentIngestionEvents: recentIngestionEvents.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
  }
}

// ---------------------------------------------------------------------------
// Ingestion events
// ---------------------------------------------------------------------------

export interface IngestionEventListInput {
  skip?: number
  take?: number
  source?: string
  status?: string
}

export interface IngestionEventItem {
  id: string
  source: string
  requestId: string | null
  status: string
  payloadMetadata: Prisma.JsonValue
  errorMessage: string | null
  createdAt: string
}

export interface IngestionEventListResult {
  items: IngestionEventItem[]
  total: number
}

export async function getIngestionEvents(
  input: IngestionEventListInput = {},
): Promise<IngestionEventListResult> {
  const { skip = 0, take = 50, source, status } = input

  const where: Prisma.IngestionEventWhereInput = {}
  if (source) where.source = { contains: source, mode: 'insensitive' }
  if (status) where.status = status

  const [rows, total] = await Promise.all([
    prisma.ingestionEvent.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        source: true,
        requestId: true,
        status: true,
        payloadMetadata: true,
        errorMessage: true,
        createdAt: true,
      },
    }),
    prisma.ingestionEvent.count({ where }),
  ])

  return {
    items: rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    total,
  }
}

// ---------------------------------------------------------------------------
// Taxonomy overview (derived from news + use-case string arrays)
// ---------------------------------------------------------------------------

export interface TaxonomyBucket {
  value: string
  newsCount: number
  useCaseCount: number
  total: number
}

export interface TaxonomyOverview {
  industries: TaxonomyBucket[]
  businessFunctions: TaxonomyBucket[]
  technologies: TaxonomyBucket[]
  categories: TaxonomyBucket[]
}

function tally(
  acc: Map<string, TaxonomyBucket>,
  values: string[],
  source: 'newsCount' | 'useCaseCount',
): void {
  for (const v of values) {
    const key = v.trim()
    if (!key) continue
    const existing = acc.get(key) ?? {
      value: key,
      newsCount: 0,
      useCaseCount: 0,
      total: 0,
    }
    existing[source] += 1
    existing.total += 1
    acc.set(key, existing)
  }
}

function sortByTotal(buckets: Map<string, TaxonomyBucket>[]): TaxonomyBucket[] {
  const merged = new Map<string, TaxonomyBucket>()
  for (const map of buckets) {
    for (const [key, bucket] of map) {
      const existing = merged.get(key) ?? {
        value: key,
        newsCount: 0,
        useCaseCount: 0,
        total: 0,
      }
      existing.newsCount += bucket.newsCount
      existing.useCaseCount += bucket.useCaseCount
      existing.total += bucket.total
      merged.set(key, existing)
    }
  }
  return Array.from(merged.values()).sort((a, b) => b.total - a.total)
}

export async function getTaxonomyOverview(): Promise<TaxonomyOverview> {
  const [news, useCases] = await Promise.all([
    prisma.news.findMany({
      select: {
        industries: true,
        businessFunctions: true,
        technologies: true,
        categories: true,
      },
    }),
    prisma.useCase.findMany({
      select: { industry: true, businessFunction: true, technologies: true },
    }),
  ])

  const indNews = new Map<string, TaxonomyBucket>()
  const indUc = new Map<string, TaxonomyBucket>()
  const fnNews = new Map<string, TaxonomyBucket>()
  const fnUc = new Map<string, TaxonomyBucket>()
  const techNews = new Map<string, TaxonomyBucket>()
  const techUc = new Map<string, TaxonomyBucket>()
  const cat = new Map<string, TaxonomyBucket>()

  for (const n of news) {
    tally(indNews, n.industries, 'newsCount')
    tally(fnNews, n.businessFunctions, 'newsCount')
    tally(techNews, n.technologies, 'newsCount')
    tally(cat, n.categories, 'newsCount')
  }

  for (const u of useCases) {
    if (u.industry) tally(indUc, [u.industry], 'useCaseCount')
    if (u.businessFunction) tally(fnUc, [u.businessFunction], 'useCaseCount')
    if (u.technologies.length > 0) tally(techUc, u.technologies, 'useCaseCount')
  }

  return {
    industries: sortByTotal([indNews, indUc]),
    businessFunctions: sortByTotal([fnNews, fnUc]),
    technologies: sortByTotal([techNews, techUc]),
    categories: sortByTotal([cat]),
  }
}

// ---------------------------------------------------------------------------
// Ideas across customers
// ---------------------------------------------------------------------------

export type AdminIdeaListItem = Prisma.IdeaGetPayload<{
  include: {
    customer: { select: { id: true; companyName: true } }
    user: { select: { id: true; firstName: true; lastName: true; email: true } }
  }
}>

export interface IdeaListInput {
  search?: string
  status?: string
  customerId?: string
  skip?: number
  take?: number
}

export interface IdeaListResult {
  items: AdminIdeaListItem[]
  total: number
}

export async function listAllIdeas(
  input: IdeaListInput = {},
): Promise<IdeaListResult> {
  const { search, status, customerId, skip = 0, take = 50 } = input

  const where: Prisma.IdeaWhereInput = {}
  if (status) where.status = status as IdeaStatus
  if (customerId) where.customerId = customerId
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.idea.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { id: true, companyName: true } },
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    }),
    prisma.idea.count({ where }),
  ])

  return { items, total }
}

export type AdminIdeaDetail = Prisma.IdeaGetPayload<{
  include: {
    customer: { select: { id: true; companyName: true; website: true } }
    user: { select: { id: true; firstName: true; lastName: true; email: true } }
    conversations: {
      orderBy: { createdAt: 'desc' }
      select: {
        id: true
        conversationType: true
        title: true
        summary: true
        createdAt: true
      }
    }
  }
}>

export async function getIdeaById(id: string): Promise<AdminIdeaDetail | null> {
  return prisma.idea.findUnique({
    where: { id },
    include: {
      customer: { select: { id: true, companyName: true, website: true } },
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      conversations: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          conversationType: true,
          title: true,
          summary: true,
          createdAt: true,
        },
      },
    },
  })
}

// ---------------------------------------------------------------------------
// News + use-case admin listings
// ---------------------------------------------------------------------------

export type AdminNewsListItem = Prisma.NewsGetPayload<{
  include: { customer: { select: { id: true; companyName: true } } }
}>

export interface NewsListResult {
  items: AdminNewsListItem[]
  total: number
}

export async function listNewsForAdmin(
  skip = 0,
  take = 50,
): Promise<NewsListResult> {
  const [items, total] = await Promise.all([
    prisma.news.findMany({
      skip,
      take,
      orderBy: { ingestedAt: 'desc' },
      include: { customer: { select: { id: true, companyName: true } } },
    }),
    prisma.news.count(),
  ])
  return { items, total }
}

export type AdminUseCaseListItem = Prisma.UseCaseGetPayload<{
  include: { customer: { select: { id: true; companyName: true } } }
}>

export interface UseCaseListResult {
  items: AdminUseCaseListItem[]
  total: number
}

export async function listUseCasesForAdmin(
  skip = 0,
  take = 50,
): Promise<UseCaseListResult> {
  const [items, total] = await Promise.all([
    prisma.useCase.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { customer: { select: { id: true, companyName: true } } },
    }),
    prisma.useCase.count(),
  ])
  return { items, total }
}
