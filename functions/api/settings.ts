// Cloudflare Pages Function: /api/settings
// Manages global site settings in Cloudflare D1: context.env.DB
import { verifyAdminAuth } from '../../src/lib/server-auth';

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

// GET /api/settings
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'Cloudflare D1 Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    const row = await db.prepare(`SELECT value_json FROM site_settings WHERE key = 'global_config' LIMIT 1`).first();

    let settings: any = {};
    if (row && (row as any).value_json) {
      settings = JSON.parse((row as any).value_json);
    }

    // Dynamic environment fallback for Razorpay and Google Client ID
    if (!settings.razorpayKeyId && (env as any).PUBLIC_RAZORPAY_KEY_ID) {
      settings.razorpayKeyId = (env as any).PUBLIC_RAZORPAY_KEY_ID;
    }
    if (!settings.razorpayKeyId && (env as any).RAZORPAY_KEY_ID) {
      settings.razorpayKeyId = (env as any).RAZORPAY_KEY_ID;
    }
    if (!settings.googleClientId && (env as any).GOOGLE_CLIENT_ID) {
      settings.googleClientId = (env as any).GOOGLE_CLIENT_ID;
    }

    // Security check: only return raw razorpayKeySecret to authenticated admins
    const isAuth = await verifyAdminAuth(request, env);
    if (!isAuth && settings.razorpayKeySecret) {
      settings.razorpayKeySecret = '••••••••••••••••';
    }

    return new Response(JSON.stringify({ success: true, settings }), { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
  }
}

// POST /api/settings
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  const isAuth = await verifyAdminAuth(request, env);
  if (!isAuth) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication token required to update settings.' }),
      { status: 401, headers: corsHeaders }
    );
  }

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'Cloudflare D1 Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    const data = (await request.json()) as Record<string, any>;
    const incoming = data && typeof data === 'object' ? data : {};

    // Preserve an existing secret when the admin form submits the masked placeholder.
    const existingRow: any = await db
      .prepare(`SELECT value_json FROM site_settings WHERE key = 'global_config' LIMIT 1`)
      .first();
    let existing: Record<string, any> = {};
    if (existingRow?.value_json) {
      try {
        existing = JSON.parse(existingRow.value_json);
      } catch {
        existing = {};
      }
    }

    const submittedSecret = incoming.razorpayKeySecret;
    const looksMasked =
      typeof submittedSecret === 'string' && (/^[•*.\s]+$/.test(submittedSecret) || submittedSecret.trim() === '');
    if (looksMasked) {
      if (existing.razorpayKeySecret) incoming.razorpayKeySecret = existing.razorpayKeySecret;
      else delete incoming.razorpayKeySecret;
    }

    const jsonStr = JSON.stringify(incoming);

    await db.prepare(`
      INSERT INTO site_settings (key, value_json, updated_at)
      VALUES ('global_config', ?, datetime('now', 'utc'))
      ON CONFLICT(key) DO UPDATE SET
        value_json = excluded.value_json,
        updated_at = datetime('now', 'utc')
    `).bind(jsonStr).run();

    return new Response(JSON.stringify({ success: true, message: 'Settings saved to Cloudflare D1.' }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
  }
}
