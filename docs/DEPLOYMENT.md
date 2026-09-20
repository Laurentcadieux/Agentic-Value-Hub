# Deployment

## How Deployment Works

This repo contains the application code. The infrastructure (VMs, Nginx, VPN, SSL) is managed by [My_Hybrid_infra](https://github.com/Laurentcadieux/My_Hybrid_infra).

```
This repo (app code)  →  built and deployed by  →  My_Hybrid_infra (Ansible)
```

## Step 1: Create VMs (in My_Hybrid_infra)

```bash
cd My_Hybrid_infra
./scripts/new-project.sh avh 192.168.0.110 4096 4 50
cd environments/project-avh
terraform init && terraform apply -var-file=dev.tfvars -var-file=credentials.tfvars
```

## Step 2: Add Database VM (in My_Hybrid_infra)

Create a second VM for PostgreSQL:
```bash
./scripts/new-project.sh avh-db 192.168.0.111 4096 2 50
cd environments/project-avh-db
terraform init && terraform apply -var-file=dev.tfvars -var-file=credentials.tfvars
```

## Step 3: Add Site to Shared Nginx (in My_Hybrid_infra)

Edit `environments/shared/main-modules.tf` → add to `sites` map:
```hcl
"avh" = {
  domain       = "laurentcadieux.online"
  backend_ip   = "192.168.0.110"
  backend_port = 3000
  ssl          = true
}
```

Apply shared:
```bash
cd environments/shared
terraform apply -var-file=dev.tfvars -var-file=secrets.tfvars -var-file=credentials.tfvars
```

## Step 4: Deploy Application (in My_Hybrid_infra)

The infra repo's Ansible playbooks deploy this app:

```bash
cd My_Hybrid_infra
ansible-playbook playbooks/deploy-app.yml \
  -i inventory/hosts.yml \
  -e target=avh \
  -e app_repo=https://github.com/Laurentcadieux/Agentic-Value-Hub.git \
  -e app_domain=laurentcadieux.online
```

## Step 5: Deploy Database (in My_Hybrid_infra)

```bash
ansible-playbook playbooks/deploy-db.yml \
  -i inventory/hosts.yml \
  -e target=avh-db
```

## CI/CD (Future)

Once GitHub Secrets are configured in My_Hybrid_infra:
1. Push to this repo → triggers a repository_dispatch
2. My_Hybrid_infra's deploy workflow runs Ansible
3. App is rebuilt and deployed automatically

## Manual Deploy (Without Ansible)

```bash
# SSH to app VM
ssh ubuntu@192.168.0.110

# Clone and build
git clone https://github.com/Laurentcadieux/Agentic-Value-Hub.git /var/www/avh
cd /var/www/avh/backend && npm install && npm run build
cd /var/www/avh/frontend && npm install && npm run build

# Start the API
cd /var/www/avh/backend && pm2 start dist/index.js

# Run database migrations
psql -U avh -h 192.168.0.111 -d avh -f /var/www/avh/database/migrations/001_init.sql
```
