"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type UserRow = {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
};

export default function AdminCustomersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get<{
        success: boolean;
        users: UserRow[];
        pagination: { total: number };
      }>("/admin/users?limit=100");
      setUsers(res.users || []);
      setTotal(res.pagination?.total ?? res.users?.length ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
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
              Registered <span className="neon-text">Users</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {total} total · live from database
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
          {loading && users.length === 0 ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No registered users yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-muted-foreground">
                    <th className="p-4 font-medium">Username</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Registered</th>
                    <th className="p-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="p-4 font-medium">{u.username}</td>
                      <td className="p-4 text-muted-foreground">{u.email}</td>
                      <td className="p-4">
                        <span className="text-xs rounded-md bg-primary/15 text-primary px-2 py-0.5">{u.role}</span>
                      </td>
                      <td className="p-4 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="p-4"><span className="text-xs text-green-400">Active</span></td>
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
