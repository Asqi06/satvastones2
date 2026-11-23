/**
 * SATVASTONES SECURE ADMIN AUTHENTICATION ENGINE
 * Implements:
 * 1. Constant-time credential verification (prevents timing attacks)
 * 2. HMAC-SHA256 cryptographic session token generation & verification (Web Crypto API)
 * 3. In-memory rate limiting & brute-force lockout (5 failed attempts -> 15 min lock)
 * 4. OWASP A01 & A07 Compliant Authentication & Access Control
 */

const DEFAULT_ADMIN_USER = '@dmin';

/**
 * The signing secret must come from the environment (ADMIN_SESSION_SECRET, 32+ chars).
 * No fallback secret is ever shipped in source control.
 */
function resolveSessionSecret(env?: any): { secret: string; configured: boolean } {
  const secret = typeof env?.ADMIN_SESSION_SECRET === 'string' ? env.ADMIN_SESSION_SECRET.trim() : '';
  return {
    secret,
    configured: secret.length >= 32
  };
}

// Rate Limiting Storage for Brute-Force Prevention
interface RateLimitEntry {
  attempts: number;
  lockedUntil: number;
  firstAttempt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

// Constant-time string comparison to prevent timing attacks
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Convert string to Uint8Array
function strToBuf(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Base64Url encode/decode helpers
function toBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Get CryptoKey for HMAC-SHA256
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    'raw',
    strToBuf(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Check and enforce login rate limit
export function checkRateLimit(ip: string): { allowed: boolean; remaining: number; waitMinutes?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry) {
    return { allowed: true, remaining: 5 };
  }

  // Check if locked
  if (entry.lockedUntil > now) {
    const waitMinutes = Math.ceil((entry.lockedUntil - now) / 60000);
    return { allowed: false, remaining: 0, waitMinutes };
  }

  // Reset window after 15 minutes of inactivity
  if (now - entry.firstAttempt > 15 * 60 * 1000) {
    rateLimitMap.delete(ip);
    return { allowed: true, remaining: 5 };
  }

  const remaining = Math.max(0, 5 - entry.attempts);
  return { allowed: remaining > 0, remaining };
}

// Record login failure
export function recordLoginFailure(ip: string): { remaining: number; locked: boolean; waitMinutes?: number } {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);

  if (!entry || now - entry.firstAttempt > 15 * 60 * 1000) {
    entry = { attempts: 1, lockedUntil: 0, firstAttempt: now };
  } else {
    entry.attempts += 1;
  }

  if (entry.attempts >= 5) {
    entry.lockedUntil = now + 15 * 60 * 1000; // 15 minutes lockout
    rateLimitMap.set(ip, entry);
    return { remaining: 0, locked: true, waitMinutes: 15 };
  }

  rateLimitMap.set(ip, entry);
  return { remaining: 5 - entry.attempts, locked: false };
}

// Clear rate limit on successful authentication
export function clearRateLimit(ip: string): void {
  rateLimitMap.delete(ip);
}

// Generate signed HMAC-SHA256 Admin Session Token
export async function createAdminToken(username: string, secret?: string): Promise<string> {
  const resolved = resolveSessionSecret({ ADMIN_SESSION_SECRET: secret });
  if (!resolved.configured) {
    throw new Error('ADMIN_SESSION_SECRET is not configured.');
  }
  const keySecret = resolved.secret;
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: username,
    role: 'SUPER_ADMIN',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (12 * 60 * 60), // 12 hours validity
    nonce: crypto.randomUUID()
  };

  const headerEnc = toBase64Url(strToBuf(JSON.stringify(header)));
  const payloadEnc = toBase64Url(strToBuf(JSON.stringify(payload)));
  const dataToSign = `${headerEnc}.${payloadEnc}`;

  const cryptoKey = await getCryptoKey(keySecret);
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, strToBuf(dataToSign));
  const sigEnc = toBase64Url(signature);

  return `${dataToSign}.${sigEnc}`;
}

// Verify Admin Session Token
export async function verifyAdminToken(token: string, secret?: string): Promise<{ valid: boolean; user?: string }> {
  try {
    if (!token || typeof token !== 'string') return { valid: false };
    const resolved = resolveSessionSecret({ ADMIN_SESSION_SECRET: secret });
    if (!resolved.configured) return { valid: false };
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };

    const [headerEnc, payloadEnc, sigEnc] = parts;
    const dataToVerify = `${headerEnc}.${payloadEnc}`;
    const keySecret = resolved.secret;

    const cryptoKey = await getCryptoKey(keySecret);
    const signatureBytes = fromBase64Url(sigEnc);

    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      signatureBytes,
      strToBuf(dataToVerify)
    );

    if (!isValid) return { valid: false };

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadEnc)));
    const nowSec = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < nowSec) {
      return { valid: false }; // Token expired
    }

    // Admin endpoints must never accept a customer session (or vice versa).
    if (payload.role !== 'SUPER_ADMIN') {
      return { valid: false };
    }

    return { valid: true, user: payload.sub };
  } catch {
    return { valid: false };
  }
}

// Extract and verify admin token from Request headers or cookies
export async function verifyAdminAuth(request: Request, env?: any): Promise<boolean> {
  try {
    const authHeader = request.headers.get('Authorization') || '';
    let token = '';

    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else {
      // Check Cookie
      const cookieHeader = request.headers.get('Cookie') || '';
      const match = cookieHeader.match(/satva_admin_session=([^;]+)/);
      if (match) token = match[1].trim();
    }

    if (!token) return false;

    const resolved = resolveSessionSecret(env);
    if (!resolved.configured) return false;
    const result = await verifyAdminToken(token, resolved.secret);
    return result.valid;
  } catch {
    return false;
  }
}

/** Reports whether the deployment has the secrets admin auth needs. */
export function isAdminAuthConfigured(env?: any): boolean {
  return Boolean(env?.ADMIN_PASSWORD) && resolveSessionSecret(env).configured;
}

// Validate credentials strictly against environment configuration (zero hardcoded passwords).
export function validateCredentials(username: string, pass: string, env?: any): boolean {
  if (typeof env?.ADMIN_PASSWORD !== 'string' || env.ADMIN_PASSWORD.length === 0) {
    return false;
  }
  const expectedUser = env?.ADMIN_USERNAME || DEFAULT_ADMIN_USER;
  const userMatch = constantTimeCompare(username.trim(), expectedUser);
  const passMatch = constantTimeCompare(pass.trim(), env.ADMIN_PASSWORD);
  return userMatch && passMatch;
}
