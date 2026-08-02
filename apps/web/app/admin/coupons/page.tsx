"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  HardDrive, Loader2, Package, Download, Gamepad2, Smartphone, Tablet,
  Image as ImageIcon, FileArchive, RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type Stats = {
  products: number;
  downloads: number;
  games: number;
  categories: number;
  androidResources: number;
  iosResources: number;
  uploadedImages: number;
  uploadedZips: number;
  storageMB: number;
  uploadedFiles: number;
};

export default function AdminPlatformPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{ success: boolean; stats: Stats }>("/admin/stats");
      setStats(res.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cards = [
    { label: "Products", value: stats?.products, icon: Package },
    { label: "Downloads", value: stats?.downloads, icon: Download },
    { label: "Games", value: stats?.games, icon: Gamepad2 },
    { label: "Categories", value: stats?.categories, icon: HardDrive },
    { label: "Android files", value: stats?.androidResources, icon: Smartphone },
    { label: "iOS files", value: stats?.iosResources, icon: Tablet },
    { label: "Images", value: stats?.uploadedImages, icon: ImageIcon },
    { label: "ZIP files", value: stats?.uploadedZips, icon: FileArchive },
    { label: "All uploaded files", value: stats?.uploadedFiles, icon: HardDrive },
    { label: "Storage used", value: stats?.storageMB != null ? `${stats.storageMB} MB` : undefined, icon: HardDrive },
  ];

  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">
              Platform <span className="neon-text">Statistics</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Coupons / payments removed — free download metrics only
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={load} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/admin">
              <Button variant="ghost" size="sm">← Admin</Button>
            </Link>
          </div>
        </div>
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        {loading && !stats ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {cards.map((c) => (
              <div key={c.label} className="card-glow p-5">
                <c.icon className="h-5 w-5 text-primary mb-3" />
                <p className="text-2xl font-bold">
                  {typeof c.value === "string" ? c.value : c.value != null ? c.value.toLocaleString() : "—"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
