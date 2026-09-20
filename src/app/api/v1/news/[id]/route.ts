import { NextRequest, NextResponse } from 'next/server'
import { findNewsById } from '@/lib/repositories/news-repository'

type RouteContext = { params: Promise<{ id: string }> }

/** GET /api/v1/news/:id — a single news item by id. */
export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const news = await findNewsById(id)
  if (!news) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(news)
}
