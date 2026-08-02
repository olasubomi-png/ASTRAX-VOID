"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api, setAuthToken } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post<{
        success: boolean;
        token: string;
        user: {
          id: string;
          email: string;
          username: string;
          role: string;
        };
      }>("/auth/register", {
        username: form.username,
        email: form.email,
        password: form.password,
      });

      setAuthToken(res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      toast.success("Account created successfully!");

      if (res.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registration failed";

      if (/409|already taken|already exists/i.test(message)) {
        toast.error("Email or username already exists");
      } else if (/unable to reach|connection|network/i.test(message)) {
        toast.error("Unable to reach the server. Please try again in a moment.");
      } else if (/failed to fetch/i.test(message)) {
        toast.error("Unable to reach the server. Please try again in a moment.");
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card-glow p-8">
          <div className="text-center mb-8">
            <h1 className="font-display text-2xl font-bold mb-1">
              Join <span className="neon-text">ASTRAX-VOID</span>
            </h1>

            <p className="text-sm text-muted-foreground">
              Create your account and start dominating
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Username
              </label>

              <Input
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value,
                  })
                }
                placeholder="commander_x"
                required
                minLength={3}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Email
              </label>

              <Input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                placeholder="you@email.com"
                required
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Password
              </label>

              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">
                Confirm Password
              </label>

              <Input
                type="password"
                value={form.confirm}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirm: e.target.value,
                  })
                }
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
