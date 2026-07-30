import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function PublicDownloadsPage() {
  return (
    <div className="section-padding">
      <div className="container-max max-w-2xl text-center">
        <Download className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="font-display text-3xl font-bold mb-3">
          Your <span className="neon-text">Downloads</span>
        </h1>
        <p className="text-muted-foreground mb-8">
          Log in to access your purchased digital products, license keys, and secure download
          links.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/login">
            <Button>Login</Button>
          </Link>
          <Link href="/dashboard/downloads">
            <Button variant="ghost">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
