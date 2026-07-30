/**
 * PM2 Ecosystem Config — ASTRAX-VOID
 * Deploy on Ubuntu AWS with: pm2 start ecosystem.config.js
 * Docs: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    {
      name: "astrax-api",
      cwd: "./apps/api",
      script: "dist/index.js",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env_production: {
        NODE_ENV: "production",
        PORT: 4000,
      },
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      log_file: "./logs/api-combined.log",
      time: true,
    },
    {
      name: "astrax-web",
      cwd: "./apps/web",
      script: "node_modules/.bin/next",
      args: "start --port 3000",
      interpreter: "node",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env_production: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/web-error.log",
      out_file: "./logs/web-out.log",
      log_file: "./logs/web-combined.log",
      time: true,
    },
  ],
};
