import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();

    if (!q) {
      return res.json({
        success: true,
        products: [],
        categories: [],
      });
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              tags: {
                has: q,
              },
            },
          ],
        },
        include: {
          category: true,
        },
        take: 10,
      }),

      prisma.category.findMany({
        where: {
          isActive: true,
          OR: [
            {
              name: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      query: q,
      products,
      categories,
    });
  } catch (err) {
    next(err);
  }
});

export { router as searchRoutes };
