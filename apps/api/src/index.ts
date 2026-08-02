import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Load .env before importing any module that reads process.env
dotenv.config();

// ── Startup validation ────────────────────────────────────────────────────────
// In production: hard-exit on missing vars so PM2/Docker restarts with a clear
// error message rather than a cryptic Prisma crash.
// In development: warn and continue — routes that need DB will return 503.
const IS_PROD = process.env.NODE_ENV === "production";
const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET", "CORS_ORIGIN"] as const;
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  if (IS_PROD) {
    console.error("\n❌ ASTRAX-VOID API cannot start — missing required environment variables:");
    missing.forEach((key) => console.error(`   • ${key}`));
    console.error("\n📋 Fix: set the listed variables in your deployment environment.\n");
    process.exit(1);
  } else {
    console.warn("\n⚠️  Missing env vars (dev mode — affected routes will return 503):");
    missing.forEach((key) => console.warn(`   • ${key}`));
    console.warn("📋 Fix: update apps/api/.env with real values.\n");
  }
}
// ─────────────────────────────────────────────────────────────────────────────

import { prisma } from "./lib/prisma.js";
import { authRoutes } from "./routes/auth.js";
import { productRoutes } from "./routes/products.js";
import { orderRoutes } from "./routes/orders.js";
import { paymentRoutes } from "./routes/payments.js";
import { adminRoutes } from "./routes/admin.js";
import { userRoutes } from "./routes/user.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { searchRoutes } from "./routes/search.js";
import { categoryRoutes } from "./routes/categories.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Security
app.use(helmet());
// CORS — accept comma-separated list of allowed origins so both Vercel
// and local dev can be whitelisted with a single env var, e.g.:
//   CORS_ORIGIN=https://astrax-void-web-upz5.vercel.app,http://localhost:5000
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, same-origin SSR)
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      // Also allow if CORS_ORIGIN is a wildcard "*"
      if (allowedOrigins.includes("*")) return cb(null, true);
      cb(new Error(`CORS: origin '${origin}' not allowed`));
    },
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many auth attempts. Try again later." },
});

// Body parsing
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Health — always responds, even if DB is degraded
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "astrax-void-api",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/categories", categoryRoutes);

// Error handler
app.use(errorHandler);

// ── Start server after confirming database is reachable ───────────────────────
async function start() {
  if (process.env.DATABASE_URL) {
    try {
      await prisma.$connect();
      console.log("✅ Database connected");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("❌ Database connection failed:", msg);
      if (IS_PROD) {
        console.error("   Check DATABASE_URL in your deployment environment.");
        process.exit(1);
      } else {
        console.warn("⚠️  Running without DB — admin/order/user routes will return 503.");
      }
    }
  } else {
    console.warn("⚠️  DATABASE_URL not set — DB routes will return 503.");
  }

  app.listen(PORT, () => {
    console.log(`🚀 ASTRAX-VOID API running on http://localhost:${PORT}`);
    console.log(`   NODE_ENV : ${process.env.NODE_ENV || "development"}`);
    console.log(`   CORS     : ${process.env.CORS_ORIGIN || "http://localhost:3000"}`);
  });
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received — shutting down gracefully");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

start();
