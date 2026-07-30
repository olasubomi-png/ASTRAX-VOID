import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middleware/errorHandler.js";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const {
      category,
      search,
      sort = "newest",
      minPrice,
      maxPrice,
      page = "1",
      limit = "20",
    } = req.query;

    const where: any = { isActive: true };
    if (category) where.category = { slug: category as string };
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: "insensitive" } },
        { description: { contains: search as string, mode: "insensitive" } },
        { tags: { has: search as string } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number(minPrice);
      if (maxPrice) where.price.lte = Number(maxPrice);
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    if (sort === "price-desc") orderBy = { price: "desc" };
    if (sort === "popular") orderBy = { reviewCount: "desc" };
    if (sort === "rating") orderBy = { rating: "desc" };

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: Number(limit),
        include: { category: true },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/featured", async (_req, res, next) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      include: { category: true },
    });
    res.json({ success: true, products });
  } catch (err) {
    next(err);
  }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        category: true,
        reviews: {
          where: { isApproved: true },
          take: 20,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { username: true, avatar: true } } },
        },
      },
    });
    if (!product || !product.isActive) throw new AppError("Product not found", 404);
    res.json({ success: true, product });
  } catch (err) {
    next(err);
  }
});

export { router as productRoutes };
