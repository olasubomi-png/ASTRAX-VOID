"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Manuel R.",
    game: "CODM",
    text: "Three months in. Zero bans. Aimbot is silky smooth and undetectable.",
    rating: 5,
  },
  {
    name: "Rizky A.",
    game: "MLBB",
    text: "Epic to Mythic in a week. Support replied in under 5 minutes.",
    rating: 5,
  },
  {
    name: "Kevin L.",
    game: "CODM",
    text: "Bought at 2am, key in my inbox in literal seconds. Absolutely insane.",
    rating: 5,
  },
  {
    name: "Fahad M.",
    game: "MLBB",
    text: "Tried 4 providers. ASTRAX-VOID is in a completely different tier.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="section-padding bg-black/40">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            What Players <span className="neon-text">Say</span>
          </h2>
          <p className="text-muted-foreground">Real feedback from real competitors.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="card-glow p-6"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-white/90 mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{t.name}</span>
                <span className="text-xs text-primary font-medium">{t.game}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
