"use client";

import Link from "next/link";
import { MessageCircle, Send, Phone, HelpCircle } from "lucide-react";
import { DISCORD_INVITE, TELEGRAM, WHATSAPP } from "@/lib/constants";

const links = [
  {
    id: "telegram",
    label: "Telegram",
    description: "Official channel — support & announcements",
    url: TELEGRAM,
    icon: Send,
    primary: true,
  },
  {
    id: "discord",
    label: "Discord",
    description: "Community server & live chat",
    url: DISCORD_INVITE,
    icon: MessageCircle,
    primary: false,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    description: "Direct support (when enabled)",
    url: WHATSAPP || "#",
    icon: Phone,
    primary: false,
    disabled: !WHATSAPP,
  },
];

export default function CommunityPage() {
  return (
    <div className="section-padding min-h-screen pt-24">
      <div className="container-max max-w-4xl">
        <div className="text-center mb-12">
          <p className="text-primary text-sm font-medium tracking-widest uppercase mb-2">
            Community
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Join <span className="neon-text">ASTRAX-VOID</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Support, updates, and exclusive drops — real humans, fast replies.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {links.map(({ id, label, description, url, icon: Icon, primary, disabled }) => (
            <a
              key={id}
              href={disabled ? undefined : url}
              target={disabled ? undefined : "_blank"}
              rel={disabled ? undefined : "noopener noreferrer"}
              className={`block rounded-2xl border p-6 text-center transition-all ${
                disabled
                  ? "border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed"
                  : primary
                    ? "border-primary/40 bg-primary/10 hover:bg-primary/15"
                    : "border-white/10 bg-white/[0.03] hover:border-primary/40 hover:bg-primary/5"
              }`}
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-white mb-1">{label}</h3>
              <p className="text-xs text-muted-foreground mb-4">{description}</p>
              {!disabled && (
                <span className="text-sm text-primary font-medium">
                  {primary ? "Open Telegram →" : "Join →"}
                </span>
              )}
              {disabled && (
                <span className="text-xs text-muted-foreground">Coming soon</span>
              )}
            </a>
          ))}
        </div>

        <div className="rounded-2xl border border-primary/30 bg-primary/10 p-6 mb-10 text-center">
          <h2 className="font-semibold text-white mb-2">Primary support channel</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Telegram is the fastest way to reach us.
          </p>
          <a
            href={TELEGRAM}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90 transition-colors"
          >
            t.me/ASTRAXVOIDexe
          </a>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/support"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white hover:border-primary/40 transition-colors"
          >
            <HelpCircle className="h-4 w-4 text-primary" />
            Support Center
          </Link>
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white hover:border-primary/40 transition-colors"
          >
            FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
