/**
 * ASTRAX-VOID API client
 *
 * All API requests must go through this module — never use raw URLs.
 * Set NEXT_PUBLIC_API_URL in your environment:
 *   - Development: http://localhost:4000/api   (direct to Express)
 *   - Production:  http://34.201.64.198/api    (via Nginx proxy)
 *   - With domain: https://yourdomain.com/api
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";

if (!API_BASE && typeof window !== "undefined") {
  console.warn(
    "[ASTRAX-VOID] NEXT_PUBLIC_API_URL is not set. API calls will fail."
  );
}

// ─── Core fetch wrapper ────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const message = await res.text().catch(() => res.statusText);
    throw new Error(`API ${res.status}: ${message}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ─── Convenience methods ───────────────────────────────────────────────────

export const api = {
  /** Base URL — use when you need to construct a URL manually (e.g. redirect). */
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
