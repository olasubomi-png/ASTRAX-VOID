/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
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
    middlewareClientMaxBodySize: "65gb",
  },

  // ── API proxy ──────────────────────────────────────────────────────────────
  // In development (Replit / local): the browser cannot reach localhost:4000
  // directly because the preview is proxied. We expose /api-proxy/* on the
  // Next.js origin and have Next.js server-side forward those requests to
  // Express — container-to-container, so localhost resolves correctly.
  //
  // In production: set NEXT_PUBLIC_API_URL to the absolute Express URL
  // (e.g. https://api.yourdomain.com/api) in your Vercel / hosting env vars.
  // The /api-proxy rewrite is still defined but never hit because the
  // frontend uses an absolute URL that bypasses it entirely.
  async rewrites() {
    const apiInternalUrl =
      process.env.API_INTERNAL_URL || "http://localhost:4000";
    const publicApi =
      process.env.PUBLIC_API_URL ||
      process.env.API_INTERNAL_URL ||
      "http://localhost:4000";
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${apiInternalUrl}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${publicApi.replace(/\/$/, "")}/uploads/:path*`,
      },
    ];
  },

  // Security headers — X-Frame-Options is handled by Nginx in production
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
