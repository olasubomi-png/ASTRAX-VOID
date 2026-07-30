import Link from "next/link";
import Image from "next/image";
import { FOOTER_LINKS, SITE_NAME, SITE_TAGLINE, DISCORD_INVITE, TELEGRAM } from "@/lib/constants";
import { MessageCircle, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t border-primary/20 bg-black/80 pt-16 pb-8">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
      <div className="container-max relative px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-primary/40">
                <Image src="/logo.png" alt={SITE_NAME} fill className="object-contain p-1" />
              </div>
              <div>
                <span className="font-display text-xl font-bold tracking-wider">
                  <span className="text-white">ASTRAX</span>
                  <span className="text-primary">-VOID</span>
                </span>
                <p className="text-xs text-muted-foreground tracking-widest uppercase">
                  {SITE_TAGLINE}
                </p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              Premium cyberpunk gaming marketplace. Instant automated delivery of VIP packages,
              CODM files, unlock tools and more. Elevate. Dominate. Conquer.
            </p>
            <div className="flex gap-3">
              <a
                href={DISCORD_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all"
                aria-label="Discord"
              >
                <MessageCircle className="h-5 w-5 text-primary" />
              </a>
              <a
                href={TELEGRAM}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all"
                aria-label="Telegram"
              >
                <Send className="h-5 w-5 text-primary" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Products</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground tracking-widest uppercase">
            Elevate • Dominate • Conquer
          </p>
        </div>
      </div>
    </footer>
  );
}
