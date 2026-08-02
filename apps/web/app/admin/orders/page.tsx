"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type DownloadRow = {
  id: string;
  productName?: string | null;
  gameSlug?: string | null;
  platform?: string | null;
  createdAt: string;
  user?: { username?: string; email?: string } | null;
};

export default function AdminDownloadsPage() {
  const [rows, setRows] = useState<DownloadRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{
        success: boolean;
        downloads: DownloadRow[];
        pagination: { total: number };
      }>("/admin/downloads?limit=100");
      setRows(res.downloads || []);
      setTotal(res.pagination?.total ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load downloads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">
              <span className="neon-text">Downloads</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {total} total · free platform (no orders/payments)
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
        <div className="card-glow overflow-hidden">
          {loading && rows.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center">
              <Download className="h-12 w-12 text-primary/40 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No downloads recorded yet. When users download files, they appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted-foreground">
                    <th className="p-4 font-medium">Product</th>
                    <th className="p-4 font-medium">Game</th>
                    <th className="p-4 font-medium">Platform</th>
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 font-medium">{r.productName || "—"}</td>
                      <td className="p-4 text-muted-foreground">{r.gameSlug || "—"}</td>
                      <td className="p-4 text-muted-foreground">
                        {r.platform?.includes("ios") ? "iOS" : r.platform?.includes("android") ? "Android" : r.platform || "—"}
                      </td>
                      <td className="p-4 text-muted-foreground">{r.user?.username || "Guest"}</td>
                      <td className="p-4 text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
