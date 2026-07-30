"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

const orders = [
  {
    id: "AX-8F3A2B1C",
    date: "2026-07-30",
    total: 79.99,
    status: "DELIVERED",
    items: ["ASTRAX VIP Elite"],
  },
  {
    id: "AX-7E2D9A0F",
    date: "2026-07-28",
    total: 49.99,
    status: "DELIVERED",
    items: ["CODM Premium V5"],
  },
];

const statusColor: Record<string, string> = {
  DELIVERED: "text-green-400 bg-green-400/10",
  PAID: "text-blue-400 bg-blue-400/10",
  PENDING: "text-yellow-400 bg-yellow-400/10",
  CANCELLED: "text-red-400 bg-red-400/10",
};

export default function OrdersPage() {
  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">
            Order <span className="neon-text">History</span>
          </h1>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              ← Dashboard
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card-glow p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <p className="font-mono text-sm text-primary">{o.id}</p>
                  <p className="text-xs text-muted-foreground">{o.date}</p>
                </div>
                <span
                  className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                    statusColor[o.status] || "text-muted-foreground bg-white/5"
                  }`}
                >
                  {o.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{o.items.join(", ")}</p>
              <p className="font-semibold">{formatPrice(o.total)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
