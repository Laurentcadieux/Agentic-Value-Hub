import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/**
 * POST /api/v1/news
 * Ingest a news item. Requires Bearer token == NEWS_INGEST_API_KEY.
 *
 * Phase 0: validates payload and auth, returns a synthetic success body.
 * The actual Prisma write is stubbed and will be wired in a later phase.
 */

const newsIngestSchema = z.object({
  slug: z.string().min(1),
  headline: z.string().min(1),
  summary: z.string().optional(),
  analysis: z.string().optional(),
  whyItMatters: z.string().optional(),
  sourceName: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  canonicalUrl: z.string().url().optional(),
  publishedAt: z.string().datetime().optional(),
  imageUrl: z.string().url().optional(),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  companies: z.array(z.string()).default([]),
  industries: z.array(z.string()).default([]),
  businessFunctions: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  contentHash: z.string().optional(),
})

function randomUuid(): string {
  // Lightweight RFC4122 v4 UUID without pulling in the uuid package.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function POST(request: NextRequest) {
  // --- Bearer auth ---
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const expected = process.env.NEWS_INGEST_API_KEY ?? ''
  if (!expected || token !== expected) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 },
    )
  }

  // --- Body validation ---
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = newsIngestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const _validated = parsed.data

  // TODO(Phase 1): persist via prisma.news.create({ data: _validated }) inside
  // a transaction that also writes an IngestionEvent row. For Phase 0 we return
  // a synthetic success payload so the ingest contract is testable end-to-end.
  const newsId = randomUuid()

  return NextResponse.json(
    { success: true, news_id: newsId, status: 'published' },
    { status: 201 },
  )
}
