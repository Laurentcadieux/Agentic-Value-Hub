import { NextResponse, type NextRequest } from 'next/server'
import { getDashboardStats } from '@/services/admin-service'
import { requireAdminRequest } from '@/lib/admin-auth'

/**
 * GET /api/v1/admin/stats
 * Returns aggregate dashboard stats (entity counts + recent ingestion events).
 * Requires the admin bearer token when ADMIN_API_KEY is configured.
 */
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ctx = requireAdminRequest(request)
  if (!ctx.authorized) {
    return NextResponse.json({ error: ctx.reason ?? 'Unauthorized' }, { status: 401 })
  }

  try {
    const data = await getDashboardStats()
    return NextResponse.json({ data, devMode: ctx.devMode })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load stats'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
