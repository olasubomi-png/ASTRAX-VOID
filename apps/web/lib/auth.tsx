"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { api, setAuthToken, clearAuthToken } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  role: string;
  avatar?: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<AuthUser>;
  logout: () => void;
  restoreSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Set session cookies the middleware can read (encode JWT safely). */
function writeSessionCookies(token: string, isAdmin: boolean) {
  if (typeof document === "undefined") return;
  const enc = encodeURIComponent(token);
  document.cookie = `user_auth=${enc}; path=/; SameSite=Lax; max-age=${COOKIE_MAX_AGE}`;
  // Lightweight flag so middleware still works if JWT cookie is truncated
  document.cookie = `astrax_session=1; path=/; SameSite=Lax; max-age=${COOKIE_MAX_AGE}`;
  if (isAdmin) {
    document.cookie = `admin_auth=${enc}; path=/; SameSite=Lax; max-age=${COOKIE_MAX_AGE}`;
  }
}

function clearSessionCookies() {
  if (typeof document === "undefined") return;
  document.cookie = "user_auth=; path=/; max-age=0";
  document.cookie = "admin_auth=; path=/; max-age=0";
  document.cookie = "astrax_session=; path=/; max-age=0";
}

function persistAuth(token: string, user: AuthUser) {
  setAuthToken(token);
  localStorage.setItem("user", JSON.stringify(user));
  writeSessionCookies(token, user.role === "ADMIN");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const restoreSession = useCallback(async () => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }
    try {
      const storedToken = localStorage.getItem("token");
      const storedUserRaw = localStorage.getItem("user");

      if (!storedToken) {
        setUser(null);
        setToken(null);
        clearSessionCookies();
        return;
      }

      // Optimistic restore so UI is not blank
      if (storedUserRaw) {
        try {
          const parsed = JSON.parse(storedUserRaw) as AuthUser;
          setUser(parsed);
          setToken(storedToken);
          writeSessionCookies(storedToken, parsed.role === "ADMIN");
        } catch {
          /* ignore bad JSON */
        }
      }

      // Validate with API when possible
      try {
        const res = await api.get<{ success: boolean; user: AuthUser }>(
          "/auth/me"
        );
        if (res?.user) {
          setUser(res.user);
          setToken(storedToken);
          localStorage.setItem("user", JSON.stringify(res.user));
          writeSessionCookies(storedToken, res.user.role === "ADMIN");
          return;
        }
      } catch {
        // /auth/me may fail for local-admin JWT or offline — keep optimistic
        // session if we still have a token + user
        if (storedToken && storedUserRaw) {
          return;
        }
        clearAuthToken();
        clearSessionCookies();
        setUser(null);
        setToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{
      success: boolean;
      token: string;
      user: AuthUser;
    }>("/auth/login", { email, password });

    if (!res?.token || !res?.user) {
      throw new Error("Invalid login response from server");
    }

    persistAuth(res.token, res.user);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const res = await api.post<{
        success: boolean;
        token: string;
        user: AuthUser;
      }>("/auth/register", { username, email, password });

      if (!res?.token || !res?.user) {
        throw new Error("Invalid register response from server");
      }

      persistAuth(res.token, res.user);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    },
    []
  );

  const logout = useCallback(() => {
    clearAuthToken();
    clearSessionCookies();
    setUser(null);
    setToken(null);
    router.replace("/login");
    router.refresh();
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      restoreSession,
    }),
    [user, token, loading, login, register, logout, restoreSession]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

/** Optional hook that does not throw outside provider (e.g. layout chrome) */
export function useAuthOptional() {
  return useContext(AuthContext);
}
