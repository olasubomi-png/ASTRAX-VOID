"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Download, Key, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/constants";
import { GetKeyModal } from "@/components/ui/GetKeyModal";
import type { Product } from "@/types";
import { toast } from "sonner";

const DEMO_PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "astrax-vip-elite",
    name: "ASTRAX VIP Elite",
    description: "Full elite VIP package with premium modules and priority support.",
    category: "vip-packages",
    images: [],
    features: ["Aimbot", "ESP", "Anti-Detection"],
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
    category: "codm-files",
    images: [],
    features: ["Silent Aim", "Wallhack"],
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
    category: "unlock-tools",
    images: [],
    features: ["Multi-game", "HWID Spoofer"],
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
    category: "bundles",
    images: [],
    features: ["All VIP", "CODM Premium", "Tools"],
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
    slug: "codm-xtreme-v5",
    name: "CODM Xtreme V5",
    description: "Maximum aggression CODM package.",
    category: "codm-files",
    images: [],
    features: ["Aimbot", "Speed", "ESP"],
    rating: 4.85,
    reviewCount: 456,
    isFeatured: true,
    isTrending: true,
    tags: ["codm"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "6",
    slug: "sensitivity-pack-pro",
    name: "Sensitivity Pack Pro",
    description: "Optimised sensitivity configs for competitive play.",
    category: "game-configuration-packs",
    images: [],
    features: ["All devices", "Multiple games", "Regular updates"],
    rating: 4.6,
    reviewCount: 312,
    isFeatured: false,
    isTrending: true,
    tags: ["config"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = DEMO_PRODUCTS.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  const handleDownload = (product: Product) => {
    if (product.fileUrl) {
      window.open(product.fileUrl, "_blank");
    } else {
      toast.info("Contact us via WhatsApp or Telegram to receive your download link.", {
        duration: 4000,
      });
      setSelectedProduct(product);
      setKeyModalOpen(true);
    }
  };

  const handleGetKey = (product: Product) => {
    setSelectedProduct(product);
    setKeyModalOpen(true);
  };

  return (
    <>
      <GetKeyModal
        open={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        productName={selectedProduct?.name}
      />

      <div className="section-padding">
        <div className="container-max">
          <div className="mb-10">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
              All <span className="neon-text">Products</span>
            </h1>
            <p className="text-muted-foreground">Premium digital arsenal — 100% free to download</p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 min-w-0">
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
              {CATEGORIES.slice(0, 6).map((c) => (
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
                  <div className="relative aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 mb-4 flex items-center justify-center overflow-hidden">
                    {product.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-display font-bold text-primary/40">
                        {product.name.charAt(0)}
                      </span>
                    )}
                    {product.isTrending && (
                      <span className="absolute top-2 left-2 rounded-lg bg-primary px-2 py-0.5 text-xs font-bold text-white">
                        HOT
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-primary transition-colors mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-1">
                    <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                    <span className="text-xs text-muted-foreground">
                      {product.rating} ({product.reviewCount})
                    </span>
                  </div>
                  <span className="inline-block text-xs font-semibold text-primary bg-primary/10 rounded-lg px-2 py-0.5">
                    FREE
                  </span>
                </Link>
                <div className="p-4 pt-0 mt-auto flex gap-2">
                  <Button
                    className="flex-1 gap-2"
                    size="sm"
                    onClick={() => handleDownload(product)}
                  >
                    <Download className="h-4 w-4" /> Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 gap-2 border border-primary/30 hover:bg-primary/10"
                    onClick={() => handleGetKey(product)}
                  >
                    <Key className="h-4 w-4" /> Get Key
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
    </>
  );
}
