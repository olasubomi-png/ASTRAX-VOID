export type ProductCategory =
  | "vip-packages"
  | "codm-files"
  | "unlock-tools"
  | "accounts"
  | "bundles"
  | "gift-cards";

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  salePrice?: number | null;
  currency: string;
  category: ProductCategory;
  images: string[];
  videoUrl?: string | null;
  features: string[];
  requirements?: string[];
  stock: number | null; // null = unlimited
  rating: number;
  reviewCount: number;
  isFeatured: boolean;
  isTrending: boolean;
  tags: string[];
  downloads?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string | null;
  role: "USER" | "ADMIN" | "MODERATOR";
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: "PENDING" | "PAID" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  paymentMethod: "PAYSTACK" | "FLUTTERWAVE" | "STRIPE";
  paymentRef?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  downloadUrl?: string;
  licenseKey?: string;
  expiresAt?: string;
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

export interface Coupon {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minAmount?: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  isActive: boolean;
}
