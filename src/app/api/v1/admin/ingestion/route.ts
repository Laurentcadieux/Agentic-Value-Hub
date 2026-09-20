import { NextResponse, type NextRequest } from 'next/server'
import { getIngestionEvents } from '@/services/admin-service'
import { requireAdminRequest } from '@/lib/admin-auth'

/**
 * GET /api/v1/admin/ingestion
 * Returns ingestion events (paginated, filterable by source/status).
 * Query params: skip, take, source, status.
 * Requires the admin bearer token when ADMIN_API_KEY is configured.
 */
export const dynamic = 'force-dynamic'

function parseNonNegInt(value: string | null, fallback: number): number {
  if (value === null) return fallback
  const n = Number(value)
  if (!Number.isFinite(n) || n < 0) return fallback
  return Math.floor(n)
}

export async function GET(request: NextRequest) {
  const ctx = requireAdminRequest(request)
  if (!ctx.authorized) {
    return NextResponse.json({ error: ctx.reason ?? 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const skip = parseNonNegInt(searchParams.get('skip'), 0)
  const take = parseNonNegInt(searchParams.get('take'), 50)
  const source = searchParams.get('source') ?? undefined
  const status = searchParams.get('status') ?? undefined

  try {
    const data = await getIngestionEvents({ skip, take, source, status })
    return NextResponse.json({ data, devMode: ctx.devMode })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load ingestion events'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
