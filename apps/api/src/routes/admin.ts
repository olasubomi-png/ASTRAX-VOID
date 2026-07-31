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

// Products CRUD (simplified)
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

router.post("/products", async (req, res, next) => {
  try {
    const product = await prisma.product.create({ data: req.body });
    res.status(201).json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

router.patch("/products/:id", async (req, res, next) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
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
