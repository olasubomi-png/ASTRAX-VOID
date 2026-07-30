"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const invoices = [
  { id: "INV-2026-001", orderId: "AX-8F3A2B1C", date: "2026-07-30", total: 79.99, status: "Paid" },
  { id: "INV-2026-002", orderId: "AX-7E2D9A0F", date: "2026-07-28", total: 49.99, status: "Paid" },
];

export default function InvoicesPage() {
  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">
            My <span className="neon-text">Invoices</span>
          </h1>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← Dashboard</Button>
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="card-glow p-12 text-center">
            <FileText className="h-12 w-12 text-primary/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No invoices yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((inv) => (
              <div key={inv.id} className="card-glow p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-primary text-sm">{inv.id}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Order: {inv.orderId} · {inv.date}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{formatPrice(inv.total)}</span>
                  <span className="rounded-lg bg-green-400/10 text-green-400 px-2.5 py-1 text-xs font-medium">
                    {inv.status}
                  </span>
                  <Button size="sm" variant="ghost" className="gap-2">
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
