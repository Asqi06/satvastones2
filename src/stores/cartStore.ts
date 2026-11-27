import type { CartItem } from '../types/ecommerce';
import { trackFunnelEvent } from '../lib/funnel-tracker';

const CART_STORAGE_KEY = 'satvastones_cart_v1';
const CART_OPEN_EVENT = 'satvastones:open_cart';
const CART_UPDATE_EVENT = 'satvastones:cart_updated';

export function getCartItems(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to parse cart items', e);
    return [];
  }
}

export function saveCartItems(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(CART_UPDATE_EVENT, { detail: items }));
  } catch (e) {
    console.error('Failed to save cart items', e);
  }
}

export function addToCart(item: CartItem): void {
  const current = getCartItems();
  const existingIdx = current.findIndex(
    (i) => i.productId === item.productId && i.variantId === item.variantId
  );

  if (existingIdx > -1) {
    current[existingIdx].quantity += item.quantity;
  } else {
    current.push(item);
  }

  saveCartItems(current);
  const subtotalPaise = current.reduce((sum, i) => sum + i.pricePaise * i.quantity, 0);
  trackFunnelEvent({
    eventType: 'add_to_cart',
    productId: item.productId,
    productSlug: item.slug,
    productName: item.name,
    valuePaise: item.pricePaise * item.quantity,
    subtotalPaise,
    items: current
  });
  openCartDrawer();
}

export function addMultipleToCart(items: CartItem[]): void {
  const current = getCartItems();
  for (const item of items) {
    const existingIdx = current.findIndex(
      (i) => i.productId === item.productId && i.variantId === item.variantId
    );
    if (existingIdx > -1) {
      current[existingIdx].quantity += item.quantity;
    } else {
      current.push(item);
    }
  }
  saveCartItems(current);
  const subtotalPaise = current.reduce((sum, i) => sum + i.pricePaise * i.quantity, 0);
  trackFunnelEvent({
    eventType: 'add_to_cart',
    productId: items[0]?.productId,
    productSlug: items[0]?.slug,
    productName: items[0]?.name,
    valuePaise: subtotalPaise,
    subtotalPaise,
    items: current
  });
  openCartDrawer();
}

export function updateQuantity(productId: string, quantity: number, variantId?: string): void {
  let current = getCartItems();
  if (quantity <= 0) {
    current = current.filter((i) => !(i.productId === productId && i.variantId === variantId));
  } else {
    const target = current.find((i) => i.productId === productId && i.variantId === variantId);
    if (target) {
      target.quantity = quantity;
    }
  }
  saveCartItems(current);
}

export function openCartDrawer(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(CART_OPEN_EVENT));
}
