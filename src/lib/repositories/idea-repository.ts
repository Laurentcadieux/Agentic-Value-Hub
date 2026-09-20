/**
 * Idea repository (Phase 5).
 *
 * CRUD over the Prisma `Idea` model. The full structured Opportunity Card is
 * serialized as JSON inside the `description` column (the schema cannot be
 * modified in this phase); `valueScore` stores the calculated opportunity
 * value. The repository owns the (de)serialization boundary so callers work
 * with typed `OpportunityCard` objects.
 */

import type { Idea, IdeaStatus } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import type { OpportunityCard } from '@/lib/types/opportunity'

export interface IdeaRecord {
  id: string
  customerId: string
  userId: string | null
  title: string
  status: IdeaStatus
  valueScore: number | null
  opportunityCard: OpportunityCard | null
  createdAt: Date
  updatedAt: Date
}

export interface IdeaCreateInput {
  customerId: string
  userId?: string | null
  title: string
  opportunityCard?: OpportunityCard | null
  valueScore?: number | null
  status?: IdeaStatus
}

export interface IdeaUpdateInput {
  title?: string
  opportunityCard?: OpportunityCard | null
  valueScore?: number | null
  status?: IdeaStatus
}

function serializeCard(card: OpportunityCard): string {
  return JSON.stringify(card)
}

function deserializeCard(description: string | null): OpportunityCard | null {
  if (!description) return null
  try {
    const parsed: unknown = JSON.parse(description)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as OpportunityCard
    }
    return null
  } catch {
    return null
  }
}

function toRecord(idea: Idea): IdeaRecord {
  return {
    id: idea.id,
    customerId: idea.customerId,
    userId: idea.userId,
    title: idea.title,
    status: idea.status,
    valueScore: idea.valueScore,
    opportunityCard: deserializeCard(idea.description),
    createdAt: idea.createdAt,
    updatedAt: idea.updatedAt,
  }
}

export const ideaRepository = {
  async create(input: IdeaCreateInput): Promise<IdeaRecord> {
    const idea = await prisma.idea.create({
      data: {
        customerId: input.customerId,
        userId: input.userId ?? null,
        title: input.title,
        description: input.opportunityCard ? serializeCard(input.opportunityCard) : null,
        valueScore: input.valueScore ?? null,
        status: input.status ?? 'DRAFT',
      },
    })
    return toRecord(idea)
  },

  async findById(id: string): Promise<IdeaRecord | null> {
    const idea = await prisma.idea.findUnique({ where: { id } })
    return idea ? toRecord(idea) : null
  },

  async findManyByCustomer(customerId: string): Promise<IdeaRecord[]> {
    const ideas = await prisma.idea.findMany({
      where: { customerId },
      orderBy: { updatedAt: 'desc' },
    })
    return ideas.map(toRecord)
  },

  async update(id: string, input: IdeaUpdateInput): Promise<IdeaRecord> {
    const data: Record<string, unknown> = {}
    if (input.title !== undefined) data.title = input.title
    if (input.opportunityCard !== undefined) {
      data.description = input.opportunityCard ? serializeCard(input.opportunityCard) : null
    }
    if (input.valueScore !== undefined) data.valueScore = input.valueScore
    if (input.status !== undefined) data.status = input.status
    const idea = await prisma.idea.update({ where: { id }, data })
    return toRecord(idea)
  },

  async delete(id: string): Promise<IdeaRecord> {
    const idea = await prisma.idea.delete({ where: { id } })
    return toRecord(idea)
  },
}
