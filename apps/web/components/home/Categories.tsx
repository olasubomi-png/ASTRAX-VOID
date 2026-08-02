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

/**
 * Homepage "Choose Your Arsenal" — games first.
 * Resource types (Android, iOS, HUD, …) appear after opening a game.
 */
export function Categories() {
  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Choose Your <span className="neon-text">Game</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Pick a title, then browse Android / iOS resources, HUD presets,
            sensitivity packs and more for that game.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                    {game.shortName}
                  </h3>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link href="/games" className="text-sm text-primary hover:underline">
            View all games →
          </Link>
        </div>
      </div>
    </section>
  );
}
