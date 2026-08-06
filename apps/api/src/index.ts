import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "./config/env.js";

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
import { uploadRoutes, UPLOAD_DIR } from "./routes/upload.js";
import { downloadRoutes } from "./routes/downloads.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// Security
// Helmet — disable Cross-Origin-Resource-Policy:same-origin so browsers
// can call this API from the Vercel frontend origin. CORP same-origin is
// the default in Helmet 7+ and causes opaque "Failed to fetch" errors.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  })
);

// CORS — accept comma-separated list of allowed origins so both Vercel
// and local dev can be whitelisted with a single env var, e.g.:
//   CORS_ORIGIN=https://astrax-void-web-upz5.vercel.app,http://localhost:5000
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

// Always permit known production frontend hosts even if env is stale
const BUILTIN_ORIGINS = [
  "http://54.167.96.219",
  "https://astraxvoid.com",
  "https://www.astraxvoid.com",
  "https://astrax-void-web-upz5.vercel.app",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5000",
];
const corsAllowlist = new Set([...allowedOrigins, ...BUILTIN_ORIGINS]);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return cb(null, true);
      if (corsAllowlist.has(origin) || allowedOrigins.includes("*")) {
        return cb(null, true);
      }
      // Allow any *.vercel.app preview deployment
      if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
        return cb(null, true);
      }
      // Do NOT throw — throwing produces HTTP 500 and "Failed to fetch".
      // Returning false emits a proper CORS failure the browser can surface.
      console.warn(`[CORS] blocked origin: ${origin}`);
      return cb(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    maxAge: 86400,
  })
);

// Trust proxy so rate-limit keys use X-Forwarded-For from Nginx / Vercel
app.set("trust proxy", 1);

/**
 * Rate limiting
 *
 * Vercel rewrites share edge IPs toward this API. Key by real client IP from
 * forwarded headers, and use a higher ceiling so homepage product fan-out
 * does not trigger HTTP 429 for everyone.
 */
function clientKey(req: express.Request): string {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length > 0) {
    return xf.split(",")[0].trim();
  }
  if (Array.isArray(xf) && xf[0]) return String(xf[0]).split(",")[0].trim();
  const real = req.headers["x-real-ip"];
  if (typeof real === "string" && real.length > 0) return real;
  return req.ip || "unknown";
}

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => clientKey(req),
  message: {
    success: false,
    error: "Too many requests. Please wait a moment and try again.",
  },
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyGenerator: (req) => clientKey(req),
  message: {
    success: false,
    error: "Too many auth attempts. Try again later.",
  },
});

// Body parsing
// JSON limit raised to 50 MB for large admin payloads.
// Note: multipart file uploads are handled by multer (up to 60 GB) and
// bypass these parsers entirely — they only apply to JSON / urlencoded bodies.
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Serve uploaded files.
// Security: all non-image files are forced to download as attachments so an
// uploaded HTML or script file cannot execute in the browser on this origin.
// Images are served inline (needed for product thumbnails), but with a
// restrictive Content-Security-Policy so inline scripts inside SVGs are blocked.
app.use(
  "/uploads",
  (req, res, next) => {
    const ext = req.path.split(".").pop()?.toLowerCase() ?? "";
    const isImage = /^(jpe?g|png|gif|webp)$/.test(ext);
    const isSvg  = ext === "svg";

    if (isSvg) {
      // SVG can carry inline scripts — serve as attachment
      res.setHeader("Content-Disposition", "attachment");
      res.setHeader("Content-Security-Policy", "default-src 'none'");
    } else if (isImage) {
      // Safe raster images — allow inline display
      res.setHeader("Content-Security-Policy", "default-src 'none'");
    } else {
      // Everything else (HTML, JS, ZIP, APK, …) — force download
      const filename = req.path.split("/").pop() ?? "download";
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    }

    next();
  },
  express.static(UPLOAD_DIR),
);

// Health — always responds, even if DB is degraded
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "astrax-void-api",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
  });
});

app.get("/health/db", async (_req, res) => {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    res.json({
      status: "ok",
      database: "connected",
    });
  } catch {
    console.error("✗ Database health check failed: MongoDB unavailable");
    res.status(503).json({
      status: "error",
      database: "unavailable",
      error: "Database unavailable",
    });
  }
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/upload", uploadRoutes);
app.use("/api/user", userRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/downloads", downloadRoutes);

// Error handler
app.use(errorHandler);

// ── Start server after confirming database is reachable ───────────────────────
async function start() {
  try {
    await prisma.$connect();
    console.log("✓ Database connected");
  } catch {
    console.error("✗ Database connection failed");
    console.error(
      "  MongoDB Atlas may be blocking this server. Add the EC2 public IP to Atlas → Network Access, or temporarily allow 0.0.0.0/0 for testing.",
    );
    console.error(
      "  Also verify the mongodb+srv:// connection string, credentials, and Atlas replica set availability.",
    );
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log("");
    console.log("══════════════════════════════════════════════");
    console.log("  ASTRAX-VOID API — Startup Report");
    console.log("══════════════════════════════════════════════");
    console.log(`  Environment     : ${process.env.NODE_ENV || "development"}`);
    console.log(`  Port            : ${PORT}`);
    console.log(`  DATABASE_URL    : ✓ Loaded`);
    console.log(`  JWT_SECRET      : ${process.env.JWT_SECRET ? "✓ Loaded" : "✗ MISSING"}`);
    console.log(`  CORS_ORIGIN     : ${process.env.CORS_ORIGIN ? "✓ Loaded" : "✗ MISSING"}`);
    console.log(`  Allowed origins :`);
    [...corsAllowlist].forEach((o) => console.log(`    • ${o}`));
    console.log("══════════════════════════════════════════════");
    console.log(`🚀 API listening on http://0.0.0.0:${PORT}`);
    console.log("");
  });

  // Server-side timeouts.
  //
  // server.requestTimeout: time allowed to receive the full HTTP request body
  // from the client.  Node.js default is 300 000 ms (5 min), which would abort
  // any 60 GB upload that takes longer than 5 minutes.
  //
  // We raise it to a single finite ceiling (48 h) that covers the worst-case
  // transfer time for a 60 GB file over a slow link (~2–3 Mbps ≈ 45 h) while
  // still being bounded.  This is safe because:
  //   • All non-upload endpoints have an Express body-size cap (50 MB) that
  //     causes the connection to close well before the deadline is reached on
  //     any realistic link speed.
  //   • The upload endpoint requires admin authentication; unauthenticated
  //     requests are rejected by requireAuth before multer reads the body.
  //   • The rate limiter (3 000 req / 15 min per IP) prevents connection
  //     exhaustion from any single client.
  //
  // server.timeout: socket inactivity timeout.  Node 18+ default is already 0
  // (no inactivity timeout); we leave it unset.
  server.requestTimeout = 48 * 60 * 60 * 1000; // 48 h finite ceiling
  server.keepAliveTimeout = 120_000; // 2 min keep-alive after response
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
