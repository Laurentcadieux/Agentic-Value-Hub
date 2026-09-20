# Architecture

## Overview

Agentic Value Hub is a full-stack application deployed on the existing hybrid infrastructure (DigitalOcean + Proxmox). The shared infrastructure provides SSL termination, VPN connectivity, and Nginx reverse proxying. This repo contains only the application code.

## Server Topology

```
                    ┌─────────────────────────────────────────┐
                    │  Shared Infrastructure (My_Hybrid_infra)│
                    │                                         │
   Internet ──────▶ │  DO Nginx Edge (137.184.59.186)        │
   laurentcadieux   │  ├── SSL (Let's Encrypt)              │
   .online/avh     │  ├── Serves React build (dist/)       │
                    │  └── /api/ → proxy to app VM via VPN   │
                    └──────────────┬──────────────────────────┘
                                   │ WireGuard VPN
                    ┌──────────────┼──────────────────────────┐
                    │  Proxmox hyper101 (On-Prem, Private)  │
                    │              │                          │
                    │  ┌───────────┴──────────┐               │
                    │  │  app-avh VM          │               │
                    │  │  Node.js 20 + Express │               │
                    │  │  192.168.0.X:3000    │               │
                    │  └───────────┬──────────┘               │
                    │              │ TCP 5432                 │
                    │  ┌───────────┴──────────┐               │
                    │  │  db-avh VM           │               │
                    │  │  PostgreSQL 16       │               │
                    │  │  192.168.0.Y:5432    │               │
                    │  └──────────────────────┘               │
                    └─────────────────────────────────────────┘
```

## Data Flow

```
Visitor → https://laurentcadieux.online/avh
  → DO Nginx serves frontend/dist/index.html (React app)
  → React app calls /api/* for data
  → DO Nginx proxies /api/* to app-avh VM (192.168.0.X:3000) via WireGuard
  → app-avh Node.js queries db-avh PostgreSQL (192.168.0.Y:5432)
  → Response flows back to visitor
```

## What Lives Where

| Component | Location | Repo |
|-----------|----------|------|
| React source code | This repo `frontend/` | Agentic-Value-Hub |
| Node.js API source | This repo `backend/` | Agentic-Value-Hub |
| SQL migrations | This repo `database/` | Agentic-Value-Hub |
| DO Nginx config | Shared infra | My_Hybrid_infra |
| WireGuard VPN | Shared infra | My_Hybrid_infra |
| Terraform (VMs) | Shared infra | My_Hybrid_infra |
| Ansible (deploy) | Shared infra | My_Hybrid_infra |

## Scaling

- **App VM**: can be scaled by adding more VMs and updating the Nginx upstream (managed in infra repo)
- **Database**: can add read replicas on Proxmox
- **Frontend**: stateless, served from DO Nginx (shared edge handles load)
