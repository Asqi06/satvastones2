// Cloudflare Pages / Worker Function: /api/admin/auth
import {
  checkRateLimit,
  recordLoginFailure,
  clearRateLimit,
  validateCredentials,
  createAdminToken,
  verifyAdminAuth,
  isAdminAuthConfigured
} from '../../src/lib/server-auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/admin/auth — Check if existing token/session is valid
export async function onRequestGet(context: { request: Request; env: any }) {
  const { request, env } = context;
  const isAuth = await verifyAdminAuth(request, env);

  if (isAuth) {
    return new Response(
      JSON.stringify({ success: true, authenticated: true, user: '@dmin' }),
      { status: 200, headers: corsHeaders }
    );
  }

  return new Response(
    JSON.stringify({ success: false, authenticated: false, message: 'Session expired or invalid.' }),
    { status: 401, headers: corsHeaders }
  );
}

// POST /api/admin/auth — Authenticate credentials & return signed session token
export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const clientIp = request.headers.get('CF-Connecting-IP') || 
                   request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                   '127.0.0.1';

  // 1. Check Rate Limit
  const rateStatus = checkRateLimit(clientIp);
  if (!rateStatus.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `Account temporarily locked due to excessive failed attempts. Please retry in ${rateStatus.waitMinutes || 15} minutes.`,
        locked: true
      }),
      { status: 429, headers: corsHeaders }
    );
  }

  // Refuse to authenticate against an unconfigured deployment rather than falling
  // back to credentials that ship in the repository.
  if (!isAdminAuthConfigured(env)) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          'Admin authentication is not configured. Set the ADMIN_PASSWORD and ADMIN_SESSION_SECRET secrets for this deployment.'
      }),
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    const body = await request.json() as any;
    const username = (body.username || '').trim();
    const password = (body.password || '').trim();

    if (!username || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Username and security passkey are required.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Validate Credentials against Environment or Secure Defaults
    const isValid = validateCredentials(username, password, env);

    if (!isValid) {
      const failStatus = recordLoginFailure(clientIp);
      if (failStatus.locked) {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Security threshold exceeded. Administrative terminal locked for 15 minutes.',
            locked: true
          }),
          { status: 429, headers: corsHeaders }
        );
      }

      return new Response(
        JSON.stringify({
          success: false,
          error: `Invalid administrative credentials. Attempt recorded. ${failStatus.remaining} attempts remaining before terminal lockout.`,
          remaining: failStatus.remaining
        }),
        { status: 401, headers: corsHeaders }
      );
    }

    // 3. Successful Login — Clear Rate Limit & Issue Signed Token
    clearRateLimit(clientIp);
    const token = await createAdminToken(username, env?.ADMIN_SESSION_SECRET);

    // Set Secure HttpOnly Cookie + Return Bearer Token
    const cookieVal = `satva_admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=43200; Path=/`;
    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.append('Set-Cookie', cookieVal);

    return new Response(
      JSON.stringify({
        success: true,
        token,
        user: '@dmin',
        expiresIn: 43200,
        message: 'Security credentials verified. Access granted.'
      }),
      { status: 200, headers: responseHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: 'Malformed authentication request.' }),
      { status: 400, headers: corsHeaders }
    );
  }
}

// DELETE /api/admin/auth — Revoke admin session cookie & clear client storage
export async function onRequestDelete() {
  const responseHeaders = new Headers(corsHeaders);
  responseHeaders.append(
    'Set-Cookie',
    'satva_admin_session=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
  );
  responseHeaders.set('Clear-Site-Data', '"cookies", "storage"');
  return new Response(
    JSON.stringify({ success: true, message: 'Admin session terminated.' }),
    { status: 200, headers: responseHeaders }
  );
}
