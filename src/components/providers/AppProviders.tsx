"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CollectionProvider } from "@/context/CollectionContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

// The three stores are independent, so the nesting order is arbitrary.
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <WishlistProvider>
        <CollectionProvider>
          {children}
          {/* §31 — mounted once, globally, INSIDE CartProvider so any page can
              call openCart(). Renders null while closed. */}
          <CartDrawer />
        </CollectionProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
