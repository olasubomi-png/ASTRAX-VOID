"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Crown,
  Gamepad2,
  Wrench,
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
  RefreshCw,
  Megaphone,
  MessagesSquare,
  Download,
  Package,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  Crown,
  Gamepad2,
  Wrench,
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
  RefreshCw,
  Megaphone,
  MessagesSquare,
  Download,
  Package,
};

export function Categories() {
  // Show main Gaming Hub categories on the homepage (skip legacy extras if you want fewer)
  const display = CATEGORIES.filter((c) =>
    ![
      "vip-packages",
      "codm-files",
      "unlock-tools",
    ].includes(c.slug)
  ).slice(0, 12);

  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Choose Your <span className="neon-text">Arsenal</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Premium configs, HUD presets, sensitivity packs and resources for competitive players.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {display.map((cat, i) => {
            const Icon = iconMap[cat.icon] ?? Package;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/products"
            className="text-sm text-primary hover:underline"
          >
            View all products →
          </Link>
        </div>
      </div>
    </section>
  );
}
