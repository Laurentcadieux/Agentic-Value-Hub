/**
 * NextAuth catch-all route handler (App Router).
 *
 * Auth logic runs in the Node runtime because the credentials provider
 * reaches the Prisma client + the file-backed credential store (node:fs).
 */

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
