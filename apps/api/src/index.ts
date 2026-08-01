import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Load .env before importing any module that reads process.env
dotenv.config();

// ── Startup validation ────────────────────────────────────────────────────────
// Check required env vars before importing Prisma (which throws if DATABASE_URL
// is missing) so PM2 logs a clear message instead of a cryptic crash.
const REQUIRED_ENV = ["DATABASE_URL", "JWT_SECRET", "CORS_ORIGIN"] as const;
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error("\n❌ ASTRAX-VOID API cannot start — missing required environment variables:");
  missing.forEach((key) => console.error(`   • ${key}`));
  console.error("\n📋 Fix: cp apps/api/.env.example apps/api/.env  then fill in the values.\n");
  process.exit(1);
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
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
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
  try {
    await prisma.$connect();
    console.log("✅ Database connected");
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ Database connection failed:", msg);
    console.error("   Check DATABASE_URL in apps/api/.env");
    process.exit(1);
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
