"use client";

import { motion } from "framer-motion";
import { Search, CreditCard, Download, Headphones } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse & Select",
    description: "Explore our catalog of VIP packages, CODM files, tools and more.",
  },
  {
    icon: CreditCard,
    title: "Secure Checkout",
    description: "Pay with Paystack, Flutterwave or Stripe. Instant verification.",
  },
  {
    icon: Download,
    title: "Instant Delivery",
    description: "Download links and license keys appear in your dashboard within seconds.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Need help? Real humans on Discord & Telegram around the clock.",
  },
];

export function HowItWorks() {
  return (
    <section className="section-padding">
      <div className="container-max">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            How It <span className="neon-text">Works</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            From browse to dominate in under a minute.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative text-center p-6"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/30 shadow-glow">
                <step.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="absolute top-4 right-4 text-4xl font-display font-bold text-primary/10">
                0{i + 1}
              </span>
              <h3 className="font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
