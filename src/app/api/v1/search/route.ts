import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { findNews } from '@/lib/repositories/news-repository'

/**
 * GET /api/v1/search?q=<query>&limit=<n>
 *
 * Cross-domain search across published news + use cases. Free-text (case-
 * insensitive) match; returns lightweight summaries rather than full records.
 * No auth (public), per the API contract.
 */
export const dynamic = 'force-dynamic'

function clampLimit(raw: string | null): number {
  const n = Number(raw ?? 20)
  if (!Number.isFinite(n)) return 20
  return Math.min(Math.max(Math.trunc(n), 1), 100)
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''
  const limit = clampLimit(request.nextUrl.searchParams.get('limit'))

  if (!q) {
    return NextResponse.json({ q, limit, news: [], useCases: [], total: 0 })
  }

  const [newsResult, useCases] = await Promise.all([
    findNews({ q, limit }),
    prisma.useCase.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { problem: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: limit,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        industry: true,
        businessFunction: true,
        agentPattern: true,
      },
    }),
  ])

  return NextResponse.json({
    q,
    limit,
    news: newsResult.items.map((n) => ({
      id: n.id,
      slug: n.slug,
      headline: n.headline,
      summary: n.summary,
      publishedAt: n.publishedAt,
    })),
    useCases,
    total: newsResult.items.length + useCases.length,
  })
}
