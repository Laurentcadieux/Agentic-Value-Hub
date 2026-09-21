import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { UseCaseStatus } from '@prisma/client'
import { useCaseService, toPublicDTO } from '@/services/usecase-service'
import type { UseCaseOrderBy } from '@/lib/repositories/usecase-repository'

/**
 * /api/v1/use-cases
 *
 * GET  — paginated, faceted, keyword + optional semantic search.
 *         Without a bearer token, returns the generic public view (sensitive
 *         fields stripped). With `Authorization: Bearer NEWS_INGEST_API_KEY`,
 *         returns the full record set including sensitive fields.
 * POST — create a use case. Gated by `NEWS_INGEST_API_KEY` bearer token
 *         (same shared write/ingest token as the news API).
 *
 * NOTE: this route reads from the database at request time, so it is always
 * dynamic (never prerendered at build).
 */
export const dynamic = 'force-dynamic'

const STATUS_VALUES = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'ALL'] as const
const ORDER_VALUES = ['newest', 'oldest', 'potential', 'title'] as const

function parseBool(v: string | null): boolean {
  return v === '1' || v === 'true' || v === 'yes'
}

function toInt(v: string | null, fallback: number): number {
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : fallback
}

/**
 * Auth gate shared by read (for the full-data branch) and write (POST).
 * Matches the news-ingest bearer-token pattern: when `NEWS_INGEST_API_KEY`
 * is set, callers must send `Authorization: Bearer <key>`. When unset, access
 * is allowed in development mode (same convenience as the news API).
 */
function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.NEWS_INGEST_API_KEY
  if (!expected) return true
  const header = request.headers.get('authorization') ?? ''
  return header === `Bearer ${expected}`
}

export async function GET(request: NextRequest) {
  const authorized = isAuthorized(request)
  const sp = request.nextUrl.searchParams
  const status = (sp.get('status') ?? 'PUBLISHED') as (typeof STATUS_VALUES)[number]
  const orderBy = (sp.get('orderBy') ?? 'newest') as UseCaseOrderBy

  const result = await useCaseService.search({
    q: sp.get('q') ?? undefined,
    industry: sp.get('industry') ?? undefined,
    businessFunction: sp.get('businessFunction') ?? undefined,
    technology: sp.get('technology') ?? undefined,
    agentPattern: sp.get('agentPattern') ?? undefined,
    automationPattern: sp.get('automationPattern') ?? undefined,
    complexity: sp.get('complexity') ?? undefined,
    valueDriver: sp.get('valueDriver') ?? undefined,
    status: STATUS_VALUES.includes(status) ? (status as UseCaseStatus | 'ALL') : UseCaseStatus.PUBLISHED,
    page: toInt(sp.get('page'), 1),
    pageSize: toInt(sp.get('pageSize'), 12),
    orderBy: ORDER_VALUES.includes(orderBy as (typeof ORDER_VALUES)[number]) ? orderBy : 'newest',
    semantic: parseBool(sp.get('semantic')),
  })

  const items = authorized
    ? result.items
    : result.items.map((uc) => toPublicDTO(uc))

  const body: Record<string, unknown> = { ...result, items }
  if (parseBool(sp.get('facets'))) {
    body.facets = await useCaseService.getFacets(
      status === 'ALL' ? 'ALL' : (status as UseCaseStatus),
    )
  }
  return NextResponse.json(body)
}

const writeSchema = z.object({
  slug: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(300),
  subtitle: z.string().max(300).nullable().optional(),
  description: z.string().nullable().optional(),
  problem: z.string().nullable().optional(),
  solution: z.string().nullable().optional(),
  conclusion: z.string().nullable().optional(),
  keyTakeaways: z.array(z.string()).optional(),
  imageUrl: z.string().url().nullable().optional(),
  author: z.string().max(200).nullable().optional(),
  readingTimeMinutes: z.number().int().min(0).nullable().optional(),
  ctaLabel: z.string().max(120).nullable().optional(),
  ctaUrl: z.string().url().nullable().optional(),
  isFeatured: z.boolean().optional(),
  industry: z.string().max(120).nullable().optional(),
  businessFunction: z.string().max(120).nullable().optional(),
  agentPattern: z.string().nullable().optional(),
  automationPattern: z.string().nullable().optional(),
  valueDrivers: z.array(z.string()).optional(),
  systems: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  automationPotential: z.number().min(0).max(100).nullable().optional(),
  endToEndAutomationSuccess: z.number().min(0).max(100).nullable().optional(),
  agenticPercentage: z.number().min(0).max(100).nullable().optional(),
  complexity: z.string().max(60).nullable().optional(),
  risks: z.string().nullable().optional(),
  controls: z.string().nullable().optional(),
  techStack: z.array(z.string()).optional(),
  boatCapabilities: z.array(z.string()).optional(),
  submitterName: z.string().optional(),
  submitterCompany: z.string().optional(),
  submitterDepartment: z.string().optional(),
  submitterEmail: z.string().optional(),
  status: z.nativeEnum(UseCaseStatus).optional(),
})

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = writeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  try {
    const created = await useCaseService.create(parsed.data)
    return NextResponse.json(created, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Create failed'
    const status = /already exists/i.test(message) ? 409 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
