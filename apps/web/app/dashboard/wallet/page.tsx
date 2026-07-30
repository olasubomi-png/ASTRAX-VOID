"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

export default function WalletPage() {
  const balance = 25.00;

  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Top-up initiated. You will be redirected to payment.");
  };

  return (
    <div className="section-padding">
      <div className="container-max max-w-xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">
            My <span className="neon-text">Wallet</span>
          </h1>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← Dashboard</Button>
          </Link>
        </div>

        {/* Balance card */}
        <div className="card-glow p-8 text-center mb-6">
          <Wallet className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground text-sm mb-2">Available Balance</p>
          <p className="font-display text-5xl font-bold neon-text">{formatPrice(balance)}</p>
        </div>

        {/* Top-up */}
        <div className="card-glow p-6">
          <h2 className="font-semibold text-white mb-4">Top Up</h2>
          <form onSubmit={handleTopUp} className="flex gap-3">
            <Input type="number" placeholder="Amount (USD)" min="5" step="0.01" className="flex-1" />
            <Button type="submit">Top Up</Button>
          </form>
          <p className="text-xs text-muted-foreground mt-3">
            Minimum top-up: $5.00. Payments via Paystack, Flutterwave, or Stripe.
          </p>
        </div>
      </div>
    </div>
  );
}
