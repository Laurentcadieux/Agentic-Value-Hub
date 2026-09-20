import { NextRequest, NextResponse } from 'next/server'
import { findNewsById, updateNews, deleteNews } from '@/lib/repositories/news-repository'

type RouteContext = { params: Promise<{ id: string }> }

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const expected = process.env.NEWS_INGEST_API_KEY ?? ''
  return !!(expected && token === expected)
}

/** GET /api/v1/news/:id — get a single news item by id. */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const news = await findNewsById(id)
  if (!news) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(news)
}

/**
 * PATCH /api/v1/news/:id — update a news item.
 *
 * Auth: Bearer token (NEWS_INGEST_API_KEY)
 *
 * Send any subset of fields to update. Only provided fields are changed.
 *
 * Example:
 * PATCH /api/v1/news/uuid-here
 * Authorization: Bearer YOUR_KEY
 * Content-Type: application/json
 *
 * {
 *   "headline": "Updated headline",
 *   "summary": "Updated summary",
 *   "status": "DRAFT",
 *   "categories": ["Updated Category"],
 *   "tags": ["updated-tag"],
 *   "imageUrl": "https://example.com/new-image.jpg"
 * }
 *
 * Response 200: { success: true, news: { ...updatedFields } }
 * Response 401: { error: "Unauthorized" }
 * Response 404: { error: "Not found" }
 * Response 422: { error: "Validation failed", issues: {...} }
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  // Check article exists
  const existing = await findNewsById(id)
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Parse body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  // Build update data — only allow known fields
  const updateData: Record<string, unknown> = {}
  const allowedFields = [
    'headline', 'subtitle', 'summary', 'analysis', 'whyItMatters',
    'conclusion', 'keyTakeaways', 'pullQuotes', 'author',
    'readingTimeMinutes', 'ctaLabel', 'ctaUrl', 'isFeatured',
    'sourceName', 'sourceUrl', 'imageUrl', 'categories', 'tags',
    'companies', 'industries', 'businessFunctions', 'technologies', 'status',
  ]

  if (typeof body === 'object' && body !== null) {
    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
        updateData[key] = value
      }
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 422 })
  }

  try {
    const updated = await updateNews(id, updateData)
    return NextResponse.json({ success: true, news: updated })
  } catch (err) {
    return NextResponse.json(
      { error: 'Update failed', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/v1/news/:id — delete a news item.
 *
 * Auth: Bearer token (NEWS_INGEST_API_KEY)
 *
 * Example:
 * DELETE /api/v1/news/uuid-here
 * Authorization: Bearer YOUR_KEY
 *
 * Response 200: { success: true, deleted_id: "uuid-here" }
 * Response 401: { error: "Unauthorized" }
 * Response 404: { error: "Not found" }
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await context.params

  const existing = await findNewsById(id)
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    await deleteNews(id)
    return NextResponse.json({ success: true, deleted_id: id })
  } catch (err) {
    return NextResponse.json(
      { error: 'Delete failed', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
