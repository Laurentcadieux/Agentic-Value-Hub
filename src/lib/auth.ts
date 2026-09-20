/**
 * Auth.js (NextAuth v4) configuration — credentials provider, abstracted.
 *
 * The installed `next-auth` is v4.24.x (the v5 beta requires a package.json
 * change this phase is not permitted to make). The config below uses the v4
 * App Router API but is structured so the provider + callbacks can be swapped
 * for the v5 shape with minimal changes.
 *
 *   - JWT session strategy. The credentials provider cannot use DB sessions,
 *     and the Prisma schema has no Account/Session/VerificationToken models for
 *     the @auth/prisma-adapter (and the schema cannot be modified this phase).
 *   - Password hashes live in the pluggable CredentialStore (no password
 *     column on User); see src/lib/auth/credential-store.ts.
 *   - The session is enriched with `userId`, `customerId` and `role` for
 *     tenant scoping via the jwt/session callbacks.
 *
 * Reads secrets directly from `process.env` (not the validated `env` object)
 * so importing this module never throws at build time when env vars are unset.
 */

import type { NextAuthOptions, DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { UserRole } from '@prisma/client'
import { validateCredentials } from '@/lib/auth/credentials'

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET ?? ''

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret: NEXTAUTH_SECRET,
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email
        const password = credentials?.password
        if (!email || !password) return null
        const user = await validateCredentials(email, password)
        if (!user) return null
        const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
        return {
          id: user.id,
          email: user.email,
          name: name || undefined,
          customerId: user.customerId,
          role: user.role as UserRole,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // `user` is the object returned by authorize() — present on first
      // sign-in only. Persist the tenant + role onto the JWT so subsequent
      // requests (where `user` is undefined) still carry them.
      if (user) {
        token.userId = user.id
        token.customerId = user.customerId
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      const userId = token.userId
      const customerId = token.customerId
      const role = token.role
      if (session.user && userId && customerId && role) {
        session.user.id = userId
        session.user.customerId = customerId
        session.user.role = role
      }
      return session
    },
  },
}

// --- Module augmentation: carry tenant + role through the typed session. ---
declare module 'next-auth' {
  interface User {
    customerId?: string
    role?: UserRole
  }
  interface Session {
    user: {
      id: string
      customerId: string
      role: UserRole
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId?: string
    customerId?: string
    role?: UserRole
  }
}
