"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Sword,
  Shield,
  Crosshair,
  Target,
  Flame,
  Box,
  Gamepad2,
} from "lucide-react";
import { GAMES } from "@/lib/constants";
import { api } from "@/lib/api";

const iconMap: Record<string, React.ElementType> = {
  Sword,
  Shield,
  Crosshair,
  Target,
  Flame,
  Box,
  Gamepad2,
};

type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  price: number;
  salePrice?: number | null;
  images?: string[];
  tags?: string[];
  isFeatured?: boolean;
};

export default function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const game = GAMES.find((g) => g.slug === slug);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  if (!game) notFound();

  const Icon = iconMap[game.icon] ?? Gamepad2;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Filter by tag matching game slug / shortName until Product.game exists in schema
        const res = await api.get<{ success: boolean; products: Product[] }>(
          `/products?gameSlug=${encodeURIComponent(game.slug)}&limit=24`
        );
        if (!cancelled) setProducts(res.products ?? []);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [game.shortName]);

  return (
    <div className="section-padding min-h-screen pt-24">
      <div className="container-max">
        <nav className="text-sm text-muted-foreground mb-6 flex gap-2">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/games" className="hover:text-primary">
            Games
          </Link>
          <span>/</span>
          <span className="text-white/70">{game.shortName}</span>
        </nav>

        <div className="relative mb-12 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-12">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <div className="relative">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <Icon className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
              {game.name}
            </h1>
            <p className="text-muted-foreground max-w-2xl mb-4">
              Premium digital resources for {game.shortName} — sensitivity packs,
              HUD presets, control layouts and performance profiles.
            </p>
            <Link
              href={`/products?search=${encodeURIComponent(game.shortName)}`}
              className="text-sm text-primary hover:underline"
            >
              Browse all {game.shortName} products →
            </Link>
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mb-6">Resources</h2>

        {loading ? (
          <p className="text-muted-foreground">Loading products…</p>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
            <p className="text-muted-foreground mb-4">
              No products tagged for {game.shortName} yet.
            </p>
            <Link href="/products" className="text-sm text-primary hover:underline">
              View all products →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Link
                key={p.id}
                href={`/products/${p.slug}`}
                className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-primary/40"
              >
                <h3 className="font-semibold text-white group-hover:text-primary mb-1">
                  {p.name}
                </h3>
                {p.shortDescription && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {p.shortDescription}
                  </p>
                )}
                <p className="text-sm font-medium text-primary">
                  {p.salePrice != null && p.salePrice < p.price ? (
                    <>
                      ${p.salePrice.toFixed(2)}{" "}
                      <span className="text-muted-foreground line-through">
                        ${p.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    `\[ {p.price.toFixed(2)}`
                  )}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
