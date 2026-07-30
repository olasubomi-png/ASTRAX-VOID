"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import { DISCORD_INVITE, TELEGRAM } from "@/lib/constants";
import { toast } from "sonner";

export default function SupportPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Ticket submitted. We'll reply soon.");
    setLoading(false);
  };

  return (
    <div className="section-padding">
      <div className="container-max max-w-3xl">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2 text-center">
          <span className="neon-text">Support</span>
        </h1>
        <p className="text-muted-foreground text-center mb-10">
          Real humans. 24/7. Discord & Telegram for fastest response.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="card-glow flex items-center gap-4 p-5 hover:border-primary/50 transition-all"
          >
            <MessageCircle className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold">Discord</p>
              <p className="text-xs text-muted-foreground">Join community & get help</p>
            </div>
          </a>
          <a
            href={TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="card-glow flex items-center gap-4 p-5 hover:border-primary/50 transition-all"
          >
            <Send className="h-8 w-8 text-primary" />
            <div>
              <p className="font-semibold">Telegram</p>
              <p className="text-xs text-muted-foreground">Direct support channel</p>
            </div>
          </a>
        </div>

        <form onSubmit={handleSubmit} className="card-glow p-6 space-y-4">
          <h2 className="font-semibold">Open a Ticket</h2>
          <Input placeholder="Subject" required />
          <Input type="email" placeholder="Your email" required />
          <textarea
            required
            rows={5}
            placeholder="Describe your issue…"
            className="flex w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting…" : "Submit Ticket"}
          </Button>
        </form>
      </div>
    </div>
  );
}
