import { headers } from 'next/headers'
import type { NextRequest } from 'next/server'

/**
 * Phase 7 — Administration authorization.
 *
 * The full NextAuth session (Phase 6) is not wired into this build, so this
 * module provides a lightweight, role-based admin guard that mirrors the
 * existing news-ingest bearer-token pattern (`NEWS_INGEST_API_KEY`).
 *
 * Authorization rules:
 *  - If `ADMIN_API_KEY` is set in the environment, admin access requires a
 *    matching `Authorization: Bearer <token>` header or an `admin_token`
 *    cookie. This enforces admin-only access in production deployments.
 *  - If `ADMIN_API_KEY` is NOT set, access is allowed in "development mode"
 *    so local development, CI, and `next build` work without secrets. The
 *    UI surfaces a banner so this is never mistaken for real authorization.
 *
 * When the Phase 6 NextAuth session is available it can be layered in here
 * (e.g. require `session.user.role === 'ADMIN'`) without touching call sites.
 */

export interface AdminContext {
  authorized: boolean
  devMode: boolean
  reason?: string
}

/** Returns the configured admin token, or undefined when not set. */
export function getAdminTokenFromEnv(): string | undefined {
  const token = process.env.ADMIN_API_KEY
  return token && token.length > 0 ? token : undefined
}

function parseCookieToken(cookieHeader: string): string | undefined {
  const match = cookieHeader.match(/(?:^|;\s*)admin_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : undefined
}

/**
 * Admin guard for server-component pages. Reads request headers via the
 * `next/headers` helper (forces dynamic rendering).
 */
export async function requireAdmin(): Promise<AdminContext> {
  const envToken = getAdminTokenFromEnv()
  if (!envToken) {
    return {
      authorized: true,
      devMode: true,
      reason: 'ADMIN_API_KEY not set — admin authorization disabled (development mode).',
    }
  }

  const h = await headers()
  const authHeader = h.get('authorization') ?? ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const cookieToken = parseCookieToken(h.get('cookie') ?? '')

  if (bearer === envToken || (cookieToken !== undefined && cookieToken === envToken)) {
    return { authorized: true, devMode: false }
  }

  return {
    authorized: false,
    devMode: false,
    reason: 'Missing or invalid admin token. Provide a Bearer token or admin_token cookie.',
  }
}

/**
 * Admin guard for route handlers and server actions that already hold the
 * `NextRequest` object.
 */
export function requireAdminRequest(request: NextRequest): AdminContext {
  const envToken = getAdminTokenFromEnv()
  if (!envToken) {
    return {
      authorized: true,
      devMode: true,
      reason: 'ADMIN_API_KEY not set — admin authorization disabled (development mode).',
    }
  }

  const authHeader = request.headers.get('authorization') ?? ''
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
  const cookieToken = parseCookieToken(request.headers.get('cookie') ?? '')

  if (bearer === envToken || (cookieToken !== undefined && cookieToken === envToken)) {
    return { authorized: true, devMode: false }
  }

  return {
    authorized: false,
    devMode: false,
    reason: 'Missing or invalid admin token. Provide a Bearer token or admin_token cookie.',
  }
}

/** Admin guard for server actions (reads headers via `next/headers`). */
export async function requireAdminAction(): Promise<AdminContext> {
  return requireAdmin()
}
