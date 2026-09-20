/**
 * Auth service — business logic for registration and session-context
 * resolution (Phase 6).
 *
 * Sits above the user/customer repository and the pluggable credential store.
 * `getSessionContext()` returns the authenticated tenant context, falling
 * back to deterministic demo identifiers when no session is present so the
 * rest of the app (Idea Lab, conversations) remains testable without a login.
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createCustomer,
  createUser,
  findUserByEmail,
} from '@/lib/repositories/user-repository'
import { getCredentialStore } from '@/lib/auth/credential-store'
import { hashPassword } from '@/lib/auth/password'
import { DEMO_CUSTOMER_ID, DEMO_USER_ID } from '@/lib/config'
import { sessionToContext, type AuthContext } from '@/lib/authorization'

export interface RegisterInput {
  companyName: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface RegisterResult {
  user: { id: string; email: string; customerId: string }
}

/** Thrown for expected, user-facing registration failures (maps to HTTP 409). */
export class RegisterError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RegisterError'
  }
}

/**
 * Register a new company (Customer) and its first admin user.
 *
 * The first user of a company is granted the ADMIN role. Password hashes are
 * stored via the CredentialStore (no password column on User).
 */
export async function register(input: RegisterInput): Promise<RegisterResult> {
  const email = input.email.trim().toLowerCase()
  const companyName = input.companyName.trim()
  if (!email || !companyName) {
    throw new RegisterError('Company name and email are required')
  }
  if (input.password.length < 8) {
    throw new RegisterError('Password must be at least 8 characters')
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    throw new RegisterError('An account with this email already exists')
  }
  const store = getCredentialStore()
  if (await store.has(email)) {
    throw new RegisterError('An account with this email already exists')
  }

  const customer = await createCustomer({ companyName })
  const user = await createUser({
    customerId: customer.id,
    email,
    firstName: input.firstName ?? null,
    lastName: input.lastName ?? null,
    role: 'ADMIN',
  })
  await store.set(email, {
    userId: user.id,
    passwordHash: hashPassword(input.password),
  })

  return {
    user: { id: user.id, email: user.email, customerId: user.customerId },
  }
}

/**
 * Resolve the tenant context for the current request.
 *
 * Returns the authenticated user's `{ customerId, userId, role }` when a
 * session exists; otherwise a deterministic demo context so API routes that
 * allow unauthenticated demo access keep working during development.
 */
export async function getSessionContext(): Promise<AuthContext> {
  const session = await getServerSession(authOptions)
  const ctx = sessionToContext(session)
  if (ctx) return ctx
  return {
    customerId: DEMO_CUSTOMER_ID,
    userId: DEMO_USER_ID ?? null,
    role: 'VIEWER',
  }
}

/**
 * Resolve the authenticated tenant context, or null when there is no session.
 *
 * Used by routes that accept a caller-supplied `customerId` (e.g. the AI
 * Advisor conversations) to enforce tenant isolation for signed-in users
 * while letting the unauthenticated demo path through unchanged.
 */
export async function getAuthContextOrNull(): Promise<AuthContext | null> {
  const session = await getServerSession(authOptions)
  return sessionToContext(session)
}
