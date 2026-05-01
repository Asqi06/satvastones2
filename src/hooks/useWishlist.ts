import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  getItemCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        if (!get().isWishlisted(item.productId)) {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },
      isWishlisted: (productId) =>
        get().items.some((i) => i.productId === productId),
      getItemCount: () => get().items.length,
    }),
    { name: "satvastones-wishlist" }
  )
);
