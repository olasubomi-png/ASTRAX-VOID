import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient — shared across all route/service files and across
 * hot reloads. Keeping the instance on globalThis also prevents duplicate
 * connection pools if this module is evaluated more than once in a process.
 */

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["warn"],
  });

globalForPrisma.prisma = prisma;

const DATABASE_ERROR_NAMES = new Set([
  "PrismaClientInitializationError",
  "PrismaClientRustPanicError",
  "PrismaClientUnknownRequestError",
]);

const DATABASE_ERROR_CODES = new Set(["P1001", "P1008", "P1017", "P2024"]);

export function isDatabaseUnavailable(error: unknown): boolean {
  const candidate = error as {
    name?: unknown;
    code?: unknown;
    message?: unknown;
  };
  const name = typeof candidate?.name === "string" ? candidate.name : "";
  const code = typeof candidate?.code === "string" ? candidate.code : "";
  const message =
    typeof candidate?.message === "string"
      ? candidate.message.toLowerCase()
      : "";

  return (
    DATABASE_ERROR_NAMES.has(name) ||
    DATABASE_ERROR_CODES.has(code) ||
    message.includes("server selection timeout") ||
    message.includes("replicaset") ||
    message.includes("no available servers") ||
    message.includes("connection") && message.includes("mongodb")
  );
}

export function databaseFailureSummary(error: unknown): string {
  return isDatabaseUnavailable(error)
    ? "MongoDB unavailable (check Atlas network access, replica set status, and credentials)"
    : "Database query failed";
}
