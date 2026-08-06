import { Router } from "express";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { databaseFailureSummary, prisma } from "../lib/prisma.js";
import { logActivity } from "../lib/activity.js";
import fs from "fs";
import path from "path";
const router = Router();

router.use(requireAuth, requireAdmin);

type GameGroup = { gameSlug: string | null };
type TopDownload = {
  productName: string | null;
  _count: { productName: number };
};

async function runStatsQuery<T>(
  label: string,
  operation: () => Promise<T>,
  fallback: T,
  errors: Record<string, string>,
): Promise<T> {
  console.log(`[admin/stats] query ${label} — starting`);
  try {
    return await operation();
  } catch (error) {
    const summary = databaseFailureSummary(error);
    errors[label] = summary;
    console.error(`[admin/stats] query ${label} failed: ${summary}`);
    return fallback;
  }
}

// ── Dashboard stats (live DB only — no demo data) ───────────────────────────
router.get("/stats", async (_req, res, next) => {
  const statsStart = Date.now();
  console.log("[admin/stats] request received — starting DB queries");
  try {
    const queryErrors: Record<string, string> = {};
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Batch 1: run sequentially so a server-selection timeout does not fan out
    // across a large set of queries. Each query returns a safe partial value.
    console.log("[admin/stats] batch 1 — running 14 queries sequentially");
    const products = await runStatsQuery(
      "product.count(all)",
      () => prisma.product.count(),
      0,
      queryErrors,
    );
    const productsActive = await runStatsQuery(
      "product.count(active)",
      () => prisma.product.count({ where: { isActive: true } }),
      0,
      queryErrors,
    );
    const users = await runStatsQuery("user.count(all)", () => prisma.user.count(), 0, queryErrors);
    const admins = await runStatsQuery(
      "user.count(admin)",
      () => prisma.user.count({ where: { role: "ADMIN" } }),
      0,
      queryErrors,
    );
    const categories = await runStatsQuery(
      "category.count(all)",
      () => prisma.category.count(),
      0,
      queryErrors,
    );
    const downloads = await runStatsQuery(
      "downloadLog.count(all)",
      () => prisma.downloadLog.count(),
      0,
      queryErrors,
    );
    const downloadsToday = await runStatsQuery(
      "downloadLog.count(today)",
      () => prisma.downloadLog.count({ where: { createdAt: { gte: startOfDay } } }),
      0,
      queryErrors,
    );
    const downloadsWeek = await runStatsQuery(
      "downloadLog.count(week)",
      () => prisma.downloadLog.count({ where: { createdAt: { gte: startOfWeek } } }),
      0,
      queryErrors,
    );
    const downloadsMonth = await runStatsQuery(
      "downloadLog.count(month)",
      () => prisma.downloadLog.count({ where: { createdAt: { gte: startOfMonth } } }),
      0,
      queryErrors,
    );
    const androidProducts = await runStatsQuery(
      "product.count(android)",
      () =>
        prisma.product.count({
          where: { category: { slug: "android-resources" }, isActive: true },
        }),
      0,
      queryErrors,
    );
    const iosProducts = await runStatsQuery(
      "product.count(ios)",
      () =>
        prisma.product.count({
          where: { category: { slug: "ios-resources" }, isActive: true },
        }),
      0,
      queryErrors,
    );
    const latestUser = await runStatsQuery(
      "user.findFirst(latest)",
      () =>
        prisma.user.findFirst({
          orderBy: { createdAt: "desc" },
          select: { id: true, username: true, email: true, createdAt: true },
        }),
      null,
      queryErrors,
    );
    const latestProduct = await runStatsQuery(
      "product.findFirst(latest)",
      () =>
        prisma.product.findFirst({
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            slug: true,
            gameSlug: true,
            createdAt: true,
            category: { select: { slug: true, name: true } },
          },
        }),
      null,
      queryErrors,
    );
    const recentActivity = await runStatsQuery(
      "activityLog.findMany(recent)",
      () =>
        prisma.activityLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
      [],
      queryErrors,
    );
    console.log(
      `[admin/stats] batch 1 done — ${14 - Object.keys(queryErrors).length}/14 ok, ` +
        `${Object.keys(queryErrors).length} failed (${Date.now() - statsStart}ms elapsed)`,
    );

    // Batch 2: game groups
    console.log("[admin/stats] batch 2 — product.groupBy(gameSlug)");
    const gameGroups = await runStatsQuery<GameGroup[]>(
      "product.groupBy(gameSlug)",
      () =>
        prisma.product.groupBy({
          by: ["gameSlug"],
          where: { gameSlug: { not: null } },
          _count: true,
        }),
      [],
      queryErrors,
    );
    const games = gameGroups.filter((g) => g.gameSlug).length;

    // Storage from uploads directory
    let storageBytes = 0;
    let uploadedFiles = 0;
    let uploadedImages = 0;
    let uploadedZips = 0;
    try {
      const uploadDir = path.resolve(process.cwd(), "uploads");
      if (fs.existsSync(uploadDir)) {
        const files = fs.readdirSync(uploadDir);
        uploadedFiles = files.length;
        for (const f of files) {
          const fp = path.join(uploadDir, f);
          try {
            const st = fs.statSync(fp);
            if (st.isFile()) {
              storageBytes += st.size;
              const lower = f.toLowerCase();
              if (/\.(jpe?g|png|gif|webp|svg)$/.test(lower)) uploadedImages += 1;
              if (/\.(zip|rar|7z)$/.test(lower)) uploadedZips += 1;
            }
          } catch {
            /* skip */
          }
        }
      }
    } catch {
      /* ignore storage errors */
    }

    // Batch 3: top downloaded product
    console.log("[admin/stats] batch 3 — downloadLog.groupBy(productName)");
    const topDownloads = await runStatsQuery<TopDownload[]>(
      "downloadLog.groupBy(productName)",
      () =>
        prisma.downloadLog.groupBy({
          by: ["productName"],
          where: { productName: { not: null } },
          _count: { productName: true },
          orderBy: { _count: { productName: "desc" } },
          take: 1,
        }),
      [],
      queryErrors,
    );
    const mostDownloaded = topDownloads[0]
      ? {
          name: topDownloads[0].productName,
          count: topDownloads[0]._count.productName,
        }
      : null;

    // Batch 4: downloads per day (last 7 days — sequential to limit DB load)
    console.log("[admin/stats] batch 4 — 7× downloadLog.count(per-day)");
    const downloadsPerDay: { date: string; count: number }[] = [];
    const downloadDays = Array.from({ length: 7 }, (_, index) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - index));
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      return { d, next };
    });
    for (const { d, next } of downloadDays) {
      const date = d.toISOString().slice(0, 10);
      const count = await runStatsQuery(
        `downloadLog.count(${date})`,
        () => prisma.downloadLog.count({ where: { createdAt: { gte: d, lt: next } } }),
        0,
        queryErrors,
      );
      downloadsPerDay.push({ date, count });
    }

    // Batch 5: new users today / this week
    console.log("[admin/stats] batch 5 — 2× user.count(time-range)");
    const usersToday = await runStatsQuery(
      "user.count(today)",
      () => prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
      0,
      queryErrors,
    );
    const usersWeek = await runStatsQuery(
      "user.count(week)",
      () => prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
      0,
      queryErrors,
    );

    console.log(
      `[admin/stats] all batches complete — responding (${Date.now() - statsStart}ms total)`,
    );
    res.json({
      success: true,
      partial: Object.keys(queryErrors).length > 0,
      errors: queryErrors,
      stats: {
        products,
        productsActive,
        users,
        admins,
        categories,
        games,
        androidResources: androidProducts,
        iosResources: iosProducts,
        downloads,
        downloadsToday,
        downloadsWeek,
        downloadsMonth,
        mostDownloaded,
        usersToday,
        usersWeek,
        storageBytes,
        storageMB: Math.round((storageBytes / (1024 * 1024)) * 10) / 10,
        uploadedFiles,
        uploadedImages,
        uploadedZips,
        latestUser,
        latestProduct,
        downloadsPerDay,
        recentActivity,
      },
    });
  } catch (err) {
    console.error(`[admin/stats] unhandled exception after ${Date.now() - statsStart}ms:`, err);
    next(err);
  }
});

// Live user list
router.get("/users", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true,
          avatar: true,
        },
      }),
      prisma.user.count(),
    ]);
    res.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// Download logs
router.get("/downloads", async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      prisma.downloadLog.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: { select: { username: true, email: true } },
        },
      }),
      prisma.downloadLog.count(),
    ]);
    res.json({
      success: true,
      downloads: logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// Activity feed
router.get("/activity", async (req, res, next) => {
  try {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 40));
    const activity = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    res.json({ success: true, activity });
  } catch (err) {
    next(err);
  }
});

// Storage summary
router.get("/storage", async (_req, res, next) => {
  try {
    const uploadDir = path.resolve(process.cwd(), "uploads");
    let bytes = 0;
    let files = 0;
    let images = 0;
    let zips = 0;
    if (fs.existsSync(uploadDir)) {
      for (const f of fs.readdirSync(uploadDir)) {
        const fp = path.join(uploadDir, f);
        try {
          const st = fs.statSync(fp);
          if (!st.isFile()) continue;
          files += 1;
          bytes += st.size;
          const lower = f.toLowerCase();
          if (/\.(jpe?g|png|gif|webp|svg)$/.test(lower)) images += 1;
          if (/\.(zip|rar|7z)$/.test(lower)) zips += 1;
        } catch {
          /* skip */
        }
      }
    }
    res.json({
      success: true,
      storage: {
        bytes,
        mb: Math.round((bytes / (1024 * 1024)) * 10) / 10,
        files,
        images,
        zips,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Products CRUD
router.get("/products", async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
});

/**
 * Resolve categorySlug → categoryId. Creates a category from the slug if missing
 * so admin can add products without seeding first.
 */
async function resolveCategoryId(body: Record<string, unknown>): Promise<string> {
  if (typeof body.categoryId === "string" && body.categoryId.length > 0) {
    return body.categoryId;
  }
  const slug =
    typeof body.categorySlug === "string" ? body.categorySlug.trim() : "";
  if (!slug) {
    throw new AppError("Category is required (select a category)", 400);
  }
  let category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    const name = slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
    category = await prisma.category.create({
      data: { slug, name, isActive: true },
    });
  }
  return category.id;
}

function buildProductData(
  body: Record<string, unknown>,
  categoryId: string,
  opts: { forCreate: boolean }
) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  if (opts.forCreate && (!name || !description)) {
    throw new AppError("Name and description are required", 400);
  }

  let slug =
    typeof body.slug === "string" && body.slug.trim()
      ? body.slug.trim()
      : name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
  if (!slug) slug = `product-${Date.now()}`;

  const data: Record<string, unknown> = {
    categoryId,
  };

  if (name) data.name = name;
  if (description) data.description = description;
  if (slug) data.slug = slug;

  if ("shortDescription" in body) {
    data.shortDescription =
      typeof body.shortDescription === "string" && body.shortDescription.trim()
        ? body.shortDescription.trim()
        : null;
  }
  if ("price" in body) {
    data.price = typeof body.price === "number" ? body.price : Number(body.price) || 0;
  } else if (opts.forCreate) {
    data.price = 0;
  }
  if ("currency" in body && typeof body.currency === "string") {
    data.currency = body.currency;
  } else if (opts.forCreate) {
    data.currency = "USD";
  }
  if (Array.isArray(body.images)) data.images = body.images;
  else if (opts.forCreate) data.images = [];

  if (Array.isArray(body.features)) data.features = body.features;
  else if (opts.forCreate) data.features = [];

  if (Array.isArray(body.requirements)) data.requirements = body.requirements;
  else if (opts.forCreate) data.requirements = [];

  if (Array.isArray(body.tags)) data.tags = body.tags;
  else if (opts.forCreate) data.tags = [];

  if ("fileKey" in body) {
    data.fileKey =
      typeof body.fileKey === "string" && body.fileKey.trim()
        ? body.fileKey.trim()
        : null;
  }
  if ("isFeatured" in body) data.isFeatured = Boolean(body.isFeatured);
  if ("isTrending" in body) data.isTrending = Boolean(body.isTrending);
  if ("isActive" in body) data.isActive = Boolean(body.isActive);
  else if (opts.forCreate) data.isActive = true;

  if ("gameSlug" in body) {
    data.gameSlug =
      typeof body.gameSlug === "string" && body.gameSlug.trim()
        ? body.gameSlug.trim()
        : null;
  }

  return data;
}

router.post("/products", async (req, res, next) => {
  try {
    const body = (req.body || {}) as Record<string, unknown>;
    const categoryId = await resolveCategoryId(body);
    const data = buildProductData(body, categoryId, { forCreate: true });

    // Ensure unique slug
    const existing = await prisma.product.findUnique({
      where: { slug: data.slug as string },
    });
    if (existing) {
      data.slug = `${data.slug}-${Date.now().toString(36)}`;
    }

    const product = await prisma.product.create({
      data: data as any,
      include: { category: true },
    });
    await logActivity({
      type: "product_create",
      message: `Admin uploaded product "${product.name}"`,
      meta: { productId: product.id, gameSlug: product.gameSlug },
    });
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

router.patch("/products/:id", async (req, res, next) => {
  try {
    const body = { ...(req.body || {}) } as Record<string, unknown>;
    let categoryId: string | undefined;
    if (body.categorySlug || body.categoryId) {
      categoryId = await resolveCategoryId(body);
    }
    const data = buildProductData(body, categoryId || (body.categoryId as string) || "", {
      forCreate: false,
    });
    // Don't overwrite categoryId with empty
    if (!categoryId) delete data.categoryId;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: data as any,
      include: { category: true },
    });
    await logActivity({
      type: "product_edit",
      message: `Admin updated product "${product.name}"`,
      meta: { productId: product.id },
    });
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    const deleted = await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
    });
    await logActivity({
      type: "product_delete",
      message: `Admin unpublished product "${deleted.name}"`,
      meta: { productId: deleted.id },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// Orders
router.get("/orders", async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, user: { select: { email: true, username: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

// Coupons
router.get("/coupons", async (_req, res, next) => {
  try {
    const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
    res.json({ success: true, coupons });
  } catch (err) {
    next(err);
  }
});

router.post("/coupons", async (req, res, next) => {
  try {
    const coupon = await prisma.coupon.create({ data: req.body });
    res.status(201).json({ success: true, coupon });
  } catch (err) {
    next(err);
  }
});

export { router as adminRoutes };
