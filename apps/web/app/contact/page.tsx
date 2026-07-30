"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Message sent. We'll reply soon.");
    setLoading(false);
  };

  return (
    <div className="section-padding">
      <div className="container-max max-w-lg">
        <h1 className="font-display text-3xl font-bold mb-2">
          Contact <span className="neon-text">Us</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Prefer Discord or Telegram for fastest support. Use the form for general inquiries.
        </p>
        <form onSubmit={handleSubmit} className="card-glow p-6 space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Name</label>
            <Input required placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Email</label>
            <Input type="email" required placeholder="you@email.com" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1.5 block">Message</label>
            <textarea
              required
              rows={5}
              className="flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              placeholder="How can we help?"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending…" : "Send Message"}
          </Button>
        </form>
      </div>
    </div>
  );
}
