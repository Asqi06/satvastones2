// Cloudflare Pages Function: /api/privacy-requests
// Handles DPDP Act 2023 Statutory Rights Requests (Sections 11, 12, 13, 14)
// Statutory SLA: Acknowledged within 48 Hours, Resolved within 1 Month

interface Env {
  DB: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/privacy-requests?ticket=...
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  const url = new URL(request.url);
  const ticket = url.searchParams.get('ticket')?.trim();

  try {
    if (ticket) {
      const row = await db.prepare(`
        SELECT ticket_number, request_type, patron_name, status, acknowledged_at, sla_due_date, created_at
        FROM privacy_requests
        WHERE UPPER(ticket_number) = ?
        LIMIT 1
      `).bind(ticket.toUpperCase()).first();

      if (!row) {
        return new Response(
          JSON.stringify({ success: false, message: 'No privacy ticket found matching: ' + ticket }),
          { status: 404, headers: corsHeaders }
        );
      }

      return new Response(JSON.stringify({ success: true, request: row }), { status: 200, headers: corsHeaders });
    }

    // Admin List: Fetch recent privacy requests
    const { results } = await db.prepare(`
      SELECT * FROM privacy_requests
      ORDER BY datetime(created_at) DESC
      LIMIT 100
    `).all();

    return new Response(JSON.stringify({ success: true, requests: results || [] }), {
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

// POST /api/privacy-requests (Submit statutory privacy request)
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    const data = await request.json() as any;

    const requestType = (data.request_type || '').toUpperCase();
    const patronName = (data.patron_name || '').trim();
    const patronEmail = (data.patron_email || '').trim().toLowerCase();
    const patronPhone = (data.patron_phone || '').trim();
    const details = data.details || {};

    if (!patronName || !patronEmail || !requestType) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name, email, and valid request type are required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const id = 'prv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const ticketNumber = 'DPDP-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);
    
    // SLA Due Date: Exactly 30 days / 1 month from now per DPDP Rules 2025
    const slaDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const acknowledgedAt = new Date().toISOString();

    await db.prepare(`
      INSERT INTO privacy_requests (
        id, ticket_number, request_type, patron_name, patron_email, patron_phone,
        details_json, status, acknowledged_at, sla_due_date, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'ACKNOWLEDGED', ?, ?, datetime('now', 'utc'), datetime('now', 'utc'))
    `).bind(
      id,
      ticketNumber,
      requestType,
      patronName,
      patronEmail,
      patronPhone,
      JSON.stringify(details),
      acknowledgedAt,
      slaDueDate
    ).run();

    return new Response(
      JSON.stringify({
        success: true,
        ticket_number: ticketNumber,
        status: 'ACKNOWLEDGED',
        acknowledged_at: acknowledgedAt,
        sla_due_date: slaDueDate,
        message: 'Your privacy request has been recorded under the Digital Personal Data Protection Act, 2023. You will receive an official acknowledgement within 48 hours.'
      }),
      { status: 201, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Failed to submit privacy request' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
