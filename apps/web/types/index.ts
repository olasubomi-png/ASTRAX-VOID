export type ProductCategory =
  | "vip-packages"
  | "codm-files"
  | "unlock-tools"
  | "accounts"
  | "bundles"
  | "gift-cards"
  | string; // allow any string from DB

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  /** Kept for compatibility with existing data — not displayed in the UI */
  price?: number;
  /** Kept for compatibility with existing data — not displayed in the UI */
  salePrice?: number | null;
  currency?: string;
  category: ProductCategory;
  images: string[];
  videoUrl?: string | null;
  features: string[];
  requirements?: string[];
  stock?: number | null;
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  tags: string[];
  /** URL or R2 key for the downloadable file */
  fileKey?: string | null;
  fileUrl?: string | null;
  downloads?: number;
  isActive?: boolean;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string | null;
  role: "USER" | "ADMIN" | "MODERATOR";
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
}
