"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Star,
  Download,
  Key,
  Check,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GetKeyModal } from "@/components/ui/GetKeyModal";
import { api } from "@/lib/api";
import type { Product } from "@/types";
import { toast } from "sonner";

function mapApiProduct(p: any): Product {
  const categorySlug =
    typeof p.category === "string"
      ? p.category
      : p.category?.slug || p.categoryId || "uncategorized";
  const fileKey = p.fileKey || null;
  const fileUrl =
    p.fileUrl ||
    (fileKey && /^https?:\/\//i.test(fileKey) ? fileKey : null);

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
    images: Array.isArray(p.images) ? p.images : [],
    features: Array.isArray(p.features) ? p.features : [],
    requirements: Array.isArray(p.requirements) ? p.requirements : [],
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

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [keyModalOpen, setKeyModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get<{ success: boolean; product: any }>(
          `/products/${encodeURIComponent(slug)}`
        );
        if (!cancelled) {
          if (res.product) setProduct(mapApiProduct(res.product));
          else setNotFound(true);
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleDownload = () => {
    if (!product) return;
    const url = product.fileUrl || product.fileKey;
    if (url && /^https?:\/\//i.test(url)) {
      window.open(url, "_blank");
    } else {
      toast.info("Contact us to receive your download link.");
      setKeyModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="section-padding flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="section-padding">
        <div className="container-max text-center py-20">
          <h1 className="font-display text-2xl font-bold mb-2">
            Product not found
          </h1>
          <p className="text-muted-foreground mb-6">
            This product may have been removed or the link is invalid.
          </p>
          <Link href="/products">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <GetKeyModal
        open={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        productName={product.name}
      />

      <div className="section-padding">
        <div className="container-max">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8"
          >
            <ArrowLeft className="h-4 w-4" /> All products
          </Link>

          <div className="grid lg:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/10 overflow-hidden flex items-center justify-center"
            >
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-6xl font-display font-bold text-primary/40">
                  {product.name.charAt(0)}
                </span>
              )}
              {product.isTrending && (
                <span className="absolute top-4 left-4 rounded-lg bg-primary px-3 py-1 text-xs font-bold text-white">
                  HOT
                </span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
                <span className="text-xs font-semibold text-primary bg-primary/10 rounded-lg px-2 py-0.5">
                  FREE
                </span>
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {product.description}
              </p>

              {product.features.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-semibold mb-3">Features</h2>
                  <ul className="space-y-2">
                    {product.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {product.requirements && product.requirements.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-semibold mb-3">Requirements</h2>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {product.requirements.map((r) => (
                      <li key={r}>• {r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button className="gap-2" onClick={handleDownload}>
                  <Download className="h-4 w-4" /> Download
                </Button>
                <Button
                  variant="ghost"
                  className="gap-2 border border-primary/30"
                  onClick={() => setKeyModalOpen(true)}
                >
                  <Key className="h-4 w-4" /> Get Key
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
