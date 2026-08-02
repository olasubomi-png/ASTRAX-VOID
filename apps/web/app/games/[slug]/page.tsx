"use client";

import { use, useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sword,
  Shield,
  Crosshair,
  Target,
  Flame,
  Box,
  Gamepad2,
  Smartphone,
  Tablet,
  Settings,
  Zap,
  LayoutGrid,
  PanelsTopLeft,
  Monitor,
  Cpu,
  BookOpen,
  Crown,
  Download,
  Package,
  ArrowLeft,
  Loader2,
  Star,
} from "lucide-react";
import { GAMES, RESOURCE_TYPES } from "@/lib/constants";
import { api } from "@/lib/api";
import { mediaUrl } from "@/lib/utils";

const gameIconMap: Record<string, React.ElementType> = {
  Sword,
  Shield,
  Crosshair,
  Target,
  Flame,
  Box,
  Gamepad2,
};

const resourceIconMap: Record<string, React.ElementType> = {
  Smartphone,
  Tablet,
  Settings,
  Zap,
  LayoutGrid,
  PanelsTopLeft,
  Crosshair,
  Monitor,
  Cpu,
  BookOpen,
  Crown,
  Download,
  Package,
};

type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  images?: string[];
  category?: { slug?: string; name?: string } | null;
  gameSlug?: string | null;
  rating?: number;
  reviewCount?: number;
  isTrending?: boolean;
};

function GameDetailInner({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";

  const game = GAMES.find((g) => g.slug === slug);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  if (!game) notFound();

  const Icon = gameIconMap[game.icon] ?? Gamepad2;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const q = new URLSearchParams();
        q.set("gameSlug", game.slug);
        q.set("limit", "50");
        if (selectedCategory) q.set("category", selectedCategory);
        const res = await api.get<{ success: boolean; products: ApiProduct[] }>(
          `/products?${q.toString()}`
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
  }, [game.slug, selectedCategory]);

  const activeResource = useMemo(
    () => RESOURCE_TYPES.find((r) => r.slug === selectedCategory),
    [selectedCategory]
  );

  return (
    <div className="section-padding min-h-screen pt-24">
      <div className="container-max">
        <nav className="text-sm text-muted-foreground mb-6 flex flex-wrap gap-2 items-center">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span>/</span>
          <Link href="/games" className="hover:text-primary">
            Games
          </Link>
          <span>/</span>
          <Link href={`/games/${game.slug}`} className="hover:text-primary">
            {game.shortName}
          </Link>
          {activeResource && (
            <>
              <span>/</span>
              <span className="text-white/70">{activeResource.name}</span>
            </>
          )}
        </nav>

        <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <div className="relative">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/20 text-primary">
              <Icon className="h-7 w-7" />
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
              {game.name}
            </h1>
            <p className="text-muted-foreground max-w-2xl">
              {activeResource
                ? `${activeResource.name} for ${game.shortName}`
                : `Choose a resource type for ${game.shortName} — Android, iOS, HUD presets, sensitivity packs and more.`}
            </p>
          </div>
        </div>

        {/* Resource types for this game */}
        {!selectedCategory && (
          <>
            <h2 className="text-xl font-bold text-white mb-6">
              Resources for {game.shortName}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
              {RESOURCE_TYPES.map((res, i) => {
                const RIcon = resourceIconMap[res.icon] ?? Package;
                return (
                  <motion.div
                    key={res.slug}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      href={`/games/${game.slug}?category=${res.slug}`}
                      className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center transition-all hover:border-primary/40 hover:bg-primary/5"
                    >
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary group-hover:scale-110 transition-transform">
                        <RIcon className="h-6 w-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                        {res.name}
                      </h3>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}

        {/* Products for game (+ optional category) */}
        {selectedCategory && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-xl font-bold text-white">
                {activeResource?.name ?? "Resources"}
              </h2>
              <Link
                href={`/games/${game.slug}`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" /> All resource types
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
                <p className="text-muted-foreground">
                  No products in this category for {game.shortName} yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => {
                  const img = p.images?.[0] ? mediaUrl(p.images[0]) : null;
                  return (
                    <Link
                      key={p.id}
                      href={`/products/${p.slug}`}
                      className="group block rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden transition-all hover:border-primary/40"
                    >
                      <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center overflow-hidden">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={img}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-display font-bold text-primary/40">
                            {p.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-white group-hover:text-primary mb-1 line-clamp-1">
                          {p.name}
                        </h3>
                        {p.shortDescription && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {p.shortDescription}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          {p.rating ?? 0} ({p.reviewCount ?? 0})
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* When no category selected, still show a short list of latest for this game */}
        {!selectedCategory && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold text-white mb-4">
              Latest for {game.shortName}
            </h2>
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No products for this game yet. Pick a resource type above once
                items are added in admin.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.slice(0, 6).map((p) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 hover:border-primary/40 transition-colors"
                  >
                    <span className="font-medium text-white text-sm">
                      {p.name}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


export default function GameDetailPage(props: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="section-padding flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <GameDetailInner {...props} />
    </Suspense>
  );
}
