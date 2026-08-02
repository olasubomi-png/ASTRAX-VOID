/**
 * ASTRAX-VOID API client
 *
 * All API requests must go through this module — never use raw URLs.
 * NEXT_PUBLIC_API_URL is set per environment:
 *   - Replit dev : /api-proxy  (rewritten by next.config.mjs → localhost:4000/api)
 *   - Vercel prod: /api-proxy  (rewritten by vercel.json → http://34.201.64.198/api)
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

if (!API_BASE && typeof window !== "undefined") {
  console.warn(
    "[ASTRAX-VOID] NEXT_PUBLIC_API_URL is not set. API calls will fail."
  );
}

// ─── Auth helpers (browser-only) ──────────────────────────────────────────

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setAuthToken(token: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

export function clearAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
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

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

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
