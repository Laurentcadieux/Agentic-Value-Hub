# Deployment — Agentic Value Hub

Step-by-step deployment using the
[`My_Hybrid_infra`](https://github.com/Laurentcadieux/My_Hybrid_infra) repo
(Terraform → Proxmox VMs, Ansible → install + configure). Production
architecture and operational practices live in
[`docs/PRODUCTION.md`](./PRODUCTION.md); security in
[`docs/SECURITY.md`](./SECURITY.md).

## Prerequisites

- Proxmox host `hyper101` reachable.
- `My_Hybrid_infra` checked out locally with the AVH module enabled.
- A domain (`agenticvaluehub.com`) with DNS A records pointing at the shared
  DigitalOcean Nginx edge.
- Object storage credentials for DB backups (S3 / DO Spaces).
- Secrets generated:
  ```bash
  openssl rand -base64 48   # NEXTAUTH_SECRET
  openssl rand -base64 48   # NEWS_INGEST_API_KEY
  ```
- A PostgreSQL password for the `avh` role.

## Step 1 — Provision the VMs

In `My_Hybrid_infra`, run the AVH Terraform module to create two Proxmox VMs
on `hyper101`:

```bash
cd My_Hybrid_infra/terraform/avh
terraform init
terraform plan  -var "avh_domain=agenticvaluehub.com"
terraform apply -var "avh_domain=agenticvaluehub.com"
```

This provisions:

| VM | Role | Network |
|----|------|---------|
| `app-avh` | Next.js standalone server + PM2 | WireGuard VPN, outbound |
| `db-avh`  | PostgreSQL 16 | WireGuard VPN only, port 5432 to `app-avh` |

WireGuard connects the DO edge droplet and both Proxmox VMs. Note the VPN IPs
(e.g. `app-avh = 10.x.x.10`, `db-avh = 10.x.x.11`).

## Step 2 — Configure PostgreSQL on `db-avh`

Ansible installs PostgreSQL 16 and the `pgvector` extension:

```bash
cd My_Hybrid_infra/ansible
ansible-playbook playbooks/avh-db.yml \
  -e pg_password="$AVH_DB_PASSWORD" \
  -e pg_listen_addr="10.x.x.11"
```

Then create the database and user (or let the playbook do it):

```bash
ssh app-avh  # then:
sudo -u postgres psql <<SQL
CREATE USER avh WITH ENCRYPTED PASSWORD '<AVH_DB_PASSWORD>';
CREATE DATABASE agentic_value_hub OWNER avh;
\c agentic_value_hub
CREATE EXTENSION IF NOT EXISTS vector;
SQL
```

Restrict `pg_hba.conf` so only `app-avh` (over WireGuard) can connect, with
`sslmode=require`.

## Step 3 — Build the artifact

On a build host (or CI runner) with the AVH repo:

```bash
cd Agentic-Value-Hub
npm ci
npx prisma generate
npm run build
```

Package the standalone output:

```bash
mkdir -p pkg/.next
cp -a .next/standalone/. pkg/
cp -a .next/static        pkg/.next/static
cp -a public             pkg/public
cp -a prisma             pkg/prisma        # migrations
cp -a deploy             pkg/deploy
tar -czf avh-<git-sha>.tgz -C pkg .
```

## Step 4 — Run migrations

From the build host (or `app-avh`), with VPN access to `db-avh`:

```bash
export DATABASE_URL="postgresql://avh:$AVH_DB_PASSWORD@10.x.x.11:5432/agentic_value_hub?schema=public&sslmode=require"
npx prisma migrate deploy
npx prisma db seed   # if a seed exists
```

## Step 5 — Deploy to `app-avh`

Copy the artifact and extract:

```bash
scp avh-<git-sha>.tgz app-avh:/tmp/
ssh app-avh '
  sudo mkdir -p /opt/agentic-value-hub
  sudo tar -xzf /tmp/avh-<git-sha>.tgz -C /opt/agentic-value-hub
  sudo chown -R avh:avh /opt/agentic-value-hub
'
```

Create the secrets environment file (Ansible Vault is the preferred path in
`My_Hybrid_infra`):

```bash
ssh app-avh 'sudo tee /etc/agentic-value-hub.env' <<EOF
NODE_ENV=production
HOSTNAME=127.0.0.1
PORT=3000
DATABASE_URL=postgresql://avh:$AVH_DB_PASSWORD@10.x.x.11:5432/agentic_value_hub?schema=public&sslmode=require
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
NEXTAUTH_URL=https://agenticvaluehub.com
NEWS_INGEST_API_KEY=$NEWS_INGEST_API_KEY
AI_PROVIDER=openai
AI_API_KEY=$AI_API_KEY
AI_MODEL=gpt-4o-mini
EOF
ssh app-avh 'sudo chmod 600 /etc/agentic-value-hub.env'
```

> If you adopt the nonce-based CSP (see `docs/SECURITY.md`), inject
> `NEXTAUTH_URL` and any public vars the same way; never put a secret in a
> `NEXT_PUBLIC_` var.

## Step 6 — Start under PM2

Install Node.js 20 + PM2 (handled by the Ansible `avh-app.yml` playbook),
then:

```bash
ssh app-avh '
  cd /opt/agentic-value-hub
  sudo set -a; . /etc/agentic-value-hub.env; set +a
  pm2 start deploy/ecosystem.config.cjs --env production
  pm2 save
  pm2 startup systemd   # follow the printed command once
'
```

Confirm the app is listening locally:

```bash
ssh app-avh 'curl -s http://127.0.0.1:3000/api/health'
# {"status":"ok","timestamp":"..."}
```

## Step 7 — Configure Nginx

On the app VM (or the shared DO edge, depending on where TLS terminates),
install the site config:

```bash
sudo cp /opt/agentic-value-hub/deploy/avh-nginx.conf /etc/nginx/sites-available/avh
sudo ln -s /etc/nginx/sites-available/avh /etc/nginx/sites-enabled/avh
sudo certbot --nginx -d agenticvaluehub.com -d www.agenticvaluehub.com
sudo nginx -t && sudo systemctl reload nginx
```

If TLS terminates at the shared DO edge, point the edge Nginx `proxy_pass`
at `http://10.x.x.10:3000` (the app VM over WireGuard) and use
`avh-nginx.conf` on the app VM only if it also fronts locally.

Verify end-to-end:

```bash
curl -sI https://agenticvaluehub.com/api/health   # 200 + security headers
```

## Step 8 — Backups

Install the cron job from `docs/PRODUCTION.md` §4 on `db-avh`. Confirm a
backup lands in object storage and a test restore succeeds.

## Step 9 — Monitoring

In Uptime Kuma, add:

- HTTP monitor → `https://agenticvaluehub.com/api/health` (expect 200, `ok`),
  60 s interval.
- TCP/Postgres monitor → `10.x.x.11:5432`, 60 s interval.

Wire notifications to the on-call channel.

## Step 10 — Smoke tests

```bash
# Rate limiter returns 429 under load
for i in $(seq 1 200); do curl -s -o /dev/null -w "%{http_code}\n" \
  https://agenticvaluehub.com/api/health; done | sort | uniq -c

# News ingestion auth + validation
curl -s -X POST https://agenticvaluehub.com/api/v1/news \
  -H "Authorization: Bearer $NEWS_INGEST_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"slug":"t","headline":"t"}'   # 201

curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST https://agenticvaluehub.com/api/v1/news \
  -d '{}'                            # 401 (no token)

# Privacy + terms pages render
curl -sI https://agenticvaluehub.com/privacy | head -1
curl -sI https://agenticvaluehub.com/terms  | head -1
```

## Step 11 — Future deploys (CI/CD)

A repeat deploy is Steps 3–6 only:

1. Build artifact on CI.
2. `scp` + extract to `/opt/agentic-value-hub`.
3. `DATABASE_URL=… npx prisma migrate deploy` if the schema changed.
4. `pm2 reload agentic-value-hub` (zero-downtime reload within a single
   instance; for true zero-downtime with multiple instances, adopt the
   shared rate-limit store first).

Keep a rollback: retain the previous artifact tarball so a failed release can
be restored by extracting it and reloading PM2.