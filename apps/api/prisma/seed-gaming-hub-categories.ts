import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  { slug: "android-resources", name: "Android Resources", icon: "Smartphone", sortOrder: 1 },
  { slug: "ios-resources", name: "iOS Resources", icon: "Tablet", sortOrder: 2 },
  { slug: "game-configuration-packs", name: "Game Configuration Packs", icon: "Settings", sortOrder: 3 },
  { slug: "performance-profiles", name: "Performance Profiles", icon: "Zap", sortOrder: 4 },
  { slug: "control-layouts", name: "Control Layouts", icon: "LayoutGrid", sortOrder: 5 },
  { slug: "hud-presets", name: "HUD Presets", icon: "PanelsTopLeft", sortOrder: 6 },
  { slug: "sensitivity-presets", name: "Sensitivity Presets", icon: "Crosshair", sortOrder: 7 },
  { slug: "graphics-optimization", name: "Graphics Optimization", icon: "Monitor", sortOrder: 8 },
  { slug: "device-compatibility", name: "Device Compatibility", icon: "Cpu", sortOrder: 9 },
  { slug: "installation-guides", name: "Installation Guides", icon: "BookOpen", sortOrder: 10 },
  { slug: "update-center", name: "Update Center", icon: "RefreshCw", sortOrder: 11 },
  { slug: "news-announcements", name: "News & Announcements", icon: "Megaphone", sortOrder: 12 },
  { slug: "community-support", name: "Community Support", icon: "MessagesSquare", sortOrder: 13 },
  { slug: "premium-resources", name: "Premium Resources", icon: "Crown", sortOrder: 14 },
  { slug: "downloads", name: "Downloads", icon: "Download", sortOrder: 15 },
  { slug: "vip-packages", name: "VIP Packages", icon: "Crown", sortOrder: 20 },
  { slug: "codm-files", name: "CODM Files", icon: "Gamepad2", sortOrder: 21 },
  { slug: "unlock-tools", name: "Unlock Tools", icon: "Wrench", sortOrder: 22 },
];

async function main() {
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      create: {
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isActive: true,
        description: `${cat.name} for ASTRAX-VOID Gaming Hub`,
      },
      update: {
        name: cat.name,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
        isActive: true,
      },
    });
    console.log("upserted:", cat.slug);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("done");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
