export const SITE_NAME = "ASTRAX-VOID";
export const SITE_TAGLINE = "Elevate • Dominate • Conquer";
export const SITE_DESCRIPTION =
  "Premium cyberpunk gaming marketplace. Configs, HUD presets, sensitivity packs & resources for CODM, MLBB, PUBG, Free Fire & more. Instant delivery.";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/products", label: "Products" },
  { href: "/vip", label: "VIP" },
  { href: "/downloads", label: "Downloads" },
  { href: "/community", label: "Community" },
  { href: "/support", label: "Support" },
] as const;

export const FOOTER_LINKS = {
  product: [
    { href: "/products", label: "All Products" },
    { href: "/games", label: "Games Hub" },
    { href: "/vip", label: "VIP Packages" },
    { href: "/downloads", label: "Downloads" },
  ],
  company: [
    { href: "/about", label: "About Us" },
    { href: "/community", label: "Community" },
    { href: "/support", label: "Support" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ],
  legal: [
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/refund", label: "Refund Policy" },
  ],
} as const;

/** Gaming Hub — supported titles */
export const GAMES = [
  { slug: "blood-strike", name: "Blood Strike", shortName: "Blood Strike", icon: "Sword" },
  { slug: "mobile-legends", name: "Mobile Legends: Bang Bang", shortName: "MLBB", icon: "Shield" },
  { slug: "delta-force", name: "Delta Force", shortName: "Delta Force", icon: "Crosshair" },
  { slug: "pubg-mobile", name: "PUBG Mobile", shortName: "PUBG", icon: "Target" },
  { slug: "free-fire", name: "Free Fire", shortName: "Free Fire", icon: "Flame" },
  { slug: "fortnite", name: "Fortnite", shortName: "Fortnite", icon: "Box" },
  { slug: "codm-global", name: "Call of Duty: Mobile (Global)", shortName: "CODM Global", icon: "Gamepad2" },
  { slug: "codm-garena", name: "Call of Duty: Mobile (Garena)", shortName: "CODM Garena", icon: "Gamepad2" },
] as const;

/**
 * Resource categories (Gaming Hub).
 * Slugs should match Category.slug in MongoDB (seed/admin).
 */
export const CATEGORIES = [
  { slug: "android-resources", name: "Android Resources", icon: "Smartphone" },
  { slug: "ios-resources", name: "iOS Resources", icon: "Tablet" },
  { slug: "game-configuration-packs", name: "Game Configuration Packs", icon: "Settings" },
  { slug: "performance-profiles", name: "Performance Profiles", icon: "Zap" },
  { slug: "control-layouts", name: "Control Layouts", icon: "LayoutGrid" },
  { slug: "hud-presets", name: "HUD Presets", icon: "PanelsTopLeft" },
  { slug: "sensitivity-presets", name: "Sensitivity Presets", icon: "Crosshair" },
  { slug: "graphics-optimization", name: "Graphics Optimization", icon: "Monitor" },
  { slug: "device-compatibility", name: "Device Compatibility", icon: "Cpu" },
  { slug: "installation-guides", name: "Installation Guides", icon: "BookOpen" },
  { slug: "update-center", name: "Update Center", icon: "RefreshCw" },
  { slug: "news-announcements", name: "News & Announcements", icon: "Megaphone" },
  { slug: "community-support", name: "Community Support", icon: "MessagesSquare" },
  { slug: "premium-resources", name: "Premium Resources", icon: "Crown" },
  { slug: "downloads", name: "Downloads", icon: "Download" },
  { slug: "vip-packages", name: "VIP Packages", icon: "Crown" },
  { slug: "codm-files", name: "CODM Files", icon: "Gamepad2" },
  { slug: "unlock-tools", name: "Unlock Tools", icon: "Wrench" },
] as const;

/** Resource types shown inside each game (not top-level alone) */
export const RESOURCE_TYPES = [
  { slug: "android-resources", name: "Android Resources", icon: "Smartphone" },
  { slug: "ios-resources", name: "iOS Resources", icon: "Tablet" },
  { slug: "game-configuration-packs", name: "Game Configuration Packs", icon: "Settings" },
  { slug: "performance-profiles", name: "Performance Profiles", icon: "Zap" },
  { slug: "control-layouts", name: "Control Layouts", icon: "LayoutGrid" },
  { slug: "hud-presets", name: "HUD Presets", icon: "PanelsTopLeft" },
  { slug: "sensitivity-presets", name: "Sensitivity Presets", icon: "Crosshair" },
  { slug: "graphics-optimization", name: "Graphics Optimization", icon: "Monitor" },
  { slug: "device-compatibility", name: "Device Compatibility", icon: "Cpu" },
  { slug: "installation-guides", name: "Installation Guides", icon: "BookOpen" },
  { slug: "premium-resources", name: "Premium Resources", icon: "Crown" },
  { slug: "downloads", name: "Downloads", icon: "Download" },
] as const;

export const DISCORD_INVITE = "https://discord.gg/astraxvoid";
export const TELEGRAM = "https://t.me/ASTRAXVOIDexe";
export const WHATSAPP = "";
