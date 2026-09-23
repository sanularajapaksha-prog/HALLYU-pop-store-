"use client";

import { createSlugStore } from "./createSlugStore";

// §25 "My Collection" — items the user OWNS. `remove`/`clear` come free from the
// shared store; the task's API only names slugs/toggle/has/count/hydrated.
const store = createSlugStore("collection", "useCollection");

export const CollectionProvider = store.Provider;
export const useCollection = store.useStore;
export type { SlugStore as CollectionApi } from "./createSlugStore";
