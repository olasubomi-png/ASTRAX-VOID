/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http",  hostname: "**" },  // Allow EC2 http:// images in dev
    ],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
    // Allow large file uploads (up to 65 GB) through the Next.js proxy rewrite.
    // When middleware returns NextResponse.next() for /api-proxy/* requests,
    // Next.js clones/buffers the request body before forwarding it to the
    // rewrite destination. Without this, the default cap returns HTTP 413
    // before the request ever reaches Express/multer.
    // (Only active in dev / Vercel — EC2/Nginx routes /api/* directly to Express.)
    middlewareClientMaxBodySize: "65gb",
  },

  // ── API proxy rewrite ──────────────────────────────────────────────────────
  //
  // DEPLOYMENT MODE SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Replit / local dev
  //    NEXT_PUBLIC_API_URL is unset → lib/api.ts falls back to "/api-proxy".
  //    This rewrite forwards /api-proxy/* → http://localhost:4000/api/*.
  //    (Container-to-container, so "localhost" resolves correctly.)
  //
  // 2. EC2 + Nginx  (recommended production setup)
  //    Set NEXT_PUBLIC_API_URL=/api in apps/web/.env.local before building.
  //    Nginx on :80 routes /api/* → Express on :4000 on the SAME machine.
  //    Same origin → no CORS, no proxy, no mixed-content.
  //    This rewrite is never triggered — Next.js never sees /api/* requests
  //    because Nginx sends them straight to Express.
  //
  // 3. Vercel  (frontend only, API hosted separately)
  //    NEXT_PUBLIC_API_URL=/api-proxy (set in vercel.json env).
  //    vercel.json rewrites /api-proxy/* → your Express API origin.
  //    For uploads > Vercel body limit: set NEXT_PUBLIC_UPLOAD_URL to the
  //    direct HTTPS Express URL so uploads bypass Vercel entirely.
  // ─────────────────────────────────────────────────────────────────────────
  async rewrites() {
    const apiInternalUrl =
      process.env.API_INTERNAL_URL || "http://localhost:4000";
    const publicApi =
      process.env.PUBLIC_API_URL ||
      process.env.API_INTERNAL_URL ||
      "http://localhost:4000";
    return [
      // Dev / Vercel: proxy /api-proxy/* → Express /api/*.
      // EC2/Nginx: this rule is defined but never reached (Nginx handles /api/*).
      {
        source: "/api-proxy/:path*",
        destination: `${apiInternalUrl}/api/:path*`,
      },
      // Proxy /uploads/* → Express static file server.
      {
        source: "/uploads/:path*",
        destination: `${publicApi.replace(/\/$/, "")}/uploads/:path*`,
      },
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
