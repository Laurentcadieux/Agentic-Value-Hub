# Agentic Value Hub

Full-stack web application built with Next.js 15 (App Router), React 19,
TypeScript, Tailwind CSS 4, Prisma 6, and PostgreSQL. It tracks the agentic
AI market, catalogs enterprise use cases, and helps teams turn opportunities
into quantified business cases.

## Architecture

```
Internet → DO Nginx (shared edge, TLS) → WireGuard VPN → Proxmox VMs
                                                       ├── app-avh  (Next.js standalone + PM2)
                                                       └── db-avh   (PostgreSQL 16)
```

| Layer | Host | Tech | Port |
|------|------|------|------|
| TLS termination, static + /api proxy | DigitalOcean (shared) | Nginx | 443 |
| Next.js standalone server | Proxmox hyper101 (app-avh) | Node.js 20 + PM2 | 127.0.0.1:3000 |
| Database | Proxmox hyper101 (db-avh) | PostgreSQL 16 + pgvector | 5432 (VPN only) |

## Repository structure

```
Agentic-Value-Hub/
├── src/
│   ├── app/                # App Router pages + API routes
│   ├── components/         # React components
│   ├── lib/                # env, prisma, seo, rate-limit, ai, value
│   ├── repositories/       # data access layer
│   └── services/          # business logic layer
├── prisma/                 # schema.prisma, migrations, seed
├── deploy/
│   ├── avh-nginx.conf      # Nginx config for the standalone server
│   └── ecosystem.config.cjs  # PM2 process config
├── docs/
│   ├── NEWS_MANAGEMENT.md       # news API guide (CRUD, fields, visibility)
│   ├── USE_CASE_MANAGEMENT.md   # use case API guide (CRUD, fields, visibility, BOAT)
│   ├── CONTENT_API.md           # technical API reference
│   ├── PRODUCTION.md            # production guide (DB, backups, monitoring)
│   ├── SECURITY.md              # security checklist, headers, rate limiting
│   └── DEPLOYMENT.md            # step-by-step deploy via My_Hybrid_infra
├── next.config.ts          # standalone output + security headers
├── src/middleware.ts       # /api rate limiting
└── .env.example           # all environment variables documented
```

## Development

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL and secrets
npx prisma migrate dev
npm run dev                 # http://localhost:3000
```

Scripts: `npm run dev` · `npm run build` · `npm start` · `npm run lint` ·
`npm run typecheck` · `npm test` (Vitest).

## Production deployment

The Hub is deployed to Proxmox VMs provisioned by the
[`My_Hybrid_infra`](https://github.com/Laurentcadieux/My_Hybrid_infra) repo
(Terraform → VMs, Ansible → install/configure), fronted by a shared
DigitalOcean Nginx edge.

- **Step-by-step deploy:** [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)
- **Production operations (PostgreSQL, backups, monitoring, performance,
  accessibility):** [`docs/PRODUCTION.md`](docs/PRODUCTION.md)
- **Security (headers, rate limiting, secrets, incident
  response):** [`docs/SECURITY.md`](docs/SECURITY.md)

Quick summary:

1. Build the standalone artifact: `npm ci && npx prisma generate && npm run build`
   → `.next/standalone/server.js`.
2. Provision `app-avh` + `db-avh` via `My_Hybrid_infra` Terraform/Ansible.
3. Run `prisma migrate deploy` against the prod DB over the WireGuard VPN.
4. Ship the artifact to `/opt/agentic-value-hub` on `app-avh`; supply secrets
   via a `600`-mode `EnvironmentFile` (no `NEXT_PUBLIC_` secrets).
5. `pm2 start deploy/ecosystem.config.cjs --env production` (binds to
   `127.0.0.1:3000`).
6. Install `deploy/avh-nginx.conf`, run certbot, reload Nginx.
7. Point Uptime Kuma at `/api/health`; enable daily `pg_dump` backups.

The pre-release gate is:

```bash
npx tsc --noEmit && npx next lint && npx next build
```

All three must pass clean with `output: 'standalone'` enabled
(`next.config.ts`).

## Content APIs

The Hub has two independent content APIs, both at `https://agenticvaluehub.com/api/v1`:

### News API

Full CRUD for news articles. All fields are public (no hidden fields).

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/api/v1/news` | ✅ | Create article |
| GET | `/api/v1/news` | ❌ | List articles |
| GET | `/api/v1/news/:id` | ❌ | Get single |
| PATCH | `/api/v1/news/:id` | ✅ | Update |
| DELETE | `/api/v1/news/:id` | ✅ | Delete |

📖 **Full guide:** [`docs/NEWS_MANAGEMENT.md`](docs/NEWS_MANAGEMENT.md) — all fields, visibility, examples, AI workflow.

### Use Cases API

Full CRUD for enterprise AI use cases. Stores all data but only shows **generic** info publicly — sensitive fields (submitter info, risks, controls, systems) are hidden without auth.

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/api/v1/use-cases` | ✅ | Create use case |
| GET | `/api/v1/use-cases` | ❌/✅ | List (public fields without auth, all with auth) |
| GET | `/api/v1/use-cases/:id` | ❌/✅ | Get single (public/auth) |
| PATCH | `/api/v1/use-cases/:id` | ✅ | Update |
| DELETE | `/api/v1/use-cases/:id` | ✅ | Delete |

📖 **Full guide:** [`docs/USE_CASE_MANAGEMENT.md`](docs/USE_CASE_MANAGEMENT.md) — all fields, visibility flags, Gartner BOAT capabilities, metrics, examples.

### Image Upload

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/api/v1/upload` | ✅ | Upload image (JPG, PNG, WebP, GIF, SVG, max 10MB) |

### Auth Token

Both APIs use the same Bearer token: `NEWS_INGEST_API_KEY` (set in `.env` on the VM).

---

## Legal pages

- [Privacy Policy](https://agenticvaluehub.com/privacy)
- [Terms of Service](https://agenticvaluehub.com/terms)

> The legal pages are production-quality templates. Have counsel review them
> before live use.