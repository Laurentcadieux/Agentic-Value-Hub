/**
 * Password hashing with Node's built-in scrypt KDF (no external dependency).
 *
 * Hashes are stored by the pluggable CredentialStore (see credential-store.ts)
 * because the Prisma `User` model has no password column and the schema cannot
 * be modified in this phase. When a password column is added later, swap the
 * file-backed store for a DB-backed one — this module stays unchanged.
 */

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

const SCRYPT_KEYLEN = 64
const SCRYPT_N = 16384
const SCRYPT_R = 8
const SCRYPT_P = 1
const SALT_LEN = 16

/**
 * Hash a password with a random salt using scrypt.
 * Returns a self-describing string: `scrypt$<salt-hex>$<hash-hex>`.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LEN)
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  })
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`
}

/**
 * Verify a plaintext password against a portable scrypt hash string.
 * Constant-time comparison guards against timing oracles.
 */
export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false
  let salt: Buffer
  let expectedHash: Buffer
  try {
    salt = Buffer.from(parts[1], 'hex')
    expectedHash = Buffer.from(parts[2], 'hex')
  } catch {
    return false
  }
  if (expectedHash.length === 0) return false
  const actualHash = scryptSync(password, salt, expectedHash.length, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  })
  return (
    actualHash.length === expectedHash.length &&
    timingSafeEqual(actualHash, expectedHash)
  )
}
