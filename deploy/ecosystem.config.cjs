// PM2 process manager config for the Agentic Value Hub Next.js standalone server.
//
// Usage (on the app VM, after the build artifact is in place):
//   pm2 start deploy/ecosystem.config.cjs --env production
//   pm2 save && pm2 startup   # enable boot-time auto-restart
//
// Single instance (exec_mode: fork) is intentional: the in-memory rate
// limiter is per-process. To run multiple instances, first move rate
// limiting to a shared store (Redis/Upstash) — see docs/SECURITY.md.
//
// The standalone server reads HOSTNAME/PORT from env. Binding to 127.0.0.1
// keeps the app private behind Nginx (deploy/avh-nginx.conf).

module.exports = {
  apps: [
    {
      name: 'agentic-value-hub',
      script: '.next/standalone/server.js',
      cwd: '/opt/agentic-value-hub',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        HOSTNAME: '127.0.0.1',
        PORT: 3000,
      },
      // Secrets are provided via the systemd EnvironmentFile or a secrets
      // manager — never committed here. Keep this file checked-in and public.
      max_memory_restart: '512M',
      error_file: '/var/log/agentic-value-hub/err.log',
      out_file: '/var/log/agentic-value-hub/out.log',
      merge_logs: true,
      time: true,
      autorestart: true,
      max_restarts: 10,
      restart_delay: 4000,
      kill_timeout: 5000,
      // Health gate: PM2 waits for the port to answer before marking ready.
      wait_ready: true,
      listen_timeout: 10000,
    },
  ],
}
