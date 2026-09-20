/**
 * POST /api/auth/register — register a new company + admin user.
 *
 * On success returns 201 with the created user's id/email/customerId. The
 * client is expected to follow up with a credentials sign-in.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { register, RegisterError } from '@/services/auth-service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  companyName: z.string().min(1).max(120),
  email: z.string().email().max(254),
  password: z.string().min(8).max(128),
  firstName: z.string().max(80).optional(),
  lastName: z.string().max(80).optional(),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  try {
    const result = await register(parsed.data)
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    if (err instanceof RegisterError) {
      return NextResponse.json({ error: err.message }, { status: 409 })
    }
    console.error('register error', err)
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }
}
