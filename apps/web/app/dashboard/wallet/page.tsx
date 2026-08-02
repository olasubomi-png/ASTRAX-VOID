"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="section-padding">
      <div className="container-max max-w-xl">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h1 className="font-display text-3xl font-bold">
            My <span className="neon-text">Downloads</span>
          </h1>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← Dashboard</Button>
          </Link>
        </div>

        <div className="card-glow p-8 text-center">
          <Download className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="font-semibold text-lg mb-2">All Downloads Are Free</h2>
          <p className="text-muted-foreground text-sm mb-6">
            ASTRAX-VOID is a completely free platform. Browse our products and download anything instantly.
          </p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
