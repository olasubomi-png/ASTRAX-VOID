"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/hooks/useCartStore";
import type { Product } from "@/types";
import { toast } from "sonner";

const VIP_PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "astrax-vip-elite",
    name: "ASTRAX VIP Elite",
    description: "Full elite VIP package with premium modules and priority support.",
    price: 99.99,
    salePrice: 79.99,
    currency: "USD",
    category: "vip-packages",
    images: [],
    features: ["Aimbot", "ESP", "Anti-Detection", "24/7 Support"],
    stock: null,
    rating: 4.9,
    reviewCount: 342,
    isFeatured: true,
    isTrending: true,
    tags: ["vip"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "vip2",
    slug: "astrax-vip-pro",
    name: "ASTRAX VIP Pro",
    description: "Pro-tier VIP with core modules for competitive play.",
    price: 59.99,
    salePrice: null,
    currency: "USD",
    category: "vip-packages",
    images: [],
    features: ["Aimbot", "ESP", "Support"],
    stock: null,
    rating: 4.7,
    reviewCount: 198,
    isFeatured: false,
    isTrending: true,
    tags: ["vip"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function VIPPage() {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-4">
            <Crown className="h-3.5 w-3.5" /> VIP Packages
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">
            Elevate to <span className="neon-text">VIP</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Premium packages built for champions. Instant delivery. Priority support.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {VIP_PRODUCTS.map((p, i) => (
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
