import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { createHmac } from "crypto";
import { AppError } from "./errorHandler.js";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Validate the local admin session token produced by the Next.js
 * /api/admin-auth route (HMAC-SHA256 of `admin:${ADMIN_PASSWORD}`).
 * Cookie / Bearer format: "local:<hex>" or just "<hex>".
 */
function isValidAdminSessionToken(raw: string): boolean {
  const isProd = process.env.NODE_ENV === "production";
  // Keep defaults in sync with apps/web/app/api/admin-auth/route.ts
  const adminPassword =
    process.env.ADMIN_PASSWORD || (!isProd ? "mickyp007" : undefined);
  const sessionSecret =
    process.env.SESSION_SECRET ||
    (!isProd ? "dev-session-secret-change-me" : undefined) ||
    process.env.JWT_SECRET ||
    "";

  if (!adminPassword || !sessionSecret) return false;

  const hex = raw.startsWith("local:") ? raw.slice(6) : raw;
  if (!/^[a-f0-9]{32,}$/i.test(hex)) return false;

  const expected = createHmac("sha256", sessionSecret)
    .update(`admin:${adminPassword}`)
    .digest("hex");

  // Constant-time-ish compare
  if (hex.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < hex.length; i++) {
    mismatch |= hex.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized — missing or invalid Authorization header", 401));
  }

  const token = header.slice(7).trim();

  // 1) Local admin session token (from /admin/login password flow)
  if (token.startsWith("admin:") || token.startsWith("local:") || isValidAdminSessionToken(token)) {
    const raw = token.startsWith("admin:") ? token.slice(6) : token;
    if (isValidAdminSessionToken(raw)) {
      req.user = {
        id: "local-admin",
        email: "admin@local",
        role: "ADMIN",
      };
      return next();
    }
    return next(new AppError("Invalid or expired admin session", 401));
  }

  // 2) Standard JWT
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      role: string;
    };
    req.user = payload;
    next();
  } catch {
    next(new AppError("Invalid or expired token", 401));
  }
}

export function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "ADMIN") {
    return next(new AppError("Admin access required", 403));
  }
  next();
}
