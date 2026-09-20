import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { UseCaseStatus } from '@prisma/client'
import { useCaseService, normalizePotential, toPublicDTO } from '@/services/usecase-service'

/**
 * /api/v1/use-cases/[id]
 *
 * GET   — a single use case (by id or slug), including linked news.
 *         Without a bearer token, returns the generic public view (sensitive
 *         fields stripped). With `Authorization: Bearer NEWS_INGEST_API_KEY`,
 *         returns the full record including sensitive fields.
 * PATCH — update a use case. Gated by `NEWS_INGEST_API_KEY` bearer token.
 * DELETE — remove a use case. Gated by `NEWS_INGEST_API_KEY` bearer token.
 *
 * Always dynamic: reads/writes the database at request time.
 */
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

/**
 * Auth gate matching the news-ingest bearer-token pattern. When
 * `NEWS_INGEST_API_KEY` is set, callers must send `Authorization: Bearer
 * <key>`. When unset, access is allowed in development mode.
 */
function isAuthorized(request: NextRequest): boolean {
  const expected = process.env.NEWS_INGEST_API_KEY
  if (!expected) return true
  const header = request.headers.get('authorization') ?? ''
  return header === `Bearer ${expected}`
}

/** Resolve an id-or-slug to a single use case with linked news. */
async function resolveOne(idOrSlug: string) {
  let useCase = await useCaseService.getBySlug(idOrSlug)
  if (!useCase) useCase = await useCaseService.getById(idOrSlug)
  return useCase
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params
  const useCase = await resolveOne(id)
  if (!useCase) {
    return NextResponse.json({ error: 'Use case not found' }, { status: 404 })
  }
  const { automationPotential, ...rest } = useCase
  const normalized = { ...rest, automationPotential: normalizePotential(automationPotential) }
  if (!isAuthorized(request)) {
    return NextResponse.json(toPublicDTO(normalized))
  }
  return NextResponse.json(normalized)
}

const patchSchema = z.object({
  slug: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(300).optional(),
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
  complexity: z.string().max(60).nullable().optional(),
  risks: z.string().nullable().optional(),
  controls: z.string().nullable().optional(),
  status: z.nativeEnum(UseCaseStatus).optional(),
})

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const existing = await resolveOne(id)
  if (!existing) {
    return NextResponse.json({ error: 'Use case not found' }, { status: 404 })
  }

  try {
    const updated = await useCaseService.update(existing.id, parsed.data)
    return NextResponse.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed'
    const status = /already exists/i.test(message) ? 409 : 400
    return NextResponse.json({ error: message }, { status })
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  const existing = await resolveOne(id)
  if (!existing) {
    return NextResponse.json({ error: 'Use case not found' }, { status: 404 })
  }
  await useCaseService.delete(existing.id)
  return NextResponse.json({ success: true })
}