"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Checkout has been removed — the platform is now a free download service.
 * Redirect users to the products page.
 */
export default function CheckoutPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/products");
  }, [router]);

  return null;
}
