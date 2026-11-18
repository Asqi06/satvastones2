/**
 * SATVASTONES CUSTOMER SECURITY & AUTHENTICATION ENGINE
 * Standards: NIST SP 800-132, DPDP Act 2023, OWASP Customer Account Security
 *
 * Implements:
 * 1. PBKDF2-SHA256 Password Hashing (100,000 iterations + unique random 16-byte cryptographic salt)
 * 2. Constant-time signature comparison to defeat timing attacks
 * 3. HMAC-SHA256 Signed Customer Session Tokens (30 days validity)
 * 4. Sliding-window IP & Account Rate Limiting (5 failed attempts -> 15 min lock)
 */

// Convert string to Uint8Array
function strToBuf(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert buffer to hex string
function bufToHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

// Constant-time string comparison
export function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

// Generate random salt
export function generateSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return bufToHex(bytes);
}

// PBKDF2 with SHA-256 (100,000 iterations)
export async function hashCustomerPassword(password: string, salt: string): Promise<string> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    strToBuf(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: strToBuf(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256
  );

  return bufToHex(derivedBits);
}

// Verify customer password
export async function verifyCustomerPassword(password: string, salt: string, storedHash: string): Promise<boolean> {
  try {
    const candidateHash = await hashCustomerPassword(password, salt);
    return constantTimeCompare(candidateHash, storedHash);
  } catch {
    return false;
  }
}

// Base64Url helpers
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

// Customer Session Token (30 days). A dedicated secret is mandatory: reusing the
// admin secret would let a customer token satisfy admin verification.
const CUSTOMER_SECRET_MIN_LENGTH = 32;

function resolveCustomerSecret(secret?: string): { secret: string; configured: boolean } {
  const configured = typeof secret === 'string' && secret.trim().length >= CUSTOMER_SECRET_MIN_LENGTH;
  return { secret: configured ? secret : '', configured };
}

export function isCustomerAuthConfigured(secret?: string): boolean {
  return resolveCustomerSecret(secret).configured;
}

export async function createCustomerToken(
  customer: { id: string; email: string; phone: string; fullName: string },
  secret?: string
): Promise<string> {
  const resolved = resolveCustomerSecret(secret);
  if (!resolved.configured) {
    throw new Error('CUSTOMER_SESSION_SECRET is not configured.');
  }
  const keySecret = resolved.secret;
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = {
    sub: customer.id,
    email: customer.email,
    phone: customer.phone,
    name: customer.fullName,
    role: 'CUSTOMER',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
    nonce: crypto.randomUUID()
  };

  const headerEnc = toBase64Url(strToBuf(JSON.stringify(header)));
  const payloadEnc = toBase64Url(strToBuf(JSON.stringify(payload)));
  const dataToSign = `${headerEnc}.${payloadEnc}`;

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    strToBuf(keySecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, strToBuf(dataToSign));
  const sigEnc = toBase64Url(signature);

  return `${dataToSign}.${sigEnc}`;
}

// Verify Customer Session Token
export async function verifyCustomerToken(
  token: string,
  secret?: string
): Promise<{ valid: boolean; customer?: { id: string; email: string; phone: string; name: string } }> {
  try {
    if (!token || typeof token !== 'string') return { valid: false };
    const resolved = resolveCustomerSecret(secret);
    if (!resolved.configured) return { valid: false };
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };

    const [headerEnc, payloadEnc, sigEnc] = parts;
    const dataToVerify = `${headerEnc}.${payloadEnc}`;
    const keySecret = resolved.secret;

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      strToBuf(keySecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const isValid = await crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      fromBase64Url(sigEnc),
      strToBuf(dataToVerify)
    );

    if (!isValid) return { valid: false };

    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(payloadEnc)));
    const nowSec = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < nowSec) {
      return { valid: false }; // Expired
    }

    // Only customer tokens may open a customer session.
    if (payload.role !== 'CUSTOMER') {
      return { valid: false };
    }

    return {
      valid: true,
      customer: {
        id: payload.sub,
        email: payload.email,
        phone: payload.phone,
        name: payload.name
      }
    };
  } catch {
    return { valid: false };
  }
}

// Rate Limiting Storage
interface RateLimitEntry {
  attempts: number;
  lockedUntil: number;
  firstAttempt: number;
}
const customerRateLimitMap = new Map<string, RateLimitEntry>();

export function checkCustomerRateLimit(ipOrKey: string): { allowed: boolean; remaining: number; waitMinutes?: number } {
  const now = Date.now();
  const entry = customerRateLimitMap.get(ipOrKey);

  if (!entry) return { allowed: true, remaining: 5 };

  if (entry.lockedUntil > now) {
    const waitMinutes = Math.ceil((entry.lockedUntil - now) / 60000);
    return { allowed: false, remaining: 0, waitMinutes };
  }

  if (now - entry.firstAttempt > 15 * 60 * 1000) {
    customerRateLimitMap.delete(ipOrKey);
    return { allowed: true, remaining: 5 };
  }

  const remaining = Math.max(0, 5 - entry.attempts);
  return { allowed: remaining > 0, remaining };
}

export function recordCustomerFailure(ipOrKey: string): { remaining: number; locked: boolean; waitMinutes?: number } {
  const now = Date.now();
  let entry = customerRateLimitMap.get(ipOrKey);

  if (!entry || now - entry.firstAttempt > 15 * 60 * 1000) {
    entry = { attempts: 1, lockedUntil: 0, firstAttempt: now };
  } else {
    entry.attempts += 1;
  }

  if (entry.attempts >= 5) {
    entry.lockedUntil = now + 15 * 60 * 1000; // 15 min lock
    customerRateLimitMap.set(ipOrKey, entry);
    return { remaining: 0, locked: true, waitMinutes: 15 };
  }

  customerRateLimitMap.set(ipOrKey, entry);
  return { remaining: 5 - entry.attempts, locked: false };
}

export function clearCustomerFailure(ipOrKey: string): void {
  customerRateLimitMap.delete(ipOrKey);
}
