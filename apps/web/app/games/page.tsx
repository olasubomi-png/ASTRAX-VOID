"use client";

import { GAMES } from "@/lib/constants";
import { GameCard } from "@/components/games/GameCard";

export default function GamesPage() {
  return (
    <div className="section-padding min-h-screen pt-24">
      <div className="container-max">
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-2">
            Arsenal
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Supported <span className="neon-text">Games</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Premium Android &amp; iOS resources for every competitive title we
            support.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {GAMES.map((game, i) => (
            <GameCard
              key={game.slug}
              slug={game.slug}
              name={game.name}
              shortName={game.shortName}
              index={i}
              variant="full"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
