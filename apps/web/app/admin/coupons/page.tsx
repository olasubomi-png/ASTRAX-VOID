"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

const coupons = [
  { code: "ASTRAX10", type: "PERCENTAGE", value: "10%", uses: "45/1000", status: "Active", expires: "Never" },
  { code: "LAUNCH25", type: "PERCENTAGE", value: "25%", uses: "200/200", status: "Exhausted", expires: "2026-08-01" },
  { code: "VOID5OFF", type: "FIXED", value: "$5.00", uses: "12/500", status: "Active", expires: "2026-12-31" },
];

export default function AdminCouponsPage() {
  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="font-display text-3xl font-bold">
            Manage <span className="neon-text">Coupons</span>
          </h1>
          <div className="flex gap-2">
            <Link href="/admin">
              <Button variant="ghost" size="sm">← Admin</Button>
            </Link>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" /> New Coupon
            </Button>
          </div>
        </div>

        <div className="card-glow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-muted-foreground">
                  <th className="p-4 font-medium">Code</th>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Value</th>
                  <th className="p-4 font-medium">Uses</th>
                  <th className="p-4 font-medium">Expires</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.code} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-4 font-mono text-primary font-semibold">{c.code}</td>
                    <td className="p-4 text-muted-foreground">{c.type}</td>
                    <td className="p-4 font-semibold">{c.value}</td>
                    <td className="p-4 text-muted-foreground">{c.uses}</td>
                    <td className="p-4 text-muted-foreground">{c.expires}</td>
                    <td className="p-4">
                      <span className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                        c.status === "Active" ? "text-green-400 bg-green-400/10" : "text-muted-foreground bg-white/5"
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
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
