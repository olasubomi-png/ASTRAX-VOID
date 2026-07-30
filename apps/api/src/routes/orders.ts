import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();
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
      where: { id: req.params.id, userId: req.user!.id },
      include: { items: true },
    });
    if (!order) throw new AppError("Order not found", 404);
    res.json({ success: true, order });
  } catch (err) {
    next(err);
  }
});

export { router as orderRoutes };
