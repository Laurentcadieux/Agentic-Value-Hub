/**
 * Tenant authorization & role checks (Phase 6).
 *
 * The hub is multi-tenant: every User belongs to a Customer, and a user may
 * only ever see data belonging to their own customer (`customerId`). The
 * ADMIN role grants access to admin surfaces but does NOT grant cross-tenant
 * data access — admins are still scoped to their own customer's records.
 *
 * `AuthContext` is the lightweight shape carried through the request: a
 * customerId, an optional userId, and a role. API routes and server
 * components convert a NextAuth `Session` into an `AuthContext` via
 * `sessionToContext`, then enforce with `assertTenantAccess` /
 * `requireAdmin`.
 */

import type { Session } from 'next-auth'

export type Role = 'ADMIN' | 'MEMBER' | 'VIEWER'

/** A resolved tenant + role context for the current request. */
export interface AuthContext {
  customerId: string
  userId: string | null
  role: Role
}

/** Thrown when a tenant or role check fails. Maps to HTTP 403 in route handlers. */
export class AuthorizationError extends Error {
  constructor(message = 'Forbidden') {
    super(message)
    this.name = 'AuthorizationError'
  }
}

/** Type guard: is there an authenticated user behind this context? */
export function isAuthed(ctx: AuthContext | null): ctx is AuthContext {
  return !!ctx && !!ctx.userId
}

/** Require an authenticated user; throws otherwise. */
export function requireSession(ctx: AuthContext | null): AuthContext {
  if (!isAuthed(ctx)) {
    throw new AuthorizationError('Sign in required')
  }
  return ctx
}

/** Require an authenticated ADMIN; throws otherwise. */
export function requireAdmin(ctx: AuthContext | null): AuthContext {
  const session = requireSession(ctx)
  if (session.role !== 'ADMIN') {
    throw new AuthorizationError('Admin access required')
  }
  return session
}

/** Can this context access data belonging to `customerId`? */
export function canAccessCustomer(
  ctx: AuthContext | null,
  customerId: string,
): boolean {
  if (!ctx) return false
  return ctx.customerId === customerId
}

/** Throw if this context may not access `customerId`'s data. */
export function assertTenantAccess(
  ctx: AuthContext,
  customerId: string,
): void {
  if (ctx.customerId !== customerId) {
    throw new AuthorizationError(
      'You do not have access to this customer\u2019s data',
    )
  }
}

/** Convert a NextAuth Session into an AuthContext, or null when unauthenticated. */
export function sessionToContext(session: Session | null): AuthContext | null {
  if (!session?.user) return null
  const user = session.user as {
    id?: string
    customerId?: string
    role?: string
  }
  if (!user.id || !user.customerId || !user.role) return null
  return {
    customerId: user.customerId,
    userId: user.id,
    role: user.role as Role,
  }
}
