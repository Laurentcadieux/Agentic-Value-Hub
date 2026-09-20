import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import {
  createConversationWithGreeting,
  listConversations,
  AdvisorError,
  type CreateConversationArgs,
} from '@/services/ai-service'
import { isConversationMode } from '@/lib/ai/state-machine'
import type { ConversationMode } from '@/lib/ai/state-machine'
import { getAuthContextOrNull } from '@/services/auth-service'
import { canAccessCustomer } from '@/lib/authorization'

/**
 * POST /api/v1/conversations
 * Create a new AI Advisor conversation in the given mode. The Advisor posts
 * an opening greeting that asks the first state-machine question.
 *
 * Customer scoping: `customerId` is required. All persisted rows are scoped to
 * it by the repository layer. Tenant authorization (Phase 6): when the caller
 * is signed in, the requested `customerId` must match their own customer.
 */
const createSchema = z.object({
  customerId: z.string().min(1).max(100),
  userId: z.string().min(1).max(100).optional().nullable(),
  mode: z.enum(['LEARN', 'EXPLORE', 'IDEATE', 'ASSESS']),
  title: z.string().min(1).max(200).optional().nullable(),
  ideaId: z.string().min(1).max(100).optional().nullable(),
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

  const data = parsed.data
  if (!isConversationMode(data.mode)) {
    return NextResponse.json({ error: 'Invalid mode' }, { status: 422 })
  }

  // Tenant authorization: signed-in users may only act on their own customer.
  const authCtx = await getAuthContextOrNull()
  if (authCtx && !canAccessCustomer(authCtx, data.customerId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const args: CreateConversationArgs = {
    customerId: data.customerId,
    userId: data.userId ?? null,
    mode: data.mode as ConversationMode,
    title: data.title ?? null,
    ideaId: data.ideaId ?? null,
  }

  try {
    const result = await createConversationWithGreeting(args)
    return NextResponse.json(result, { status: 201 })
  } catch (err) {
    if (err instanceof AdvisorError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('conversations POST failed', err)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}

/**
 * GET /api/v1/conversations?customerId=...&userId=...
 * List conversations for a customer (optionally narrowed to a user), newest
 * activity first. Tenant authorization (Phase 6): signed-in callers must
 * request their own customer.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const customerId = searchParams.get('customerId')
  const userId = searchParams.get('userId') ?? undefined

  if (!customerId) {
    return NextResponse.json(
      { error: 'customerId query parameter is required' },
      { status: 400 },
    )
  }

  const authCtx = await getAuthContextOrNull()
  if (authCtx && !canAccessCustomer(authCtx, customerId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const conversations = await listConversations(customerId, userId)
    return NextResponse.json({ conversations })
  } catch (err) {
    console.error('conversations GET failed', err)
    return NextResponse.json({ error: 'Failed to list conversations' }, { status: 500 })
  }
}
