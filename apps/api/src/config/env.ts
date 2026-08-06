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

const isMongoConnectionString = (value: string | undefined): boolean =>
  Boolean(
    value &&
      (value.startsWith("mongodb://") || value.startsWith("mongodb+srv://")),
  );
const isProduction = process.env.NODE_ENV === "production";

/**
 * DATABASE_URL is reserved by Replit and may be populated with a non-Mongo
 * runtime value. Prefer the explicitly configured Atlas secret when present,
 * while retaining DATABASE_URL support for EC2/PM2 deployments.
 */
const databaseUrl = isMongoConnectionString(process.env.ATLAS_DATABASE_URL)
  ? process.env.ATLAS_DATABASE_URL
  : isMongoConnectionString(process.env.DATABASE_URL)
    ? process.env.DATABASE_URL
    : undefined;

if (!databaseUrl) {
  console.error(
    "✗ MongoDB connection string is missing. Set ATLAS_DATABASE_URL securely on Replit, or DATABASE_URL in apps/api/.env on EC2/PM2.",
  );
  process.exit(1);
}

process.env.DATABASE_URL = databaseUrl;

const requiredEnvironment = ["JWT_SECRET", "CORS_ORIGIN"] as const;
const missingEnvironment = requiredEnvironment.filter((key) => !process.env[key]);

if (missingEnvironment.length > 0) {
  const missing = missingEnvironment;
  const message = `Missing environment variables: ${missing.join(", ")}`;

  if (isProduction) {
    console.error(`✗ ASTRAX-VOID API cannot start — ${message}`);
    process.exit(1);
  }

  console.warn(`⚠ ${message} (development mode)`);
}

console.log(
  `[config] ${process.env.ATLAS_DATABASE_URL === databaseUrl ? "ATLAS_DATABASE_URL" : "DATABASE_URL"} loaded (${databaseUrl.startsWith("mongodb+srv://") ? "MongoDB Atlas SRV" : "MongoDB"} connection string)`,
);
