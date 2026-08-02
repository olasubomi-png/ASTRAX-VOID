"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Package,
  Users,
  Settings,
  Download,
  Loader2,
  RefreshCw,
  ServerCrash,
  LogOut,
  Smartphone,
  Tablet,
  Gamepad2,
  HardDrive,
  Activity,
  FolderOpen,
  Image as ImageIcon,
  FileArchive,
} from "lucide-react";
import { api, clearAuthToken } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface AdminStats {
  products: number;
  productsActive: number;
  users: number;
  admins: number;
  categories: number;
  games: number;
  androidResources: number;
  iosResources: number;
  downloads: number;
  downloadsToday: number;
  downloadsWeek: number;
  downloadsMonth: number;
  usersToday: number;
  usersWeek: number;
  storageMB: number;
  uploadedFiles: number;
  uploadedImages: number;
  uploadedZips: number;
  mostDownloaded: { name: string | null; count: number } | null;
  latestUser: {
    username: string;
    email: string;
    createdAt: string;
  } | null;
  latestProduct: {
    name: string;
    gameSlug?: string | null;
    createdAt: string;
  } | null;
  downloadsPerDay: { date: string; count: number }[];
  recentActivity: {
    id: string;
    type: string;
    message: string;
    actorName?: string | null;
    createdAt: string;
  }[];
}

const links = [
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/orders", icon: Download, label: "Downloads" },
  { href: "/admin/customers", icon: Users, label: "Users" },
  { href: "/admin/coupons", icon: HardDrive, label: "Platform" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; stats: AdminStats }>(
        "/admin/stats"
      );
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
    document.cookie = "admin_auth=; path=/; max-age=0";
    document.cookie = "astrax_session=; path=/; max-age=0";
    try {
      await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
    } catch {
      /* ignore */
    }
    router.push("/admin/login");
  };

  const primaryCards = [
    {
      label: "Products",
      value: stats?.productsActive ?? stats?.products,
      icon: Package,
    },
    {
      label: "Downloads",
      value: stats?.downloads,
      icon: Download,
    },
    {
      label: "Users",
      value: stats?.users,
      icon: Users,
    },
    {
      label: "Games",
      value: stats?.games,
      icon: Gamepad2,
    },
  ];

  const platformCards = [
    {
      label: "Android files",
      value: stats?.androidResources,
      icon: Smartphone,
    },
    { label: "iOS files", value: stats?.iosResources, icon: Tablet },
    {
      label: "Uploaded files",
      value: stats?.uploadedFiles,
      icon: FolderOpen,
    },
    {
      label: "Images",
      value: stats?.uploadedImages,
      icon: ImageIcon,
    },
    {
      label: "ZIP files",
      value: stats?.uploadedZips,
      icon: FileArchive,
    },
    {
      label: "Storage",
      value:
        stats?.storageMB != null ? `${stats.storageMB} MB` : undefined,
      icon: HardDrive,
    },
  ];

  const maxDay = Math.max(
    1,
    ...(stats?.downloadsPerDay?.map((d) => d.count) ?? [1])
  );

  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">
              Admin <span className="neon-text">Panel</span>
            </h1>
            <p className="text-muted-foreground">
              Live free-download platform metrics
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadStats}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2 text-muted-foreground hover:text-red-400"
            >
              <LogOut className="h-4 w-4" /> Logout
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4 flex items-start gap-3">
            <ServerCrash className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-400">
                Unable to load live stats
              </p>
              <p className="text-xs text-red-400/70 mt-0.5 break-words">
                {error}
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

        {/* Primary metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {primaryCards.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card-glow p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <span className="text-[10px] text-green-400">LIVE</span>
                )}
              </div>
              <p className="text-2xl font-bold">
                {s.value != null ? s.value.toLocaleString() : "—"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Download period stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Downloads today", value: stats?.downloadsToday },
            { label: "This week", value: stats?.downloadsWeek },
            { label: "This month", value: stats?.downloadsMonth },
          ].map((c) => (
            <div key={c.label} className="card-glow p-4">
              <p className="text-xl font-bold">
                {c.value != null ? c.value.toLocaleString() : "—"}
              </p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Platform stats */}
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" /> Platform
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {platformCards.map((s) => (
            <div key={s.label} className="card-glow p-4">
              <s.icon className="h-4 w-4 text-primary mb-2" />
              <p className="text-lg font-bold">
                {typeof s.value === "string"
                  ? s.value
                  : s.value != null
                    ? s.value.toLocaleString()
                    : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Simple downloads chart */}
        <div className="card-glow p-5 mb-10">
          <h2 className="text-sm font-semibold mb-4">Downloads — last 7 days</h2>
          <div className="flex items-end gap-2 h-32">
            {(stats?.downloadsPerDay ?? []).map((d) => (
              <div
                key={d.date}
                className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
              >
                <span className="text-[10px] text-muted-foreground">
                  {d.count}
                </span>
                <div
                  className="w-full rounded-t-md bg-primary/80 min-h-[4px] transition-all"
                  style={{
                    height: `${Math.max(4, (d.count / maxDay) * 100)}%`,
                  }}
                />
                <span className="text-[9px] text-muted-foreground">
                  {d.date.slice(5)}
                </span>
              </div>
            ))}
            {!stats?.downloadsPerDay?.length && !loading && (
              <p className="text-sm text-muted-foreground w-full text-center">
                No download data yet
              </p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-10">
          {/* Latest */}
          <div className="card-glow p-5 space-y-4">
            <h2 className="text-sm font-semibold">Latest</h2>
            <div>
              <p className="text-xs text-muted-foreground">Latest user</p>
              <p className="text-sm font-medium">
                {stats?.latestUser
                  ? `${stats.latestUser.username} (${stats.latestUser.email})`
                  : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formatDate(stats?.latestUser?.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Latest product</p>
              <p className="text-sm font-medium">
                {stats?.latestProduct?.name ?? "—"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {formatDate(stats?.latestProduct?.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Most downloaded</p>
              <p className="text-sm font-medium">
                {stats?.mostDownloaded?.name
                  ? `${stats.mostDownloaded.name} (${stats.mostDownloaded.count})`
                  : "—"}
              </p>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>New users today: {stats?.usersToday ?? "—"}</span>
              <span>This week: {stats?.usersWeek ?? "—"}</span>
            </div>
          </div>

          {/* Activity */}
          <div className="card-glow p-5">
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" /> Recent activity
            </h2>
            <ul className="space-y-2 max-h-64 overflow-y-auto text-sm">
              {(stats?.recentActivity ?? []).map((a) => (
                <li
                  key={a.id}
                  className="border-b border-white/5 pb-2 last:border-0"
                >
                  <p className="text-white/90">{a.message}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {a.type} · {formatDate(a.createdAt)}
                  </p>
                </li>
              ))}
              {!stats?.recentActivity?.length && !loading && (
                <li className="text-muted-foreground text-xs">
                  No activity yet — uploads and downloads will appear here.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Nav links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {links.map((l, i) => (
            <motion.div
              key={l.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.03 }}
            >
              <Link
                href={l.href}
                className="card-glow flex flex-col items-center gap-2 p-5 hover:border-primary/40 transition-colors text-center"
              >
                <l.icon className="h-6 w-6 text-primary" />
                <span className="text-sm font-medium">{l.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
