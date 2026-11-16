import type { Product } from '../types/ecommerce';

const WISHLIST_STORAGE_KEY = 'satvastones_wishlist_v1';
const WISHLIST_UPDATE_EVENT = 'satvastones:wishlist_updated';

export function getWishlistItems(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse wishlist', e);
    return [];
  }
}

export function saveWishlistItems(items: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(WISHLIST_UPDATE_EVENT, { detail: items }));
  } catch (e) {
    console.error('Failed to save wishlist', e);
  }
}

export function isInWishlist(productId: string): boolean {
  const items = getWishlistItems();
  return items.some((i) => i.id === productId);
}

export function toggleWishlist(product: Product): boolean {
  const current = getWishlistItems();
  const exists = current.some((i) => i.id === product.id);
  let updated: Product[];

  if (exists) {
    updated = current.filter((i) => i.id !== product.id);
  } else {
    updated = [...current, product];
  }

  saveWishlistItems(updated);
  return !exists;
}
