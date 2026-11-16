// Cloudflare Pages Function: /api/claims
// Handles 360° unboxing video claims verification for transit damage / anti-tarnish warranty
// Connects to Cloudflare D1 (SQLite) binding: context.env.DB
import { verifyAdminAuth } from '../../src/lib/server-auth';

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
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
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
    const data = await request.json() as any;
    const id = data.id || ('claim-' + Date.now());
    const orderNumber = (data.orderNumber || '').trim().toUpperCase();
    const customerName = (data.customerName || 'Customer').trim();
    const phone = (data.phone || '').trim();
    const videoProofUrl = (data.videoProofUrl || '').trim();
    const description = (data.description || '').trim();

    if (!orderNumber || !videoProofUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Order Number and 360° Unboxing Video Proof URL are required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

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
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: corsHeaders }
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
    const data = await request.json() as any;
    const { claimId, status, adminNotes } = data;

    if (!claimId || !status) {
      return new Response(
        JSON.stringify({ success: false, error: 'claimId and status are required.' }),
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
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
}
