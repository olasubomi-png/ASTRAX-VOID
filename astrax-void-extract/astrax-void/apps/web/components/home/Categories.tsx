"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Crown, Gamepad2, Wrench, User, Package, Gift } from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

const iconMap: Record<string, React.ElementType> = {
  Crown,
  Gamepad2,
  Wrench,
  User,
  Package,
  Gift,
};

export function Categories() {
  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Choose Your <span className="neon-text">Arsenal</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Premium digital products for competitive players who refuse to settle.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat, i) => {
            const Icon = iconMap[cat.icon] || Package;
            return (
              <motion.div
                key={cat.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  className="card-glow flex flex-col items-center gap-3 p-6 text-center group"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:shadow-glow transition-all">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-white/90 group-hover:text-white">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
