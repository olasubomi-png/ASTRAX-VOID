"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export default function InvoicesPage() {
  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <h1 className="font-display text-3xl font-bold">
            My <span className="neon-text">Activity</span>
          </h1>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← Dashboard</Button>
          </Link>
        </div>

        <div className="card-glow p-12 text-center">
          <FileText className="h-12 w-12 text-primary/40 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No activity yet.</p>
          <Link href="/products"><Button>Browse Products</Button></Link>
        </div>
      </div>
    </div>
  );
}
