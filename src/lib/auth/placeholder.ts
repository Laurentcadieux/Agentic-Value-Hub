/**
 * Placeholder session helper for Phase 5.
 *
 * Real Auth.js (NextAuth) wiring lands in Phase 6. Until then, API routes that
 * need a customer/user context read optional `x-customer-id` and `x-user-id`
 * request headers, falling back to deterministic demo identifiers. This keeps
 * the Idea Lab end-to-end testable without a logged-in user while preserving
 * the tenant-scoped shape of the contract.
 */

import { headers } from 'next/headers'

export const DEMO_CUSTOMER_ID = '00000000-0000-0000-0000-000000000000'
export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'

export interface PlaceholderSession {
  customerId: string
  userId: string | null
}

/**
 * Resolve a placeholder session from the incoming request headers.
 * `headers()` is async in Next 15 App Router.
 */
export async function getPlaceholderSession(): Promise<PlaceholderSession> {
  const h = await headers()
  const customerId = h.get('x-customer-id') ?? DEMO_CUSTOMER_ID
  const userIdHeader = h.get('x-user-id')
  const userId = userIdHeader && userIdHeader.length > 0 ? userIdHeader : null
  return { customerId, userId }
}
