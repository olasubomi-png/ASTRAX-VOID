import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(str: string, length: number) {
  if (str.length <= length) return str;
  return str.slice(0, length) + "…";
}


/**
 * Resolve product image / download URLs for the browser.
 * - Absolute https:// URLs are used as-is
 * - Absolute http:// API host URLs are rewritten to same-origin /uploads/...
 *   so HTTPS pages (Vercel) are not blocked by mixed content
 * - Relative /uploads/... paths stay relative (proxied by Vercel rewrite)
 * - Bare filenames become /uploads/<name>
 */
export function mediaUrl(src?: string | null): string | null {
  if (!src || typeof src !== "string") return null;
  const s = src.trim();
  if (!s) return null;

  // Already relative path
  if (s.startsWith("/uploads/")) return s;
  if (s.startsWith("/")) return s;

  // Full URL — rewrite known API http host to same-origin path
  try {
    if (/^https?:\/\//i.test(s)) {
      const u = new URL(s);
      if (u.pathname.startsWith("/uploads/")) {
        // Same-origin proxy via Vercel rewrite (avoids mixed content)
        return u.pathname + u.search;
      }
      return s; // other absolute URLs (cdn, etc.)
    }
  } catch {
    /* ignore */
  }

  // Bare filename from older records
  if (!s.includes("/") || !s.startsWith("http")) {
    const name = s.split("/").pop() || s;
    return `/uploads/${name}`;
  }

  return s;
}

/** Trigger a browser download for a file URL */
export function triggerDownload(url: string, filename?: string) {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  if (filename) a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
