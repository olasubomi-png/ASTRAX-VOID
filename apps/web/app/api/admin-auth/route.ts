import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";

/**
 * POST /api/admin-auth
 * Validates the admin password and sets the admin_auth cookie.
 * Used as a fallback when the backend API is unreachable.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { password?: string; action?: string };

    if (body.action === "logout") {
      const res = NextResponse.json({ success: true });
      res.cookies.set("admin_auth", "", {
        maxAge: 0,
        path: "/",
      });
      return res;
    }

    const { password } = body;

    // Prefer explicit env var. In local development only, fall back to a
    // well-known default so the admin UI is usable without extra setup.
    // NEVER relies on the fallback in production (NODE_ENV=production).
    const isProd = process.env.NODE_ENV === "production";
    const adminPassword =
      process.env.ADMIN_PASSWORD ||
      (!isProd ? "mickyp007" : undefined);
    const sessionSecret =
      process.env.SESSION_SECRET ||
      (!isProd ? "dev-session-secret-change-me" : "fallback-secret-change-me");

    if (!adminPassword) {
      return NextResponse.json(
        {
          error:
            "ADMIN_PASSWORD is not configured on this deployment. " +
            "Add it in Vercel → Settings → Environment Variables, then redeploy.",
        },
        { status: 503 }
      );
    }

    if (!password || password !== adminPassword) {
      return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
    }

    // Create a deterministic, signed session token
    const token = createHmac("sha256", sessionSecret)
      .update(`admin:${adminPassword}`)
      .digest("hex");

    const res = NextResponse.json({ success: true, mode: "local" });
    res.cookies.set("admin_auth", `local:${token}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
