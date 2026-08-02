"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Star, Download, Key, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GetKeyModal } from "@/components/ui/GetKeyModal";
import { api } from "@/lib/api";
import type { Product } from "@/types";
import { toast } from "sonner";
import { mediaUrl, triggerDownload } from "@/lib/utils";

function mapApiProduct(p: any): Product {
  const categorySlug =
    typeof p.category === "string"
      ? p.category
      : p.category?.slug || p.categoryId || "uncategorized";
  const fileKey = p.fileKey || null;
  const fileUrl = mediaUrl(p.fileUrl) || mediaUrl(fileKey) || null;

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description || "",
    shortDescription: p.shortDescription || undefined,
    category: categorySlug,
    images: Array.isArray(p.images) ? p.images.map((img: string) => mediaUrl(img) || img).filter(Boolean) : [],
    features: Array.isArray(p.features) ? p.features : [],
    rating: typeof p.rating === "number" ? p.rating : 0,
    reviewCount: typeof p.reviewCount === "number" ? p.reviewCount : 0,
    isFeatured: Boolean(p.isFeatured),
    isTrending: Boolean(p.isTrending),
    tags: Array.isArray(p.tags) ? p.tags : [],
    fileKey,
    fileUrl,
    createdAt: p.createdAt || new Date().toISOString(),
    updatedAt: p.updatedAt || new Date().toISOString(),
  };
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Prefer featured; if none, show latest active products
        let list: any[] = [];
        try {
          const res = await api.get<{ success: boolean; products: any[] }>(
            "/products/featured"
          );
          list = res.products || [];
        } catch {
          /* fall through */
        }
        if (list.length === 0) {
          const res = await api.get<{ success: boolean; products: any[] }>(
            "/products?limit=8&sort=newest"
          );
          list = res.products || [];
        }
        if (!cancelled) setProducts(list.map(mapApiProduct));
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleDownload = (product: Product) => {
    const url = mediaUrl(product.fileUrl) || mediaUrl(product.fileKey);
    if (url) {
      triggerDownload(url, product.slug ? `${product.slug}.zip` : "download.zip");
    } else {
      toast.info("No file attached. Contact us for your download link.");
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

      <section className="section-padding bg-black/30">
        <div className="container-max">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Featured <span className="neon-text">Products</span>
              </h2>
              <p className="text-muted-foreground">
                Hand-picked premium offerings — all free
              </p>
            </div>
            <Link href="/products">
              <Button variant="ghost">View All</Button>
            </Link>
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && products.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              No products yet — check back soon.
            </p>
          )}

          {!loading && products.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
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
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl font-display font-bold text-primary/40">
                            {product.name.charAt(0)}
                          </span>
                        </div>
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
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                      <span className="text-xs text-muted-foreground">
                        {product.rating} ({product.reviewCount})
                      </span>
                    </div>
                    <span className="text-xs font-bold text-primary">FREE</span>
                  </Link>
                  <div className="p-4 pt-0 mt-auto flex gap-2">
                    <Button
                      className="flex-1 gap-1.5"
                      size="sm"
                      onClick={() => handleDownload(product)}
                    >
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="border border-primary/30 hover:bg-primary/10 px-3"
                      onClick={() => handleGetKey(product)}
                      aria-label="Get Key"
                    >
                      <Key className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
