import { PrismaClient } from "@prisma/client";

/**
 * Singleton PrismaClient — shared across all route/service files.
 * The base instance is stored on globalThis so it survives module
 * re-evaluation (e.g. ts-node-dev / tsx --watch hot reloads).
 * The exported `prisma` is an *extended* client that adds pre-query
 * logging and automatic retry around every model operation.
 */

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

// ── Error classification ──────────────────────────────────────────────────────

export type DbErrorKind =
  | "auth"
  | "dns"
  | "server-selection-timeout"
  | "network-timeout"
  | "unknown";

/**
 * Classify a thrown Prisma/MongoDB error into one of four actionable buckets.
 * Matching is intentionally broad so both Prisma error codes and raw driver
 * messages are caught.
 */
export function classifyDbError(error: unknown): DbErrorKind {
  const e = error as { name?: string; code?: string; message?: string };
  const msg = (e?.message ?? "").toLowerCase();
  const code = e?.code ?? "";

  // P1000 = authentication failure
  if (
    code === "P1000" ||
    msg.includes("authentication failed") ||
    msg.includes("not authorized") ||
    msg.includes("bad auth")
  ) {
    return "auth";
  }

  // DNS / hostname resolution
  if (
    msg.includes("getaddrinfo") ||
    msg.includes("enotfound") ||
    msg.includes("failed to resolve") ||
    msg.includes("dns")
  ) {
    return "dns";
  }

  // P1001 = server selection timeout / replica set unavailable
  if (
    code === "P1001" ||
    msg.includes("server selection timeout") ||
    msg.includes("no available servers") ||
    msg.includes("replicasetnoprimary") ||
    // "replicaset" alone is broad enough to cover topology messages
    (msg.includes("replicaset") && msg.includes("timeout"))
  ) {
    return "server-selection-timeout";
  }

  // P1008 = operation timed out (network / socket level)
  if (
    code === "P1008" ||
    msg.includes("network timeout") ||
    msg.includes("etimedout") ||
    msg.includes("econnreset") ||
    msg.includes("socket timeout") ||
    msg.includes("timed out")
  ) {
    return "network-timeout";
  }

  return "unknown";
}

/**
 * Return a human-readable, operator-actionable description for a DB error.
 */
export function describeDbError(error: unknown): string {
  switch (classifyDbError(error)) {
    case "auth":
      return (
        "MongoDB authentication failed — verify the username/password in " +
        "DATABASE_URL and the Atlas database user's role"
      );
    case "dns":
      return (
        "MongoDB DNS resolution failed — check the cluster hostname in " +
        "DATABASE_URL and ensure this server can reach the internet"
      );
    case "server-selection-timeout":
      return (
        "MongoDB server selection timed out — the Atlas replica set may be " +
        "degraded, or this server's IP is not in Atlas → Network Access"
      );
    case "network-timeout":
      return (
        "MongoDB network timeout — connection was established but a query " +
        "timed out; check Atlas region latency and serverSelectionTimeoutMS"
      );
    default:
      return "MongoDB query failed — check Atlas status and the connection string";
  }
}

// ── Backward-compatible helpers used by errorHandler ─────────────────────────

const DATABASE_ERROR_NAMES = new Set([
  "PrismaClientInitializationError",
  "PrismaClientRustPanicError",
  "PrismaClientUnknownRequestError",
]);

const DATABASE_ERROR_CODES = new Set(["P1000", "P1001", "P1008", "P1017", "P2024"]);

export function isDatabaseUnavailable(error: unknown): boolean {
  const candidate = error as { name?: unknown; code?: unknown };
  const name = typeof candidate?.name === "string" ? candidate.name : "";
  const code = typeof candidate?.code === "string" ? candidate.code : "";
  return (
    DATABASE_ERROR_NAMES.has(name) ||
    DATABASE_ERROR_CODES.has(code) ||
    classifyDbError(error) !== "unknown"
  );
}

export function databaseFailureSummary(error: unknown): string {
  return describeDbError(error);
}

// ── Retry wrapper ─────────────────────────────────────────────────────────────

/** Error kinds that are worth retrying (transient topology / network blips). */
const RETRIABLE: DbErrorKind[] = ["server-selection-timeout", "network-timeout"];

/** Back-off delays (ms) between attempts 1→2, 2→3, and 3→4. */
const RETRY_DELAYS_MS = [500, 1500, 3000] as const;

/**
 * Run `fn` and, on retriable MongoDB errors, wait then retry up to
 * `RETRY_DELAYS_MS.length` additional times before giving up.
 *
 * @param fn    - Async function to attempt. Receives the 1-based attempt number.
 * @param label - Short description for log lines (e.g. "Product.findMany").
 */
export async function withRetry<T>(
  fn: (attempt: number) => Promise<T>,
  label: string,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= RETRY_DELAYS_MS.length + 1; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      const kind = classifyDbError(err);

      if (!RETRIABLE.includes(kind) || attempt > RETRY_DELAYS_MS.length) {
        throw err;
      }

      const delay = RETRY_DELAYS_MS[attempt - 1];
      console.warn(
        `[DB] ${label} — attempt ${attempt} failed [${kind}]; ` +
          `retrying in ${delay}ms`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// ── Singleton base client ─────────────────────────────────────────────────────

const _base: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["warn"],
  });

// Persist on globalThis so hot-reload does not create a second connection pool.
globalForPrisma.prisma = _base;

// ── Extended client: pre-query logging + automatic retry ──────────────────────

/**
 * Use this everywhere instead of constructing a new PrismaClient.
 *
 * Every model operation is wrapped with:
 *   1. A log line before the query fires  (visibility into connection state)
 *   2. Elapsed-time logging on success
 *   3. Classified error logging on failure
 *   4. Automatic retry (up to 3 extra attempts) for transient Atlas outages
 */
export const prisma = _base.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const label = `${model}.${operation}`;

        return withRetry(async (attempt) => {
          const start = Date.now();

          if (attempt === 1) {
            console.log(`[DB] ${label} — starting`);
          } else {
            console.log(`[DB] ${label} — attempt ${attempt}`);
          }

          try {
            const result = await query(args);
            console.log(`[DB] ${label} — ok (${Date.now() - start}ms)`);
            return result;
          } catch (err) {
            const kind = classifyDbError(err);
            console.error(
              `[DB] ${label} — failed after ${Date.now() - start}ms ` +
                `[${kind}]: ${describeDbError(err)}`,
            );
            throw err;
          }
        }, label);
      },
    },
  },
});
