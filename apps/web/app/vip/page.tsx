"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, Star, Download, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GetKeyModal } from "@/components/ui/GetKeyModal";
import type { Product } from "@/types";
import { toast } from "sonner";

const VIP_PRODUCTS: Product[] = [
  {
    id: "1",
    slug: "astrax-vip-elite",
    name: "ASTRAX VIP Elite",
    description: "Full elite VIP package with premium modules and priority support.",
    category: "vip-packages",
    images: [],
    features: ["Aimbot", "ESP", "Anti-Detection", "24/7 Support"],
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
    category: "vip-packages",
    images: [],
    features: ["Aimbot", "ESP", "Support"],
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
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleDownload = (p: Product) => {
    if (p.fileUrl) {
      window.open(p.fileUrl, "_blank");
    } else {
      toast.info("Contact us to receive your VIP download link.");
      setSelectedProduct(p);
      setKeyModalOpen(true);
    }
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
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-4">
              <Crown className="h-3.5 w-3.5" /> VIP Packages
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold mb-3">
              Elevate to <span className="neon-text">VIP</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Premium packages built for champions. Instant delivery. Priority support. 100% free.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
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
                <p className="text-sm text-muted-foreground mb-5 flex-1">{p.description}</p>
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-primary/15 border border-primary/30 px-4 py-1.5 text-base font-bold text-primary">
                    FREE
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 gap-2" onClick={() => handleDownload(p)}>
                    <Download className="h-4 w-4" /> Download
                  </Button>
                  <Button
                    variant="ghost"
                    className="flex-1 gap-2 border border-primary/30 hover:bg-primary/10"
                    onClick={() => { setSelectedProduct(p); setKeyModalOpen(true); }}
                  >
                    <Key className="h-4 w-4" /> Get Key
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
