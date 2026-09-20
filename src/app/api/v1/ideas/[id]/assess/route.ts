/**
 * POST /api/v1/ideas/:id/assess — re-run the ROI engine for an idea.
 *
 * Accepts optional value-input overrides (hourlyCost, errorReductionRate,
 * errorCostBaseline, executionConfidence, timeHorizonYears, discountRate)
 * and an optional automationPotential override (which also updates the card).
 * Implements the spec's "resume assessment" / assess endpoint.
 *
 * Auth (Phase 6): tenant-scoped — an idea belonging to another customer is
 * reported as 404.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { assessIdea, getIdea } from '@/services/idea-service'
import { serializeIdea } from '@/lib/idea-serializer'
import { getSessionContext } from '@/services/auth-service'
import { canAccessCustomer } from '@/lib/authorization'

export const dynamic = 'force-dynamic'

const assessSchema = z.object({
  hourlyCost: z.number().min(0).optional(),
  errorReductionRate: z.number().min(0).max(1).optional(),
  errorCostBaseline: z.number().min(0).optional(),
  executionConfidence: z.number().min(0).max(1).optional(),
  timeHorizonYears: z.number().min(1).optional(),
  discountRate: z.number().min(0).max(1).optional(),
  automationPotential: z.number().min(0).max(100).optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const ctx = await getSessionContext()

  let body: unknown = {}
  if (
    request.headers.get('content-length') &&
    Number(request.headers.get('content-length')) > 0
  ) {
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }
  }

  const parsed = assessSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  try {
    // Enforce tenant isolation before assessing.
    const existing = await getIdea(id)
    if (!existing || !canAccessCustomer(ctx, existing.record.customerId)) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }

    const result = await assessIdea(id, parsed.data)
    if (!result) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 })
    }
    return NextResponse.json(serializeIdea(result))
  } catch (err) {
    console.error('ideas.assess error', err)
    return NextResponse.json({ error: 'Failed to assess idea' }, { status: 500 })
  }
}
