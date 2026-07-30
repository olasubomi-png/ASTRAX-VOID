# ASTRAX-VOID

**Elevate • Dominate • Conquer**

Premium Cyberpunk Gaming Digital Marketplace  
Futuristic • Luxury • Dark Theme • Instant Digital Delivery

![ASTRAX-VOID Logo](apps/web/public/logo.png)

---

## Overview

ASTRAX-VOID is a production-ready, AAA-quality digital marketplace for gaming products:

- VIP Packages
- CODM Files
- Unlock Tools
- Accounts
- Bundles
- Gift Cards

Built to feel more premium than competing platforms while maintaining a unique identity.

**Brand Colors**
- Primary: `#8B5CF6`
- Secondary: `#6D28D9`
- Accent: `#A855F7`
- Background: `#050505`
- Text: White
- Glassmorphism + neon purple glow throughout

---

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion + GSAP
- ShadCN UI
- Lucide Icons
- Particles, parallax, mouse glow, loading screen

### Backend
- Node.js + Express
- MongoDB + Prisma ORM
- Redis (caching, rate limiting, sessions)
- JWT + Google/Discord OAuth

### Payments
- Paystack (Nigeria primary)
- Flutterwave
- Stripe

### Storage
- Cloudflare R2 (digital files + secure signed download links)

### Security
- Helmet, rate limiting, CSRF, input validation, XSS protection
- Secure download links with expiry + download limits
- License key generation

### Deployment
- Vercel (frontend)
- Docker + Railway/Render/VPS (API + MongoDB + Redis)

---

## Project Structure

```
astrax-void/
├── apps/
│   ├── web/                 # Next.js 15 frontend
│   │   ├── app/             # App Router pages
│   │   ├── components/      # UI components
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── public/
│   │   └── styles/
│   └── api/                 # Express backend
│       ├── src/
│       │   ├── routes/
│       │   ├── controllers/
│       │   ├── middleware/
│       │   ├── services/
│       │   └── utils/
│       └── prisma/
├── packages/
│   └── shared/              # Shared types & constants
├── docker/
├── docs/
└── scripts/
```

---

## Getting Started

### 1. Prerequisites
- Node.js 20+
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Cloudflare R2 bucket (optional for production)

### 2. Install

```bash
git clone https://github.com/olasubomi-png/ASTRAX-VOID.git
cd ASTRAX-VOID
npm install
```

### 3. Environment

Copy the example env files:

```bash
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

Fill in the values (see comments inside the files).

### 4. Database

```bash
npm run db:generate
npm run db:push
npm run db:seed   # optional demo data
```

### 5. Development

```bash
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:4000

### 6. Docker (full stack)

```bash
npm run docker:up
```

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Stunning home (hero, particles, featured, stats, testimonials, FAQ) |
| `/products` | Full catalog with search, filters, sorting |
| `/vip` | VIP Packages |
| `/codm` | CODM Files |
| `/tools` | Unlock Tools |
| `/downloads` | Public downloads section |
| `/about` | Brand story |
| `/support` | Support tickets |
| `/contact` | Contact form |
| `/faq` | FAQ |
| `/terms` `/privacy` `/refund` | Legal |
| `/login` `/register` `/forgot-password` | Auth |
| `/dashboard/*` | Customer dashboard (downloads, orders, wishlist, wallet, keys, invoices) |
| `/admin/*` | Full admin panel (analytics, products, orders, coupons, settings…) |

---

## Key Features Implemented

- Modern slide-over cart + coupons
- Instant search + autocomplete
- Automatic digital delivery after payment verification
- Secure signed download links (expiry + limits)
- License key generation
- Customer + Admin dashboards
- Referral system + wallet (stubs ready for expansion)
- Glassmorphism cards with neon glow
- Framer Motion + GSAP animations
- Fully responsive
- SEO (OpenGraph, Twitter cards, sitemap, robots, schema)
- Rate limiting, Helmet, validation

---

## Payments Flow

1. User adds items → checkout
2. Select Paystack / Flutterwave / Stripe
3. On success → webhook verifies payment
4. Order marked paid
5. Digital product delivered (download link + license key if applicable)
6. Invoice generated + email sent
7. Customer sees items in Dashboard → Downloads

---

## Admin Capabilities

- Add / edit / delete products
- View & manage orders
- Manage customers
- Create discount coupons
- Track sales & revenue graphs
- Hero / banner / FAQ / newsletter managers
- Payment logs
- Website settings

---

## Security Notes

- All download links are signed & time-limited
- Rate limiting on auth + payment endpoints
- Input sanitization + Zod validation
- JWT with short expiry + refresh tokens
- CSRF protection on forms
- Helmet + secure headers

---

## Deployment

### Frontend (Vercel)
```bash
cd apps/web
vercel
```

### Backend
- Deploy `apps/api` to Railway / Render / Fly.io / VPS
- Set environment variables
- Point MongoDB + Redis
- Configure Cloudflare R2 credentials
- Set webhook URLs for Paystack / Flutterwave / Stripe

---

## License

Proprietary — All rights reserved.  
© ASTRAX-VOID

---

**Elevate. Dominate. Conquer.**
