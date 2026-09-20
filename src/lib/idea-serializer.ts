/**
 * Shared idea serializer — converts an `IdeaServiceResult` into a JSON-safe
 * API response body.
 *
 * Lives outside the route files because Next.js App Router `route.ts` modules
 * only permit HTTP-method and config exports; a named helper exported from a
 * route file is rejected by `next build` route validation. All idea routes
 * import it from here.
 */

import type { IdeaServiceResult } from '@/services/idea-service'

export function serializeIdea(result: IdeaServiceResult) {
  const { record, opportunityCard, valueResult } = result
  return {
    id: record.id,
    customerId: record.customerId,
    userId: record.userId,
    title: record.title,
    status: record.status,
    valueScore: record.valueScore,
    opportunityCard,
    valueResult,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}
