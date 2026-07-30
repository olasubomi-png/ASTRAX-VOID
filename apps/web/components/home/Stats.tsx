"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "20,000+", label: "Active Users" },
  { value: "99.8%", label: "Uptime" },
  { value: "< 2s", label: "Avg Delivery" },
  { value: "42+", label: "Countries" },
];

export function Stats() {
  return (
    <section className="section-padding border-y border-primary/10 bg-black/40">
      <div className="container-max">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-3xl md:text-4xl font-bold neon-text mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
