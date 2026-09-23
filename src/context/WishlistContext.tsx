"use client";

import { createSlugStore } from "./createSlugStore";

// §25 — items the user WANTS. Distinct from the collection (items they own).
const store = createSlugStore("wishlist", "useWishlist");

export const WishlistProvider = store.Provider;
export const useWishlist = store.useStore;
export type { SlugStore as WishlistApi } from "./createSlugStore";
