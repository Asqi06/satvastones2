// IndexNow streaming notification helper for Bing, Copilot Grounding & IndexNow partners
// Spec: https://www.indexnow.org/documentation

const CANONICAL_HOST = 'www.satvastones.in';
const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';
const PRODUCTION_HOSTS = new Set(['www.satvastones.in', 'satvastones.in']);
const NON_INDEXABLE_PREFIXES = [
  '/api/',
  '/admin',
  '/cart',
  '/checkout',
  '/account',
  '/wishlist',
  '/track-order',
  '/orders',
  '/search',
  '/journal/_template'
];
const REDIRECTED_PATHS = new Set([
  '/blog',
  '/gifts-for-girlfriend-under-500',
  '/policies/privacy',
  '/policies/returns',
  '/policies/shipping',
  '/policies/terms'
]);

export interface IndexNowEnv {
  INDEXNOW_KEY?: string;
  ENVIRONMENT?: string;
}

export function normalizeIndexNowUrls(paths: string[]): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];

  for (const raw of paths) {
    if (!raw || typeof raw !== 'string') continue;
    let pathname = raw.trim();
    if (!pathname) continue;

    if (pathname.startsWith('http://') || pathname.startsWith('https://')) {
      try {
        const parsed = new URL(pathname);
        pathname = parsed.pathname;
      } catch {
        continue;
      }
    }

    if (!pathname.startsWith('/')) pathname = `/${pathname}`;
    if (pathname.length > 1) pathname = pathname.replace(/\/+$/, '');

    // Skip non-indexable, XML feed, and redirected paths — IndexNow expects canonical HTML URLs
    if (
      REDIRECTED_PATHS.has(pathname) ||
      pathname.endsWith('.xml') ||
      pathname.endsWith('.txt') ||
      NON_INDEXABLE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix))
    ) {
      continue;
    }

    const canonicalUrl = `${CANONICAL_ORIGIN}${pathname}`;
    if (!seen.has(canonicalUrl)) {
      seen.add(canonicalUrl);
      urls.push(canonicalUrl);
    }
  }

  return urls.slice(0, 10000);
}

/**
 * Streams canonical URL change notifications (add, update, or delete) to IndexNow.
 * Safe to invoke inside Cloudflare Workers `ctx.waitUntil(...)`: never throws.
 */
export async function notifyIndexNow(
  env: IndexNowEnv,
  requestUrl: string,
  paths: string[]
): Promise<{ submitted: boolean; count: number; status?: number }> {
  const key = String(env.INDEXNOW_KEY || '').trim();
  if (!key || !/^[a-zA-Z0-9-]{8,128}$/.test(key)) {
    return { submitted: false, count: 0 };
  }

  try {
    const reqHost = new URL(requestUrl).hostname.toLowerCase();
    if (!PRODUCTION_HOSTS.has(reqHost)) {
      return { submitted: false, count: 0 };
    }
  } catch {
    return { submitted: false, count: 0 };
  }

  const urlList = normalizeIndexNowUrls(paths);
  if (urlList.length === 0) {
    return { submitted: false, count: 0 };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify({
        host: CANONICAL_HOST,
        key,
        keyLocation: `${CANONICAL_ORIGIN}/${key}.txt`,
        urlList
      }),
      signal: controller.signal
    });
    return { submitted: res.ok, count: urlList.length, status: res.status };
  } catch {
    return { submitted: false, count: urlList.length };
  } finally {
    clearTimeout(timeout);
  }
}
