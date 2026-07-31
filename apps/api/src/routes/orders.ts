import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { prisma } from "../lib/prisma.js";
const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
    res.json({ success: true, orders });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id as string, userId: req.user!.id },
      include: { items: true },
    });
    if (!order) throw new AppError("Order not found", 404);
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

export { router as orderRoutes };
