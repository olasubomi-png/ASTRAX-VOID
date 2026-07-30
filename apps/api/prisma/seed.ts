import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ASTRAX-VOID database...");

  // Categories
  const vip = await prisma.category.upsert({
    where: { slug: "vip-packages" },
    update: {},
    create: { slug: "vip-packages", name: "VIP Packages", icon: "Crown", sortOrder: 1 },
  });
  const codm = await prisma.category.upsert({
    where: { slug: "codm-files" },
    update: {},
    create: { slug: "codm-files", name: "CODM Files", icon: "Gamepad2", sortOrder: 2 },
  });
  const tools = await prisma.category.upsert({
    where: { slug: "unlock-tools" },
    update: {},
    create: { slug: "unlock-tools", name: "Unlock Tools", icon: "Wrench", sortOrder: 3 },
  });
  const bundles = await prisma.category.upsert({
    where: { slug: "bundles" },
    update: {},
    create: { slug: "bundles", name: "Bundles", icon: "Package", sortOrder: 4 },
  });

  // Products
  await prisma.product.upsert({
    where: { slug: "astrax-vip-elite" },
    update: {},
    create: {
      slug: "astrax-vip-elite",
      name: "ASTRAX VIP Elite",
      description:
        "Full elite VIP package with premium modules, priority support, and lifetime updates.",
      shortDescription: "Elite VIP with premium modules",
      price: 99.99,
      salePrice: 79.99,
      categoryId: vip.id,
      images: [],
      features: ["Aimbot", "ESP", "Anti-Detection", "HWID Spoofer", "24/7 Support"],
      requirements: ["Android 10+", "Compatible game version"],
      stock: null,
      rating: 4.9,
      reviewCount: 342,
      isFeatured: true,
      isTrending: true,
      tags: ["vip", "elite"],
    },
  });

  await prisma.product.upsert({
    where: { slug: "codm-premium-v5" },
    update: {},
    create: {
      slug: "codm-premium-v5",
      name: "CODM Premium V5",
      description: "Latest CODM premium files. Instant delivery, undetected.",
      price: 49.99,
      categoryId: codm.id,
      images: [],
      features: ["Silent Aim", "Wallhack", "No Recoil", "Rapid Updates"],
      stock: 50,
      rating: 4.8,
      reviewCount: 891,
      isFeatured: true,
      isTrending: true,
      tags: ["codm"],
    },
  });

  await prisma.product.upsert({
    where: { slug: "unlock-tool-pro" },
    update: {},
    create: {
      slug: "unlock-tool-pro",
      name: "Unlock Tool Pro",
      description: "Professional unlock toolkit with multi-game support.",
      price: 29.99,
      salePrice: 19.99,
      categoryId: tools.id,
      images: [],
      features: ["Multi-game", "HWID Spoofer", "Lifetime Updates"],
      stock: null,
      rating: 4.7,
      reviewCount: 215,
      isFeatured: true,
      isTrending: false,
      tags: ["tools"],
    },
  });

  await prisma.product.upsert({
    where: { slug: "bundle-dominator" },
    update: {},
    create: {
      slug: "bundle-dominator",
      name: "Dominator Bundle",
      description: "VIP + CODM + Tools in one package.",
      price: 149.99,
      salePrice: 119.99,
      categoryId: bundles.id,
      images: [],
      features: ["All VIP features", "CODM Premium", "Unlock Tools"],
      stock: 20,
      rating: 5.0,
      reviewCount: 67,
      isFeatured: true,
      isTrending: true,
      tags: ["bundle"],
    },
  });

  // Coupon
  await prisma.coupon.upsert({
    where: { code: "ASTRAX10" },
    update: {},
    create: {
      code: "ASTRAX10",
      type: "PERCENTAGE",
      value: 10,
      maxUses: 1000,
      isActive: true,
    },
  });

  // Admin user (password: admin123 — change in production!)
  const bcrypt = await import("bcryptjs");
  const hash = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@astraxvoid.com" },
    update: {},
    create: {
      email: "admin@astraxvoid.com",
      username: "admin",
      passwordHash: hash,
      role: "ADMIN",
      referralCode: "AXADMIN",
    },
  });

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
