import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();
const router = Router();

router.use(requireAuth);

// Downloads
router.get("/downloads", async (req: AuthRequest, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: req.user!.id,
        status: { in: ["PAID", "DELIVERED"] },
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    const downloads = (
      orders as Array<{ id: string; createdAt: Date; items: Record<string, unknown>[] }>
    ).flatMap((o) =>
      o.items.map((item) => ({
        ...item,
        orderId: o.id,
        orderDate: o.createdAt,
      }))
    );

    res.json({ success: true, downloads });
  } catch (err) {
    next(err);
  }
});

// Wishlist
router.get("/wishlist", async (req: AuthRequest, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user!.id },
      include: { product: true },
    });
    res.json({ success: true, items });
  } catch (err) {
    next(err);
  }
});

router.post("/wishlist/:productId", async (req: AuthRequest, res, next) => {
  try {
    const productId = req.params.productId as string;
    const item = await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: req.user!.id,
          productId,
        },
      },
      create: {
        userId: req.user!.id,
        productId,
      },
      update: {},
    });
    res.json({ success: true, item });
  } catch (err) {
    next(err);
  }
});

router.delete("/wishlist/:productId", async (req: AuthRequest, res, next) => {
  try {
    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user!.id, productId: req.params.productId as string },
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export { router as userRoutes };
