/**
 * PM2 Ecosystem Config — ASTRAX-VOID
 *
 * Usage (from /var/www/astrax-void):
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup
 *
 * Docs: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    // ── Express API ──────────────────────────────────────────────────────────
    {
      name: "astrax-api",
      cwd: "./apps/api",
      script: "dist/index.js",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",

      // env        → applied on every start (fallback)
      // env_production → merged on top when --env production is passed
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },

      // Log to root-level logs/ dir (created by deploy.sh)
      error_file: "../../logs/api-error.log",
      out_file: "../../logs/api-out.log",
      log_file: "../../logs/api-combined.log",
      time: true,

      // Restart strategy: exponential back-off up to 10 retries
      restart_delay: 3000,
      max_restarts: 10,
      exp_backoff_restart_delay: 100,
    },

    // ── Next.js Frontend ─────────────────────────────────────────────────────
    {
      name: "astrax-web",
      cwd: "./apps/web",
      script: "node_modules/.bin/next",
      args: "start --port 3000 --hostname 0.0.0.0",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",

      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },

      error_file: "../../logs/web-error.log",
      out_file: "../../logs/web-out.log",
      log_file: "../../logs/web-combined.log",
      time: true,

      restart_delay: 3000,
      max_restarts: 10,
      exp_backoff_restart_delay: 100,
    },
  ],
};
