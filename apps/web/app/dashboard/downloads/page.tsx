"use client";

import Link from "next/link";
import { Download, Key, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// Demo data
const downloads = [
  {
    id: "1",
    name: "ASTRAX VIP Elite",
    licenseKey: "AX-A1B2C3D4-E5F6",
    downloadUrl: "#",
    expiresAt: "2026-08-02",
    orderDate: "2026-07-30",
  },
  {
    id: "2",
    name: "CODM Premium V5",
    licenseKey: "AX-G7H8I9J0-K1L2",
    downloadUrl: "#",
    expiresAt: "2026-08-02",
    orderDate: "2026-07-28",
  },
];

export default function DownloadsPage() {
  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">
              Your <span className="neon-text">Downloads</span>
            </h1>
            <p className="text-muted-foreground text-sm">Secure links & license keys</p>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              ← Dashboard
            </Button>
          </Link>
        </div>

        {downloads.length === 0 ? (
          <div className="card-glow p-12 text-center">
            <Download className="h-12 w-12 text-primary/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No downloads yet.</p>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {downloads.map((d) => (
              <div key={d.id} className="card-glow p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{d.name}</h3>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-primary" />
                      <code className="text-primary/90">{d.licenseKey}</code>
                    </span>
                    <span>Expires: {d.expiresAt}</span>
                    <span>Ordered: {d.orderDate}</span>
                  </div>
                </div>
                <a href={d.downloadUrl}>
                  <Button size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
