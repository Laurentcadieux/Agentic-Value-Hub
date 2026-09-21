/**
 * Use-case data access layer.
 *
 * All Prisma queries for the knowledge base live here: CRUD, keyword search,
 * faceted filtering, structural "related" lookup and related-news linking.
 * The service layer (`src/services/usecase-service.ts`) builds business logic
 * (semantic ranking, normalization) on top of these primitives.
 */
import { Prisma, UseCase, UseCaseStatus, News } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/** A use case with its linked news items (for detail + related-news views). */
export type UseCaseWithNews = Prisma.UseCaseGetPayload<{
  include: { newsUseCases: { include: { news: true } } }
}>

/** Faceted filters accepted by the search/list endpoints. */
export interface UseCaseFilters {
  q?: string
  industry?: string
  businessFunction?: string
  technology?: string
  agentPattern?: string
  automationPattern?: string
  complexity?: string
  valueDriver?: string
  /** Defaults to PUBLISHED. Pass `undefined` to omit (admin sees all). */
  status?: UseCaseStatus | 'ALL'
}

export type UseCaseOrderBy = 'newest' | 'oldest' | 'potential' | 'title'

export interface UseCaseListOptions extends UseCaseFilters {
  page?: number
  pageSize?: number
  orderBy?: UseCaseOrderBy
}

export interface UseCaseListResult {
  items: UseCase[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/** Distinct values for each filterable facet (nulls excluded, sorted). */
export interface UseCaseFacets {
  industries: string[]
  businessFunctions: string[]
  technologies: string[]
  agentPatterns: string[]
  automationPatterns: string[]
  complexities: string[]
  valueDrivers: string[]
}

/** Input shape for create/update (looser than Prisma's generated input). */
export interface UseCaseWriteInput {
  slug?: string
  title: string
  subtitle?: string | null
  description?: string | null
  problem?: string | null
  solution?: string | null
  conclusion?: string | null
  keyTakeaways?: string[]
  imageUrl?: string | null
  author?: string | null
  readingTimeMinutes?: number | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  isFeatured?: boolean
  industry?: string | null
  businessFunction?: string | null
  agentPattern?: string | null
  automationPattern?: string | null
  valueDrivers?: string[]
  systems?: string[]
  technologies?: string[]
  automationPotential?: number | null
  endToEndAutomationSuccess?: number | null
  agenticPercentage?: number | null
  complexity?: string | null
  risks?: string | null
  controls?: string | null
  sourceRefs?: Prisma.JsonValue | null
  techStack?: string[]
  boatCapabilities?: string[]
  submitterName?: string | null
  submitterCompany?: string | null
  submitterDepartment?: string | null
  submitterEmail?: string | null
  status?: UseCaseStatus
}

const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 100

function clampPagination(page?: number, pageSize?: number): {
  page: number
  pageSize: number
  skip: number
} {
  const p = Math.max(1, Math.floor(page ?? 1))
  const size = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize ?? DEFAULT_PAGE_SIZE)))
  return { page: p, pageSize: size, skip: (p - 1) * size }
}

function orderByClause(orderBy?: UseCaseOrderBy): Prisma.UseCaseOrderByWithRelationInput {
  switch (orderBy) {
    case 'oldest':
      return { createdAt: 'asc' }
    case 'potential':
      return { automationPotential: 'desc' }
    case 'title':
      return { title: 'asc' }
    case 'newest':
    default:
      return { createdAt: 'desc' }
  }
}

/**
 * Build the Prisma where-clause from filters. Keyword `q` is split into tokens
 * that are AND-ed; each token must match (case-insensitively) any text field or
 * appear as an element of a string[] field. `status=ALL` disables the status
 * filter (for admin listings).
 */
function buildWhere(filters: UseCaseFilters): Prisma.UseCaseWhereInput {
  const where: Prisma.UseCaseWhereInput = {}

  if (filters.status && filters.status !== 'ALL') {
    where.status = filters.status
  } else if (!filters.status) {
    where.status = UseCaseStatus.PUBLISHED
  }

  if (filters.industry) where.industry = filters.industry
  if (filters.businessFunction) where.businessFunction = filters.businessFunction
  if (filters.agentPattern) where.agentPattern = filters.agentPattern
  if (filters.automationPattern) where.automationPattern = filters.automationPattern
  if (filters.complexity) where.complexity = filters.complexity
  if (filters.technology) where.technologies = { has: filters.technology }
  if (filters.valueDriver) where.valueDrivers = { has: filters.valueDriver }

  const q = filters.q?.trim()
  if (q) {
    const tokens = q.split(/\s+/).filter(Boolean)
    where.AND = tokens.map((token) => ({
      OR: [
        { title: { contains: token, mode: 'insensitive' } },
        { description: { contains: token, mode: 'insensitive' } },
        { problem: { contains: token, mode: 'insensitive' } },
        { industry: { contains: token, mode: 'insensitive' } },
        { businessFunction: { contains: token, mode: 'insensitive' } },
        { agentPattern: { contains: token, mode: 'insensitive' } },
        { automationPattern: { contains: token, mode: 'insensitive' } },
        { complexity: { contains: token, mode: 'insensitive' } },
        { risks: { contains: token, mode: 'insensitive' } },
        { controls: { contains: token, mode: 'insensitive' } },
        { technologies: { hasSome: [token] } },
        { valueDrivers: { hasSome: [token] } },
        { systems: { hasSome: [token] } },
      ],
    }))
  }

  return where
}

/**
 * Map a sourceRefs value to Prisma's nullable-JSON input. Plain `null` must be
 * expressed as `Prisma.DbNull` (a DB NULL) rather than a JSON `null`.
 * `undefined` means "leave the field untouched" and is therefore omitted.
 */
function jsonInput(
  value: Prisma.JsonValue | null | undefined,
): Prisma.UseCaseCreateInput['sourceRefs'] | undefined {
  if (value === undefined) return undefined
  return value === null ? Prisma.DbNull : value
}

export const useCaseRepository = {
  /** Paginated, filtered, keyword-searched list. */
  async findMany(options: UseCaseListOptions = {}): Promise<UseCaseListResult> {
    const { page, pageSize, skip } = clampPagination(options.page, options.pageSize)
    const where = buildWhere(options)
    const orderBy = orderByClause(options.orderBy)

    const [items, total] = await Promise.all([
      prisma.useCase.findMany({ where, orderBy, skip, take: pageSize }),
      prisma.useCase.count({ where }),
    ])

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    }
  },

  /** Fetch by primary id, including linked news. */
  async findById(id: string): Promise<UseCaseWithNews | null> {
    return prisma.useCase.findUnique({
      where: { id },
      include: { newsUseCases: { include: { news: true } } },
    })
  },

  /** Fetch by slug, including linked news. */
  async findBySlug(slug: string): Promise<UseCaseWithNews | null> {
    return prisma.useCase.findUnique({
      where: { slug },
      include: { newsUseCases: { include: { news: true } } },
    })
  },

  /**
   * Structurally related use cases: same industry / business function and/or
   * overlapping technologies & value drivers, ranked by an overlap score.
   * Excludes the source and non-published rows. Pure Prisma + in-memory score.
   */
  async findRelated(id: string, limit = 5): Promise<UseCase[]> {
    const source = await prisma.useCase.findUnique({ where: { id } })
    if (!source) return []

    const orClauses: Prisma.UseCaseWhereInput[] = []
    if (source.industry) orClauses.push({ industry: source.industry })
    if (source.businessFunction) orClauses.push({ businessFunction: source.businessFunction })
    if (source.technologies.length) orClauses.push({ technologies: { hasSome: source.technologies } })
    if (source.valueDrivers.length) orClauses.push({ valueDrivers: { hasSome: source.valueDrivers } })

    const where: Prisma.UseCaseWhereInput = {
      id: { not: id },
      status: UseCaseStatus.PUBLISHED,
    }
    if (orClauses.length) where.OR = orClauses

    const candidates = await prisma.useCase.findMany({ where, take: 100 })

    const scored = candidates.map((c) => {
      let score = 0
      if (source.industry && c.industry === source.industry) score += 3
      if (source.businessFunction && c.businessFunction === source.businessFunction) score += 4
      if (source.technologies.length) {
        const overlap = c.technologies.filter((t) => source.technologies.includes(t)).length
        score += overlap * 1.5
      }
      if (source.valueDrivers.length) {
        const overlap = c.valueDrivers.filter((v) => source.valueDrivers.includes(v)).length
        score += overlap
      }
      if (source.complexity && c.complexity === source.complexity) score += 0.5
      return { c, score }
    })

    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, limit).map((s) => s.c)
  },

  /** News linked to a use case via NewsUseCase, published only, best-relevance first. */
  async findRelatedNews(id: string, limit = 10): Promise<News[]> {
    const links = await prisma.newsUseCase.findMany({
      where: { useCaseId: id, news: { status: 'PUBLISHED' } },
      include: { news: true },
      orderBy: [{ relevanceScore: 'desc' }, { news: { publishedAt: 'desc' } }],
      take: limit,
    })
    return links.map((l) => l.news)
  },

  /** Distinct facet values across the given status scope (default PUBLISHED). */
  async getFacets(status: UseCaseStatus | 'ALL' = UseCaseStatus.PUBLISHED): Promise<UseCaseFacets> {
    const where: Prisma.UseCaseWhereInput = status === 'ALL' ? {} : { status }

    const [industries, businessFunctions, agentPatterns, automationPatterns, complexities, rows] =
      await Promise.all([
        prisma.useCase.findMany({
          where,
          select: { industry: true },
          distinct: ['industry'],
          orderBy: { industry: 'asc' },
        }),
        prisma.useCase.findMany({
          where,
          select: { businessFunction: true },
          distinct: ['businessFunction'],
          orderBy: { businessFunction: 'asc' },
        }),
        prisma.useCase.findMany({
          where,
          select: { agentPattern: true },
          distinct: ['agentPattern'],
          orderBy: { agentPattern: 'asc' },
        }),
        prisma.useCase.findMany({
          where,
          select: { automationPattern: true },
          distinct: ['automationPattern'],
          orderBy: { automationPattern: 'asc' },
        }),
        prisma.useCase.findMany({
          where,
          select: { complexity: true },
          distinct: ['complexity'],
          orderBy: { complexity: 'asc' },
        }),
        prisma.useCase.findMany({ where, select: { technologies: true, valueDrivers: true } }),
      ])

    const uniq = (arr: (string | null)[]): string[] =>
      Array.from(new Set(arr.filter((v): v is string => Boolean(v)))).sort()

    const techSet = new Set<string>()
    const driverSet = new Set<string>()
    for (const r of rows) {
      for (const t of r.technologies ?? []) techSet.add(t)
      for (const v of r.valueDrivers ?? []) driverSet.add(v)
    }

    return {
      industries: uniq(industries.map((r) => r.industry)),
      businessFunctions: uniq(businessFunctions.map((r) => r.businessFunction)),
      technologies: Array.from(techSet).sort(),
      agentPatterns: uniq(agentPatterns.map((r) => r.agentPattern)),
      automationPatterns: uniq(automationPatterns.map((r) => r.automationPattern)),
      complexities: uniq(complexities.map((r) => r.complexity)),
      valueDrivers: Array.from(driverSet).sort(),
    }
  },

  async create(data: UseCaseWriteInput): Promise<UseCase> {
    const sourceRefs = jsonInput(data.sourceRefs)
    return prisma.useCase.create({
      data: {
        slug: data.slug?.trim() || slugify(data.title),
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        problem: data.problem,
        solution: data.solution,
        conclusion: data.conclusion,
        keyTakeaways: data.keyTakeaways ?? [],
        imageUrl: data.imageUrl,
        author: data.author,
        readingTimeMinutes: data.readingTimeMinutes,
        ctaLabel: data.ctaLabel,
        ctaUrl: data.ctaUrl,
        isFeatured: data.isFeatured ?? false,
        industry: data.industry,
        businessFunction: data.businessFunction,
        agentPattern: data.agentPattern,
        automationPattern: data.automationPattern,
        valueDrivers: data.valueDrivers ?? [],
        systems: data.systems ?? [],
        technologies: data.technologies ?? [],
        automationPotential: data.automationPotential,
        endToEndAutomationSuccess: data.endToEndAutomationSuccess,
        agenticPercentage: data.agenticPercentage,
        complexity: data.complexity,
        risks: data.risks,
        controls: data.controls,
        techStack: data.techStack ?? [],
        boatCapabilities: data.boatCapabilities ?? [],
        submitterName: data.submitterName,
        submitterCompany: data.submitterCompany,
        submitterDepartment: data.submitterDepartment,
        submitterEmail: data.submitterEmail,
        status: data.status ?? UseCaseStatus.DRAFT,
        ...(sourceRefs !== undefined ? { sourceRefs } : {}),
      },
    })
  },

  async update(id: string, data: Partial<UseCaseWriteInput>): Promise<UseCase> {
    const sourceRefs = jsonInput(data.sourceRefs)
    return prisma.useCase.update({
      where: { id },
      data: {
        slug: data.slug,
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        problem: data.problem,
        solution: data.solution,
        conclusion: data.conclusion,
        keyTakeaways: data.keyTakeaways,
        imageUrl: data.imageUrl,
        author: data.author,
        readingTimeMinutes: data.readingTimeMinutes,
        ctaLabel: data.ctaLabel,
        ctaUrl: data.ctaUrl,
        isFeatured: data.isFeatured,
        industry: data.industry,
        businessFunction: data.businessFunction,
        agentPattern: data.agentPattern,
        automationPattern: data.automationPattern,
        valueDrivers: data.valueDrivers,
        systems: data.systems,
        technologies: data.technologies,
        automationPotential: data.automationPotential,
        endToEndAutomationSuccess: data.endToEndAutomationSuccess,
        agenticPercentage: data.agenticPercentage,
        complexity: data.complexity,
        risks: data.risks,
        controls: data.controls,
        techStack: data.techStack,
        boatCapabilities: data.boatCapabilities,
        submitterName: data.submitterName,
        submitterCompany: data.submitterCompany,
        submitterDepartment: data.submitterDepartment,
        submitterEmail: data.submitterEmail,
        status: data.status,
        ...(sourceRefs !== undefined ? { sourceRefs } : {}),
      },
    })
  },

  async delete(id: string): Promise<UseCase> {
    return prisma.useCase.delete({ where: { id } })
  },

  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const existing = await prisma.useCase.findUnique({
      where: { slug },
      select: { id: true },
    })
    return existing ? existing.id !== excludeId : false
  },
}

/** Build a slug from a title (lowercase, hyphenated, trimmed). */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
