/**
 * Credential validation for the credentials auth provider.
 *
 * Kept in its own module (outside auth.ts and auth-service.ts) to avoid an
 * import cycle: auth.ts (NextAuth options) imports `validateCredentials`
 * here, and auth-service.ts imports `authOptions` from auth.ts. This module
 * only depends on the repository + credential store + password helper, never
 * on the NextAuth config itself.
 */

import { findUserByEmail } from '@/lib/repositories/user-repository'
import { getCredentialStore } from '@/lib/auth/credential-store'
import { verifyPassword } from '@/lib/auth/password'

export interface AuthenticatedUser {
  id: string
  email: string
  customerId: string
  role: string
  firstName: string | null
  lastName: string | null
}

/**
 * Validate an email/password pair against the user table + credential store.
 * Returns the user on success, or null if the user is unknown, has no stored
 * credential, or the password does not match.
 */
export async function validateCredentials(
  email: string,
  password: string,
): Promise<AuthenticatedUser | null> {
  const normalized = email.trim().toLowerCase()
  const user = await findUserByEmail(normalized)
  if (!user) return null

  const store = getCredentialStore()
  const credential = await store.get(normalized)
  if (!credential) return null

  if (!verifyPassword(password, credential.passwordHash)) return null

  return {
    id: user.id,
    email: user.email,
    customerId: user.customerId,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  }
}
