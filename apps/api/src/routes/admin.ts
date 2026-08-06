import { Router } from "express";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { prisma } from "../lib/prisma.js";
import { databaseFailureSummary, isDatabaseUnavailable } from "../lib/prisma.js";
import { logActivity } from "../lib/activity.js";
import fs from "fs";
import path from "path";
const router = Router();

router.use(requireAuth, requireAdmin);

function valueOr<T>(
  result: PromiseSettledResult<T>,
  fallback: T,
  label: string,
): T {
  if (result.status === "fulfilled") return result.value;
  console.warn(`[admin/stats] ${label} unavailable: ${databaseFailureSummary(result.reason)}`);
  return fallback;
}

// ── Dashboard stats (live DB only — no demo data) ───────────────────────────
router.get("/stats", async (_req, res, next) => {
  const statsStart = Date.now();
  console.log("[admin/stats] request received — starting DB queries");
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Batch 1: 14 queries in parallel. allSettled ensures a single failing
    // query never crashes the endpoint — valueOr() substitutes safe defaults.
    console.log("[admin/stats] batch 1 — firing 14 queries");
    const BATCH1_LABELS = [
      "product.count(all)",
      "product.count(active)",
      "user.count(all)",
      "user.count(admin)",
      "category.count(all)",
      "downloadLog.count(all)",
      "downloadLog.count(today)",
      "downloadLog.count(week)",
      "downloadLog.count(month)",
      "product.count(android)",
      "product.count(ios)",
      "user.findFirst(latest)",
      "product.findFirst(latest)",
      "activityLog.findMany(recent)",
    ];
    const initialResults = await Promise.allSettled([
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.category.count(),
      prisma.downloadLog.count(),
      prisma.downloadLog.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.downloadLog.count({ where: { createdAt: { gte: startOfWeek } } }),
      prisma.downloadLog.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.product.count({
        where: { category: { slug: "android-resources" }, isActive: true },
      }),
      prisma.product.count({
        where: { category: { slug: "ios-resources" }, isActive: true },
      }),
      prisma.user.findFirst({
        orderBy: { createdAt: "desc" },
        select: { id: true, username: true, email: true, createdAt: true },
      }),
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
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
    ]);

    const batch1Ok = initialResults.filter((r) => r.status === "fulfilled").length;
    const batch1Fail = initialResults.length - batch1Ok;
    console.log(
      `[admin/stats] batch 1 done — ${batch1Ok}/${initialResults.length} ok, ` +
        `${batch1Fail} failed (${Date.now() - statsStart}ms elapsed)`,
    );
    initialResults.forEach((r, i) => {
      if (r.status === "rejected") {
        console.error(
          `[admin/stats] batch 1[${i}] ${BATCH1_LABELS[i]} failed: ${databaseFailureSummary(r.reason)}`,
        );
      }
    });

    if (initialResults.every((result) => result.status === "rejected")) {
      const firstFailure = initialResults.find(
        (result): result is PromiseRejectedResult => result.status === "rejected",
      );
      if (firstFailure && isDatabaseUnavailable(firstFailure.reason)) {
        console.error("[admin/stats] all batch 1 queries failed — returning 503");
        res.status(503).json({ success: false, error: "Database unavailable" });
        return;
      }
    }

    const [
      products,
      productsActive,
      users,
      admins,
      categories,
      downloads,
      downloadsToday,
      downloadsWeek,
      downloadsMonth,
      androidProducts,
      iosProducts,
      latestUser,
      latestProduct,
      recentActivity,
    ] = [
      valueOr(initialResults[0], 0, "products"),
      valueOr(initialResults[1], 0, "active products"),
      valueOr(initialResults[2], 0, "users"),
      valueOr(initialResults[3], 0, "admins"),
      valueOr(initialResults[4], 0, "categories"),
      valueOr(initialResults[5], 0, "downloads"),
      valueOr(initialResults[6], 0, "downloads today"),
      valueOr(initialResults[7], 0, "downloads this week"),
      valueOr(initialResults[8], 0, "downloads this month"),
      valueOr(initialResults[9], 0, "Android products"),
      valueOr(initialResults[10], 0, "iOS products"),
      valueOr(initialResults[11], null, "latest user"),
      valueOr(initialResults[12], null, "latest product"),
      valueOr(initialResults[13], [], "recent activity"),
    ];

    // Batch 2: game groups
    console.log("[admin/stats] batch 2 — product.groupBy(gameSlug)");
    const [gameGroupsResult] = await Promise.allSettled([
      prisma.product.groupBy({
        by: ["gameSlug"],
        where: { gameSlug: { not: null } },
        _count: true,
      }),
    ]);
    if (gameGroupsResult.status === "rejected") {
      console.error(
        `[admin/stats] batch 2 product.groupBy failed: ${databaseFailureSummary(gameGroupsResult.reason)}`,
      );
    }
    const gameGroups = valueOr(gameGroupsResult, [], "game groups");
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
    const [topDownloadsResult] = await Promise.allSettled([
      prisma.downloadLog.groupBy({
        by: ["productName"],
        where: { productName: { not: null } },
        _count: { productName: true },
        orderBy: { _count: { productName: "desc" } },
        take: 1,
      }),
    ]);
    if (topDownloadsResult.status === "rejected") {
      console.error(
        `[admin/stats] batch 3 downloadLog.groupBy failed: ${databaseFailureSummary(topDownloadsResult.reason)}`,
      );
    }
    const topDownloads = valueOr(topDownloadsResult, [], "top downloads");
    const mostDownloaded = topDownloads[0]
      ? {
          name: topDownloads[0].productName,
          count: topDownloads[0]._count.productName,
        }
      : null;

    // Batch 4: downloads per day (last 7 days — 7 queries in parallel)
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
    const downloadDayResults = await Promise.allSettled(
      downloadDays.map(({ d, next }) =>
        prisma.downloadLog.count({ where: { createdAt: { gte: d, lt: next } } }),
      ),
    );
    downloadDays.forEach(({ d }, index) => {
      const count = valueOr(
        downloadDayResults[index],
        0,
        `downloads for ${d.toISOString().slice(0, 10)}`,
      );
      downloadsPerDay.push({ date: d.toISOString().slice(0, 10), count });
    });

    // Batch 5: new users today / this week
    console.log("[admin/stats] batch 5 — 2× user.count(time-range)");
    const [usersTodayResult, usersWeekResult] = await Promise.allSettled([
      prisma.user.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.user.count({ where: { createdAt: { gte: startOfWeek } } }),
    ]);
    if (usersTodayResult.status === "rejected") {
      console.error(
        `[admin/stats] batch 5 user.count(today) failed: ${databaseFailureSummary(usersTodayResult.reason)}`,
      );
    }
    if (usersWeekResult.status === "rejected") {
      console.error(
        `[admin/stats] batch 5 user.count(week) failed: ${databaseFailureSummary(usersWeekResult.reason)}`,
      );
    }
    const usersToday = valueOr(usersTodayResult, 0, "users today");
    const usersWeek = valueOr(usersWeekResult, 0, "users this week");

    console.log(
      `[admin/stats] all batches complete — responding (${Date.now() - statsStart}ms total)`,
    );
    res.json({
      success: true,
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
