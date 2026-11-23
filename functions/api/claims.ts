// Cloudflare Pages Function: /api/claims
// Handles 360° unboxing video claims verification for transit damage / anti-tarnish warranty
// Connects to Cloudflare D1 (SQLite) binding: context.env.DB
import { verifyAdminAuth } from '../../src/lib/server-auth';
import { clientIp, isRateLimited, readJsonBody, safeHttpUrl } from '../../src/lib/http';

interface Env {
  DB: any;
  R2_BUCKET: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

const CLAIM_LIMITS = {
  orderNumber: 40,
  customerName: 80,
  phone: 20,
  videoProofUrl: 600,
  description: 1500,
  adminNotes: 1000
} as const;

const CLAIM_STATUSES = new Set(['PENDING_REVIEW', 'REPLACEMENT_APPROVED', 'REJECTED']);

function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/claims
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  const isAuth = await verifyAdminAuth(request, env);
  if (!isAuth) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication token required to view claims.' }),
      { status: 401, headers: corsHeaders }
    );
  }

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'D1 Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    const { results } = await db.prepare(`
      SELECT * FROM damage_claims 
      ORDER BY datetime(created_at) DESC 
      LIMIT 100
    `).all();

    const claims = (results || []).map((row: any) => ({
      id: row.id,
      orderNumber: row.order_number,
      customerName: row.customer_name,
      phone: row.phone,
      submissionDate: row.submission_date || row.created_at,
      videoProofUrl: row.video_proof_url,
      description: row.description || '',
      status: row.status || 'PENDING_REVIEW',
      adminNotes: row.admin_notes || ''
    }));

    return new Response(JSON.stringify({ success: true, claims }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    console.error('[api/claims]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Unable to process claim request.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST /api/claims (Customer submits 360° unboxing video proof)
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'D1 Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    if (isRateLimited(`claim:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Too many claims from this connection. Please try again later.' }),
        { status: 429, headers: corsHeaders }
      );
    }

    const data = await readJsonBody<Record<string, any>>(request, 32 * 1024);
    const orderNumber = cleanText(data.orderNumber, CLAIM_LIMITS.orderNumber).toUpperCase();
    const customerName = cleanText(data.customerName, CLAIM_LIMITS.customerName) || 'Customer';
    const phone = cleanText(data.phone, CLAIM_LIMITS.phone).replace(/[^0-9+]/g, '');
    const rawVideoUrl = cleanText(data.videoProofUrl, CLAIM_LIMITS.videoProofUrl);
    const description = cleanText(data.description, CLAIM_LIMITS.description);

    if (!orderNumber || !rawVideoUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order Number and 360° Unboxing Video Proof URL are required.' }),
        { status: 400, headers: corsHeaders }
      );
    }
    if (!/^[A-Z0-9-]{4,40}$/.test(orderNumber)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Please enter a valid order number.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Only http(s) links may be stored. The admin panel renders this as an
    // anchor, so a `javascript:` value would otherwise be a stored XSS vector.
    const videoProofUrl = safeHttpUrl(rawVideoUrl, '');
    if (!videoProofUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Video proof must be a valid http(s) link.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Ids are server-owned so a claimant cannot overwrite another claim.
    const id = `claim-${crypto.randomUUID()}`;

    await db.prepare(`
      INSERT INTO damage_claims (id, order_number, customer_name, phone, video_proof_url, description, status)
      VALUES (?, ?, ?, ?, ?, ?, 'PENDING_REVIEW')
    `).bind(id, orderNumber, customerName, phone, videoProofUrl, description).run();

    return new Response(
      JSON.stringify({
        success: true,
        claimId: id,
        message: 'Your 360° unboxing video claim has been logged for manual inspection by our Vapi atelier team.'
      }),
      { status: 201, headers: corsHeaders }
    );
  } catch (err: any) {
    const tooLarge = String(err?.message || '').includes('Payload too large');
    return new Response(
      JSON.stringify({ success: false, error: tooLarge ? 'Claim details are too long.' : 'Claim could not be saved.' }),
      { status: tooLarge ? 413 : 500, headers: corsHeaders }
    );
  }
}

// PUT /api/claims (Admin review approval / rejection)
export async function onRequestPut(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  const isAuth = await verifyAdminAuth(request, env);
  if (!isAuth) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication token required to update claims.' }),
      { status: 401, headers: corsHeaders }
    );
  }

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'D1 Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    const data = await readJsonBody<Record<string, any>>(request, 16 * 1024);
    const claimId = cleanText(data.claimId, CLAIM_LIMITS.orderNumber);
    const status = cleanText(data.status, 40).toUpperCase();
    const adminNotes = data.adminNotes ? cleanText(data.adminNotes, CLAIM_LIMITS.adminNotes) : null;

    if (!claimId || !status) {
      return new Response(
        JSON.stringify({ success: false, error: 'claimId and status are required.' }),
        { status: 400, headers: corsHeaders }
      );
    }
    if (!CLAIM_STATUSES.has(status)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unsupported claim status.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    await db.prepare(`
      UPDATE damage_claims 
      SET status = ?, 
          admin_notes = COALESCE(?, admin_notes),
          updated_at = datetime('now', 'utc')
      WHERE id = ?
    `).bind(status, adminNotes || null, claimId).run();

    return new Response(
      JSON.stringify({ success: true, message: `Claim ${claimId} status updated to ${status}.` }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[api/claims]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Unable to process claim request.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
