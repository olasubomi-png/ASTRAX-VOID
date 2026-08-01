import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// Get all active categories
router.get("/", async (_req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    res.json({
      success: true,
      categories,
    });
  } catch (err) {
    next(err);
  }
});

// Get category by slug
router.get("/:slug", async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: {
        slug: req.params.slug,
      },
      include: {
        products: {
          where: {
            isActive: true,
          },
        },
      },
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      category,
    });
  } catch (err) {
    next(err);
  }
});

// Create category
router.post("/", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const category = await prisma.category.create({
      data: req.body,
    });

    res.status(201).json({
      success: true,
      category,
    });
  } catch (err) {
    next(err);
  }
});

// Update category
router.put("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const category = await prisma.category.update({
      where: {
        id: req.params.id,
      },
      data: req.body,
    });

    res.json({
      success: true,
      category,
    });
  } catch (err) {
    next(err);
  }
});

// Delete category
router.delete("/:id", requireAuth, requireAdmin, async (req, res, next) => {
  try {
    await prisma.category.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json({
      success: true,
      message: "Category deleted",
    });
  } catch (err) {
    next(err);
  }
});

export { router as categoryRoutes };
