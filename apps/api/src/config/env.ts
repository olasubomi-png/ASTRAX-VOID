import dotenv from "dotenv";
import path from "path";

/**
 * Resolve the API environment file from the application directory rather
 * than process.cwd(). PM2 already uses apps/api as its cwd today, but using an
 * absolute path also keeps startup correct when PM2 is launched elsewhere.
 */
const apiDirectory = path.resolve(__dirname, "../..");
const envPath = path.join(apiDirectory, ".env");
const envResult = dotenv.config({ path: envPath });

if (envResult.error) {
  if (process.env.DATABASE_URL) {
    console.warn(
      "[config] apps/api/.env not found; using environment variables supplied by the process",
    );
  } else {
    console.error(
      "[config] apps/api/.env not found and DATABASE_URL was not supplied by the process",
    );
  }
} else {
  console.log("[config] loaded environment from apps/api/.env");
}

const isProduction = process.env.NODE_ENV === "production";
const requiredEnvironment = ["DATABASE_URL", "JWT_SECRET", "CORS_ORIGIN"] as const;
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);

if (!process.env.DATABASE_URL) {
  console.error(
    "✗ DATABASE_URL is missing. Set it in apps/api/.env or in the PM2 environment before starting the API.",
  );
  process.exit(1);
}

if (missingEnvironment.some((key) => key !== "DATABASE_URL")) {
  const missing = missingEnvironment.filter((key) => key !== "DATABASE_URL");
  const message = `Missing environment variables: ${missing.join(", ")}`;

  if (isProduction) {
    console.error(`✗ ASTRAX-VOID API cannot start — ${message}`);
    process.exit(1);
  }

  console.warn(`⚠ ${message} (development mode)`);
}

const databaseUrl = process.env.DATABASE_URL;
if (
  !databaseUrl.startsWith("mongodb://") &&
  !databaseUrl.startsWith("mongodb+srv://")
) {
  console.error(
    "✗ DATABASE_URL must be a MongoDB connection string beginning with mongodb:// or mongodb+srv://.",
  );
  process.exit(1);
}

console.log(
  `[config] DATABASE_URL loaded (${databaseUrl.startsWith("mongodb+srv://") ? "MongoDB Atlas SRV" : "MongoDB"} connection string)`,
);
