#!/usr/bin/env bash
# ASTRAX-VOID — Ubuntu AWS Deployment Script
# Run once on a fresh Ubuntu 22.04 server as root or with sudo.
# Usage: chmod +x deploy/deploy.sh && sudo bash deploy/deploy.sh

set -euo pipefail

APP_DIR="/var/www/astrax-void"
REPO_URL="https://github.com/olasubomi-png/ASTRAX-VOID.git"
NODE_VERSION="20"
PNPM_VERSION="10"

echo "========================================"
echo " ASTRAX-VOID Deployment"
echo "========================================"

# ── 1. System dependencies ───────────────────────────────────────────────────
echo "[1/10] Installing system dependencies..."
apt-get update -y
apt-get install -y curl git nginx ufw

# ── 2. Node.js ───────────────────────────────────────────────────────────────
echo "[2/10] Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs
node -v && npm -v

# ── 3. pnpm ──────────────────────────────────────────────────────────────────
echo "[3/10] Installing pnpm $PNPM_VERSION..."
npm install -g "pnpm@$PNPM_VERSION"
pnpm --version

# ── 4. PM2 ───────────────────────────────────────────────────────────────────
echo "[4/10] Installing PM2..."
npm install -g pm2

# ── 5. Clone or pull repo ────────────────────────────────────────────────────
echo "[5/10] Cloning / updating repository..."
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull origin main
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 6. Environment files ─────────────────────────────────────────────────────
echo "[6/10] Setting up environment files..."

if [ ! -f apps/api/.env ]; then
  cp apps/api/.env.example apps/api/.env
  echo ""
  echo "  ┌─────────────────────────────────────────────────────────────────┐"
  echo "  │  ACTION REQUIRED — fill in apps/api/.env before continuing.     │"
  echo "  │  At minimum you must set:                                        │"
  echo "  │    DATABASE_URL   MongoDB Atlas connection string                │"
  echo "  │    JWT_SECRET     64-char random hex (see .env.example)          │"
  echo "  │    CORS_ORIGIN    Frontend URL, e.g. http://34.201.64.198        │"
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
  echo "  │    NEXT_PUBLIC_API_URL   http://34.201.64.198/api                │"
  echo "  │    NEXT_PUBLIC_APP_URL   http://34.201.64.198                    │"
  echo "  │    NEXTAUTH_SECRET       32-char random hex                      │"
  echo "  │    NEXTAUTH_URL          http://34.201.64.198                    │"
  echo "  └─────────────────────────────────────────────────────────────────┘"
  echo ""
  read -rp "  Press ENTER once apps/web/.env.local is filled in..."
else
  echo "  ✓ apps/web/.env.local already exists"
fi

# ── 7. Validate required API env vars before building ────────────────────────
echo "[7/10] Validating required environment variables..."
MISSING=""
for var in DATABASE_URL JWT_SECRET CORS_ORIGIN; do
  val=$(grep -E "^${var}=" apps/api/.env 2>/dev/null | cut -d= -f2- | tr -d '"' | tr -d "'")
  if [ -z "$val" ] || echo "$val" | grep -qE "CHANGE_THIS|YOUR_|xxxx|PLACEHOLDER"; then
    MISSING="$MISSING $var"
  fi
done

if [ -n "$MISSING" ]; then
  echo ""
  echo "  ❌ The following required API variables are not set in apps/api/.env:"
  for v in $MISSING; do echo "       • $v"; done
  echo ""
  echo "  Please fill in the values and re-run this script."
  exit 1
fi
echo "  ✓ Required environment variables are set"

# ── 8. Install dependencies ──────────────────────────────────────────────────
echo "[8/10] Installing dependencies with pnpm..."
pnpm install --frozen-lockfile

# ── 9. Build ─────────────────────────────────────────────────────────────────
echo "[9/10] Building (API: prisma generate + tsc, Web: next build)..."
pnpm -r build

# ── 10. Nginx + PM2 ──────────────────────────────────────────────────────────
echo "[10/10] Configuring Nginx and starting PM2..."

cp deploy/nginx.conf /etc/nginx/sites-available/astrax-void
ln -sf /etc/nginx/sites-available/astrax-void /etc/nginx/sites-enabled/astrax-void
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

mkdir -p logs  # absolute log dir referenced by ecosystem.config.js

pm2 delete astrax-api astrax-web 2>/dev/null || true   # clean slate on redeploy
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash  # auto-run on reboot

echo ""
echo "========================================"
echo " ✅ Deployment complete!"
echo ""
echo " Frontend : http://34.201.64.198"
echo " API      : http://34.201.64.198/api"
echo " Health   : http://34.201.64.198/health"
echo ""
echo " Next steps:"
echo "   PM2 status : pm2 status"
echo "   PM2 logs   : pm2 logs"
echo "   DB seed    : cd $APP_DIR && pnpm --filter @astrax-void/api db:seed"
echo "   SSL cert   : sudo apt install certbot python3-certbot-nginx -y"
echo "                sudo certbot --nginx -d yourdomain.com"
echo "========================================"
