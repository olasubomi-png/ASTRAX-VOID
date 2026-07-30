"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const handleSave = () => {
    toast.success("Settings saved.");
  };

  return (
    <div className="section-padding">
      <div className="container-max max-w-2xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl font-bold">
            Site <span className="neon-text">Settings</span>
          </h1>
          <Link href="/admin">
            <Button variant="ghost" size="sm">← Admin</Button>
          </Link>
        </div>

        <div className="card-glow p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="font-semibold text-white">General</h2>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Site Name</label>
              <Input defaultValue="ASTRAX-VOID" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Support Email</label>
              <Input defaultValue="support@astraxvoid.com" type="email" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Discord Invite URL</label>
              <Input defaultValue="https://discord.gg/astraxvoid" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Telegram URL</label>
              <Input defaultValue="https://t.me/astraxvoid" />
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <Button onClick={handleSave}>Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
