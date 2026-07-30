"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

const notifications = [
  { id: "1", title: "Order Delivered", message: "Your ASTRAX VIP Elite is ready to download.", time: "2 hours ago", read: false },
  { id: "2", title: "New Update Available", message: "CODM Premium V5 has been updated to the latest version.", time: "1 day ago", read: true },
  { id: "3", title: "Welcome to ASTRAX-VOID!", message: "Your account is set up. Browse our premium catalog.", time: "3 days ago", read: true },
];

export default function NotificationsPage() {
  return (
    <div className="section-padding">
      <div className="container-max max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">
            <span className="neon-text">Notifications</span>
          </h1>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← Dashboard</Button>
          </Link>
        </div>

        {notifications.length === 0 ? (
          <div className="card-glow p-12 text-center">
            <Bell className="h-12 w-12 text-primary/40 mx-auto mb-4" />
            <p className="text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`card-glow p-5 ${!n.read ? "border-primary/40" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${!n.read ? "bg-primary" : "bg-white/20"}`} />
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{n.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground/60 mt-2">{n.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
