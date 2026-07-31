/**
 * PM2 Ecosystem Config — ASTRAX-VOID
 *
 * Usage (from /var/www/astrax-void):
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup
 *
 * Required environment variables (set in apps/api/.env before starting):
 *   API:  DATABASE_URL  JWT_SECRET  CORS_ORIGIN  NODE_ENV  PORT
 *   Web:  NEXT_PUBLIC_API_URL  NEXT_PUBLIC_APP_URL  NODE_ENV  PORT
 *
 * Docs: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

"use strict";

const path = require("path");

// Absolute path to the repo root (where this file lives).
// Using __dirname makes log paths correct regardless of which
// directory PM2 is launched from.
const ROOT = __dirname;
const LOGS = path.join(ROOT, "logs");

module.exports = {
  apps: [
    // ── Express API ──────────────────────────────────────────────────────────
    {
      name: "astrax-api",
      cwd: path.join(ROOT, "apps", "api"),

      // Entry point is the compiled TypeScript output (apps/api/dist/index.js).
      // Build first: pnpm --filter @astrax-void/api build
      script: "dist/index.js",
      interpreter: "node",

      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",

      // These values are safe to hard-code; secrets must be in apps/api/.env
      // which is loaded by dotenv at startup.
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },

      error_file: path.join(LOGS, "api-error.log"),
      out_file: path.join(LOGS, "api-out.log"),
      log_file: path.join(LOGS, "api-combined.log"),
      time: true,

      restart_delay: 3000,
      max_restarts: 10,
      exp_backoff_restart_delay: 100,
    },

    // ── Next.js Frontend ─────────────────────────────────────────────────────
    {
      name: "astrax-web",
      cwd: path.join(ROOT, "apps", "web"),

      // *** Fix for "SyntaxError: missing ) after argument list" ***
      //
      // node_modules/.bin/next is a SHELL SCRIPT wrapper — PM2 must NOT pass
      // it to the Node.js interpreter.  Using `script: "pnpm"` with
      // `interpreter: "none"` tells PM2 to exec pnpm directly as a binary,
      // which in turn runs `next start` via the package.json "start" script.
      script: "pnpm",
      args: "run start",
      interpreter: "none",

      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",

      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },

      error_file: path.join(LOGS, "web-error.log"),
      out_file: path.join(LOGS, "web-out.log"),
      log_file: path.join(LOGS, "web-combined.log"),
      time: true,

      restart_delay: 3000,
      max_restarts: 10,
      exp_backoff_restart_delay: 100,
    },
  ],
};
