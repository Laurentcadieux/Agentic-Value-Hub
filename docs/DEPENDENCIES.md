# Dependencies

## Application Stack

```
frontend (React 19 + Vite 6 + TypeScript)
    │
    │  HTTP /api/* requests
    ▼
backend (Node.js 20 + Express + TypeScript)
    │
    │  SQL queries (TCP 5432)
    ▼
database (PostgreSQL 16)
```

## Frontend → Backend

| Dependency | How | Config |
|------------|-----|--------|
| API URL | Frontend calls `/api/*` | Nginx proxies `/api/` to app VM via VPN |
| Auth | JWT in Authorization header | Backend validates |
| WebSocket | Optional, via Nginx upgrade | Nginx `proxy_http_version 1.1` |

## Backend → Database

| Dependency | How | Config |
|------------|-----|--------|
| Connection string | `postgresql://user:pass@<db-vm-ip>:5432/avh` | `DATABASE_URL` env var |
| Migrations | Run on deploy | `npm run db:migrate` |
| Pooling | pg Pool (max 10 connections) | Backend manages |

## Server Dependencies

| Server | Software | Version | Installed By |
|--------|----------|---------|-------------|
| App VM | Node.js | 20 LTS | Ansible (infra repo) |
| App VM | npm | 10+ | bundled with Node.js |
| DB VM | PostgreSQL | 16 | Ansible (infra repo) |
| DB VM | pg_dump (backups) | 16 | bundled |

## External Dependencies

| Service | Purpose | Managed By |
|---------|---------|------------|
| DO Nginx edge | SSL, static file serving, /api proxy | Shared infra repo |
| WireGuard VPN | DO ↔ Proxmox connectivity | Shared infra repo |
| Let's Encrypt | SSL certificates | Shared infra repo |
| GitHub | Source code, CI/CD | This repo |

## Environment Variables

### Frontend (build-time, baked into Vite build)
```
VITE_API_URL=/api
```

### Backend (runtime, on app VM)
```
DATABASE_URL=postgresql://avh:PASSWORD@192.168.0.X:5432/avh
PORT=3000
NODE_ENV=production
JWT_SECRET=...
```

### Database (on DB VM)
```
POSTGRES_DB=avh
POSTGRES_USER=avh
POSTGRES_PASSWORD=...
```

## What This Repo Does NOT Include

- Terraform (infrastructure lives in My_Hybrid_infra)
- Nginx config (managed by shared DO edge)
- WireGuard config (managed by shared VPN VM)
- SSL certificates (managed by shared DO edge)
- Firewall rules (managed by shared infra)
