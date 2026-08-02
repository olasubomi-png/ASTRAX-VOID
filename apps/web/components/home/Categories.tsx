"use client";

import Link from "next/link";
import { GAMES } from "@/lib/constants";
import { GameCard } from "@/components/games/GameCard";

/**
 * Homepage — games with premium hero + icon + Android/iOS counts.
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
            Pick a title, then browse Android and iOS resources built for that
            game.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {GAMES.map((game, i) => (
            <GameCard
              key={game.slug}
              slug={game.slug}
              name={game.name}
              shortName={game.shortName}
              index={i}
              variant="compact"
            />
          ))}
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
