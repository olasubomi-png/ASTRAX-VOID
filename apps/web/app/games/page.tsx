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

export default function GamesPage() {
  return (
    <div className="section-padding min-h-screen pt-24">
      <div className="container-max">
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-2">
            Gaming Hub
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Supported <span className="neon-text">Games</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Premium resources for every competitive title we support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {GAMES.map((game, i) => {
            const Icon = iconMap[game.icon] ?? Gamepad2;
            return (
              <motion.div
                key={game.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/games/${game.slug}`}
                  className="group block h-full rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="font-semibold text-white text-lg group-hover:text-primary transition-colors mb-2">
                    {game.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Browse configs, HUD presets, sensitivity packs and more for {game.shortName}.
                  </p>
                  <span className="text-xs text-primary font-medium">
                    View resources →
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
