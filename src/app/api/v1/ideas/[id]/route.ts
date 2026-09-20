/**
 * GET /api/v1/ideas/:id — fetch an idea with its opportunity card and value.
 * PATCH /api/v1/ideas/:id — edit an idea (re-extract card + re-run value).
 *
 * Auth (Phase 6): the real Auth.js session scopes every read/write to the
 * caller's customer. An idea belonging to another tenant is reported as 404
 * (existence is not leaked). Unauthenticated demo access resolves to the
 * shared demo customer so the Idea Lab stays testable.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getIdea, updateIdea } from '@/services/idea-service'
import { serializeIdea } from '@/lib/idea-serializer'
import { getSessionContext } from '@/services/auth-service'
import { canAccessCustomer } from '@/lib/authorization'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  rawIdea: z.string().min(1).max(5000).optional(),
  businessFunction: z.string().max(120).optional(),
  industry: z.string().max(120).optional(),
  currentProcess: z.string().max(5000).optional(),
  systems: z.array(z.string().max(200)).max(50).optional(),
  annualVolume: z.number().min(0).optional(),
  currentAnnualEffort: z.number().min(0).optional(),
  automationPotential: z.number().min(0).max(100).optional(),
  complexity: z.enum(['Low', 'Medium', 'High']).optional(),
  status: z
    .enum(['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ARCHIVED'])
    .optional(),
})

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const ctx = await getSessionContext()
  try {
    const result = await getIdea(id)
    if (!result || !canAccessCustomer(ctx, result.record.customerId)) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }
    return NextResponse.json(serializeIdea(result))
  } catch (err) {
    console.error('ideas.get error', err)
    return NextResponse.json({ error: 'Failed to load idea' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const ctx = await getSessionContext()

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

  try {
    // Enforce tenant isolation before mutating: an out-of-tenant idea is 404.
    const existing = await getIdea(id)
    if (!existing || !canAccessCustomer(ctx, existing.record.customerId)) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    const result = await updateIdea(id, parsed.data)
    if (!result) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }
    return NextResponse.json(serializeIdea(result))
  } catch (err) {
    console.error('ideas.patch error', err)
    return NextResponse.json({ error: 'Failed to update idea' }, { status: 500 })
  }
}
