# Security — Agentic Value Hub

Security posture, checklist, and operational rules for the Agentic Value Hub
(AVH). Production deployment details live in [`docs/PRODUCTION.md`](./PRODUCTION.md).

## 1. Secrets management

| Rule | Why |
|------|-----|
| Never commit secrets to the repo (`.gitignore` excludes `.env`). | Avoids credential leaks via git history. |
| **No `NEXT_PUBLIC_` secrets.** Any `NEXT_PUBLIC_*` var is inlined into the client JS bundle and shipped to every browser. | Client bundles are public; secrets there are not secret. |
| Generate long random values: `openssl rand -base64 48`. | Brute-force resistance for `NEXTAUTH_SECRET`, `NEWS_INGEST_API_KEY`. |
| Provide secrets at runtime via systemd `EnvironmentFile` or a secrets manager (Vault / Ansible Vault). | Reproducible, auditable, rotatable. |
| Rotate secrets on a schedule and on team turnover. | Limits blast radius of any unknown leak. |
| The DB password in `DATABASE_URL` is a distinct secret from app secrets. | DB compromise does not hand over app tokens and vice versa. |
| Use `sslmode=require` (or `verify-full`) in `DATABASE_URL` for prod. | Encrypts DB traffic on the WireGuard network. |

### NEXT_PUBLIC_ audit

Before each release, confirm no secret is exposed:

```bash
# Fail if any NEXT_PUBLIC_ var looks like a secret/key/token/secret/password.
grep -rnE 'NEXT_PUBLIC_[A-Z_]*(KEY|SECRET|TOKEN|PASSWORD)' src/ .env.example || true
```

Only non-secret, browser-safe values may use `NEXT_PUBLIC_`
(e.g. `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `NEXT_PUBLIC_SITE_URL`). Secret values
are read server-side only via `process.env` / the validated `env` object in
`src/lib/env.ts`.

## 2. Security headers

Set in `next.config.ts` (applied to every route) and reinforced at the edge
in `deploy/avh-nginx.conf`:

| Header | Value | Purpose |
|--------|-------|---------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | Force HTTPS |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-Content-Type-Options` | `nosniff` | MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), interest-cohort=()` | Disable unneeded APIs + FLoC |
| `Content-Security-Policy` | see `next.config.ts` | Injection / data exfil |
| `X-Powered-By` | (removed via `poweredByHeader: false`) | Reduce fingerprinting |

### Content Security Policy

Current CSP (strict where possible):

```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self' https:;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
upgrade-insecure-requests;
```

`'unsafe-inline'` is currently required for `script-src` and `style-src`
because Next.js emits inline runtime chunks and the theme-init script in
`src/app/layout.tsx`.

**Upgrade path (nonce-based CSP):**

1. In `src/middleware.ts`, generate a per-request nonce (`crypto.randomUUID()`)
   and attach it to the request headers.
2. In `next.config.ts`, set `script-src 'self' 'nonce-{NONCE}'` (drop
   `'unsafe-inline'`) and `style-src 'self' 'nonce-{NONPE}'`.
3. Configure Next.js to apply the nonce to its emitted scripts/styles via
   the `experimental: { nonce: true }` option and read the nonce in
   `layout.tsx` for the inline theme script (replace
   `dangerouslySetInnerHTML` with a nonce-tagged `<script>`).

This removes `'unsafe-inline'` entirely. Document the change here once done.

## 3. Rate limiting

Two layers, both per-IP sliding windows (`src/lib/rate-limit.ts`):

| Layer | Where | Runtime | Limit (default) | Key |
|-------|-------|---------|-----------------|-----|
| Global /api ceiling | `src/middleware.ts` | Edge | 120 / min | `api:<ip>` |
| Health route | `src/app/api/health/route.ts` | Node | 60 / min | `health:<ip>` |
| News ingestion | `src/app/api/v1/news/route.ts` | Node | 30 / min | `news:<ip>` |

Tunable without code via env (optional): `RATE_LIMIT_GLOBAL_PER_MIN`,
`RATE_LIMIT_HEALTH_PER_MIN`, `RATE_LIMIT_NEWS_PER_MIN`.

Responses carry `X-RateLimit-Limit`, `X-RateLimit-Remaining`,
`X-RateLimit-Reset`, and on rejection a `Retry-After` header.

### In-memory caveat

The limiter state lives in the process that imports the module. Middleware
(Edge) and route handlers (Node) maintain independent counters — this is
intentional defense in depth, not double-counting. With PM2 fork mode and a
single instance this is correct. To scale horizontally:

- Replace the `buckets` Map in `src/lib/rate-limit.ts` with a shared store
  (Redis, Upstash) keeping the same `rateLimit({ key, limit, windowMs })`
  signature. Then run multiple PM2 instances / containers.

### IP extraction

`getClientIp()` reads `X-Forwarded-For` (set by Nginx) first, then
`X-Real-IP`, then falls back to `"unknown"`. Ensure Nginx overwrites
`X-Forwarded-For` (it does via `$proxy_add_x_forwarded_for`) so a client
cannot spoof a permissive IP.

## 4. Authentication & authorization

- News ingestion requires `Authorization: Bearer <NEWS_INGEST_API_KEY>`
  (constant-time comparison can be added; the current `===` check is
  acceptable for an opaque bearer token but note it for hardening).
- NextAuth session secrets are kept server-side; the session cookie is
  `httpOnly`, `secure` in production.
- Apply the principle of least privilege to the `avh` DB role.

## 5. Dependency hygiene

```bash
npm audit --omit=dev        # review advisories before each release
npx better-npm-audit || npm audit fix
```

Pin major versions in `package.json` (already done). Review transitive
deps on `npm install`.

## 6. Operational checklist (pre-release)

- [ ] `npx tsc --noEmit && npx next lint && npx next build` all pass.
- [ ] No `NEXT_PUBLIC_` secret (audit command above returns nothing).
- [ ] `.env` / `EnvironmentFile` populated; no secrets in git.
- [ ] `output: 'standalone'` confirmed; artifact contains
      `.next/standalone/server.js`.
- [ ] Rate-limit 429 path tested on `/api/health` and `/api/v1/news`.
- [ ] Security headers present (check with
      `curl -sI https://agenticvaluehub.com | grep -iE 'content-security|x-frame|strict-transport'`).
- [ ] HSTS preload eligibility (served over HTTPS on the apex domain).
- [ ] Uptime Kuma monitors green; alerts wired.
- [ ] DB backup job ran; test restore verified.
- [ ] `/privacy` and `/terms` reachable from the footer.

## 7. Incident response (short)

1. Rotate `NEXTAUTH_SECRET`, `NEWS_INGEST_API_KEY`, and the DB password.
2. Revoke and re-issue API tokens. Force re-login (session invalidation).
3. Pull relevant logs from `/var/log/agentic-value-hub/` and Nginx.
4. If data exfiltration suspected, restore from the last known-good backup
   after取证 and notify affected users per policy.
