"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/hooks/useCartStore";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import { CreditCard, Shield } from "lucide-react";

type PaymentMethod = "PAYSTACK" | "FLUTTERWAVE" | "STRIPE";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart, coupon } = useCartStore();
  const [method, setMethod] = useState<PaymentMethod>("PAYSTACK");
  const [loading, setLoading] = useState(false);
  const cartTotal = total();
  const discount = coupon === "ASTRAX10" ? cartTotal * 0.1 : 0;
  const finalTotal = cartTotal - discount;

  if (items.length === 0) {
    return (
      <div className="section-padding text-center">
        <p className="text-muted-foreground mb-4">Your cart is empty.</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  const handlePay = async () => {
    setLoading(true);
    try {
      // TODO: call /api/payments/checkout then redirect to gateway
      await new Promise((r) => setTimeout(r, 1500));
      toast.success("Payment successful! Products delivered to your dashboard.");
      clearCart();
      router.push("/dashboard/downloads");
    } catch {
      toast.error("Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="container-max max-w-4xl">
        <h1 className="font-display text-3xl font-bold mb-8">
          <span className="neon-text">Checkout</span>
        </h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment method */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="card-glow p-6">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" /> Payment Method
              </h2>
              <div className="space-y-3">
                {(
                  [
                    { id: "PAYSTACK", label: "Paystack", desc: "Cards, Bank, USSD (Nigeria)" },
                    { id: "FLUTTERWAVE", label: "Flutterwave", desc: "Cards & local methods" },
                    { id: "STRIPE", label: "Stripe", desc: "International cards" },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      method === m.id
                        ? "border-primary bg-primary/10 shadow-glow"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <p className="font-medium text-white">{m.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="card-glow p-6">
              <h2 className="font-semibold mb-4">Billing Email</h2>
              <Input type="email" placeholder="you@email.com" defaultValue="" />
              <p className="text-xs text-muted-foreground mt-2">
                Receipt and download links will be sent here.
              </p>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-glow p-6 h-fit"
          >
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <ul className="space-y-3 mb-4">
              {items.map((item) => (
                <li key={item.productId} className="flex justify-between text-sm">
                  <span className="text-muted-foreground truncate pr-2">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span>
                    {formatPrice(
                      (item.product.salePrice ?? item.product.price) * item.quantity
                    )}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-white/10 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Discount</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base pt-2">
                <span>Total</span>
                <span className="text-primary">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <Button className="w-full mt-6 gap-2" size="lg" onClick={handlePay} disabled={loading}>
              {loading ? "Processing…" : `Pay ${formatPrice(finalTotal)}`}
            </Button>

            <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5 text-primary" />
              Secure payment • Instant digital delivery
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
