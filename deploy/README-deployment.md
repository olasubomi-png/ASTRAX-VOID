# ASTRAX-VOID — Ubuntu AWS Deployment Guide

## Prerequisites

- Ubuntu 22.04 LTS EC2 instance (t3.small or larger recommended)
- Domain name pointed to your server's IP
- MongoDB Atlas (or self-hosted MongoDB 7)
- Redis (Upstash free tier or self-hosted Redis 7)
- Port 80 and 443 open in your AWS Security Group

---

## Quick Deploy (automated)

```bash
git clone https://github.com/olasubomi-png/ASTRAX-VOID.git /var/www/astrax-void
cd /var/www/astrax-void
chmod +x deploy/deploy.sh
sudo bash deploy/deploy.sh
```

---

## Manual Step-by-Step

### 1. Install Node.js 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install PM2 and Nginx

```bash
sudo npm install -g pm2
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### 3. Clone the repo

```bash
git clone https://github.com/olasubomi-png/ASTRAX-VOID.git /var/www/astrax-void
cd /var/www/astrax-void
```

### 4. Configure environment variables

**API (`apps/api/.env`):**
```bash
cp apps/api/.env.example apps/api/.env
nano apps/api/.env
```

Fill in at minimum:
- `DATABASE_URL` — your MongoDB connection string
- `REDIS_URL` — your Redis URL
- `JWT_SECRET` — a long random string (32+ chars)
- `APP_URL` — your production frontend URL (e.g. `https://astraxvoid.com`)
- `API_URL` — your production API URL (e.g. `https://astraxvoid.com`)

**Frontend (`apps/web/.env.local`):**
```bash
cp apps/web/.env.example apps/web/.env.local
nano apps/web/.env.local
```

Fill in:
- `NEXT_PUBLIC_API_URL=https://astraxvoid.com/api`
- `NEXT_PUBLIC_APP_URL=https://astraxvoid.com`
- `NEXTAUTH_SECRET` — same long random string
- `NEXTAUTH_URL=https://astraxvoid.com`

### 5. Install dependencies & build

```bash
npm install
npm run build
```

### 6. Database setup (first deploy only)

```bash
npm run db:generate
npm run db:push
npm run db:seed     # optional — adds demo categories, products & admin user
```

Default admin: `admin@astraxvoid.com` / `admin123` — **change password immediately in production**.

### 7. Nginx configuration

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/astrax-void
# Edit the server_name to your domain:
sudo nano /etc/nginx/sites-available/astrax-void

sudo ln -s /etc/nginx/sites-available/astrax-void /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### 8. SSL with Let's Encrypt

```bash
sudo certbot --nginx -d astraxvoid.com -d www.astraxvoid.com
# Certbot auto-updates the Nginx config with SSL paths
sudo systemctl reload nginx
```

### 9. Start with PM2

```bash
mkdir -p apps/api/logs apps/web/logs
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
# Follow the command pm2 outputs to enable auto-start on reboot
```

---

## Updating (future deploys)

```bash
cd /var/www/astrax-void
git pull origin main
npm install
npm run build
pm2 reload ecosystem.config.js --env production
```

---

## Useful commands

| Command | Description |
|---------|-------------|
| `pm2 status` | See all running processes |
| `pm2 logs` | Tail all logs |
| `pm2 logs astrax-api` | API logs only |
| `pm2 logs astrax-web` | Frontend logs only |
| `pm2 restart astrax-api` | Restart API |
| `pm2 restart astrax-web` | Restart frontend |
| `sudo systemctl status nginx` | Nginx status |
| `sudo nginx -t` | Test Nginx config |

---

## Architecture on the server

```
Internet
   │
   ▼
Nginx (80/443) — SSL termination, rate limiting, security headers
   ├── /api/*      → Express API  (127.0.0.1:4000) via PM2
   └── /*          → Next.js      (127.0.0.1:3000) via PM2
        │
        ├── MongoDB Atlas (DATABASE_URL)
        ├── Redis / Upstash (REDIS_URL)
        └── Cloudflare R2 (optional, for digital file storage)
```

---

## Security checklist before going live

- [ ] Change `JWT_SECRET` to a 64-char random string
- [ ] Change `NEXTAUTH_SECRET` to a different 64-char random string
- [ ] Change the seeded admin password (`admin123`)
- [ ] Restrict MongoDB Atlas IP whitelist to your server's IP
- [ ] Enable AWS Security Group: only 80, 443, and 22 (SSH) inbound
- [ ] Configure Redis `requirepass` or use Upstash with auth URL
- [ ] Set `NODE_ENV=production` in both `.env` files
- [ ] Review and set Paystack/Flutterwave/Stripe webhook secrets
