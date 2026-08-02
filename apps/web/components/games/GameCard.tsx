"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Smartphone, Tablet } from "lucide-react";
import { gameArt } from "@/lib/constants";
import { api } from "@/lib/api";

type Props = {
  slug: string;
  name: string;
  shortName: string;
  index?: number;
  /** compact = homepage grid; full = /games page */
  variant?: "compact" | "full";
};

export function GameCard({
  slug,
  name,
  shortName,
  index = 0,
  variant = "full",
}: Props) {
  const art = gameArt(slug);
  const [androidCount, setAndroidCount] = useState<number | null>(null);
  const [iosCount, setIosCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, i] = await Promise.all([
          api.get<{ pagination?: { total?: number }; products?: unknown[] }>(
            `/products?gameSlug=${encodeURIComponent(slug)}&category=android-resources&limit=1`
          ),
          api.get<{ pagination?: { total?: number }; products?: unknown[] }>(
            `/products?gameSlug=${encodeURIComponent(slug)}&category=ios-resources&limit=1`
          ),
        ]);
        if (!cancelled) {
          setAndroidCount(a.pagination?.total ?? a.products?.length ?? 0);
          setIosCount(i.pagination?.total ?? i.products?.length ?? 0);
        }
      } catch {
        if (!cancelled) {
          setAndroidCount(0);
          setIosCount(0);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
    >
      <Link
        href={`/games/${slug}`}
        className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition-all hover:border-primary/45 hover:shadow-[0_0_40px_-12px_rgba(139,92,246,0.45)]"
      >
        {/* Hero banner */}
        <div className="relative aspect-[16/9] overflow-hidden bg-[#0a0614]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={art.hero}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {/* Circular profile icon */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-primary/60 bg-black shadow-lg shadow-primary/20 ring-2 ring-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={art.icon}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        <div className={`text-center ${variant === "full" ? "px-5 pb-5 pt-12" : "px-3 pb-4 pt-11"}`}>
          <h2
            className={`font-semibold text-white group-hover:text-primary transition-colors ${
              variant === "full" ? "text-lg mb-3" : "text-sm mb-2"
            }`}
          >
            {variant === "full" ? name : shortName}
          </h2>

          <div
            className={`flex justify-center gap-3 text-muted-foreground ${
              variant === "full" ? "text-xs" : "text-[10px]"
            }`}
          >
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1">
              <Smartphone className="h-3 w-3 text-primary" />
              Android{" "}
              <strong className="text-white">
                {androidCount === null ? "…" : androidCount}
              </strong>
            </span>
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/5 border border-white/10 px-2 py-1">
              <Tablet className="h-3 w-3 text-primary" />
              iOS{" "}
              <strong className="text-white">
                {iosCount === null ? "…" : iosCount}
              </strong>
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
