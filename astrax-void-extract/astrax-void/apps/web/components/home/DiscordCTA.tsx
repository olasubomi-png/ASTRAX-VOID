"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DISCORD_INVITE } from "@/lib/constants";

export function DiscordCTA() {
  return (
    <section className="section-padding">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent p-10 md:p-16 text-center"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_70%)]" />
          <div className="relative z-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 border border-primary/40 shadow-glow">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
              Join the <span className="neon-text">Community</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8">
              Real-time support, exclusive drops, giveaways and a crew of elite players waiting for you.
            </p>
            <a href={DISCORD_INVITE} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="gap-2">
                <MessageCircle className="h-5 w-5" /> Join Discord
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
