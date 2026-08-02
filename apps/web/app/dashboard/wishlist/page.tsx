"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, Download, Key } from "lucide-react";
import { useState } from "react";
import { GetKeyModal } from "@/components/ui/GetKeyModal";

const wishlist: { id: string; name: string; slug: string }[] = [];

export default function WishlistPage() {
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [selectedName, setSelectedName] = useState("");

  return (
    <>
      <GetKeyModal open={keyModalOpen} onClose={() => setKeyModalOpen(false)} productName={selectedName} />

      <div className="section-padding">
        <div className="container-max">
          <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
            <h1 className="font-display text-3xl font-bold">
              My <span className="neon-text">Wishlist</span>
            </h1>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">← Dashboard</Button>
            </Link>
          </div>

          {wishlist.length === 0 ? (
            <div className="card-glow p-12 text-center">
              <Heart className="h-12 w-12 text-primary/40 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
              <Link href="/products"><Button>Browse Products</Button></Link>
            </div>
          ) : (
            <div className="space-y-4">
              {wishlist.map((item) => (
                <div key={item.id} className="card-glow p-5 flex items-center justify-between gap-4 flex-wrap">
                  <h3 className="font-semibold text-white">{item.name}</h3>
                  <div className="flex gap-2">
                    <Link href={`/products/${item.slug}`}>
                      <Button size="sm" className="gap-2">
                        <Download className="h-4 w-4" /> Download
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" className="gap-2 border border-primary/30" onClick={() => { setSelectedName(item.name); setKeyModalOpen(true); }}>
                      <Key className="h-4 w-4" /> Get Key
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
