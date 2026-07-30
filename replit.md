# ASTRAX-VOID

**Elevate • Dominate • Conquer**  
Premium Cyberpunk Gaming Digital Marketplace — futuristic dark theme, instant digital delivery.

## Project Structure

```
astrax-void/
├── apps/
│   ├── web/        # Next.js 15 frontend (port 3000)
│   └── api/        # Express backend (port 4000)
├── packages/
│   └── shared/     # Shared TypeScript types
├── docker/         # Docker Compose for local full-stack
└── docs/
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, GSAP, ShadCN UI
- **Backend**: Node.js + Express, MongoDB + Prisma ORM, Redis
- **Payments**: Paystack, Flutterwave, Stripe
- **Storage**: Cloudflare R2 (signed download links)
- **Auth**: JWT + Google/Discord OAuth

## Running Locally

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```
Fill in the values — at minimum: `DATABASE_URL` (MongoDB), `REDIS_URL`, and `JWT_SECRET`.

### 3. Generate Prisma client & push schema
```bash
npm run db:generate
npm run db:push
npm run db:seed   # optional demo data
```

### 4. Start development servers
```bash
npm run dev          # both frontend + API
npm run dev:web      # frontend only (port 3000)
npm run dev:api      # API only (port 4000)
```

### Docker (full stack)
```bash
npm run docker:up
```

## Required External Services

| Service | Purpose | Required |
|---------|---------|----------|
| MongoDB (Atlas or local) | Primary database | ✅ Yes |
| Redis (Upstash or local) | Caching, sessions, rate limiting | ✅ Yes |
| Paystack / Flutterwave / Stripe | Payments | Optional |
| Google / Discord OAuth | Social login | Optional |
| Cloudflare R2 | Secure file storage | Optional |
| SMTP | Email notifications | Optional |

## User Preferences

<!-- Agent: record user preferences here -->
