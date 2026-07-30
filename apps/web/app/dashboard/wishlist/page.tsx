"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const wishlist = [
  { id: "1", name: "Dominator Bundle", price: 119.99, salePrice: null },
  { id: "2", name: "CODM Xtreme V5", price: 69.99, salePrice: 59.99 },
];

export default function WishlistPage() {
  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">
            My <span className="neon-text">Wishlist</span>
          </h1>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← Dashboard</Button>
          </Link>
        </div>

        {wishlist.length === 0 ? (
          <div className="card-glow p-12 text-center">
            <Heart className="h-12 w-12 text-primary/40 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
            <Link href="/products"><Button>Browse Products</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {wishlist.map((item) => (
              <div key={item.id} className="card-glow p-5 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-bold">{formatPrice(item.salePrice ?? item.price)}</span>
                    {item.salePrice && (
                      <span className="text-sm text-muted-foreground line-through">{formatPrice(item.price)}</span>
                    )}
                  </div>
                </div>
                <Button size="sm" className="gap-2">
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
