// Lightweight First-Party Conversion Funnel & Cart Intent Tracker
// Sends behavioral signals to /api/funnel-events for Cloudflare D1 analytics & autonomous cart recovery.

const SESSION_KEY = 'satva_funnel_sid';
const CUST_USER_KEY = 'satva_customer_user';

export interface FunnelEventPayload {
  eventType:
    | 'page_view'
    | 'product_view'
    | 'add_to_cart'
    | 'checkout_started'
    | 'checkout_field_filled'
    | 'exit_offer_shown'
    | 'exit_offer_accepted'
    | 'checkout_abandoned'
    | 'order_completed';
  pagePath?: string;
  productId?: string;
  productSlug?: string;
  productName?: string;
  valuePaise?: number;
  subtotalPaise?: number;
  fullName?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  items?: Array<{ productId?: string; name: string; slug?: string; pricePaise: number; quantity: number }>;
  checkoutFields?: Record<string, boolean>;
  orderNumber?: string;
  metadata?: Record<string, any>;
}

export function getFunnelSessionId(): string {
  if (typeof window === 'undefined') return 'ssr';
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `sf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return `sf-mem-${Math.random().toString(36).slice(2, 10)}`;
  }
}

function readSignedInCustomer(): { id?: string; fullName?: string; email?: string; phone?: string } {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CUST_USER_KEY);
    if (!raw) return {};
    const u = JSON.parse(raw);
    return {
      id: u?.id,
      fullName: u?.fullName || u?.name,
      email: u?.email,
      phone: u?.phone
    };
  } catch {
    return {};
  }
}

export function trackFunnelEvent(payload: FunnelEventPayload, useBeacon = false): void {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  if (path.startsWith('/admin')) return;

  const cust = readSignedInCustomer();
  const body = JSON.stringify({
    sessionId: getFunnelSessionId(),
    customerId: cust.id || undefined,
    fullName: payload.fullName || cust.fullName || undefined,
    email: payload.email || cust.email || undefined,
    whatsappNumber: payload.whatsappNumber || payload.phone || cust.phone || undefined,
    pagePath: payload.pagePath || path,
    ...payload
  });

  try {
    if (useBeacon && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon('/api/funnel-events', blob);
      return;
    }
    fetch('/api/funnel-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true
    }).catch(() => {});
  } catch {
    /* tracking must never break UX */
  }
}

export function initAutoFunnelTracking(): void {
  if (typeof window === 'undefined') return;
  const path = window.location.pathname;
  if (path.startsWith('/admin') || path.startsWith('/404')) return;

  // 1. Page view
  trackFunnelEvent({ eventType: 'page_view', pagePath: path });

  // 2. Product detail view (detects SSR-hydrated PDP metadata automatically)
  if (path.startsWith('/products/')) {
    const slug = path.replace('/products/', '').replace(/\/$/, '').trim();
    const pdpEl = document.querySelector<HTMLElement>('[data-product-name]');
    const productName =
      pdpEl?.dataset.productName ||
      document.querySelector('h1')?.textContent?.trim() ||
      slug;
    const productId = pdpEl?.dataset.productId || undefined;
    const valuePaise = Number(pdpEl?.dataset.productPrice) || 0;

    if (slug) {
      trackFunnelEvent({
        eventType: 'product_view',
        pagePath: path,
        productId,
        productSlug: pdpEl?.dataset.productSlug || slug,
        productName,
        valuePaise
      });
    }
  }
}
