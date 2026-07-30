"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/hooks/useCartStore";
import type { Product } from "@/types";
import { toast } from "sonner";

// Demo featured products (replace with API fetch)
const FEATURED: Product[] = [
  {
    id: "1",
    slug: "astrax-vip-elite",
    name: "ASTRAX VIP Elite",
    description: "Full elite VIP package with premium modules and priority support.",
    price: 99.99,
    salePrice: 79.99,
    currency: "USD",
    category: "vip-packages",
    images: ["/logo.png"],
    features: ["Aimbot", "ESP", "Anti-Detection", "24/7 Support"],
    stock: null,
    rating: 4.9,
    reviewCount: 342,
    isFeatured: true,
    isTrending: true,
    tags: ["vip", "elite"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    slug: "codm-premium-v5",
    name: "CODM Premium V5",
    description: "Latest CODM premium files. Instant delivery, undetected.",
    price: 49.99,
    salePrice: null,
    currency: "USD",
    category: "codm-files",
    images: ["/logo.png"],
    features: ["Silent Aim", "Wallhack", "No Recoil", "Rapid Updates"],
    stock: 50,
    rating: 4.8,
    reviewCount: 891,
    isFeatured: true,
    isTrending: true,
    tags: ["codm", "premium"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    slug: "unlock-tool-pro",
    name: "Unlock Tool Pro",
    description: "Professional unlock toolkit with lifetime updates.",
    price: 29.99,
    salePrice: 19.99,
    currency: "USD",
    category: "unlock-tools",
    images: ["/logo.png"],
    features: ["Multi-game", "HWID Spoofer", "Lifetime Updates"],
    stock: null,
    rating: 4.7,
    reviewCount: 215,
    isFeatured: true,
    isTrending: false,
    tags: ["tools"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    slug: "bundle-dominator",
    name: "Dominator Bundle",
    description: "VIP + CODM + Tools in one powerful package.",
    price: 149.99,
    salePrice: 119.99,
    currency: "USD",
    category: "bundles",
    images: ["/logo.png"],
    features: ["All VIP features", "CODM Premium", "Unlock Tools", "Priority Queue"],
    stock: 20,
    rating: 5.0,
    reviewCount: 67,
    isFeatured: true,
    isTrending: true,
    tags: ["bundle"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function FeaturedProducts() {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = (product: Product) => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <section className="section-padding bg-black/30">
      <div className="container-max">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              Featured <span className="neon-text">Products</span>
            </h2>
            <p className="text-muted-foreground">Hand-picked premium offerings</p>
          </div>
          <Link href="/products">
            <Button variant="ghost">View All Products</Button>
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-glow group flex flex-col"
            >
              <Link href={`/products/${product.slug}`} className="block p-4">
                <div className="relative aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 mb-4 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-display font-bold text-primary/40">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                  {product.salePrice && (
                    <span className="absolute top-2 left-2 rounded-lg bg-accent px-2 py-0.5 text-xs font-bold text-white">
                      SALE
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-white group-hover:text-primary transition-colors mb-1 line-clamp-1">
                  {product.name}
                </h3>
                <div className="flex items-center gap-1 mb-2">
                  <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {product.rating} ({product.reviewCount})
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-white">
                    {formatPrice(product.salePrice ?? product.price)}
                  </span>
                  {product.salePrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </Link>
              <div className="p-4 pt-0 mt-auto">
                <Button
                  className="w-full gap-2"
                  size="sm"
                  onClick={() => handleAdd(product)}
                >
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
