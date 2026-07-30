"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Key, Copy } from "lucide-react";
import { toast } from "sonner";

const keys = [
  { id: "1", product: "ASTRAX VIP Elite", key: "AX-A1B2C3D4-E5F6", issuedAt: "2026-07-30", expiresAt: "Never" },
  { id: "2", product: "CODM Premium V5", key: "AX-G7H8I9J0-K1L2", issuedAt: "2026-07-28", expiresAt: "Never" },
];

export default function LicenseKeysPage() {
  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("License key copied to clipboard");
  };

  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">
            License <span className="neon-text">Keys</span>
          </h1>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← Dashboard</Button>
          </Link>
        </div>

        {keys.length === 0 ? (
          <div className="card-glow p-12 text-center">
            <Key className="h-12 w-12 text-primary/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No license keys yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {keys.map((k) => (
              <div key={k.id} className="card-glow p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-white mb-2">{k.product}</h3>
                    <div className="flex items-center gap-2">
                      <code className="text-primary font-mono text-sm bg-primary/10 px-3 py-1.5 rounded-lg">
                        {k.key}
                      </code>
                      <button
                        onClick={() => copyKey(k.key)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Issued: {k.issuedAt} · Expires: {k.expiresAt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
