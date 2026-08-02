import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const first = await prisma.product.findFirst({
    where: { isActive: true },
  });

  if (!first) {
    console.log("No products found");
    return;
  }

  const updated = await prisma.product.update({
    where: { id: first.id },
    data: {
      gameSlug: "codm-global",
    },
  });

  console.log(updated.slug, "=>", updated.gameSlug);
}

main()
  .finally(() => prisma.$disconnect());
