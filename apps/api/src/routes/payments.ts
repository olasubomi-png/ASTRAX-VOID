import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { requireAuth, AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { deliverDigitalProduct } from "../services/delivery.js";

const prisma = new PrismaClient();
const router = Router();

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
    })
  ),
  paymentMethod: z.enum(["PAYSTACK", "FLUTTERWAVE", "STRIPE"]),
  couponCode: z.string().optional(),
});

// Create order + return payment intent data
router.post("/checkout", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const data = checkoutSchema.parse(req.body);
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    });

    if (products.length !== productIds.length) {
      throw new AppError("One or more products not found", 400);
    }

    let total = 0;
    const orderItemsData = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const price = product.salePrice ?? product.price;
      total += price * item.quantity;
      return {
        productId: product.id,
        name: product.name,
        price,
        quantity: item.quantity,
      };
    });

    // Coupon logic (simplified)
    let discount = 0;
    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });
      if (coupon && coupon.isActive) {
        if (coupon.type === "PERCENTAGE") {
          discount = (total * coupon.value) / 100;
        } else {
          discount = coupon.value;
        }
        total = Math.max(0, total - discount);
      }
    }

    const order = await prisma.order.create({
      data: {
        userId: req.user!.id,
        total,
        discount,
        couponCode: data.couponCode?.toUpperCase(),
        paymentMethod: data.paymentMethod,
        status: "PENDING",
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    // In production: initialize Paystack/Flutterwave/Stripe transaction here
    // and return authorization_url or client_secret

    res.status(201).json({
      success: true,
      order,
      payment: {
        method: data.paymentMethod,
        amount: total,
        reference: `AX-${order.id.slice(-8).toUpperCase()}`,
        // For demo: pretend payment can be confirmed immediately
        demoConfirmUrl: `/api/payments/confirm/${order.id}`,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Demo / webhook-style confirm (replace with real webhooks)
router.post("/confirm/:orderId", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.orderId, userId: req.user!.id },
      include: { items: true },
    });
    if (!order) throw new AppError("Order not found", 404);
    if (order.status !== "PENDING") throw new AppError("Order already processed", 400);

    // Mark paid
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID", paymentRef: `DEMO-${uuidv4().slice(0, 8)}` },
    });

    // Deliver digital products
    for (const item of order.items) {
      await deliverDigitalProduct(item.id, req.user!.id);
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: "DELIVERED" },
    });

    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });

    res.json({ success: true, order: updated, message: "Payment confirmed. Products delivered." });
  } catch (err) {
    next(err);
  }
});

export { router as paymentRoutes };
