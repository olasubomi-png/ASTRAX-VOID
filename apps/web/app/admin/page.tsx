"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingBag,
  Users,
  Settings,
  DollarSign,
  TrendingUp,
  Loader2,
  RefreshCw,
  ServerCrash,
  LogOut,
  Ticket,
} from "lucide-react";
import { api, clearAuthToken } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface AdminStats {
  users: number;
  orders: number;
  products: number;
  revenue: number;
}

const links = [
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/coupons", icon: Ticket, label: "Coupons" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; stats: AdminStats }>("/admin/stats");
      setStats(res.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleLogout = async () => {
    clearAuthToken();
    // Clear cookie
    document.cookie = "admin_auth=; path=/; max-age=0";
    try {
      await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {
      // ignore
    }
    router.push("/admin/login");
  };

  const cards = [
    { label: "Revenue", value: stats ? `$${stats.revenue.toLocaleString()}` : "—", icon: DollarSign },
    { label: "Orders", value: stats ? stats.orders.toLocaleString() : "—", icon: ShoppingBag },
    { label: "Customers", value: stats ? stats.users.toLocaleString() : "—", icon: Users },
    { label: "Products", value: stats ? stats.products.toLocaleString() : "—", icon: Package },
  ];

  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">
              Admin <span className="neon-text">Panel</span>
            </h1>
            <p className="text-muted-foreground">Manage your marketplace</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground hover:text-red-400">
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 flex items-start gap-3">
            <ServerCrash className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-400">Unable to reach server</p>
              <p className="text-xs text-red-400/70 mt-0.5">
                Stats could not be loaded. Verify the API is reachable and your account has ADMIN role.
              </p>
            </div>
            <button
              onClick={loadStats}
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {cards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-glow p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Live
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {links.map((l, i) => (
            <motion.div
              key={l.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Link
                href={l.href}
                className="card-glow flex flex-col items-center gap-3 p-6 text-center group"
              >
                <l.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{l.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
