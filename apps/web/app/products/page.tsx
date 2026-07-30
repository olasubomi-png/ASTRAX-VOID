"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, ShoppingCart, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/hooks/useCartStore";
import { CATEGORIES } from "@/lib/constants";
import type { Product } from "@/types";
import { toast } from "sonner";

// Demo data — replace with API fetch
const DEMO_PRODUCTS: Product[] = [
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
    features: ["Aimbot", "ESP", "Anti-Detection"],
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
    id: "2",
    slug: "codm-premium-v5",
    name: "CODM Premium V5",
    description: "Latest CODM premium files. Instant delivery.",
    price: 49.99,
    salePrice: null,
    currency: "USD",
    category: "codm-files",
    images: [],
    features: ["Silent Aim", "Wallhack"],
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
    id: "3",
    slug: "unlock-tool-pro",
    name: "Unlock Tool Pro",
    description: "Professional unlock toolkit.",
    price: 29.99,
    salePrice: 19.99,
    currency: "USD",
    category: "unlock-tools",
    images: [],
    features: ["Multi-game", "HWID Spoofer"],
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
    description: "VIP + CODM + Tools package.",
    price: 149.99,
    salePrice: 119.99,
    currency: "USD",
    category: "bundles",
    images: [],
    features: ["All VIP", "CODM Premium", "Tools"],
    stock: 20,
    rating: 5.0,
    reviewCount: 67,
    isFeatured: true,
    isTrending: true,
    tags: ["bundle"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    slug: "gift-card-50",
    name: "ASTRAX Gift Card $50",
    description: "Give the gift of domination.",
    price: 50,
    salePrice: null,
    currency: "USD",
    category: "gift-cards",
    images: [],
    features: ["Instant", "No expiry"],
    stock: null,
    rating: 4.9,
    reviewCount: 120,
    isFeatured: false,
    isTrending: false,
    tags: ["gift"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    slug: "codm-xtreme-v5",
    name: "CODM Xtreme V5",
    description: "Maximum aggression CODM package.",
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

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const addItem = useCartStore((s) => s.addItem);

  const filtered = DEMO_PRODUCTS.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  const handleAdd = (product: Product) => {
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            All <span className="neon-text">Products</span>
          </h1>
          <p className="text-muted-foreground">Premium digital arsenal for elite players</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={category === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setCategory("all")}
            >
              All
            </Button>
            {CATEGORIES.map((c) => (
              <Button
                key={c.slug}
                variant={category === c.slug ? "default" : "ghost"}
                size="sm"
                onClick={() => setCategory(c.slug)}
              >
                {c.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-glow group flex flex-col"
            >
              <Link href={`/products/${product.slug}`} className="block p-4">
                <div className="relative aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 mb-4 flex items-center justify-center">
                  <span className="text-4xl font-display font-bold text-primary/40">
                    {product.name.charAt(0)}
                  </span>
                  {product.salePrice && (
                    <span className="absolute top-2 left-2 rounded-lg bg-accent px-2 py-0.5 text-xs font-bold">
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
                  <span className="text-lg font-bold">
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
                <Button className="w-full gap-2" size="sm" onClick={() => handleAdd(product)}>
                  <ShoppingCart className="h-4 w-4" /> Add to Cart
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            No products found. Try a different search or category.
          </div>
        )}
      </div>
    </div>
  );
}
