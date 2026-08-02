/**
 * ASTRAX-VOID API client
 *
 * All API requests must go through this module — never use raw URLs.
 * NEXT_PUBLIC_API_URL is set per environment:
 *   - Replit dev : /api-proxy  (rewritten by next.config.mjs → localhost:4000/api)
 *   - Vercel prod: /api-proxy  (rewritten by vercel.json → http://34.201.64.198/api)
 */

/**
 * Prefer relative /api-proxy so the browser always hits the same origin.
 * Next.js (dev) and Vercel (prod) rewrite /api-proxy/* → Express /api/*.
 * Absolute http:// URLs from an https:// site cause mixed-content blocks
 * and "Failed to fetch". Only use an absolute URL when it is https://.
 */
function resolveApiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  if (!raw) return "/api-proxy";
  // Block accidental mixed content: http API from https page
  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    raw.startsWith("http://")
  ) {
    console.warn(
      "[ASTRAX-VOID] NEXT_PUBLIC_API_URL is http:// on an https:// page — using /api-proxy to avoid mixed content."
    );
    return "/api-proxy";
  }
  return raw;
}

const API_BASE = resolveApiBase();

// ─── Auth helpers (browser-only) ──────────────────────────────────────────

/**
 * Prefer the standard JWT (including admin-login JWT with role ADMIN).
 * Fall back to the legacy HMAC admin session token as `Bearer admin:<hex>`.
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  const jwt = localStorage.getItem("token");
  if (jwt) return jwt;
  const admin = localStorage.getItem("adminToken");
  if (admin) return `admin:${admin}`;
  return null;
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
    // Cookie so middleware can require login before showing the site
    document.cookie = `user_auth=${token}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`;
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("adminToken");
    document.cookie = "user_auth=; path=/; max-age=0";
    document.cookie = "admin_auth=; path=/; max-age=0";
  }
}

// ─── Core fetch wrapper ────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const authHeaders: Record<string, string> = {};
  const token = getAuthToken();
  if (token) {
    authHeaders["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (networkErr) {
    // TypeError: Failed to fetch — never surface the raw browser message
    const hint =
      networkErr instanceof Error ? networkErr.message : String(networkErr);
    console.error("[ASTRAX-VOID] Network error", API_BASE + path, hint);
    throw new Error(
      "Unable to reach the server. Please check your connection and try again."
    );
  }

  if (!res.ok) {
    // Try JSON first (structured error from our API), then fall back to a
    // plain status description — never include raw HTML in the error message.
    let message: string;
    try {
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        const json = (await res.json()) as { message?: string; error?: string };
        message = json.message ?? json.error ?? res.statusText;
      } else {
        // Server returned non-JSON (HTML 404, proxy error, etc.) — ignore body
        message = res.statusText || `HTTP ${res.status}`;
      }
    } catch {
      message = res.statusText || `HTTP ${res.status}`;
    }
    throw new Error(`API ${res.status}: ${message}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Convenience methods ───────────────────────────────────────────────────

export const api = {
  /** Base URL — use when you need to construct a URL manually. */
  baseUrl: API_BASE,

  get<T>(path: string, options?: Omit<RequestOptions, "body">): Promise<T> {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "POST", body });
  },

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "PUT", body });
  },

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "PATCH", body });
  },

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};
