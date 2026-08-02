import { Router } from "express";
import { requireAuth, requireAdmin, AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { prisma } from "../lib/prisma.js";
const router = Router();

router.use(requireAuth, requireAdmin);

// Dashboard stats
router.get("/stats", async (_req, res, next) => {
  try {
    const [users, orders, products, revenue] = await Promise.all([
      prisma.user.count(),
      prisma.order.count({ where: { status: { in: ["PAID", "DELIVERED"] } } }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.aggregate({
        where: { status: { in: ["PAID", "DELIVERED"] } },
        _sum: { total: true },
      }),
    ]);

    res.json({
      success: true,
      stats: {
        users,
        orders,
        products,
        revenue: revenue._sum.total || 0,
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
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { isActive: false },
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
