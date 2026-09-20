import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { UseCaseStatus } from '@prisma/client'
import { useCaseService } from '@/services/usecase-service'
import { normalizePotential } from '@/services/usecase-service'

/**
 * /api/v1/use-cases/[id]
 *
 * GET   — a single use case (by id or slug), including linked news.
 * PATCH — update a use case (admin).
 * DELETE — remove a use case (admin).
 *
 * Always dynamic: reads/writes the database at request time.
 */
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

function adminAllowed(request: NextRequest): boolean {
  const expected = process.env.ADMIN_API_TOKEN
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

export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  const useCase = await resolveOne(id)
  if (!useCase) {
    return NextResponse.json({ error: 'Use case not found' }, { status: 404 })
  }
  const { automationPotential, ...rest } = useCase
  return NextResponse.json({
    ...rest,
    automationPotential: normalizePotential(automationPotential),
  })
}

const patchSchema = z.object({
  slug: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(300).optional(),
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

export async function PATCH(request: NextRequest, { params }: Params) {
  if (!adminAllowed(request)) {
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
  if (!adminAllowed(request)) {
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