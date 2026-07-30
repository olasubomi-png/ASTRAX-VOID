"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function DashboardSettingsPage() {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated.");
  };

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Password changed.");
  };

  return (
    <div className="section-padding">
      <div className="container-max max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">
            Account <span className="neon-text">Settings</span>
          </h1>
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">← Dashboard</Button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* Profile */}
          <div className="card-glow p-6">
            <h2 className="font-semibold text-white mb-4">Profile</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Username</label>
                <Input placeholder="Your username" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Email</label>
                <Input type="email" placeholder="your@email.com" />
              </div>
              <Button type="submit" size="sm">Save Changes</Button>
            </form>
          </div>

          {/* Password */}
          <div className="card-glow p-6">
            <h2 className="font-semibold text-white mb-4">Change Password</h2>
            <form onSubmit={handlePassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Current Password</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">New Password</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Confirm New Password</label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <Button type="submit" size="sm">Update Password</Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
