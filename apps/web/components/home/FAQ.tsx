"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How fast is delivery?",
    a: "Almost instant. After payment verification, download links and license keys appear in your dashboard usually within 2 seconds.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Paystack and Flutterwave (perfect for Nigeria & Africa), plus Stripe for international cards. More gateways coming soon.",
  },
  {
    q: "Are the products undetected?",
    a: "We prioritize stealth and rapid updates. Every release is stress-tested. No solution is 100% risk-free — use at your own discretion.",
  },
  {
    q: "Do you offer refunds?",
    a: "See our Refund Policy. Digital products are generally non-refundable once delivered, except in cases of proven non-delivery or critical defects.",
  },
  {
    q: "How do I get support?",
    a: "Join our Discord or Telegram. Real humans reply 24/7. You can also open a ticket from your dashboard.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="section-padding bg-black/30">
      <div className="container-max max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Frequently Asked <span className="neon-text">Questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={cn(
                "rounded-2xl border transition-all duration-300",
                open === i
                  ? "border-primary/40 bg-primary/5"
                  : "border-white/10 bg-white/5 hover:border-white/20"
              )}
            >
              <button
                className="flex w-full items-center justify-between p-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="font-medium text-white pr-4">{faq.q}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-primary transition-transform duration-300",
                    open === i && "rotate-180"
                  )}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
