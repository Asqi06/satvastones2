// Cloudflare Pages Function: /api/consent
// Compliant with DPDP Rules 2025 (Rule 3 & Rule 4 - Proof of Consent & 1-Year Retention)
import { isRateLimited, readJsonBody } from '../../src/lib/http';

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

  const clientIp =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1';

  if (isRateLimited(`consent:${clientIp}`, 20, 60 * 1000)) {
    return new Response(
      JSON.stringify({ success: false, error: 'Too many consent log requests. Please try again shortly.' }),
      { status: 429, headers: corsHeaders }
    );
  }

  try {
    const data = await readJsonBody<Record<string, any>>(request, 16 * 1024);

    const consentId = String(data.consent_id || ('dpdp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8))).slice(0, 128);
    const timestampUtc = String(data.timestamp_utc || new Date().toISOString()).slice(0, 64);
    const categoriesAccepted = JSON.stringify(
      Array.isArray(data.categories_accepted) ? data.categories_accepted.slice(0, 10) : ['necessary']
    );
    const policyVersion = String(data.policy_version || '2026.1-DPDP').slice(0, 64);
    const sessionHash = String(data.session_hash || ('anon-' + Math.random().toString(36).substring(2, 12))).slice(0, 128);
    const userAgent = (request.headers.get('user-agent') || 'Unknown').slice(0, 256);
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
    console.error('[api/consent POST]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to log consent.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}
