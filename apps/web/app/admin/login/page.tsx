"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api, setAuthToken } from "@/lib/api";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/admin";

  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      toast.error("Enter the admin password.");
      return;
    }
    setLoading(true);
    try {
      // 1) Prefer API-issued JWT (role ADMIN). Works with all admin/upload routes.
      //    Uses the same JWT_SECRET as the API — no SESSION_SECRET pairing needed.
      let jwt: string | null = null;
      try {
        const res = await api.post<{
          success: boolean;
          token: string;
          user?: { role?: string };
        }>("/auth/admin-login", { password });
        if (res?.token) jwt = res.token;
      } catch (apiErr) {
        // Fall through to local cookie gate if API is unreachable
        console.warn("[admin-login] API admin-login failed, trying local gate", apiErr);
      }

      if (jwt) {
        setAuthToken(jwt);
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: "local-admin",
              email: "admin@local",
              username: "admin",
              role: "ADMIN",
            })
          );
          // Cookie so Next middleware allows /admin pages
          document.cookie = `admin_auth=${jwt}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`;
        }
        toast.success("Admin access granted.");
        router.push(from);
        return;
      }

      // 2) Fallback: local Next.js password gate (cookie only — limited API access)
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as {
        success?: boolean;
        error?: string;
        token?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Invalid password.");
        return;
      }
      if (data.token && typeof window !== "undefined") {
        localStorage.setItem("adminToken", data.token);
      }
      toast.success("Admin access granted.");
      router.push(from);
    } catch {
      toast.error("Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card-glow p-8">
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold">
              Admin <span className="neon-text">Access</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Restricted area — authorised personnel only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Admin Password
              </label>
              <div className="relative">
                <Input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  name="admin-password"
                  id="admin-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  tabIndex={-1}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Unlock Admin
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
