"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingBag,
  Users,
  Ticket,
  Settings,
  DollarSign,
  TrendingUp,
  Loader2,
  RefreshCw,
  ServerCrash,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

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
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get<{ success: boolean; stats: AdminStats }>("/admin/stats");
        if (!cancelled) setStats(res.stats);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load stats");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = [
    {
      label: "Revenue",
      value: stats ? formatPrice(stats.revenue) : "—",
      icon: DollarSign,
    },
    {
      label: "Orders",
      value: stats ? stats.orders.toLocaleString() : "—",
      icon: ShoppingBag,
    },
    {
      label: "Customers",
      value: stats ? stats.users.toLocaleString() : "—",
      icon: Users,
    },
    {
      label: "Products",
      value: stats ? stats.products.toLocaleString() : "—",
      icon: Package,
    },
  ];

  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">
            Admin <span className="neon-text">Panel</span>
          </h1>
          <p className="text-muted-foreground">Manage your marketplace</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 flex items-start gap-3">
            <ServerCrash className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-400">Unable to reach server</p>
              <p className="text-xs text-red-400/70 mt-0.5">
                Stats could not be loaded. Check that the API is reachable and try again.
              </p>
            </div>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                api
                  .get<{ success: boolean; stats: AdminStats }>("/admin/stats")
                  .then((res) => setStats(res.stats))
                  .catch((err: unknown) =>
                    setError(
                      err instanceof Error ? err.message : "Failed to load stats"
                    )
                  )
                  .finally(() => setLoading(false));
              }}
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

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
