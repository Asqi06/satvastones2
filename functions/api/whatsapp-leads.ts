// Cloudflare Worker / Pages Function: /api/whatsapp-leads
// Registers customer WhatsApp numbers with explicit DPDP Act 2023 promotional consent status
// and unlocks the first-purchase welcome offer (15% OFF + Free Delivery: WELCOME15FREE).
import { verifyAdminAuth } from '../../src/lib/server-auth';
import { verifyCustomerToken } from '../../src/lib/customer-auth';
import { clientIp, isRateLimited, readJsonBody } from '../../src/lib/http';

export const WELCOME_COUPON_CODE = 'WELCOME15FREE';
const POLICY_VERSION = '2026.1-DPDP';
const DEFAULT_CONSENT_TEXT =
  'I consent to Satvastones Jewellery registering my WhatsApp number and sending promotional offers, new drops, and styling updates via WhatsApp. I understand I can withdraw consent at any time.';

interface Env {
  DB: any;
  CUSTOMER_SESSION_SECRET?: string;
  ADMIN_SECRET_KEY?: string;
  [key: string]: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function ensureWhatsappLeadsTable(db: any): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS whatsapp_leads (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        full_name TEXT,
        email TEXT,
        whatsapp_number TEXT UNIQUE NOT NULL,
        promo_consent INTEGER NOT NULL DEFAULT 0,
        consent_text TEXT NOT NULL,
        consent_timestamp_utc TEXT NOT NULL,
        policy_version TEXT NOT NULL DEFAULT '2026.1-DPDP',
        coupon_code TEXT,
        first_order_used INTEGER NOT NULL DEFAULT 0,
        source TEXT NOT NULL DEFAULT 'welcome_popup',
        user_agent TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
      )`
    )
    .run();

  await db
    .prepare('CREATE INDEX IF NOT EXISTS idx_wa_leads_consent ON whatsapp_leads(promo_consent)')
    .run();
  await db
    .prepare('CREATE INDEX IF NOT EXISTS idx_wa_leads_email ON whatsapp_leads(email)')
    .run();
}

function normalizeIndianMobile(raw: unknown): string {
  const digits = String(raw || '').replace(/[^0-9]/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

async function getAuthCustomer(request: Request, env: Env) {
  const authHeader = request.headers.get('Authorization') || '';
  let token = '';

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    const cookieHeader = request.headers.get('Cookie') || '';
    const match = cookieHeader.match(/satva_customer_session=([^;]+)/);
    if (match) token = match[1].trim();
  }

  if (!token || !env?.CUSTOMER_SESSION_SECRET) return null;
  const result = await verifyCustomerToken(token, env.CUSTOMER_SESSION_SECRET);
  return result.valid && result.customer ? result.customer : null;
}

function formatLeadRow(r: any) {
  return {
    id: String(r.id),
    customerId: r.customer_id ? String(r.customer_id) : null,
    fullName: String(r.full_name || ''),
    email: String(r.email || ''),
    whatsappNumber: String(r.whatsapp_number || ''),
    promoConsent: Number(r.promo_consent) === 1,
    consentText: String(r.consent_text || DEFAULT_CONSENT_TEXT),
    consentTimestampUtc: String(r.consent_timestamp_utc || r.created_at || ''),
    policyVersion: String(r.policy_version || POLICY_VERSION),
    couponCode: r.coupon_code ? String(r.coupon_code) : null,
    firstOrderUsed: Number(r.first_order_used) === 1,
    source: String(r.source || 'welcome_popup'),
    createdAt: String(r.created_at || ''),
    updatedAt: String(r.updated_at || '')
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/whatsapp-leads (Admin: list all registered WhatsApp numbers + consent status)
// GET /api/whatsapp-leads?me=1 (Authenticated customer: check own status)
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    await ensureWhatsappLeadsTable(db);
    const url = new URL(request.url);

    // Self-lookup for signed-in customer
    if (url.searchParams.get('me') === '1') {
      const customer = await getAuthCustomer(request, env);
      if (!customer) {
        return new Response(
          JSON.stringify({ success: true, authenticated: false, lead: null }),
          { status: 200, headers: corsHeaders }
        );
      }

      const phone = normalizeIndianMobile(customer.phone);
      const email = String(customer.email || '').toLowerCase().trim();
      const row = await db
        .prepare(
          `SELECT * FROM whatsapp_leads
           WHERE (customer_id = ?) OR (email <> '' AND LOWER(email) = ?) OR (length(?) = 10 AND whatsapp_number = ?)
           ORDER BY datetime(updated_at) DESC
           LIMIT 1`
        )
        .bind(customer.id, email, phone, phone)
        .first();

      return new Response(
        JSON.stringify({
          success: true,
          authenticated: true,
          lead: row ? formatLeadRow(row) : null
        }),
        { status: 200, headers: corsHeaders }
      );
    }

    // Admin list
    const isAdmin = await verifyAdminAuth(request, env);
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required.' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const consentFilter = url.searchParams.get('consent'); // 'yes' | 'no' | null
    let query = 'SELECT * FROM whatsapp_leads ORDER BY datetime(updated_at) DESC LIMIT 500';
    if (consentFilter === 'yes') {
      query = 'SELECT * FROM whatsapp_leads WHERE promo_consent = 1 ORDER BY datetime(updated_at) DESC LIMIT 500';
    } else if (consentFilter === 'no') {
      query = 'SELECT * FROM whatsapp_leads WHERE promo_consent = 0 ORDER BY datetime(updated_at) DESC LIMIT 500';
    }

    const { results } = await db.prepare(query).all();
    const leads = (results || []).map(formatLeadRow);

    const statsRow: any = await db
      .prepare(
        `SELECT
          COUNT(*) AS total,
          SUM(CASE WHEN promo_consent = 1 THEN 1 ELSE 0 END) AS consented,
          SUM(CASE WHEN promo_consent = 0 THEN 1 ELSE 0 END) AS declined,
          SUM(CASE WHEN first_order_used = 1 THEN 1 ELSE 0 END) AS redeemed
         FROM whatsapp_leads`
      )
      .first();

    return new Response(
      JSON.stringify({
        success: true,
        leads,
        stats: {
          total: Number(statsRow?.total) || 0,
          consented: Number(statsRow?.consented) || 0,
          declined: Number(statsRow?.declined) || 0,
          redeemed: Number(statsRow?.redeemed) || 0
        }
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[api/whatsapp-leads GET]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Unable to load WhatsApp leads.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST /api/whatsapp-leads (Register WhatsApp number + explicit promo consent status & issue welcome coupon)
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  const ip = clientIp(request);
  if (isRateLimited(`wa-lead:${ip}`, 15, 15 * 60 * 1000)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Too many requests. Please try again in a few minutes.' }),
      { status: 429, headers: corsHeaders }
    );
  }

  try {
    await ensureWhatsappLeadsTable(db);

    const authCustomer = await getAuthCustomer(request, env);
    if (!authCustomer) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Please sign in or create an account first to register your WhatsApp number and claim the welcome offer.'
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    const data = await readJsonBody<Record<string, any>>(request, 16 * 1024);
    const whatsappNumber = normalizeIndianMobile(data.whatsappNumber || data.phone || authCustomer.phone);

    if (!/^[6-9]\d{9}$/.test(whatsappNumber)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Please enter a valid 10-digit Indian WhatsApp mobile number.'
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const promoConsent = Boolean(data.promoConsent);
    const fullName = String(data.fullName || authCustomer.name || '').trim().slice(0, 120);
    const email = String(authCustomer.email || data.email || '').toLowerCase().trim().slice(0, 160);
    const consentText = String(data.consentText || DEFAULT_CONSENT_TEXT).trim().slice(0, 500);
    const source = String(data.source || 'welcome_popup').trim().slice(0, 64);
    const userAgent = (request.headers.get('user-agent') || 'Unknown').slice(0, 256);
    const nowIso = new Date().toISOString();

    // Check if this customer / WhatsApp number has already placed an order (first-purchase rule)
    let hasPriorOrder = false;
    try {
      const priorOrder = await db
        .prepare(
          `SELECT id FROM orders
           WHERE (LOWER(email) = ? AND ? <> '')
              OR substr(replace(replace(replace(phone, ' ', ''), '-', ''), '+91', ''), -10) = ?
           LIMIT 1`
        )
        .bind(email, email, whatsappNumber)
        .first();
      hasPriorOrder = Boolean(priorOrder);
    } catch {
      /* orders table may be empty */
    }

    const existingLead: any = await db
      .prepare('SELECT id, first_order_used, coupon_code FROM whatsapp_leads WHERE whatsapp_number = ? LIMIT 1')
      .bind(whatsappNumber)
      .first();

    const alreadyRedeemed = Boolean(existingLead && Number(existingLead.first_order_used) === 1);
    const eligibleForCoupon = promoConsent && !hasPriorOrder && !alreadyRedeemed;
    const issuedCouponCode = eligibleForCoupon ? WELCOME_COUPON_CODE : existingLead?.coupon_code || null;

    const leadId = existingLead?.id || `wa-${crypto.randomUUID()}`;

    await db
      .prepare(
        `INSERT INTO whatsapp_leads (
          id, customer_id, full_name, email, whatsapp_number,
          promo_consent, consent_text, consent_timestamp_utc, policy_version,
          coupon_code, first_order_used, source, user_agent, created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'utc'), datetime('now', 'utc'))
        ON CONFLICT(whatsapp_number) DO UPDATE SET
          customer_id = COALESCE(excluded.customer_id, whatsapp_leads.customer_id),
          full_name = CASE WHEN excluded.full_name <> '' THEN excluded.full_name ELSE whatsapp_leads.full_name END,
          email = CASE WHEN excluded.email <> '' THEN excluded.email ELSE whatsapp_leads.email END,
          promo_consent = excluded.promo_consent,
          consent_text = excluded.consent_text,
          consent_timestamp_utc = excluded.consent_timestamp_utc,
          policy_version = excluded.policy_version,
          coupon_code = CASE
            WHEN excluded.promo_consent = 1 AND whatsapp_leads.first_order_used = 0 THEN excluded.coupon_code
            ELSE whatsapp_leads.coupon_code
          END,
          user_agent = excluded.user_agent,
          updated_at = datetime('now', 'utc')`
      )
      .bind(
        leadId,
        authCustomer.id,
        fullName,
        email,
        whatsappNumber,
        promoConsent ? 1 : 0,
        consentText,
        nowIso,
        POLICY_VERSION,
        issuedCouponCode,
        alreadyRedeemed ? 1 : 0,
        source,
        userAgent
      )
      .run();

    // Ensure WELCOME15FREE exists in coupons table when D1 has custom coupons
    if (eligibleForCoupon) {
      try {
        await db
          .prepare(
            `INSERT OR IGNORE INTO coupons (id, code, discount_percent, flat_discount_paise, min_order_paise, is_active, description)
             VALUES ('coup-welcome-15-free', ?, 15, NULL, 0, 1, '15% OFF + Free Express Delivery on your first purchase (WhatsApp Welcome Offer)')`
          )
          .bind(WELCOME_COUPON_CODE)
          .run();
      } catch {
        /* coupons table optional — fallback handles WELCOME15FREE */
      }
    }

    // Record DPDP Rules 2025 Rule 4 audit log entry in consent_logs
    try {
      const consentLogId = `wa-cns-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const categoriesAccepted = promoConsent ? ['necessary', 'whatsapp_promotional'] : ['necessary'];
      const hashBuf = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(`${authCustomer.id}:${whatsappNumber}`)
      );
      const sessionHash = Array.from(new Uint8Array(hashBuf))
        .slice(0, 12)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      await db
        .prepare(
          `INSERT INTO consent_logs (
            id, consent_id, timestamp_utc, categories_accepted, policy_version, session_hash, user_agent, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'utc'))`
        )
        .bind(
          `cns-${crypto.randomUUID()}`,
          consentLogId,
          nowIso,
          JSON.stringify(categoriesAccepted),
          POLICY_VERSION,
          `wa-${sessionHash}`,
          userAgent
        )
        .run();
    } catch {
      /* non-fatal audit log write */
    }

    return new Response(
      JSON.stringify({
        success: true,
        whatsappNumber,
        promoConsent,
        eligibleForCoupon,
        alreadyOrdered: hasPriorOrder || alreadyRedeemed,
        couponCode: eligibleForCoupon ? WELCOME_COUPON_CODE : null,
        discountPercent: eligibleForCoupon ? 15 : 0,
        freeShipping: eligibleForCoupon,
        message: eligibleForCoupon
          ? `Welcome to Satvastones! Use ${WELCOME_COUPON_CODE} for 15% OFF + Free Express Delivery on your first order.`
          : !promoConsent
            ? 'Your WhatsApp number has been saved with promotional messages turned OFF. Enable promotional consent anytime to unlock the 15% OFF + Free Delivery welcome code.'
            : 'Your WhatsApp preference has been saved. The welcome offer is reserved for first-time purchases.'
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[api/whatsapp-leads POST]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Unable to save WhatsApp preference right now.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT /api/whatsapp-leads (Admin: update promo_consent flag, e.g. on STOP/opt-out)
export async function onRequestPut(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  const isAdmin = await verifyAdminAuth(request, env);
  if (!isAdmin) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required.' }),
      { status: 401, headers: corsHeaders }
    );
  }

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    await ensureWhatsappLeadsTable(db);
    const data = await readJsonBody<Record<string, any>>(request, 8 * 1024);
    const id = String(data.id || '').trim();
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Lead ID is required.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const promoConsent = data.promoConsent ? 1 : 0;
    await db
      .prepare(
        `UPDATE whatsapp_leads
         SET promo_consent = ?, consent_timestamp_utc = ?, updated_at = datetime('now', 'utc')
         WHERE id = ?`
      )
      .bind(promoConsent, new Date().toISOString(), id)
      .run();

    return new Response(
      JSON.stringify({
        success: true,
        id,
        promoConsent: Boolean(promoConsent),
        message: promoConsent ? 'Promotional WhatsApp consent enabled.' : 'Promotional WhatsApp consent withdrawn.'
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[api/whatsapp-leads PUT]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Unable to update consent status.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE /api/whatsapp-leads?id=... (Admin: erase WhatsApp lead per DPDP Act right to erasure)
export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  const isAdmin = await verifyAdminAuth(request, env);
  if (!isAdmin) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required.' }),
      { status: 401, headers: corsHeaders }
    );
  }

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    await ensureWhatsappLeadsTable(db);
    const url = new URL(request.url);
    const id = (url.searchParams.get('id') || '').trim();
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Lead ID is required.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    await db.prepare('DELETE FROM whatsapp_leads WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'WhatsApp lead record erased.' }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    console.error('[api/whatsapp-leads DELETE]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Unable to delete lead.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
