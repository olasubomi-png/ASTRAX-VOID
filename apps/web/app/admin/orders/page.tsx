"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const orders = [
  { id: "AX-8F3A2B1C", customer: "john@example.com", total: 79.99, status: "DELIVERED", date: "2026-07-30" },
  { id: "AX-7E2D9A0F", customer: "jane@example.com", total: 49.99, status: "PAID", date: "2026-07-29" },
  { id: "AX-6D1C8B9E", customer: "alex@example.com", total: 119.99, status: "PENDING", date: "2026-07-28" },
];

const statusColor: Record<string, string> = {
  DELIVERED: "text-green-400 bg-green-400/10",
  PAID: "text-blue-400 bg-blue-400/10",
  PENDING: "text-yellow-400 bg-yellow-400/10",
  CANCELLED: "text-red-400 bg-red-400/10",
};

export default function AdminOrdersPage() {
  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">
            Manage <span className="neon-text">Orders</span>
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
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 font-mono text-primary text-xs">{o.id}</td>
                    <td className="p-4 text-muted-foreground">{o.customer}</td>
                    <td className="p-4 font-semibold">{formatPrice(o.total)}</td>
                    <td className="p-4">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${statusColor[o.status] || "text-muted-foreground bg-white/5"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="p-4 text-muted-foreground">{o.date}</td>
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
