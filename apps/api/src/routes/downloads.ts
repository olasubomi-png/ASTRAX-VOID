import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { logActivity } from "../lib/activity.js";
import { requireAuth, AuthRequest } from "../middleware/auth.js";

const router = Router();

/**
 * POST /api/downloads/log
 * Record a free product download. Auth optional — if logged in, ties to user.
 */
router.post("/log", async (req, res, next) => {
  try {
    const { productId, productName, gameSlug, platform } = req.body || {};
    if (!productId && !productName) {
      return res.status(400).json({ success: false, error: "productId or productName required" });
    }

    let userId: string | null = null;
    const auth = req.headers.authorization;
    if (auth?.startsWith("Bearer ")) {
      try {
        // soft parse via requireAuth path is heavy; try jwt if present
        const jwt = await import("jsonwebtoken");
        const token = auth.slice(7);
        const payload = jwt.default.verify(token, process.env.JWT_SECRET!) as {
          id?: string;
        };
        if (payload?.id && payload.id !== "local-admin") userId = payload.id;
      } catch {
        /* guest download */
      }
    }

    const log = await prisma.downloadLog.create({
      data: {
        userId: userId || undefined,
        productId: typeof productId === "string" ? productId : undefined,
        productName: typeof productName === "string" ? productName : undefined,
        gameSlug: typeof gameSlug === "string" ? gameSlug : undefined,
        platform: typeof platform === "string" ? platform : undefined,
        ip: (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip,
        userAgent: req.headers["user-agent"]?.slice(0, 300),
      },
    });

    await logActivity({
      type: "download",
      message: `Downloaded ${productName || productId || "a product"}`,
      actorId: userId,
      meta: { productId, gameSlug, platform },
    });

    res.status(201).json({ success: true, id: log.id });
  } catch (err) {
    next(err);
  }
});

export { router as downloadRoutes };
