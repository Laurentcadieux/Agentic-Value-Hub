import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { sendMessage, AdvisorError, type SendMessageArgs } from '@/services/ai-service'
import { getAuthContextOrNull } from '@/services/auth-service'
import { canAccessCustomer } from '@/lib/authorization'

/**
 * POST /api/v1/conversations/[id]/messages
 * Send a user message to the Advisor and receive the assistant's reply.
 *
 * The service:
 *  - validates/hardens the user input (prompt-injection defense)
 *  - advances the conversation state machine
 *  - retrieves RAG knowledge from use cases + news
 *  - calls the configured AI provider (or a deterministic fallback)
 *  - validates the assistant output server-side
 *  - persists both messages and returns the full updated message list
 *
 * Customer scoping: `customerId` is required and must match the conversation.
 * Tenant authorization (Phase 6): signed-in callers must use their own
 * customer.
 */
const sendSchema = z.object({
  content: z.string().min(1).max(4000),
  customerId: z.string().min(1).max(100),
})

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = sendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    )
  }

  const authCtx = await getAuthContextOrNull()
  if (authCtx && !canAccessCustomer(authCtx, parsed.data.customerId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const args: SendMessageArgs = {
    conversationId: id,
    customerId: parsed.data.customerId,
    content: parsed.data.content,
  }

  try {
    const result = await sendMessage(args)
    return NextResponse.json(result)
  } catch (err) {
    if (err instanceof AdvisorError) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error('messages POST failed', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
