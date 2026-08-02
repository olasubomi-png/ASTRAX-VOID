"use client";

import { use, useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import {
  Smartphone,
  Tablet,
  ArrowLeft,
  Loader2,
  Star,
  Download,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GetKeyModal } from "@/components/ui/GetKeyModal";
import { GAMES, gameArt } from "@/lib/constants";
import { api } from "@/lib/api";
import { mediaUrl, triggerDownload, logProductDownload } from "@/lib/utils";
import { toast } from "sonner";

type ApiProduct = {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
  description?: string;
  images?: string[];
  category?: { slug?: string; name?: string } | null;
  gameSlug?: string | null;
  fileKey?: string | null;
  rating?: number;
  reviewCount?: number;
};

function ProductCard({
  product,
  platformLabel,
  onDownload,
  onGetKey,
}: {
  product: ApiProduct;
  platformLabel: string;
  onDownload: () => void;
  onGetKey: () => void;
}) {
  const img = product.images?.[0] ? mediaUrl(product.images[0]) : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-glow group flex flex-col overflow-hidden"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center overflow-hidden">
          {img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-display font-bold text-primary/40">
              {product.name.charAt(0)}
            </span>
          )}
          <span className="absolute top-2 right-2 rounded-lg bg-black/70 border border-white/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            {platformLabel}
          </span>
        </div>
        <div className="p-4 pb-2">
          <h3 className="font-semibold text-white group-hover:text-primary transition-colors mb-1 line-clamp-1">
            {product.name}
          </h3>
          {(product.shortDescription || product.description) && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {product.shortDescription || product.description}
            </p>
          )}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            {product.rating ?? 0} ({product.reviewCount ?? 0})
          </div>
        </div>
      </Link>
      <div className="p-4 pt-2 mt-auto flex gap-2">
        <Button className="flex-1 gap-1.5" size="sm" onClick={onDownload}>
          <Download className="h-3.5 w-3.5" /> Download
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="border border-primary/30 hover:bg-primary/10 px-3"
          onClick={onGetKey}
          aria-label="Get Key"
        >
          <Key className="h-3.5 w-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}

function GameDetailInner({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const game = GAMES.find((g) => g.slug === slug);

  const [android, setAndroid] = useState<ApiProduct[]>([]);
  const [ios, setIos] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string | undefined>();

  if (!game) notFound();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [aRes, iRes] = await Promise.all([
          api.get<{ success: boolean; products: ApiProduct[] }>(
            `/products?gameSlug=${encodeURIComponent(game.slug)}&category=android-resources&limit=50`
          ),
          api.get<{ success: boolean; products: ApiProduct[] }>(
            `/products?gameSlug=${encodeURIComponent(game.slug)}&category=ios-resources&limit=50`
          ),
        ]);
        if (!cancelled) {
          setAndroid(aRes.products ?? []);
          setIos(iRes.products ?? []);
        }
      } catch {
        if (!cancelled) {
          setAndroid([]);
          setIos([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [game.slug]);

  const handleDownload = (p: ApiProduct) => {
    const url = mediaUrl(p.fileKey);
    if (url) {
      logProductDownload({
        productId: p.id,
        productName: p.name,
        gameSlug: p.gameSlug,
        platform: p.category?.slug,
      });
      triggerDownload(url, p.slug ? `${p.slug}.zip` : "download.zip");
    } else {
      toast.info("No file attached. Use Get Key or contact support.");
      setSelectedName(p.name);
      setKeyModalOpen(true);
    }
  };

  return (
    <>
      <GetKeyModal
        open={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        productName={selectedName}
      />

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
            <span className="text-white/70">{game.shortName}</span>
          </nav>

          <div className="relative mb-10 overflow-hidden rounded-3xl border border-white/10">
            <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-[320px] sm:max-h-[380px] w-full bg-[#0a0614]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gameArt(game.slug).hero}
                alt=""
                className="h-full w-full object-cover"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
                <Link
                  href="/games"
                  className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-primary mb-4 w-fit"
                >
                  <ArrowLeft className="h-4 w-4" /> All games
                </Link>
                <div className="flex items-center gap-4 mb-2">
                  <div className="h-14 w-14 sm:h-16 sm:w-16 overflow-hidden rounded-full border-2 border-primary/50 bg-black shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={gameArt(game.slug).icon}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="font-display text-2xl sm:text-4xl font-bold text-white">
                      {game.name}
                    </h1>
                    <p className="text-sm text-white/60 mt-1">
                      Android &amp; iOS resources for {game.shortName}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-14">
              {android.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Android Resources
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {android.length} file{android.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {android.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        platformLabel="Android"
                        onDownload={() => handleDownload(p)}
                        onGetKey={() => {
                          setSelectedName(p.name);
                          setKeyModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {ios.length > 0 && (
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <Tablet className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        iOS Resources
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        {ios.length} file{ios.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {ios.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        platformLabel="iOS"
                        onDownload={() => handleDownload(p)}
                        onGetKey={() => {
                          setSelectedName(p.name);
                          setKeyModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {!loading && android.length === 0 && ios.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
                  <p className="text-muted-foreground">
                    No Android or iOS resources for {game.shortName} yet.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
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
