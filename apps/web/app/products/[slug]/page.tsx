"use client";

import { use } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Heart, Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/hooks/useCartStore";
import type { Product } from "@/types";
import { toast } from "sonner";

// Demo product lookup — replace with API
const PRODUCTS: Record<string, Product> = {
  "astrax-vip-elite": {
    id: "1",
    slug: "astrax-vip-elite",
    name: "ASTRAX VIP Elite",
    description:
      "Full elite VIP package with premium modules, priority support, and lifetime updates. Built for players who refuse to settle for average performance.",
    shortDescription: "Elite VIP with premium modules",
    price: 99.99,
    salePrice: 79.99,
    currency: "USD",
    category: "vip-packages",
    images: [],
    features: [
      "Precision Aimbot (custom FOV & smoothness)",
      "Full ESP suite (box, skeleton, glow)",
      "Kernel-level anti-detection",
      "HWID spoofer included",
      "Priority 24/7 support",
      "Rapid updates (2–4h after game patches)",
    ],
    requirements: ["Android 10+", "Compatible CODM version", "Stable internet"],
    stock: null,
    rating: 4.9,
    reviewCount: 342,
    isFeatured: true,
    isTrending: true,
    tags: ["vip", "elite"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "codm-premium-v5": {
    id: "2",
    slug: "codm-premium-v5",
    name: "CODM Premium V5",
    description:
      "Latest CODM premium files. Instant delivery, undetected, worldwide. Silent aim, wallhack, no recoil and more.",
    price: 49.99,
    salePrice: null,
    currency: "USD",
    category: "codm-files",
    images: [],
    features: ["Silent Aim", "Wallhack / ESP", "No Recoil", "Rapid Updates", "24/7 Support"],
    requirements: ["CODM latest version", "Android device"],
    stock: 50,
    rating: 4.8,
    reviewCount: 891,
    isFeatured: true,
    isTrending: true,
    tags: ["codm"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "unlock-tool-pro": {
    id: "3",
    slug: "unlock-tool-pro",
    name: "Unlock Tool Pro",
    description: "Professional unlock toolkit with multi-game support and lifetime updates.",
    price: 29.99,
    salePrice: 19.99,
    currency: "USD",
    category: "unlock-tools",
    images: [],
    features: ["Multi-game support", "HWID Spoofer", "Lifetime updates"],
    stock: null,
    rating: 4.7,
    reviewCount: 215,
    isFeatured: true,
    isTrending: false,
    tags: ["tools"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "bundle-dominator": {
    id: "4",
    slug: "bundle-dominator",
    name: "Dominator Bundle",
    description: "VIP + CODM + Tools in one powerful package. Best value for serious players.",
    price: 149.99,
    salePrice: 119.99,
    currency: "USD",
    category: "bundles",
    images: [],
    features: ["All VIP Elite features", "CODM Premium V5", "Unlock Tool Pro", "Priority queue"],
    stock: 20,
    rating: 5.0,
    reviewCount: 67,
    isFeatured: true,
    isTrending: true,
    tags: ["bundle"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const product = PRODUCTS[slug];
  const addItem = useCartStore((s) => s.addItem);

  if (!product) {
    return (
      <div className="section-padding text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="section-padding">
      <div className="container-max">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>

        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-accent/10 border border-primary/20 flex items-center justify-center overflow-hidden"
          >
            <span className="text-8xl font-display font-bold text-primary/30">
              {product.name.charAt(0)}
            </span>
            {product.salePrice && (
              <span className="absolute top-4 left-4 rounded-xl bg-accent px-3 py-1 text-sm font-bold">
                SALE
              </span>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <p className="text-sm text-primary font-medium uppercase tracking-wider mb-2">
              {product.category.replace("-", " ")}
            </p>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.round(product.rating)
                        ? "fill-primary text-primary"
                        : "text-white/20"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-white">
                {formatPrice(product.salePrice ?? product.price)}
              </span>
              {product.salePrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>

            <div className="flex flex-wrap gap-3 mb-8">
              <Button size="lg" className="gap-2" onClick={handleAdd}>
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </Button>
              <Button size="lg" variant="ghost" className="gap-2">
                <Heart className="h-5 w-5" /> Wishlist
              </Button>
            </div>

            {product.features.length > 0 && (
              <div className="card-glow p-5">
                <h3 className="font-semibold mb-3">Features</h3>
                <ul className="space-y-2">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {product.requirements && product.requirements.length > 0 && (
              <div className="mt-4 text-sm text-muted-foreground">
                <span className="font-medium text-white">Requirements: </span>
                {product.requirements.join(" • ")}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
