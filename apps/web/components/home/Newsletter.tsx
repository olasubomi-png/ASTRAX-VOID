"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // TODO: wire to API
    await new Promise((r) => setTimeout(r, 800));
    toast.success("You're on the list. Welcome to the void.");
    setEmail("");
    setLoading(false);
  };

  return (
    <section className="section-padding">
      <div className="container-max max-w-2xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
            Stay Ahead of the <span className="neon-text">Meta</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Get exclusive drops, update alerts and promo codes straight to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? "Joining…" : "Subscribe"}
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
