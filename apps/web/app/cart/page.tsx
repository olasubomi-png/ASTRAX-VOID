"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/hooks/useCartStore";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export default function CartPage() {
  const { items, removeItem, updateQuantity, total, clearCart, coupon, setCoupon } =
    useCartStore();
  const [couponInput, setCouponInput] = useState("");
  const cartTotal = total();

  const applyCoupon = () => {
    if (!couponInput.trim()) return;
    // Demo: accept ASTRAX10 for 10% off
    if (couponInput.toUpperCase() === "ASTRAX10") {
      setCoupon("ASTRAX10");
      toast.success("Coupon applied: 10% off");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  const discount = coupon === "ASTRAX10" ? cartTotal * 0.1 : 0;
  const finalTotal = cartTotal - discount;

  if (items.length === 0) {
    return (
      <div className="section-padding min-h-[60vh] flex flex-col items-center justify-center">
        <ShoppingBag className="h-16 w-16 text-primary/40 mb-4" />
        <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-6">Add some premium gear and come back.</p>
        <Link href="/products">
          <Button>Browse Products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-max">
        <h1 className="font-display text-3xl font-bold mb-8">
          Your <span className="neon-text">Cart</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <motion.div
                key={item.productId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card-glow flex gap-4 p-4"
              >
                <div className="h-20 w-20 shrink-0 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
                  <span className="text-2xl font-display font-bold text-primary/50">
                    {item.product.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-semibold text-white hover:text-primary transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatPrice(item.product.salePrice ?? item.product.price)} each
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5">
                      <button
                        className="p-1.5 hover:bg-white/10 rounded-l-lg"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        className="p-1.5 hover:bg-white/10 rounded-r-lg"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        removeItem(item.productId);
                        toast.success("Removed from cart");
                      }}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right font-semibold">
                  {formatPrice(
                    (item.product.salePrice ?? item.product.price) * item.quantity
                  )}
                </div>
              </motion.div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => clearCart()}>
              Clear cart
            </Button>
          </div>

          {/* Summary */}
          <div className="card-glow p-6 h-fit sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Discount (ASTRAX10)</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-3 flex justify-between font-semibold text-base">
                <span>Total</span>
                <span className="text-primary">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Input
                placeholder="Coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="flex-1"
              />
              <Button variant="ghost" onClick={applyCoupon}>
                Apply
              </Button>
            </div>

            <Link href="/checkout" className="block mt-6">
              <Button className="w-full gap-2">
                Checkout <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Instant delivery after payment
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
