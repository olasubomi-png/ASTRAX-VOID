"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, Send, Music2, Instagram } from "lucide-react";
import { SOCIAL_LINKS } from "@/lib/social-links";

interface GetKeyModalProps {
  open: boolean;
  onClose: () => void;
  productName?: string;
}

const PLATFORMS = [
  {
    key: "whatsapp" as const,
    label: "WhatsApp",
    description: "Chat with us on WhatsApp",
    icon: MessageCircle,
    color: "from-green-500/20 to-green-600/10",
    border: "border-green-500/30 hover:border-green-400/60",
    iconColor: "text-green-400",
    bg: "hover:bg-green-500/10",
  },
  {
    key: "telegram" as const,
    label: "Telegram",
    description: "Message us on Telegram",
    icon: Send,
    color: "from-sky-500/20 to-sky-600/10",
    border: "border-sky-500/30 hover:border-sky-400/60",
    iconColor: "text-sky-400",
    bg: "hover:bg-sky-500/10",
  },
  {
    key: "tiktok" as const,
    label: "TikTok",
    description: "Find us on TikTok",
    icon: Music2,
    color: "from-pink-500/20 to-purple-600/10",
    border: "border-pink-500/30 hover:border-pink-400/60",
    iconColor: "text-pink-400",
    bg: "hover:bg-pink-500/10",
  },
  {
    key: "instagram" as const,
    label: "Instagram",
    description: "DM us on Instagram",
    icon: Instagram,
    color: "from-orange-500/20 to-purple-600/10",
    border: "border-orange-500/30 hover:border-orange-400/60",
    iconColor: "text-orange-400",
    bg: "hover:bg-orange-500/10",
  },
] as const;

export function GetKeyModal({ open, onClose, productName }: GetKeyModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
            className="relative z-10 w-full max-w-md rounded-2xl border border-primary/30 bg-[#0a0a0f] shadow-2xl shadow-primary/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
              <div>
                <h2 className="font-display text-xl font-bold">
                  Get Your <span className="neon-text">Key</span>
                </h2>
                {productName && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {productName}
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <p className="text-sm text-muted-foreground mb-5 text-center">
                Contact us on any platform below to receive your free key instantly.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  const url = SOCIAL_LINKS[platform.key];
                  return (
                    <a
                      key={platform.key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group flex flex-col items-center gap-2.5 rounded-xl border p-4 transition-all duration-200 bg-gradient-to-br ${platform.color} ${platform.border} ${platform.bg}`}
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform ${platform.iconColor}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-white">{platform.label}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                          {platform.description}
                        </p>
                      </div>
                    </a>
                  );
                })}
              </div>

              <p className="text-[11px] text-muted-foreground text-center mt-5">
                All keys are delivered for <span className="text-primary font-medium">FREE</span> — no payment required.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
