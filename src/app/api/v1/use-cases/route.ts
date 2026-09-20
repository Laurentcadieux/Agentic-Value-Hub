import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { UseCaseStatus } from '@prisma/client'
import { useCaseService } from '@/services/usecase-service'
import type { UseCaseOrderBy } from '@/lib/repositories/usecase-repository'

/**
 * /api/v1/use-cases
 *
 * GET  — paginated, faceted, keyword + optional semantic search.
 * POST — create a use case (admin). Gated by optional ADMIN_API_TOKEN bearer.
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
 * Lightweight admin gate. When `ADMIN_API_TOKEN` is set in the environment,
 * writes require `Authorization: Bearer <token>`. When unset, writes are
 * allowed (dev convenience) — Phase 7 adds real role-based admin auth.
 */
function adminAllowed(request: NextRequest): boolean {
  const expected = process.env.ADMIN_API_TOKEN
  if (!expected) return true
  const header = request.headers.get('authorization') ?? ''
  return header === `Bearer ${expected}`
}

export async function GET(request: NextRequest) {
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

  const body: Record<string, unknown> = { ...result }
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
  industry: z.string().max(120).nullable().optional(),
  businessFunction: z.string().max(120).nullable().optional(),
  problem: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  agentPattern: z.string().nullable().optional(),
  automationPattern: z.string().nullable().optional(),
  valueDrivers: z.array(z.string()).optional(),
  systems: z.array(z.string()).optional(),
  technologies: z.array(z.string()).optional(),
  automationPotential: z.number().min(0).max(100).nullable().optional(),
  complexity: z.string().max(60).nullable().optional(),
  risks: z.string().nullable().optional(),
  controls: z.string().nullable().optional(),
  status: z.nativeEnum(UseCaseStatus).optional(),
})

export async function POST(request: NextRequest) {
  if (!adminAllowed(request)) {
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
