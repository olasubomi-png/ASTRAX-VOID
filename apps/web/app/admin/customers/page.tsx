"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

const customers = [
  { id: "1", username: "shadowplayer", email: "shadow@example.com", orders: 5, joined: "2026-01-15" },
  { id: "2", username: "voidmaster", email: "void@example.com", orders: 12, joined: "2025-11-03" },
  { id: "3", username: "neonknight", email: "neon@example.com", orders: 3, joined: "2026-06-22" },
];

export default function AdminCustomersPage() {
  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">
            Manage <span className="neon-text">Customers</span>
          </h1>
          <Link href="/admin">
            <Button variant="ghost" size="sm">← Admin</Button>
          </Link>
        </div>

        <div className="card-glow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted-foreground">
                  <th className="p-4 font-medium">Username</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Orders</th>
                  <th className="p-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 font-semibold text-white">{c.username}</td>
                    <td className="p-4 text-muted-foreground">{c.email}</td>
                    <td className="p-4">{c.orders}</td>
                    <td className="p-4 text-muted-foreground">{c.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
