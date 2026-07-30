"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Download,
  ShoppingBag,
  Heart,
  Key,
  Wallet,
  FileText,
  Settings,
  Bell,
} from "lucide-react";

const cards = [
  { href: "/dashboard/downloads", icon: Download, label: "Downloads", desc: "Your digital products" },
  { href: "/dashboard/orders", icon: ShoppingBag, label: "Orders", desc: "Order history" },
  { href: "/dashboard/wishlist", icon: Heart, label: "Wishlist", desc: "Saved items" },
  { href: "/dashboard/keys", icon: Key, label: "License Keys", desc: "Your keys" },
  { href: "/dashboard/wallet", icon: Wallet, label: "Wallet", desc: "Balance & top-up" },
  { href: "/dashboard/invoices", icon: FileText, label: "Invoices", desc: "Download invoices" },
  { href: "/dashboard/notifications", icon: Bell, label: "Notifications", desc: "Alerts & updates" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings", desc: "Profile & security" },
];

export default function DashboardPage() {
  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Command <span className="neon-text">Center</span>
          </h1>
          <p className="text-muted-foreground">Manage your arsenal, downloads and account.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={card.href}
                className="card-glow flex flex-col gap-3 p-6 h-full group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:shadow-glow transition-all">
                  <card.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                    {card.label}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
