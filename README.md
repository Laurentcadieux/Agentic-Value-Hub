# Agentic Value Hub

Full-stack web application with React frontend, Node.js backend, and PostgreSQL database.

## Architecture

```
Internet → DO Nginx (shared edge, SSL) → WireGuard VPN → Proxmox VMs
                                                         ├── app-avh  (Node.js API)
                                                         └── db-avh   (PostgreSQL)
```

## Server Types

| Server | Role | Location | Tech | Port |
|--------|------|----------|------|------|
| Web (shared) | SSL termination, serve React build, proxy /api | DigitalOcean | Nginx | 443 |
| App | Node.js backend API | Proxmox hyper101 | Node.js 20 + Express | 3000 |
| Database | PostgreSQL | Proxmox hyper101 | PostgreSQL 16 | 5432 |

## Repository Structure

```
Agentic-Value-Hub/
├── frontend/              # React app (Vite + TypeScript)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/               # Node.js API server
│   ├── src/
│   ├── package.json
│   └── .env.example
├── database/              # PostgreSQL schema and migrations
│   ├── migrations/
│   └── seed/
├── deploy/               # Deployment configurations
│   ├── docker-compose.yml
│   ├── nginx-app.conf
│   └── .env.example
├── docs/                 # Architecture and dependency documentation
│   ├── ARCHITECTURE.md
│   ├── DEPENDENCIES.md
│   └── DEPLOYMENT.md
├── .gitignore
└── README.md
```

## Dependencies

See [docs/DEPENDENCIES.md](docs/DEPENDENCIES.md) for the full dependency graph.

## Deployment

Deployment is managed by the [My_Hybrid_infra](https://github.com/Laurentcadieux/My_Hybrid_infra) repo:

1. **Terraform** creates the Proxmox VMs (app + database)
2. **Ansible** installs Node.js, PostgreSQL, deploys the code
3. **DO Nginx** (shared) serves the React build and proxies /api to the app VM

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed deployment instructions.

## Development

```bash
# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npm run dev

# Database (requires local PostgreSQL or Docker)
cd database && psql -U postgres -f migrations/001_init.sql
```
