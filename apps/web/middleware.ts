import { NextRequest, NextResponse } from "next/server";

/** Paths that anyone can open without logging in */
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/admin/login",
  "/terms",
  "/privacy",
  "/refund",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/login" || pathname === "/register") return true;
  return PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next internals and static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/api-proxy") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".") // favicon, images, etc.
  ) {
    return NextResponse.next();
  }

  const userAuth = request.cookies.get("user_auth")?.value;
  const adminAuth = request.cookies.get("admin_auth")?.value;
  const sessionFlag = request.cookies.get("astrax_session")?.value;
  // Any of these means the client established a session after login/register
  const isLoggedIn = Boolean(userAuth || adminAuth || sessionFlag === "1");

  // Admin area — requires admin_auth specifically
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!adminAuth) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Site-wide gate: require login for everything else
  if (!isPublicPath(pathname) && !isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in, keep them off the auth forms
  if (isLoggedIn && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals.
     * Static files with extensions are skipped in the handler above.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
