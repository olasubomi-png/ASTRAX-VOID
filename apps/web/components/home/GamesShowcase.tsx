"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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

const iconMap: Record<string, React.ElementType> = {
  Sword,
  Shield,
  Crosshair,
  Target,
  Flame,
  Box,
  Gamepad2,
};

export function GamesShowcase() {
  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-primary text-sm font-medium tracking-widest uppercase mb-2">
              Gaming Hub
            </p>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Supported <span className="neon-text">Games</span>
            </h2>
          </div>
          <Link href="/games" className="text-sm text-primary hover:underline">
            View all games →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {GAMES.map((game, i) => {
            const Icon = iconMap[game.icon] ?? Gamepad2;
            return (
              <motion.div
                key={game.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  href={`/games/${game.slug}`}
                  className="group block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                    {game.shortName}
                  </h3>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
