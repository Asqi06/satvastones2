import type { AdminOrder, DamageClaim, SiteSettings } from '../stores/adminStore';

/**
 * SATVASTONES CLOUDFLARE EDGE API CLIENT
 * Communicates with Cloudflare Pages Functions (/api/*) backed by Cloudflare D1 & R2
 */

function getAdminAuthHeaders(explicitToken?: string): Record<string, string> {
  const token =
    explicitToken ||
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('satvastones_admin_token') : null) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('satvastones_admin_token') : null);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

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

export async function fetchOrderFromCloudflare(ref: string, contact?: string): Promise<AdminOrder | null> {
  try {
    const params = new URLSearchParams({ ref: ref.trim() });
    if (contact?.trim()) params.set('contact', contact.trim());
    const res = await fetch(`/api/orders?${params.toString()}`);
    if (!res.ok) return null;
    const json = await res.json() as any;
    return json.success && json.order ? json.order : null;
  } catch (err) {
    console.warn('Cloudflare D1 order lookup not reachable:', err);
    return null;
  }
}

export async function fetchAllOrdersFromCloudflare(token?: string): Promise<AdminOrder[] | null> {
  try {
    const res = await fetch('/api/orders', {
      headers: getAdminAuthHeaders(token)
    });
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
  trackingNumber?: string,
  token?: string
): Promise<boolean> {
  try {
    const res = await fetch('/api/orders', {
      method: 'PUT',
      headers: getAdminAuthHeaders(token),
      credentials: 'include',
      body: JSON.stringify({ orderNumber, fulfillmentStatus, courierPartner, trackingNumber })
    });
    const json = await res.json() as any;
    return !!json.success;
  } catch (err) {
    console.warn('Failed to update status in Cloudflare D1:', err);
    return false;
  }
}

export async function deleteOrderFromCloudflare(orderNumber: string, token?: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(token),
      credentials: 'include'
    });
    const json = await res.json() as any;
    return !!json.success;
  } catch (err) {
    console.warn('Failed to delete order from Cloudflare D1:', err);
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

export async function fetchClaimsFromCloudflare(token?: string): Promise<DamageClaim[] | null> {
  try {
    const res = await fetch('/api/claims', {
      headers: getAdminAuthHeaders(token)
    });
    if (!res.ok) return null;
    const json = await res.json() as any;
    return json.success && Array.isArray(json.claims) ? json.claims : null;
  } catch (err) {
    console.warn('Failed to fetch claims from Cloudflare D1:', err);
    return null;
  }
}

export async function updateClaimStatusInCloudflare(claimId: string, status: string, adminNotes?: string, token?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/claims', {
      method: 'PUT',
      headers: getAdminAuthHeaders(token),
      body: JSON.stringify({ claimId, status, adminNotes })
    });
    const json = await res.json() as any;
    return !!json.success;
  } catch (err) {
    console.warn('Failed to update claim status in Cloudflare D1:', err);
    return false;
  }
}

// 3. SETTINGS
export async function saveSettingsToCloudflare(settings: SiteSettings, token?: string): Promise<boolean> {
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: getAdminAuthHeaders(token),
      body: JSON.stringify(settings)
    });
    const json = await res.json() as any;
    return !!json.success;
  } catch (err) {
    console.warn('Failed to save settings to Cloudflare D1:', err);
    return false;
  }
}

export async function fetchSettingsFromCloudflare(): Promise<SiteSettings | null> {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return null;
    const json = await res.json() as any;
    return json.success && json.settings ? json.settings : null;
  } catch (err) {
    console.warn('Failed to fetch settings from Cloudflare D1:', err);
    return null;
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
