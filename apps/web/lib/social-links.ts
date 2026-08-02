/**
 * ASTRAX-VOID Social / Contact Links
 *
 * Edit the values below (or set the corresponding NEXT_PUBLIC_* env vars)
 * to change where the "Get Key" modal buttons point — no component editing required.
 */

export const SOCIAL_LINKS = {
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/1234567890",
  telegram: process.env.NEXT_PUBLIC_TELEGRAM_URL || "https://t.me/ASTRAXVOIDexe",
  tiktok: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://tiktok.com/@astraxvoid",
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/astraxvoid",
} as const;

export type SocialPlatform = keyof typeof SOCIAL_LINKS;
