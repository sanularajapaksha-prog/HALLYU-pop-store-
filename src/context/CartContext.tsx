"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { products } from "@/lib/products";
import { useStoredState } from "@/lib/useStoredState";

export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
};

export type CartApi = {
  items: CartItem[];
  addItem: (productId: string, quantity?: number, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  hydrated: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartApi | null>(null);

const EMPTY: CartItem[] = [];

const isCartItem = (v: unknown): v is CartItem => {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (
    typeof o.productId === "string" &&
    typeof o.quantity === "number" &&
    Number.isFinite(o.quantity) &&
    o.quantity > 0 &&
    (o.variantId === undefined || typeof o.variantId === "string")
  );
};

const isCartItems = (v: unknown): v is CartItem[] => Array.isArray(v) && v.every(isCartItem);

/**
 * `productId` is matched against Product.id first, then Product.slug — callers
 * coming from a product page hold the slug, callers from the data layer hold the
 * id, and an unresolvable line is simply worth 0 rather than NaN.
 */
function lineTotal(item: CartItem): number {
  const product = products.find((p) => p.id === item.productId || p.slug === item.productId);
  if (!product) return 0;
  const variant = item.variantId
    ? product.variants.find((v) => v.id === item.variantId)
    : undefined;
  return (variant?.price ?? product.price) * item.quantity;
}

const same = (item: CartItem, productId: string, variantId?: string) =>
  item.productId === productId && item.variantId === variantId;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems, hydrated] = useStoredState("cart", EMPTY, isCartItems);
  // Drawer state is deliberately NOT persisted — a reload should not reopen it.
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback(
    (productId: string, quantity = 1, variantId?: string) => {
      if (!Number.isFinite(quantity) || quantity <= 0) return;
      setItems((prev) => {
        const existing = prev.findIndex((i) => same(i, productId, variantId));
        if (existing === -1) return [...prev, { productId, variantId, quantity }];
        return prev.map((i, idx) =>
          idx === existing ? { ...i, quantity: i.quantity + quantity } : i,
        );
      });
    },
    [setItems],
  );

  const removeItem = useCallback(
    (productId: string, variantId?: string) =>
      setItems((prev) => prev.filter((i) => !same(i, productId, variantId))),
    [setItems],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      setItems((prev) =>
        // Quantity at or below zero means "gone" — the QuantitySelector's minus
        // button hitting 0 should not leave a zero-quantity ghost line.
        quantity <= 0 || !Number.isFinite(quantity)
          ? prev.filter((i) => !same(i, productId, variantId))
          : prev.map((i) => (same(i, productId, variantId) ? { ...i, quantity } : i)),
      );
    },
    [setItems],
  );

  const clear = useCallback(() => setItems([]), [setItems]);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartApi>(() => {
    return {
      items,
      addItem,
      removeItem,
      updateQuantity,
      clear,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + lineTotal(i), 0),
      hydrated,
      isOpen,
      openCart,
      closeCart,
    };
  }, [items, addItem, removeItem, updateQuantity, clear, hydrated, isOpen, openCart, closeCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <AppProviders>");
  return ctx;
}
