/**
 * Shared HTTP hardening helpers.
 *
 * The API handlers historically replied with `Access-Control-Allow-Origin: *`.
 * Combined with `credentials: 'include'` requests from the storefront that invited
 * any origin to read authenticated responses. CORS is now resolved centrally in
 * `src/worker.ts`, and only same-origin or the two canonical storefront hosts are
 * echoed back.
 */

const CANONICAL_HOSTS = new Set(['satvastones.in', 'www.satvastones.in']);

export function isAllowedOrigin(origin: string, requestUrl: string): boolean {
  if (!origin) return false;
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }

  // Same-site requests (including Cloudflare preview deployments) are always fine.
  try {
    if (parsed.host === new URL(requestUrl).host) return true;
  } catch {
    /* ignore */
  }

  return parsed.protocol === 'https:' && CANONICAL_HOSTS.has(parsed.hostname);
}

/**
 * Replaces any wildcard CORS header on an API response with an allow-listed origin.
 * Same-origin and non-browser calls (no Origin header) are untouched.
 */
export function applyCorsPolicy(request: Request, response: Response): Response {
  const origin = request.headers.get('Origin');
  if (!origin) return response;

  const headers = new Headers(response.headers);
  headers.append('Vary', 'Origin');
  if (isAllowedOrigin(origin, request.url)) {
    headers.set('Access-Control-Allow-Origin', origin);
  } else {
    headers.delete('Access-Control-Allow-Origin');
  }
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

/** Escapes a value for HTML text and quoted attribute contexts. */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Restricts a URL to https/http so it cannot smuggle `javascript:` into markup. */
export function safeHttpUrl(value: unknown, fallback = ''): string {
  const raw = String(value ?? '').trim();
  if (!raw) return fallback;
  try {
    const parsed = new URL(raw, 'https://www.satvastones.in');
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
}

/** Basic JSON body reader with a hard size ceiling (defence against oversized payloads). */
export async function readJsonBody<T = any>(request: Request, maxBytes = 512 * 1024): Promise<T> {
  const length = Number(request.headers.get('content-length') || 0);
  if (length && length > maxBytes) {
    throw new Error('Payload too large');
  }
  return (await request.json()) as T;
}

/**
 * Sliding-window throttle for public write endpoints (reviews, claims, contact).
 *
 * Cloudflare may run several isolates, so this is a coarse first line of defence
 * rather than a global quota. Combined with length caps and moderation it stops
 * casual spam floods without adding a database round-trip to every read.
 */
const RATE_BUCKETS = new Map<string, number[]>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const cutoff = now - windowMs;
  const hits = (RATE_BUCKETS.get(key) || []).filter((stamp) => stamp > cutoff);
  if (hits.length >= limit) {
    RATE_BUCKETS.set(key, hits);
    return true;
  }
  hits.push(now);
  RATE_BUCKETS.set(key, hits);
  // Keep the map from growing without bound on long-lived isolates.
  if (RATE_BUCKETS.size > 5000) {
    for (const [bucketKey, stamps] of RATE_BUCKETS) {
      if (!stamps.length || stamps[stamps.length - 1] <= cutoff) RATE_BUCKETS.delete(bucketKey);
    }
  }
  return false;
}

/** Best-effort caller identity for throttling (Cloudflare sets CF-Connecting-IP). */
export function clientIp(request: Request): string {
  return (
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
    'unknown'
  );
}
