import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient — shared across all route/service files.
 * Prevents opening multiple connection pools (one per route module),
 * which caused MongoDB connection exhaustion and process crashes.
 */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
