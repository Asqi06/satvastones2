import type { AdminOrder, DamageClaim, SiteSettings } from '../stores/adminStore';

/**
 * SATVASTONES CLOUDFLARE EDGE API CLIENT
 * Communicates with Cloudflare Pages Functions (/api/*) backed by Cloudflare D1 & R2
 */

// 1. ORDERS
export async function syncOrderToCloudflare(order: AdminOrder): Promise<boolean> {
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (!res.ok) {
      console.warn('Cloudflare D1 order sync returned status:', res.status);
      return false;
    }
    const json = await res.json() as any;
    return !!json.success;
  } catch (err) {
    console.warn('Cloudflare D1 edge sync not reachable (local/offline):', err);
    return false;
  }
}

export async function fetchOrderFromCloudflare(ref: string): Promise<AdminOrder | null> {
  try {
    const res = await fetch(`/api/orders?ref=${encodeURIComponent(ref.trim())}`);
    if (!res.ok) return null;
    const json = await res.json() as any;
    return json.success && json.order ? json.order : null;
  } catch (err) {
    console.warn('Cloudflare D1 order lookup not reachable:', err);
    return null;
  }
}

export async function fetchAllOrdersFromCloudflare(): Promise<AdminOrder[] | null> {
  try {
    const res = await fetch('/api/orders');
    if (!res.ok) return null;
    const json = await res.json() as any;
    return json.success && Array.isArray(json.orders) ? json.orders : null;
  } catch (err) {
    console.warn('Failed to fetch orders from Cloudflare D1:', err);
    return null;
  }
}

export async function updateOrderStatusInCloudflare(
  orderNumber: string,
  fulfillmentStatus: string,
  courierPartner?: string,
  trackingNumber?: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderNumber, fulfillmentStatus, courierPartner, trackingNumber })
    });
    const json = await res.json() as any;
    return !!json.success;
  } catch (err) {
    console.warn('Failed to update status in Cloudflare D1:', err);
    return false;
  }
}

// 2. 360° UNBOXING VIDEO CLAIMS
export async function syncClaimToCloudflare(claim: DamageClaim): Promise<boolean> {
  try {
    const res = await fetch('/api/claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(claim)
    });
    const json = await res.json() as any;
    return !!json.success;
  } catch (err) {
    console.warn('Failed to sync claim to Cloudflare D1:', err);
    return false;
  }
}

export async function fetchClaimsFromCloudflare(): Promise<DamageClaim[] | null> {
  try {
    const res = await fetch('/api/claims');
    if (!res.ok) return null;
    const json = await res.json() as any;
    return json.success && Array.isArray(json.claims) ? json.claims : null;
  } catch (err) {
    console.warn('Failed to fetch claims from Cloudflare D1:', err);
    return null;
  }
}

export async function updateClaimStatusInCloudflare(claimId: string, status: string, adminNotes?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/claims', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claimId, status, adminNotes })
    });
    const json = await res.json() as any;
    return !!json.success;
  } catch (err) {
    console.warn('Failed to update claim status in Cloudflare D1:', err);
    return false;
  }
}

// 3. ZERO-EGRESS R2 FILE UPLOAD
export async function uploadToCloudflareR2(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    if (!res.ok) return null;
    const json = await res.json() as any;
    return json.success && json.url ? json.url : null;
  } catch (err) {
    console.warn('Failed to upload file to Cloudflare R2:', err);
    return null;
  }
}
