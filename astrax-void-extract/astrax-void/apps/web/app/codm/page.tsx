"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Gamepad2, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/hooks/useCartStore";
import type { Product } from "@/types";
import { toast } from "sonner";

const CODM: Product[] = [
  {
    id: "2",
    slug: "codm-premium-v5",
    name: "CODM Premium V5",
    description: "Latest CODM premium files. Instant delivery, undetected.",
    price: 49.99,
    salePrice: null,
    currency: "USD",
    category: "codm-files",
    images: [],
    features: ["Silent Aim", "Wallhack", "No Recoil"],
    stock: 50,
    rating: 4.8,
    reviewCount: 891,
    isFeatured: true,
    isTrending: true,
    tags: ["codm"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    slug: "codm-xtreme-v5",
    name: "CODM Xtreme V5",
    description: "Maximum aggression package for CODM.",
    price: 69.99,
    salePrice: 59.99,
    currency: "USD",
    category: "codm-files",
    images: [],
    features: ["Aimbot", "Speed", "ESP"],
    stock: 30,
    rating: 4.85,
    reviewCount: 456,
    isFeatured: true,
    isTrending: true,
    tags: ["codm"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function CODMPage() {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-4">
            <Gamepad2 className="h-3.5 w-3.5" /> CODM Files
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">
            Call of Duty <span className="neon-text">Mobile</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Premium CODM files. Instant automated delivery. Rapid updates after every patch.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {CODM.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card-glow p-6 flex flex-col"
            >
              <Link href={`/products/${p.slug}`}>
                <h3 className="font-display text-xl font-bold mb-2 hover:text-primary transition-colors">
                  {p.name}
                </h3>
              </Link>
              <div className="flex items-center gap-1 mb-3">
                <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                <span className="text-xs text-muted-foreground">
                  {p.rating} ({p.reviewCount})
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4 flex-1">{p.description}</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-bold">
                  {formatPrice(p.salePrice ?? p.price)}
                </span>
                {p.salePrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(p.price)}
                  </span>
                )}
              </div>
              <Button
                className="w-full gap-2"
                onClick={() => {
                  addItem(p);
                  toast.success(`${p.name} added to cart`);
                }}
              >
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
