# ASTRAX-VOID — Production Deployment Guide

## Architecture

```
Internet → Nginx (80/443) → Next.js :3000  (PM2: astrax-web)
                          → Express  :4000  (PM2: astrax-api)
```

MongoDB Atlas and Redis are external services — they are NOT hosted on the same machine.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Ubuntu | 22.04 LTS | AWS EC2 |
| Node.js | 20 LTS | via nodesource |
| PM2 | latest | `npm i -g pm2` |
| Nginx | latest | `apt install nginx` |
| Git | latest | `apt install git` |

---

## Quick Start (fresh server)

```bash
chmod +x deploy/deploy.sh
sudo bash deploy/deploy.sh
```

The script will pause and prompt you to fill in `.env` files before building.

---

## Deployment Checklist — Secrets You Must Provide

### `apps/api/.env`  (copy from `apps/api/.env.example`)

#### ✅ REQUIRED — the API will refuse to start without these

| Variable | How to get it |
|----------|---------------|
| `DATABASE_URL` | MongoDB Atlas → Connect → Drivers → copy connection string. Replace `<password>` and `<dbname>` (`astrax-void`). |
| `JWT_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |

#### ⚙️ CONFIGURE — must match your domain

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `APP_URL` | `https://astraxvoid.com` |
| `API_URL` | `https://astraxvoid.com` |

#### 🔌 OPTIONAL — leave blank to disable the feature

| Variable | Feature |
|----------|---------|
| `REDIS_URL` | Session caching, rate limiting (Upstash free tier works) |
| `JWT_EXPIRES_IN` | Default `7d` |
| `GOOGLE_CLIENT_ID` / `_SECRET` | Google OAuth login |
| `DISCORD_CLIENT_ID` / `_SECRET` | Discord OAuth login |
| `PAYSTACK_SECRET_KEY` / `_PUBLIC_KEY` | Paystack payments |
| `FLUTTERWAVE_SECRET_KEY` / `_PUBLIC_KEY` | Flutterwave payments |
| `STRIPE_SECRET_KEY` | Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | Cloudflare R2 file storage |
| `R2_BUCKET_NAME` | Default `astrax-void` |
| `R2_PUBLIC_URL` | Your R2 public bucket URL |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Outgoing email |
| `EMAIL_FROM` | Sender address shown in emails |

---

### `apps/web/.env.local`  (copy from `apps/web/.env.example`)

> **Important:** `NEXT_PUBLIC_*` variables are embedded at **build time**.  
> Set them correctly **before** running `npm run build`.

#### ✅ REQUIRED

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://astraxvoid.com/api` |
| `NEXT_PUBLIC_APP_URL` | `https://astraxvoid.com` |
| `NEXTAUTH_SECRET` | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `NEXTAUTH_URL` | `https://astraxvoid.com` |

#### 🔌 OPTIONAL

| Variable | Feature |
|----------|---------|
| `GOOGLE_CLIENT_ID` / `_SECRET` | Google OAuth |
| `DISCORD_CLIENT_ID` / `_SECRET` | Discord OAuth |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack checkout button |
| `NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY` | Flutterwave checkout button |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe checkout button |

---

## Manual Step-by-Step (if not using deploy.sh)

```bash
# 1. Clone
git clone https://github.com/olasubomi-png/ASTRAX-VOID.git /var/www/astrax-void
cd /var/www/astrax-void

# 2. Environment files
cp apps/api/.env.example apps/api/.env
nano apps/api/.env          # fill in DATABASE_URL + JWT_SECRET at minimum

cp apps/web/.env.example apps/web/.env.local
nano apps/web/.env.local    # fill in all REQUIRED vars

# 3. Install + build
# postinstall automatically runs `prisma generate`
npm install
npm run build               # API: prisma generate + tsc | Web: next build

# 4. Seed the database (first deploy only)
npm run db:seed --workspace=apps/api

# 5. Create log directory
mkdir -p /var/www/astrax-void/logs

# 6. Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup                 # follow the printed command to enable autostart

# 7. Nginx
cp deploy/nginx.conf /etc/nginx/sites-available/astrax-void
ln -sf /etc/nginx/sites-available/astrax-void /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# 8. SSL
certbot --nginx -d astraxvoid.com -d www.astraxvoid.com
```

---

## Redeploy (update running app)

```bash
cd /var/www/astrax-void
git pull origin main
npm install                 # picks up any new packages
npm run build               # rebuilds both apps
pm2 reload ecosystem.config.js --env production   # zero-downtime reload
```

---

## Nginx Routing

| Request path | Proxied to |
|---|---|
| `/api/*` | Express API on `:4000` with 20 req/s rate limit |
| `/api/auth/*` | Express API on `:4000` with 5 req/min stricter limit |
| `/health` | Express API on `:4000` (no rate limit) |
| `/_next/static/*` | Next.js on `:3000` with 1-year immutable cache |
| `/*` | Next.js on `:3000` |

---

## Useful Commands

```bash
pm2 status                          # app health
pm2 logs                            # tail all logs
pm2 logs astrax-api --lines 100     # API logs
pm2 logs astrax-web --lines 100     # Web logs
pm2 restart astrax-api              # restart API only
pm2 restart astrax-web              # restart web only

# Check API is running
curl http://localhost:4000/health

# Check web is running
curl -I http://localhost:3000

# Nginx
nginx -t                            # test config
systemctl reload nginx              # reload without downtime
tail -f /var/log/nginx/astrax-error.log
```

---

## MongoDB Atlas Setup

1. Create a free cluster at https://cloud.mongodb.com
2. **Database Access** → Add user with read/write on `astrax-void`
3. **Network Access** → Add your AWS EC2 IP (or `0.0.0.0/0` temporarily)
4. **Connect** → Drivers → copy the connection string
5. Paste into `DATABASE_URL` in `apps/api/.env`

After first deploy, seed the DB:
```bash
cd /var/www/astrax-void
npm run db:seed --workspace=apps/api
```

---

## Firewall (UFW)

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'    # ports 80 + 443
ufw enable
# Do NOT expose ports 3000 or 4000 directly — Nginx proxies them
```

---

## Troubleshooting

### API exits immediately
```bash
pm2 logs astrax-api --lines 50
```
Common causes:
- `DATABASE_URL` or `JWT_SECRET` missing from `apps/api/.env`
- MongoDB Atlas IP whitelist not set
- `prisma generate` not run — rebuild with `npm run build`

### Web shows 502 Bad Gateway
```bash
pm2 status          # is astrax-web running?
curl http://localhost:3000   # is Next.js responding?
```

### Prisma errors on startup
```bash
cd /var/www/astrax-void/apps/api
npx prisma generate     # regenerate client
cd /var/www/astrax-void
pm2 restart astrax-api
```
