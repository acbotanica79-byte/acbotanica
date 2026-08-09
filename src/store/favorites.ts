import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FavoritesState {
  productIds: string[];
  toggle: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      productIds: [],
      toggle: (productId) => {
        const ids = get().productIds;
        set({
          productIds: ids.includes(productId)
            ? ids.filter((id) => id !== productId)
            : [...ids, productId],
        });
      },
      isFavorite: (productId) => get().productIds.includes(productId),
    }),
    { name: "accfg-botanica-favorites" }
  )
);
