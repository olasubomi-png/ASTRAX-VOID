#!/usr/bin/env bash
# ASTRAX-VOID — Ubuntu AWS Deployment Script
# Run once on a fresh Ubuntu 22.04 server as root or with sudo.
# Usage: chmod +x deploy/deploy.sh && sudo bash deploy/deploy.sh

set -euo pipefail

APP_DIR="/var/www/astrax-void"
REPO_URL="https://github.com/olasubomi-png/ASTRAX-VOID.git"
NODE_VERSION="20"

echo "========================================"
echo " ASTRAX-VOID Deployment"
echo "========================================"

# ── 1. System dependencies ───────────────────────────────────────────────────
echo "[1/9] Installing system dependencies..."
apt-get update -y
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

# ── 2. Node.js ───────────────────────────────────────────────────────────────
echo "[2/9] Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs
node -v && npm -v

# ── 3. PM2 ───────────────────────────────────────────────────────────────────
echo "[3/9] Installing PM2..."
npm install -g pm2

# ── 4. Clone or pull repo ────────────────────────────────────────────────────
echo "[4/9] Cloning / updating repository..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull origin main
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 5. Environment files ─────────────────────────────────────────────────────
echo "[5/9] Setting up environment files..."

if [ ! -f apps/api/.env ]; then
  cp apps/api/.env.example apps/api/.env
  echo ""
  echo "  ┌─────────────────────────────────────────────────────────────────┐"
  echo "  │  ACTION REQUIRED — fill in apps/api/.env before continuing.     │"
  echo "  │  At minimum you must set:                                        │"
  echo "  │    DATABASE_URL   MongoDB Atlas connection string                │"
  echo "  │    JWT_SECRET     64-char random hex (see .env.example)          │"
  echo "  └─────────────────────────────────────────────────────────────────┘"
  echo ""
  read -rp "  Press ENTER once apps/api/.env is filled in..."
else
  echo "  ✓ apps/api/.env already exists"
fi

if [ ! -f apps/web/.env.local ]; then
  cp apps/web/.env.example apps/web/.env.local
  echo ""
  echo "  ┌─────────────────────────────────────────────────────────────────┐"
  echo "  │  ACTION REQUIRED — fill in apps/web/.env.local before building. │"
  echo "  │  At minimum you must set:                                        │"
  echo "  │    NEXT_PUBLIC_API_URL   https://yourdomain.com/api              │"
  echo "  │    NEXTAUTH_SECRET       32-char random hex                      │"
  echo "  │    NEXTAUTH_URL          https://yourdomain.com                  │"
  echo "  └─────────────────────────────────────────────────────────────────┘"
  echo ""
  read -rp "  Press ENTER once apps/web/.env.local is filled in..."
else
  echo "  ✓ apps/web/.env.local already exists"
fi

# ── 6. Install dependencies ──────────────────────────────────────────────────
echo "[6/9] Installing npm dependencies..."
# postinstall runs `prisma generate` automatically in apps/api
npm install

# ── 7. Build ─────────────────────────────────────────────────────────────────
echo "[7/9] Building (API: tsc, Web: next build)..."
# `npm run build` in apps/api already runs `prisma generate && tsc`
npm run build

# ── 8. Nginx ─────────────────────────────────────────────────────────────────
echo "[8/9] Configuring Nginx..."
cp deploy/nginx.conf /etc/nginx/sites-available/astrax-void
ln -sf /etc/nginx/sites-available/astrax-void /etc/nginx/sites-enabled/astrax-void
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── 9. PM2 ───────────────────────────────────────────────────────────────────
echo "[9/9] Starting services with PM2..."
mkdir -p logs  # root-level log directory referenced by ecosystem.config.js

pm2 delete astrax-api astrax-web 2>/dev/null || true   # clean slate on redeploy
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash  # auto-run on reboot

echo ""
echo "========================================"
echo " ✅ Deployment complete!"
echo ""
echo " Frontend : http://YOUR_DOMAIN"
echo " API      : http://YOUR_DOMAIN/api"
echo " Health   : http://YOUR_DOMAIN/health"
echo ""
echo " Next steps:"
echo "   SSL cert  : sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"
echo "   PM2 status: pm2 status"
echo "   PM2 logs  : pm2 logs"
echo "   DB seed   : cd $APP_DIR && npm run db:seed --workspace=apps/api"
echo "========================================"
