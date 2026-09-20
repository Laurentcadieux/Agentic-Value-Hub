import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { newsIngestSchema, ingestNews } from '@/services/news-service'
import { findNews } from '@/lib/repositories/news-repository'

/**
 * POST /api/v1/news — ingest a news item.
 *
 * Bearer-token auth (NEWS_INGEST_API_KEY) → Zod validation → canonical URL
 * normalization → content sanitization → content-hash fingerprint → duplicate
 * detection → persist → IngestionEvent audit. See src/services/news-service.ts.
 */
export async function POST(request: NextRequest) {
  // --- Bearer auth ---
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const expected = process.env.NEWS_INGEST_API_KEY ?? ''
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  const requestId = request.headers.get('x-request-id') ?? randomUUID()
  const result = await ingestNews(parsed.data, { source: 'api', requestId })

  if (result.success) {
    return NextResponse.json(
      { success: true, news_id: result.newsId, status: 'published' },
      { status: 201 },
    )
  }

  if (result.status === 'duplicate') {
    return NextResponse.json(
      {
        success: false,
        status: 'duplicate',
        error: result.error,
        news_id: result.newsId,
      },
      { status: 409 },
    )
  }

  return NextResponse.json(
    { success: false, status: 'error', error: result.error },
    { status: 500 },
  )
}

/**
 * GET /api/v1/news — list news with pagination and filtering.
 *
 * Query params: limit, offset, category, tag, company, industry, technology,
 * status, q (text search across headline + summary).
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const limitParam = params.get('limit')
  const offsetParam = params.get('offset')

  const result = await findNews({
    limit: limitParam != null ? Number(limitParam) : undefined,
    offset: offsetParam != null ? Number(offsetParam) : undefined,
    category: params.get('category') ?? undefined,
    tag: params.get('tag') ?? undefined,
    company: params.get('company') ?? undefined,
    industry: params.get('industry') ?? undefined,
    technology: params.get('technology') ?? undefined,
    status: params.get('status') ?? undefined,
    q: params.get('q') ?? undefined,
  })

  return NextResponse.json(result)
}
