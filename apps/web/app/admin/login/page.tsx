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

  const [tab, setTab] = useState<"api" | "local">("api");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleApiLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post<{
        success: boolean;
        token: string;
        user: { id: string; email: string; username: string; role: string };
      }>("/auth/login", { email, password });

      if (res.user.role !== "ADMIN") {
        toast.error("This account does not have admin access.");
        return;
      }

      setAuthToken(res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      // Set cookie for middleware
      document.cookie = `admin_auth=${res.token}; path=/; SameSite=Lax; max-age=${60 * 60 * 24 * 7}`;

      toast.success("Welcome back, Admin!");
      router.push(from);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login failed";
      if (msg.includes("401")) {
        toast.error("Invalid email or password.");
      } else {
        toast.error("API unreachable — try the Admin Password tab.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLocalLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Invalid password.");
        return;
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
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold">
              Admin <span className="neon-text">Access</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Restricted area — authorised personnel only
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6">
            {(["api", "local"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                  tab === t
                    ? "bg-primary text-white shadow"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                {t === "api" ? "Account Login" : "Admin Password"}
              </button>
            ))}
          </div>

          {tab === "api" ? (
            <form onSubmit={handleApiLogin} className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLocalLogin} className="space-y-4">
              <p className="text-xs text-muted-foreground rounded-lg bg-white/5 p-3">
                Use the <code className="text-primary">ADMIN_PASSWORD</code> environment variable
                set on this deployment. This grants UI access even if the API is offline.
              </p>
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block">Admin Password</label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
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
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
