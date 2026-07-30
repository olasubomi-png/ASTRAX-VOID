#!/usr/bin/env bash
# ASTRAX-VOID — Ubuntu AWS Deployment Script
# Run once on a fresh Ubuntu 22.04 server as root or with sudo.
# Usage: chmod +x deploy.sh && sudo bash deploy.sh

set -e

APP_DIR="/var/www/astrax-void"
REPO_URL="https://github.com/olasubomi-png/ASTRAX-VOID.git"
NODE_VERSION="20"

echo "========================================"
echo " ASTRAX-VOID Deployment"
echo "========================================"

# ── 1. System dependencies ───────────────────────────────────────────────────
echo "[1/8] Installing system dependencies..."
apt-get update -y
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

# ── 2. Node.js via nvm ───────────────────────────────────────────────────────
echo "[2/8] Installing Node.js $NODE_VERSION..."
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
apt-get install -y nodejs
node -v && npm -v

# ── 3. PM2 ───────────────────────────────────────────────────────────────────
echo "[3/8] Installing PM2..."
npm install -g pm2

# ── 4. Clone or pull repo ────────────────────────────────────────────────────
echo "[4/8] Cloning repository..."
if [ -d "$APP_DIR" ]; then
  cd "$APP_DIR"
  git pull origin main
else
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

# ── 5. Environment files ─────────────────────────────────────────────────────
echo "[5/8] Setting up environment files..."
echo "  ⚠  You must create the .env files manually before continuing."
echo "  API: cp apps/api/.env.example apps/api/.env  then fill in values."
echo "  Web: cp apps/web/.env.example apps/web/.env.local  then fill in values."
echo ""
read -p "  Press ENTER once you have created and filled both .env files..."

# ── 6. Install dependencies + build ─────────────────────────────────────────
echo "[6/8] Installing dependencies and building..."
npm install
npm run build

# ── 7. Nginx ─────────────────────────────────────────────────────────────────
echo "[7/8] Configuring Nginx..."
cp deploy/nginx.conf /etc/nginx/sites-available/astrax-void
# Update server_name if needed — replace astraxvoid.com with your domain
ln -sf /etc/nginx/sites-available/astrax-void /etc/nginx/sites-enabled/astrax-void
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── 8. PM2 ───────────────────────────────────────────────────────────────────
echo "[8/8] Starting app with PM2..."
mkdir -p apps/api/logs apps/web/logs
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "========================================"
echo " ✅ Deployment complete!"
echo " Frontend: http://YOUR_DOMAIN"
echo " API:      http://YOUR_DOMAIN/api"
echo " Health:   http://YOUR_DOMAIN/health"
echo ""
echo " Get SSL cert: sudo certbot --nginx -d yourdomain.com"
echo " PM2 status:   pm2 status"
echo " PM2 logs:     pm2 logs"
echo "========================================"
