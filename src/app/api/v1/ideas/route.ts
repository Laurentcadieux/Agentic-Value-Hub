/**
 * POST /api/v1/ideas — create an idea from guided ideation input.
 *
 * Auth (Phase 6): resolves the real Auth.js session and scopes the new idea to
 * the authenticated user's customer (tenant). Falls back to deterministic demo
 * identifiers when unauthenticated so the Idea Lab stays testable without a
 * login during development.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createIdea } from '@/services/idea-service'
import { getSessionContext } from '@/services/auth-service'
import { serializeIdea } from '@/lib/idea-serializer'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  rawIdea: z.string().min(1).max(5000),
  businessFunction: z.string().max(120).optional(),
  industry: z.string().max(120).optional(),
  currentProcess: z.string().max(5000).optional(),
  systems: z.array(z.string().max(200)).max(50).optional(),
  annualVolume: z.number().min(0).optional(),
  currentAnnualEffort: z.number().min(0).optional(),
  automationPotential: z.number().min(0).max(100).optional(),
  complexity: z.enum(['Low', 'Medium', 'High']).optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const session = await getSessionContext()
  try {
    const result = await createIdea(parsed.data, session)
    return NextResponse.json(serializeIdea(result), { status: 201 })
  } catch (err) {
    console.error('ideas.create error', err)
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 },
    )
  }
}
