/**
 * Cart has been removed — ASTRAX-VOID is now a free download platform.
 * This file is kept as a stub to avoid breaking any residual imports.
 * Remove usage gradually; all product pages now use Download / Get Key instead.
 */
export function useCartStore() {
  return {
    items: [] as never[],
    itemCount: () => 0,
    total: () => 0,
    addItem: () => {},
    removeItem: () => {},
    clearCart: () => {},
  };
}
