"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Download, Key, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CATEGORIES } from "@/lib/constants";
import { GetKeyModal } from "@/components/ui/GetKeyModal";
import { api } from "@/lib/api";
import type { Product } from "@/types";
import { toast } from "sonner";
import { mediaUrl, triggerDownload } from "@/lib/utils";

/** Map API product (category may be object) → frontend Product */
function mapApiProduct(p: any): Product {
  const categorySlug =
    typeof p.category === "string"
      ? p.category
      : p.category?.slug || p.categoryId || "uncategorized";
  const fileKey = p.fileKey || null;
  const fileUrl =
    mediaUrl(p.fileUrl) ||
    mediaUrl(fileKey) ||
    null;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description || "",
    shortDescription: p.shortDescription || undefined,
    price: p.price,
    salePrice: p.salePrice,
    currency: p.currency,
    category: categorySlug,
    images: Array.isArray(p.images) ? p.images.map((img: string) => mediaUrl(img) || img).filter(Boolean) : [],
    videoUrl: p.videoUrl,
    features: Array.isArray(p.features) ? p.features : [],
    requirements: Array.isArray(p.requirements) ? p.requirements : [],
    stock: p.stock,
    rating: typeof p.rating === "number" ? p.rating : 0,
    reviewCount: typeof p.reviewCount === "number" ? p.reviewCount : 0,
    isFeatured: Boolean(p.isFeatured),
    isTrending: Boolean(p.isTrending),
    tags: Array.isArray(p.tags) ? p.tags : [],
    fileKey,
    fileUrl,
    isActive: p.isActive,
    categoryId: p.categoryId,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("limit", "100");
      params.set("sort", "newest");
      if (category !== "all") params.set("category", category);
      if (search.trim()) params.set("search", search.trim());

      const res = await api.get<{ success: boolean; products: any[] }>(
        `/products?${params.toString()}`
      );
      setProducts((res.products || []).map(mapApiProduct));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const handleDownload = (product: Product) => {
    const url = mediaUrl(product.fileUrl) || mediaUrl(product.fileKey);
    if (url) {
      const name = product.slug ? `${product.slug}.zip` : "download.zip";
      triggerDownload(url, name);
    } else {
      toast.info(
        "No file attached. Contact us via WhatsApp or Telegram for your download.",
        { duration: 4000 }
      );
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
            <p className="text-muted-foreground">
              Premium digital arsenal — 100% free to download
            </p>
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
              {CATEGORIES.slice(0, 8).map((c) => (
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

          {loading && (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-12 text-red-400 text-sm">
              {error}
              <div className="mt-3">
                <Button size="sm" variant="ghost" onClick={load}>
                  Retry
                </Button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                    className="card-glow group flex flex-col"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="block p-4"
                    >
                      <div className="relative aspect-square rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 mb-4 flex items-center justify-center overflow-hidden">
                        {product.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
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

              {products.length === 0 && (
                <div className="text-center py-20 text-muted-foreground">
                  No products found. Try a different search or category.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
