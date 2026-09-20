import { NextRequest, NextResponse } from 'next/server'
import { useCaseService } from '@/services/usecase-service'

/**
 * /api/v1/use-cases/[id]/related
 *
 * GET — structurally + semantically related use cases and linked news for the
 * given id-or-slug. Always dynamic.
 */
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

function toInt(v: string | null, fallback: number): number {
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : fallback
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params
  const limit = Math.min(20, Math.max(1, toInt(request.nextUrl.searchParams.get('limit'), 5)))

  // Resolve id-or-slug to a slug for the related lookup.
  let useCase = await useCaseService.getBySlug(id)
  if (!useCase) useCase = await useCaseService.getById(id)
  if (!useCase) {
    return NextResponse.json({ error: 'Use case not found' }, { status: 404 })
  }

  const related = await useCaseService.getRelated(useCase.slug, limit)
  return NextResponse.json(related)
}