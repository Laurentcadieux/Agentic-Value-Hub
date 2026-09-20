# Production Deployment Guide — Agentic Value Hub

This guide covers taking the Agentic Value Hub (AVH) from a clean build to a
running production deployment on the Proxmox VM provisioned by the
[`My_Hybrid_infra`](https://github.com/Laurentcadieux/My_Hybrid_infra) repo,
fronted by a shared DigitalOcean Nginx edge, with PostgreSQL, backups,
monitoring, and process management.

For the step-by-step infrastructure provisioning, see
[`docs/DEPLOYMENT.md`](./DEPLOYMENT.md). For security controls, see
[`docs/SECURITY.md`](./SECURITY.md).

## 1. Target architecture

```
Internet → DO Nginx (shared edge, TLS) → WireGuard VPN → Proxmox VMs
                                                       ├── app-avh   (Next.js standalone + PM2)
                                                       └── db-avh    (PostgreSQL 16)
```

| Layer | Host | Software | Listens on |
|------|------|----------|-----------|
| TLS termination, static + /api proxy | DO droplet (shared) | Nginx | 443 |
| Next.js standalone server | Proxmox VM `app-avh` | Node.js 20, PM2 | 127.0.0.1:3000 |
| Database | Proxmox VM `db-avh` | PostgreSQL 16 | 5432 (VPN only) |
| Monitoring | Proxmox VM / DO | Uptime Kuma | internal |

The Next.js app is built with `output: 'standalone'` (see `next.config.ts`),
which produces a self-contained `.next/standalone/server.js` plus a minimal
`node_modules`. The app VM only needs Node.js + the standalone bundle + the
`.next/static` directory — no full `npm install` at runtime.

## 2. Build

On a build host (or CI) with the repo checked out:

```bash
npm ci
npx prisma generate
npm run build          # next build → .next/standalone + .next/static
```

The deployable artifact is the standalone bundle:

```
.next/standalone/      # server.js + trimmed node_modules
.next/static/         # must be copied next to .next/standalone/.next/static
public/                # copied into .next/standalone/public
```

Package for transfer:

```bash
tar -czf avh-standalone.tgz \
  -C .next/standalone . \
  -C ../.. .next/static \
  -C .. public
```

(Adjust paths so that on the app VM the layout is
`/opt/agentic-value-hub/server.js` and
`/opt/agentic-value-hub/.next/static/`.)

## 3. Production PostgreSQL

Provisioned by `My_Hybrid_infra` on the `db-avh` VM. PostgreSQL 16, listening
on the WireGuard interface only.

```bash
# On db-avh:
sudo -u postgres createuser -P avh
sudo -u postgres createdb -O avh agentic_value_hub
# pgvector extension is required by later phases for semantic search:
sudo -u postgres psql -d agentic_value_hub -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

Set the `DATABASE_URL` (see `.env.example`). Run migrations on the app VM
or a CI runner with network access to the DB over the VPN:

```bash
DATABASE_URL="postgresql://avh:***@10.x.x.x:5432/agentic_value_hub?schema=public" \
  npx prisma migrate deploy
```

### Connection hardening

- TLS between app and DB: enable `sslmode=require` (or `verify-full`) in
  `DATABASE_URL` once the DB cert is in place.
- Connection pooling: use PgBouncer (transaction mode) if you scale beyond
  a single app process.
- The `avh` role has the minimum privileges: full CRUD on the
  `agentic_value_hub` database, no superuser, no replication.

## 4. Database backups

Daily logical backups via `pg_dump`, rotated by `pgBackRest` or a simple
`cron` + `logrotate`:

```cron
# /etc/cron.d/avh-pgdump — daily 03:00, keep 14 days locally, ship to S3
0 3 * * * postgres pg_dump -Fc agentic_value_hub | \
  /usr/local/bin/rclone rcat s3:avh-backups/$(date +\%F).dump
0 4 * * * postgres find /var/backups/avh -name '*.dump' -mtime +14 -delete
```

Recommended:

- **Frequency:** daily logical dump + continuous WAL archiving (PITR) via
  `pgBackRest` for point-in-time recovery.
- **Retention:** 14 daily, 4 weekly, 6 monthly; verify restore quarterly.
- **Off-site:** copy backups to object storage (S3/DO Spaces) with
  encryption-at-rest and a separate lifecycle/bucket policy.
- **Test restore:** schedule a monthly restore into a staging DB and run
  `prisma migrate status` to confirm schema integrity.

## 5. Secrets management

All secrets are environment variables provided at runtime. They are **not**
committed. Supply them via the systemd EnvironmentFile on the app VM, or via
your secrets manager (e.g. HashiCorp Vault, Ansible Vault in
`My_Hybrid_infra`).

Critical rules:

1. **No `NEXT_PUBLIC_` secrets.** Any variable prefixed with `NEXT_PUBLIC_`
   is inlined into the client bundle and shipped to every browser. Use it
   only for non-secret public values (e.g. a Plausible domain). Verified by
   the checklist in `docs/SECURITY.md`.
2. `NEXTAUTH_SECRET` and `NEWS_INGEST_API_KEY` must be long random strings
   (`openssl rand -base64 48`).
3. Rotate secrets on a schedule and on team turnover.
4. The `DATABASE_URL` password is a distinct secret from the app secrets.

## 6. Monitoring (Uptime Kuma)

Point an Uptime Kuma monitor at the health endpoint:

- **Monitor type:** HTTP(s)
- **URL:** `https://agenticvaluehub.com/api/health`
- **Expected status:** 200
- **Keyword (optional):** `"ok"` in the body
- **Interval:** 60 s
- **Notifications:** email / webhook / Pushover into the on-call channel

Add a second monitor for the database:

- **Monitor type:** TCP / Postgres ping against `db-avh:5432` (internal)
- **Interval:** 60 s

Alert on any non-200 from `/api/health` for 2 consecutive checks, and on
DB unreachability for 1 check.

## 7. Analytics

A privacy-respecting, cookieless analytics placeholder is wired in
`src/components/Analytics.tsx`. It emits nothing by default. To enable,
set `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (or your provider equivalent) and
uncomment the snippet in the component. Only non-secret measurement IDs go
in `NEXT_PUBLIC_*` variables.

## 8. Accessibility validation (WCAG 2.1 AA)

Run before each release:

```bash
npx @axe-core/cli http://localhost:3000 --tags wcag2aa
npx pa11y http://localhost:3000 --standard WCAG2AA
npx lighthouse http://localhost:3000 --only-categories=accessibility --view
```

Manual checks:

- Keyboard-only navigation reaches all interactive elements with a visible
  focus ring.
- Color contrast ≥ 4.5:1 for body text (the editorial palette in
  `globals.css` meets this in both light and dark themes).
- `prefers-reduced-motion` is respected (smooth-scroll disabled in
  `globals.css`).
- Every form input has an associated `<label>` (applies once forms land in
  later phases).

## 9. Performance testing

```bash
# Lighthouse CI
npx @lhci/cli autorun --collect.url=http://localhost:3000 \
  --assert.preset=lighthouse:recommended

# Load test the API rate limiter and health route
npx autocannon -c 50 -d 30 https://agenticvaluehub.com/api/health
npx autocannon -c 20 -d 30 -m POST \
  -H "Authorization: Bearer $NEWS_INGEST_API_KEY" \
  -b '{"slug":"t","headline":"t"}' \
  https://agenticvaluehub.com/api/v1/news
```

Targets:

- LCP < 2.5 s, INP < 200 ms, CLS < 0.1 (Core Web Vitals — Good).
- `/api/health` p99 < 50 ms at 50 RPS.
- News ingestion degrades gracefully under the rate cap (HTTP 429 with
  `retry-after`, no 500s).

## 10. Production build verification

The build gate before every release:

```bash
npx tsc --noEmit && npx next lint && npx next build
```

All three must pass clean. `output: 'standalone'` is required and present in
`next.config.ts`. Confirm the artifact contains
`.next/standalone/server.js`.

## 11. Process management (PM2)

`deploy/ecosystem.config.cjs` runs the standalone server under PM2 in fork
mode, bound to `127.0.0.1:3000`. Single instance because the in-memory
rate limiter is per-process.

```bash
pm2 start deploy/ecosystem.config.cjs --env production
pm2 save && pm2 startup systemd   # enable boot-time auto-restart
pm2 log agentic-value-hub          # tail logs
pm2 restart agentic-value-hub      # after each deploy
```

PM2 emits structured logs to `/var/log/agentic-value-hub/`.

## 12. Nginx edge

`deploy/avh-nginx.conf` is the app-VM-facing Nginx config (TLS, gzip, static
caching, proxy to the standalone server). The shared DO edge Nginx
terminates TLS for the public domain and proxies to the app VM over the
WireGuard VPN. See `docs/DEPLOYMENT.md` for the full request path.
