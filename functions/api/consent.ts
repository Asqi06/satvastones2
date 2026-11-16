// Cloudflare Pages Function: /api/consent
// Compliant with DPDP Rules 2025 (Rule 3 & Rule 4 - Proof of Consent & 1-Year Retention)

interface Env {
  DB: any; // D1Database
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

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

    const consentId = data.consent_id || ('dpdp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8));
    const timestampUtc = data.timestamp_utc || new Date().toISOString();
    const categoriesAccepted = JSON.stringify(data.categories_accepted || ['necessary']);
    const policyVersion = data.policy_version || '2026.1-DPDP';
    const sessionHash = data.session_hash || ('anon-' + Math.random().toString(36).substring(2, 12));
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const id = 'cns-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);

    await db.prepare(`
      INSERT INTO consent_logs (
        id, consent_id, timestamp_utc, categories_accepted, policy_version, session_hash, user_agent, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', 'utc'))
    `).bind(
      id, consentId, timestampUtc, categoriesAccepted, policyVersion, sessionHash, userAgent
    ).run();

    return new Response(
      JSON.stringify({
        success: true,
        consent_id: consentId,
        message: 'Consent state logged in accordance with Rule 4 of the Digital Personal Data Protection Rules, 2025.'
      }),
      { status: 201, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Failed to log consent' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
