import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { AdminOrder, AdminProduct, DamageClaim, SiteSettings, AdminCoupon } from '../stores/adminStore';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseConfig(): { url: string; anonKey: string } | null {
  // 1. Check environment variables
  const envUrl = typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SUPABASE_URL;
  const envKey = typeof import.meta !== 'undefined' && import.meta.env?.PUBLIC_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey };
  }

  // 2. Check localStorage (allows admin to paste keys directly into the UI)
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('satvastones_supabase_config');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.url && parsed.anonKey) {
          return parsed;
        }
      }
    } catch {}
  }

  return null;
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('satvastones_supabase_config', JSON.stringify({ url, anonKey }));
  supabaseInstance = null; // Reset cached client
}

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  const config = getSupabaseConfig();
  if (!config) return null;

  try {
    supabaseInstance = createClient(config.url, config.anonKey);
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

// ==========================================
// Orders Sync
// ==========================================
export async function syncOrderToSupabase(order: AdminOrder): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb.from('orders').upsert({
      id: order.id,
      order_number: order.orderNumber,
      created_at: order.createdAt,
      customer_name: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city,
      state: order.state,
      pincode: order.pincode,
      items: order.items,
      subtotal_paise: order.subtotalPaise,
      shipping_paise: order.shippingPaise,
      discount_paise: order.discountPaise,
      total_paise: order.totalPaise,
      payment_method: order.paymentMethod,
      payment_status: order.paymentStatus,
      fulfillment_status: order.fulfillmentStatus,
      courier_partner: order.courierPartner || null,
      tracking_number: order.trackingNumber || null
    });

    if (error) {
      console.warn('Supabase order sync error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('Supabase order exception:', e);
    return false;
  }
}

export async function fetchOrdersFromSupabase(): Promise<AdminOrder[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return null;

    return data.map((d: any) => ({
      id: d.id,
      orderNumber: d.order_number,
      createdAt: d.created_at,
      customerName: d.customer_name,
      email: d.email,
      phone: d.phone,
      address: d.address,
      city: d.city,
      state: d.state,
      pincode: d.pincode,
      items: d.items,
      subtotalPaise: d.subtotal_paise,
      shippingPaise: d.shipping_paise,
      discountPaise: d.discount_paise,
      totalPaise: d.total_paise,
      paymentMethod: d.payment_method,
      paymentStatus: d.payment_status,
      fulfillmentStatus: d.fulfillment_status,
      courierPartner: d.courier_partner,
      trackingNumber: d.tracking_number
    }));
  } catch {
    return null;
  }
}

// ==========================================
// Damage Claims Sync (Unboxing Videos)
// ==========================================
export async function syncClaimToSupabase(claim: DamageClaim): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    const { error } = await sb.from('damage_claims').upsert({
      id: claim.id,
      order_number: claim.orderNumber,
      customer_name: claim.customerName,
      phone: claim.phone,
      submission_date: claim.submissionDate,
      video_proof_url: claim.videoProofUrl,
      description: claim.description,
      status: claim.status
    });
    return !error;
  } catch {
    return false;
  }
}

export async function fetchClaimsFromSupabase(): Promise<DamageClaim[] | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const { data, error } = await sb
      .from('damage_claims')
      .select('*')
      .order('submission_date', { ascending: false });

    if (error || !data) return null;

    return data.map((d: any) => ({
      id: d.id,
      orderNumber: d.order_number,
      customerName: d.customer_name,
      phone: d.phone,
      submissionDate: d.submission_date,
      videoProofUrl: d.video_proof_url,
      description: d.description,
      status: d.status
    }));
  } catch {
    return null;
  }
}
