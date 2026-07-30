"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Ticket,
  Settings,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const stats = [
  { label: "Revenue", value: "$12,480", icon: DollarSign, change: "+18%" },
  { label: "Orders", value: "342", icon: ShoppingBag, change: "+12%" },
  { label: "Customers", value: "1,890", icon: Users, change: "+8%" },
  { label: "Products", value: "24", icon: Package, change: "+2" },
];

const links = [
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/orders", icon: ShoppingBag, label: "Orders" },
  { href: "/admin/customers", icon: Users, label: "Customers" },
  { href: "/admin/coupons", icon: Ticket, label: "Coupons" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminPage() {
  return (
    <div className="section-padding">
      <div className="container-max">
        <div className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-1">
            Admin <span className="neon-text">Panel</span>
          </h1>
          <p className="text-muted-foreground">Manage your marketplace</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-glow p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {s.change}
                </span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {links.map((l, i) => (
            <motion.div
              key={l.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Link
                href={l.href}
                className="card-glow flex flex-col items-center gap-3 p-6 text-center group"
              >
                <l.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{l.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
