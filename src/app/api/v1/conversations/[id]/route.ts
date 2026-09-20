import { NextRequest, NextResponse } from 'next/server'
import { getConversation, AdvisorError } from '@/services/ai-service'
import { deleteConversation } from '@/lib/repositories/conversation-repository'
import { getAuthContextOrNull } from '@/services/auth-service'
import { canAccessCustomer } from '@/lib/authorization'

/**
 * GET /api/v1/conversations/[id]?customerId=...
 * Fetch a single conversation with all of its messages. Customer-scoped: a
 * request that does not match the conversation's customer returns 404 (never
 * reveals existence to an out-of-scope caller). Tenant authorization (Phase
 * 6): signed-in callers must request their own customer.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const customerId = new URL(request.url).searchParams.get('customerId')
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
    const conversation = await getConversation(id, customerId)
    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }
    return NextResponse.json({ conversation })
  } catch (err) {
    if (err instanceof AdvisorError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('conversation GET failed', err)
    return NextResponse.json({ error: 'Failed to load conversation' }, { status: 500 })
  }
}

/**
 * DELETE /api/v1/conversations/[id]?customerId=...
 * Delete a conversation and its messages. Customer-scoped. Tenant
 * authorization (Phase 6): signed-in callers must target their own customer.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const customerId = new URL(request.url).searchParams.get('customerId')
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

  const ok = await deleteConversation(id, customerId).catch(() => false)
  if (!ok) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
