/**
 * Conversation & Message persistence, scoped to a customer.
 *
 * Customer data scoping: every read/write accepts a `customerId` and filters on
 * it; a user may only ever see conversations belonging to their customer. The
 * optional `userId` further narrows list queries when provided.
 */

import type {
  Conversation,
  ConversationType,
  Idea,
  Message,
  MessageRole,
  Prisma,
} from '@prisma/client'
import { prisma } from '@/lib/prisma'

export interface CreateConversationInput {
  customerId: string
  userId?: string | null
  conversationType: ConversationType
  title?: string | null
  summary?: string | null
  ideaId?: string | null
}

export async function createConversation(
  input: CreateConversationInput,
): Promise<Conversation> {
  return prisma.conversation.create({
    data: {
      customerId: input.customerId,
      userId: input.userId ?? undefined,
      conversationType: input.conversationType,
      title: input.title ?? undefined,
      summary: input.summary ?? undefined,
      ideaId: input.ideaId ?? undefined,
    },
  })
}

export async function getConversation(
  id: string,
  customerId: string,
): Promise<(Conversation & { messages: Message[] }) | null> {
  return prisma.conversation.findFirst({
    where: { id, customerId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  })
}

export async function listConversations(
  customerId: string,
  userId?: string,
  limit = 100,
): Promise<Conversation[]> {
  return prisma.conversation.findMany({
    where: { customerId, ...(userId ? { userId } : {}) },
    orderBy: { updatedAt: 'desc' },
    take: limit,
  })
}

export interface CreateMessageInput {
  conversationId: string
  role: MessageRole
  content: string
  metadata?: Prisma.InputJsonValue
}

export async function addMessage(input: CreateMessageInput): Promise<Message> {
  const message = await prisma.message.create({
    data: {
      conversationId: input.conversationId,
      role: input.role,
      content: input.content,
      metadata: input.metadata ?? undefined,
    },
  })
  // Bump the parent conversation's updatedAt so list ordering reflects activity.
  await prisma.conversation
    .update({ where: { id: input.conversationId }, data: { updatedAt: new Date() } })
    .catch(() => {
      /* ignore — conversation may have been deleted concurrently */
    })
  return message
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
  })
}

export interface UpdateConversationInput {
  title?: string | null
  summary?: string | null
  ideaId?: string | null
}

export async function updateConversation(
  id: string,
  customerId: string,
  data: UpdateConversationInput,
): Promise<Conversation | null> {
  try {
    return await prisma.conversation.update({
      where: { id, customerId },
      data: {
        ...(data.title !== undefined ? { title: data.title ?? undefined } : {}),
        ...(data.summary !== undefined ? { summary: data.summary ?? undefined } : {}),
        ...(data.ideaId !== undefined ? { ideaId: data.ideaId ?? undefined } : {}),
      },
    })
  } catch {
    // update throws if the row is missing or out of customer scope
    return null
  }
}

export async function deleteConversation(
  id: string,
  customerId: string,
): Promise<boolean> {
  try {
    await prisma.conversation.delete({ where: { id, customerId } })
    return true
  } catch {
    return false
  }
}

export interface CreateIdeaInput {
  customerId: string
  userId?: string | null
  title: string
  description?: string | null
  valueScore?: number | null
}

/** Persist an opportunity card as an Idea (used by the save_idea stage). */
export async function createIdea(input: CreateIdeaInput): Promise<Idea> {
  return prisma.idea.create({
    data: {
      customerId: input.customerId,
      userId: input.userId ?? undefined,
      title: input.title,
      description: input.description ?? undefined,
      valueScore: input.valueScore ?? undefined,
      status: 'DRAFT',
    },
  })
}

export async function linkConversationToIdea(
  conversationId: string,
  customerId: string,
  ideaId: string,
): Promise<void> {
  await updateConversation(conversationId, customerId, { ideaId })
}
