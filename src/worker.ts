// Cloudflare Worker entrypoint with Static Assets & D1 Database API routing
import * as ordersHandler from '../functions/api/orders';
import * as claimsHandler from '../functions/api/claims';
import * as consentHandler from '../functions/api/consent';
import * as privacyHandler from '../functions/api/privacy-requests';
import * as settingsHandler from '../functions/api/settings';
import * as adminAuthHandler from '../functions/api/admin-auth';
import * as customerHandler from '../functions/api/customer';
import * as productsHandler from '../functions/api/products';
import * as couponsHandler from '../functions/api/coupons';
import * as reviewsHandler from '../functions/api/reviews';
import * as uploadHandler from '../functions/api/upload';
import * as blogsHandler from '../functions/api/blogs';
import { applyCorsPolicy, escapeHtml, isAllowedOrigin, safeHttpUrl } from './lib/http';
import { generateGoogleMerchantFeedXml, generateSitemapXml, type FeedBlog, type FeedProduct } from './lib/feeds';
import { estimateReadTimeMinutes, renderEditorialMarkdown } from './lib/markdown';

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  DB: any;
  R2_BUCKET?: any;
  ENVIRONMENT?: string;
  BRAND_NAME?: string;
  PROPRIETOR_NAME?: string;
  GSTIN?: string;
  STORE_LOCATION?: string;
  FREE_SHIPPING_THRESHOLD_PAISE?: string;
  SUPPORT_EMAIL?: string;
  [key: string]: any;
}

const SITE_URL = 'https://www.satvastones.in';
const ALLOWED_CATEGORIES = new Set([
  'rings',
  'necklaces',
  'bracelets',
  'earrings',
  'bangles',
  'gift-sets',
  'jewellery-set',
  'mystery-jewellery-jar'
]);
const FALLBACK_IMAGE = `${SITE_URL}/satvastones-logo.png`;

// SEO-safe Cloudflare Workers Edge Cache (caches.default) helpers
// - Only caches 200 OK public GET responses (never 404/5xx, never auth/admin/checkout/cart)
// - Automatically purges affected edge keys on admin product/blog writes
const HTML_CACHE_CONTROL = 'public, max-age=60, s-maxage=300, stale-while-revalidate=600';
const FEED_CACHE_CONTROL = 'public, max-age=300, s-maxage=300, stale-while-revalidate=600';
const API_PUBLIC_CACHE_CONTROL = 'public, max-age=30, s-maxage=120, stale-while-revalidate=300';

function getDefaultCache(): Cache | null {
  try {
    return ((globalThis as any).caches?.default as Cache) || null;
  } catch {
    return null;
  }
}

function buildEdgeCacheKey(requestUrl: string, preserveSearch = false): Request {
  const u = new URL(requestUrl);
  const canonicalPath = u.pathname.length > 1 ? u.pathname.replace(/\/+$/, '') : u.pathname;
  const keyUrl = preserveSearch ? `${u.origin}${canonicalPath}${u.search}` : `${u.origin}${canonicalPath}`;
  return new Request(keyUrl, { method: 'GET' });
}

async function withEdgeCache(
  request: Request,
  ctx: any,
  cacheControl: string,
  preserveSearch: boolean,
  producer: () => Promise<Response>
): Promise<Response> {
  if (request.method !== 'GET' || request.headers.get('Authorization')) {
    return producer();
  }

  const cache = getDefaultCache();
  const cacheKey = buildEdgeCacheKey(request.url, preserveSearch);

  if (cache) {
    try {
      const cached = await cache.match(cacheKey);
      if (cached) {
        const hitHeaders = new Headers(cached.headers);
        hitHeaders.set('X-Satva-Cache', 'HIT');
        return new Response(cached.body, {
          status: cached.status,
          statusText: cached.statusText,
          headers: hitHeaders
        });
      }
    } catch {
      /* fall through to origin render */
    }
  }

  const fresh = await producer();
  if (fresh.status !== 200) {
    return fresh;
  }

  const headers = new Headers(fresh.headers);
  headers.set('Cache-Control', cacheControl);
  headers.delete('Cloudflare-CDN-Cache-Control');
  headers.set('X-Satva-Cache', 'MISS');

  const responseToServe = new Response(fresh.body, {
    status: fresh.status,
    statusText: fresh.statusText,
    headers
  });

  if (cache) {
    try {
      const toStore = responseToServe.clone();
      const putPromise = cache.put(cacheKey, toStore).catch(() => {});
      if (ctx?.waitUntil) ctx.waitUntil(putPromise);
      else await putPromise;
    } catch {
      /* ignore cache write failure */
    }
  }

  return responseToServe;
}

async function purgeEdgePaths(origin: string, paths: string[]): Promise<void> {
  const cache = getDefaultCache();
  if (!cache) return;
  const unique = Array.from(new Set(paths.filter(Boolean)));
  await Promise.all(
    unique.map((p) => {
      const normalized = p.startsWith('/') ? p : `/${p}`;
      return cache.delete(new Request(`${origin}${normalized}`, { method: 'GET' })).catch(() => false);
    })
  );
}

function jsonError(message: string, status = 500): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function render404Response(request: Request, env: Env): Promise<Response> {
  try {
    const notFoundUrl = new URL('/404.html', request.url);
    const res = await env.ASSETS.fetch(notFoundUrl);
    if (res.ok) {
      return new Response(res.body, {
        status: 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Cloudflare-CDN-Cache-Control': 'no-cache',
          'X-Robots-Tag': 'noindex, nofollow',
          'X-Content-Type-Options': 'nosniff'
        }
      });
    }
  } catch {
    /* fallback below */
  }
  return new Response('Not Found', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Robots-Tag': 'noindex, nofollow'
    }
  });
}

function updateJsonLdNodes(
  html: string,
  targetType: string,
  update: (node: Record<string, any>) => void
): string {
  return html.replace(
    /(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g,
    (match, open: string, json: string, close: string) => {
      try {
        const data = JSON.parse(json);
        const visit = (node: any): void => {
          if (!node || typeof node !== 'object') return;
          if (Array.isArray(node)) {
            node.forEach(visit);
            return;
          }
          const nodeType = node['@type'];
          if (nodeType === targetType || (Array.isArray(nodeType) && nodeType.includes(targetType))) {
            update(node);
          }
          for (const key of Object.keys(node)) {
            if (key !== '@type') visit(node[key]);
          }
        };
        visit(data);
        return `${open}${JSON.stringify(data).replace(/</g, '\\u003c')}${close}`;
      } catch {
        return match;
      }
    }
  );
}

async function loadLivePublishedProducts(db: any): Promise<FeedProduct[]> {
  if (!db) return [];
  try {
    const prodRes = await db
      .prepare('SELECT * FROM products ORDER BY sort_order ASC, created_at DESC')
      .all();
    const rows = prodRes.results || [];
    const metaMap = new Map<string, Record<string, any>>();
    try {
      const metaRes = await db.prepare('SELECT product_id, meta_json FROM product_meta').all();
      for (const m of metaRes.results || []) {
        try {
          metaMap.set(String(m.product_id), JSON.parse(m.meta_json));
        } catch {
          /* ignore */
        }
      }
    } catch {
      /* product_meta table may not exist yet */
    }

    const list: FeedProduct[] = [];
    for (const r of rows) {
      const meta = metaMap.get(String(r.id)) || {};
      if (meta.isPublished === false) continue;

      let gallery: Array<{ url: string; alt?: string }> = [];
      try {
        const parsed = Array.isArray(r.gallery_json) ? r.gallery_json : JSON.parse(r.gallery_json || '[]');
        if (Array.isArray(parsed)) {
          gallery = parsed
            .filter((g: any) => g && typeof g.url === 'string' && g.url)
            .map((g: any) => ({ url: safeHttpUrl(g.url, FALLBACK_IMAGE), alt: String(g.alt || r.name) }));
        }
      } catch {
        /* ignore */
      }

      list.push({
        id: String(r.id),
        name: String(r.name || ''),
        slug: String(r.slug || ''),
        sku: String(r.sku || `SAT-${r.id}`),
        category: String(r.category || 'necklaces'),
        headline: String(r.headline || ''),
        description: String(r.description || ''),
        pricePaise: Number(r.price_paise) || 0,
        compareAtPricePaise: r.compare_at_price_paise ? Number(r.compare_at_price_paise) : null,
        imageUrl: safeHttpUrl(r.image_url, FALLBACK_IMAGE),
        gallery,
        material: String(r.material || '316L Surgical Stainless Steel + 18K Gold PVD'),
        finish: String(r.finish || 'Mirror Polished'),
        inStock: Number(r.in_stock) !== 0,
        isPublished: true,
        weightGrams: Number(meta.weightGrams) > 0 ? Number(meta.weightGrams) : undefined,
        seoTitle: typeof meta.seoTitle === 'string' ? meta.seoTitle : undefined,
        seoDescription: typeof meta.seoDescription === 'string' ? meta.seoDescription : undefined,
        updatedAt: r.updated_at || r.created_at
      });
    }
    return list;
  } catch {
    return [];
  }
}

async function loadLivePublishedBlogs(db: any): Promise<FeedBlog[]> {
  if (!db) return [];
  try {
    const res = await db
      .prepare(
        "SELECT id, title, slug, excerpt, cover_image, category, status, published_at, updated_at, created_at FROM blogs WHERE status = 'published' ORDER BY is_featured DESC, COALESCE(published_at, created_at) DESC"
      )
      .all();
    return (res.results || []).map((b: any) => ({
      id: String(b.id),
      title: String(b.title || ''),
      slug: String(b.slug || ''),
      excerpt: String(b.excerpt || ''),
      coverImage: b.cover_image ? safeHttpUrl(b.cover_image, '') : '',
      category: String(b.category || 'Styling Guide'),
      status: 'published',
      publishedAt: b.published_at || b.created_at,
      updatedAt: b.updated_at || b.published_at || b.created_at
    }));
  } catch {
    return [];
  }
}

async function routeApi(request: Request, env: Env, ctx: any): Promise<Response | null> {
  const url = new URL(request.url);
  const context = {
    request,
    env,
    params: {},
    waitUntil: (promise: Promise<any>) => ctx?.waitUntil?.(promise),
    next: () => env.ASSETS.fetch(request),
    data: {}
  };

  if (url.pathname.startsWith('/api/customer/')) {
    if (request.method === 'OPTIONS') return customerHandler.onRequestOptions();
    return customerHandler.handleCustomerRequest(request, env);
  }

  if (url.pathname === '/api/admin/auth') {
    if (request.method === 'OPTIONS') return adminAuthHandler.onRequestOptions();
    if (request.method === 'GET') return adminAuthHandler.onRequestGet(context as any);
    if (request.method === 'POST') return adminAuthHandler.onRequestPost(context as any);
  }

  if (url.pathname === '/api/orders' || url.pathname.startsWith('/api/orders/')) {
    if (request.method === 'OPTIONS') return ordersHandler.onRequestOptions();
    if (request.method === 'GET') return ordersHandler.onRequestGet(context as any);
    if (request.method === 'POST') return ordersHandler.onRequestPost(context as any);
    if (request.method === 'PUT') {
      return (ordersHandler as any).onRequestPut
        ? (ordersHandler as any).onRequestPut(context as any)
        : jsonError('Method Not Allowed', 405);
    }
    if (request.method === 'DELETE') return ordersHandler.onRequestDelete(context as any);
  }

  if (url.pathname === '/api/claims' || url.pathname.startsWith('/api/claims/')) {
    if (request.method === 'OPTIONS') return claimsHandler.onRequestOptions();
    if (request.method === 'GET') return claimsHandler.onRequestGet(context as any);
    if (request.method === 'POST') return claimsHandler.onRequestPost(context as any);
  }

  if (url.pathname === '/api/consent') {
    if (request.method === 'OPTIONS') return consentHandler.onRequestOptions();
    if (request.method === 'POST') return consentHandler.onRequestPost(context as any);
  }

  if (url.pathname === '/api/privacy-requests') {
    if (request.method === 'OPTIONS') return privacyHandler.onRequestOptions();
    if (request.method === 'GET') return privacyHandler.onRequestGet(context as any);
    if (request.method === 'POST') return privacyHandler.onRequestPost(context as any);
  }

  if (url.pathname === '/api/settings') {
    if (request.method === 'OPTIONS') return settingsHandler.onRequestOptions();
    if (request.method === 'GET') return settingsHandler.onRequestGet(context as any);
    if (request.method === 'POST') return settingsHandler.onRequestPost(context as any);
  }

  if (url.pathname === '/api/products' || url.pathname.startsWith('/api/products/')) {
    if (request.method === 'OPTIONS') return productsHandler.onRequestOptions();
    if (request.method === 'GET') return productsHandler.onRequestGet(context as any);
    if (request.method === 'POST') return productsHandler.onRequestPost(context as any);
    if (request.method === 'DELETE') return productsHandler.onRequestDelete(context as any);
  }

  if (url.pathname === '/api/blogs' || url.pathname.startsWith('/api/blogs/')) {
    if (request.method === 'OPTIONS') return blogsHandler.onRequestOptions();
    if (request.method === 'GET') return blogsHandler.onRequestGet(context as any);
    if (request.method === 'POST') return blogsHandler.onRequestPost(context as any);
    if (request.method === 'PUT') return blogsHandler.onRequestPut(context as any);
    if (request.method === 'DELETE') return blogsHandler.onRequestDelete(context as any);
  }

  if (url.pathname === '/api/coupons' || url.pathname.startsWith('/api/coupons/')) {
    if (request.method === 'OPTIONS') return couponsHandler.onRequestOptions();
    if (request.method === 'GET') return couponsHandler.onRequestGet(context as any);
    if (request.method === 'POST') return couponsHandler.onRequestPost(context as any);
    if (request.method === 'DELETE') return couponsHandler.onRequestDelete(context as any);
  }

  if (url.pathname === '/api/reviews' || url.pathname.startsWith('/api/reviews/')) {
    if (request.method === 'OPTIONS') return reviewsHandler.onRequestOptions();
    if (request.method === 'GET') return reviewsHandler.onRequestGet(context as any);
    if (request.method === 'POST') return reviewsHandler.onRequestPost(context as any);
    if (request.method === 'DELETE') return reviewsHandler.onRequestDelete(context as any);
  }

  if (url.pathname === '/api/upload') {
    if (request.method === 'OPTIONS') return uploadHandler.onRequestOptions();
    if (request.method === 'GET') return uploadHandler.onRequestGet(context as any);
    if (request.method === 'POST') return uploadHandler.onRequestPost(context as any);
  }

  return null;
}

function formatReadableDate(value?: string): string {
  try {
    const d = value ? new Date(value) : new Date();
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return '';
  }
}

function withSecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  if (!headers.has('Strict-Transport-Security')) {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  if (!headers.has('X-Frame-Options')) {
    headers.set('X-Frame-Options', 'SAMEORIGIN');
  }
  if (!headers.has('X-Content-Type-Options')) {
    headers.set('X-Content-Type-Options', 'nosniff');
  }
  if (!headers.has('Referrer-Policy')) {
    headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  }
  if (!headers.has('Permissions-Policy')) {
    headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const res = await this.handleRequest(request, env, ctx);
    return withSecurityHeaders(res);
  },

  async handleRequest(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // 0. Canonical SEO 301 Redirects (Host, Trailing Slash, and Legacy Policy Aliases)
    if ((request.method === 'GET' || request.method === 'HEAD') && !url.pathname.startsWith('/api/')) {
      const lowerHost = url.hostname.toLowerCase();
      const isNonCanonicalHost =
        lowerHost === 'satvastones.in' ||
        lowerHost === 'satvastonesjewellery.in' ||
        lowerHost === 'www.satvastonesjewellery.in';

      const policyAliasMap: Record<string, string> = {
        '/policies/privacy': '/privacy-policy',
        '/policies/returns': '/refund-policy',
        '/policies/shipping': '/shipping-policy',
        '/policies/terms': '/terms-and-conditions'
      };
      const cleanPath = url.pathname.length > 1 && url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
      const aliasTarget = policyAliasMap[cleanPath];
      const hasTrailingSlash = url.pathname.length > 1 && url.pathname.endsWith('/');

      if (isNonCanonicalHost || aliasTarget || hasTrailingSlash) {
        const targetHost = isNonCanonicalHost ? 'www.satvastones.in' : url.host;
        const targetPath = aliasTarget || cleanPath;
        const targetUrl = `https://${targetHost}${targetPath}${url.search}`;
        return Response.redirect(targetUrl, 301);
      }
    }

    // Helper: fetch static Astro HTML page directly via /<path>/index.html to avoid Cloudflare Assets 307 redirects
    const fetchStaticAssetClean = async (req: Request): Promise<Response> => {
      const reqUrl = new URL(req.url);
      const hasExtension = /\.[a-z0-9]{1,8}$/i.test(reqUrl.pathname);
      if (!hasExtension && reqUrl.pathname !== '/' && !reqUrl.pathname.endsWith('/')) {
        const indexRes = await env.ASSETS.fetch(new URL(`${reqUrl.pathname}/index.html`, req.url));
        if (indexRes.ok) return indexRes;
      }
      return env.ASSETS.fetch(req);
    };

    // Route /api/* requests to serverless D1 handlers, then normalise CORS.
    if (url.pathname.startsWith('/api/')) {
      // CSRF Defense: reject state-changing browser requests from untrusted origins
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
        const origin = request.headers.get('Origin');
        if (origin && !isAllowedOrigin(origin, request.url)) {
          return jsonError('Forbidden origin.', 403);
        }
      }

      try {
        const isPublicReadCatalog =
          request.method === 'GET' &&
          !request.headers.get('Authorization') &&
          (url.pathname === '/api/products' ||
            (url.pathname === '/api/blogs' &&
              url.searchParams.get('all') !== '1' &&
              url.searchParams.get('all') !== 'true'));

        if (isPublicReadCatalog) {
          const cachedApiRes = await withEdgeCache(request, ctx, API_PUBLIC_CACHE_CONTROL, true, async () => {
            const apiResponse = await routeApi(request, env, ctx);
            return apiResponse || jsonError('Not Found', 404);
          });
          return applyCorsPolicy(request, cachedApiRes);
        }

        const apiResponse = await routeApi(request, env, ctx);
        if (apiResponse) {
          // Automatically purge edge cache whenever an admin mutates products or blogs
          if (
            apiResponse.status < 400 &&
            (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE')
          ) {
            if (url.pathname === '/api/products' || url.pathname.startsWith('/api/products/')) {
              const slugParam = url.searchParams.get('slug');
              const purgeTargets = [
                '/api/products',
                '/shop',
                '/gifts-for-girlfriend-under-500',
                '/anti-tarnish-jewellery-vapi',
                '/affordable-anti-tarnish-jewellery-india',
                '/sitemap.xml',
                '/feeds/google-merchant.xml',
                '/google-merchant.xml',
                '/feed.xml',
                '/collections/rings',
                '/collections/necklaces',
                '/collections/bracelets',
                '/collections/earrings',
                '/collections/bangles',
                '/collections/gift-sets',
                '/collections/jewellery-set',
                '/collections/mystery-jewellery-jar',
                '/collections/rings-under-100',
                '/collections/gifts-for-girlfriend-under-500',
                '/collections/anti-tarnish-minimal-rings',
                '/collections/bestsellers',
                '/collections/new-arrivals',
                ...(slugParam ? [`/products/${slugParam}`] : [])
              ];
              try {
                const cloned = apiResponse.clone();
                const data: any = await cloned.json().catch(() => null);
                if (data?.slug) purgeTargets.push(`/products/${data.slug}`);
                if (data?.product?.slug) purgeTargets.push(`/products/${data.product.slug}`);
              } catch {
                /* ignore */
              }
              const purgeJob = purgeEdgePaths(url.origin, purgeTargets);
              if (ctx?.waitUntil) ctx.waitUntil(purgeJob);
            } else if (url.pathname === '/api/blogs' || url.pathname.startsWith('/api/blogs/')) {
              const slugParam = url.searchParams.get('slug');
              const purgeTargets = [
                '/api/blogs',
                '/journal',
                '/sitemap.xml',
                ...(slugParam ? [`/journal/${slugParam}`] : [])
              ];
              try {
                const cloned = apiResponse.clone();
                const data: any = await cloned.json().catch(() => null);
                if (data?.blog?.slug) purgeTargets.push(`/journal/${data.blog.slug}`);
              } catch {
                /* ignore */
              }
              const purgeJob = purgeEdgePaths(url.origin, purgeTargets);
              if (ctx?.waitUntil) ctx.waitUntil(purgeJob);
            }
          }
          return applyCorsPolicy(request, apiResponse);
        }
        return applyCorsPolicy(request, jsonError('Not Found', 404));
      } catch {
        return applyCorsPolicy(request, jsonError('Request failed', 500));
      }
    }

    // Redirect legacy /blog to /journal
    if (url.pathname === '/blog' || url.pathname === '/blog/') {
      return Response.redirect(`${SITE_URL}/journal`, 301);
    }

    // 1. Dynamic XML Sitemap directly from live Cloudflare D1 products & blogs (Edge Cached)
    if (url.pathname === '/sitemap.xml' && env.DB) {
      return withEdgeCache(request, ctx, FEED_CACHE_CONTROL, false, async () => {
        const [products, blogs] = await Promise.all([
          loadLivePublishedProducts(env.DB),
          loadLivePublishedBlogs(env.DB)
        ]);
        const xml = generateSitemapXml(products, blogs);
        return new Response(xml, {
          status: 200,
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'X-Content-Type-Options': 'nosniff'
          }
        });
      });
    }

    // 2. Dynamic Google Merchant Center XML Product Feed directly from live Cloudflare D1 (Edge Cached)
    if (
      url.pathname === '/feeds/google-merchant.xml' ||
      url.pathname === '/google-merchant.xml' ||
      url.pathname === '/feed.xml'
    ) {
      return withEdgeCache(request, ctx, FEED_CACHE_CONTROL, false, async () => {
        const products = env.DB ? await loadLivePublishedProducts(env.DB) : [];
        const xml = generateGoogleMerchantFeedXml(products);
        return new Response(xml, {
          status: 200,
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'X-Content-Type-Options': 'nosniff'
          }
        });
      });
    }

    // 3. Dynamic Product Detail Page (PDP) resolution from Cloudflare D1 (Edge Cached for 200 OK only)
    // Authoritative: if a product is deleted from D1 or unpublished, return 404 (never cached) so
    // Googlebot / Google Merchant Center immediately removes deleted mock products.
    if (url.pathname.startsWith('/products/')) {
      const slug = url.pathname.replace('/products/', '').replace(/\/$/, '').trim();
      if (slug && env.DB) {
        return withEdgeCache(request, ctx, HTML_CACHE_CONTROL, false, async () => {
        try {
          const row: any = await env.DB.prepare(
            'SELECT * FROM products WHERE slug = ? OR id = ? LIMIT 1'
          )
            .bind(slug, slug)
            .first();

          if (!row) {
            return render404Response(request, env);
          }

          let meta: Record<string, any> = {};
          try {
            const metaRow: any = await env.DB.prepare(
              'SELECT meta_json FROM product_meta WHERE product_id = ? LIMIT 1'
            )
              .bind(row.id)
              .first();
            if (metaRow?.meta_json) {
              const parsed = JSON.parse(metaRow.meta_json);
              if (parsed && typeof parsed === 'object') meta = parsed;
            }
          } catch {
            /* product_meta is optional */
          }

          if (meta.isPublished === false) {
            return render404Response(request, env);
          }

          const templateReqUrl = new URL('/products/aura-herringbone-snake-chain/index.html', request.url);
          const templateRes = await env.ASSETS.fetch(templateReqUrl);

          if (!templateRes.ok) {
            return new Response('Product template unavailable.', { status: 502 });
          }

          let html = await templateRes.text();

          const name = escapeHtml(row.name || 'Satvastones Piece');
          const rawName = String(row.name || 'Satvastones Piece');
          const rawSku = String(row.sku || `SAT-${row.id}`);
          const rawDescription =
            String(row.description || '').trim() ||
            `${rawName} - Handcrafted waterproof fine jewellery in 316L stainless steel & 18K vacuum gold PVD.`;
          const pricePaise = Number(row.price_paise) || 0;
          const compareAtPricePaise = row.compare_at_price_paise ? Number(row.compare_at_price_paise) : null;
          const priceRupees = Math.round(pricePaise / 100);
          const compareRupees = compareAtPricePaise ? Math.round(compareAtPricePaise / 100) : null;
          const discountPercent =
            compareAtPricePaise && compareAtPricePaise > pricePaise
              ? Math.round(((compareAtPricePaise - pricePaise) / compareAtPricePaise) * 100)
              : 0;
          const rawImageUrl = safeHttpUrl(row.image_url, FALLBACK_IMAGE);
          const imageUrl = escapeHtml(rawImageUrl);
          const headline = escapeHtml(row.headline || rawName);
          const description = escapeHtml(rawDescription);
          const sku = escapeHtml(rawSku);
          const slugValue = escapeHtml(row.slug || '');
          const idValue = escapeHtml(row.id || '');
          const category =
            typeof row.category === 'string' && ALLOWED_CATEGORIES.has(row.category) ? row.category : 'necklaces';
          const safeSlug =
            String(row.slug || slug || '')
              .toLowerCase()
              .replace(/[^a-z0-9-]/g, '') || slugValue;

          const materialRaw = String(row.material || '316L Surgical Stainless Steel + 18K Gold PVD');
          const finishRaw = String(row.finish || 'Mirror Polished');
          const material = escapeHtml(materialRaw);
          const finish = escapeHtml(finishRaw);
          const dimensions = typeof meta.dimensions === 'string' ? escapeHtml(meta.dimensions.trim()) : '';
          const weightGrams = Number(meta.weightGrams) > 0 ? Number(meta.weightGrams) : 0;
          const warranty = typeof meta.warranty === 'string' ? escapeHtml(meta.warranty.trim()) : '';
          const careInstructions = Array.isArray(meta.careInstructions)
            ? meta.careInstructions
                .filter((tip: unknown) => typeof tip === 'string' && tip.trim())
                .slice(0, 12)
                .map((tip: string) => escapeHtml(tip.trim()))
            : [];

          let gallery: Array<{ url: string; alt: string }> = [];
          try {
            const parsedGallery = Array.isArray(row.gallery_json)
              ? row.gallery_json
              : JSON.parse(row.gallery_json || '[]');
            gallery = (Array.isArray(parsedGallery) ? parsedGallery : [])
              .filter((img: any) => img && typeof img.url === 'string' && img.url)
              .slice(0, 8)
              .map((img: any, index: number) => ({
                url: safeHttpUrl(img.url, FALLBACK_IMAGE),
                alt: String(img.alt || `${rawName} image ${index + 1}`)
              }));
          } catch {
            /* malformed gallery_json falls back to the hero shot */
          }
          // Never keep the mock Unsplash fallback alongside real uploaded images.
          const realGallery = gallery.filter((img) => !img.url.includes('photo-1599643478518-a784e5dc4c8f'));
          if (realGallery.length) {
            gallery = realGallery;
          }
          if (!gallery.length) {
            gallery = [{ url: rawImageUrl, alt: rawName }];
          }
          // If row.image_url is the mock fallback but gallery has a real image, promote the real image.
          const effectiveRawImageUrl =
            rawImageUrl.includes('photo-1599643478518-a784e5dc4c8f') && realGallery.length
              ? realGallery[0].url
              : rawImageUrl;
          const effectiveImageUrl = escapeHtml(effectiveRawImageUrl);

          const generatedTitle = `${name} – 18K Gold PVD | Buy Online at Satvastones India`;
          const title =
            typeof meta.seoTitle === 'string' && meta.seoTitle.trim()
              ? escapeHtml(meta.seoTitle.trim())
              : generatedTitle;
          const generatedDescription = `Buy ${name} online in India for ₹${priceRupees.toLocaleString(
            'en-IN'
          )}. Waterproof 18K gold PVD steel. Free PAN-India delivery > ₹499 &amp; 7-day returns.`;
          const seoDescription =
            typeof meta.seoDescription === 'string' && meta.seoDescription.trim()
              ? escapeHtml(meta.seoDescription.trim())
              : generatedDescription;

          html = html.replace(/<title>.*?<\/title>/, () => `<title>${title}</title>`);
          html = html.replace(/<meta name="title" content=".*?">/, () => `<meta name="title" content="${title}">`);
          html = html.replace(
            /<meta name="description" content=".*?">/,
            () => `<meta name="description" content="${seoDescription}">`
          );
          html = html.replace(/<meta property="og:type" content=".*?">/, () => `<meta property="og:type" content="product">`);
          html = html.replace(/<meta property="og:title" content=".*?">/, () => `<meta property="og:title" content="${title}">`);
          html = html.replace(/<meta property="twitter:title" content=".*?">/, () => `<meta property="twitter:title" content="${title}">`);
          html = html.replace(
            /<meta property="og:description" content=".*?">/,
            () => `<meta property="og:description" content="${seoDescription}">`
          );
          html = html.replace(
            /<meta property="twitter:description" content=".*?">/,
            () => `<meta property="twitter:description" content="${seoDescription}">`
          );
          html = html.replace(
            /<meta property="og:image" content=".*?">/,
            () => `<meta property="og:image" content="${effectiveImageUrl}">`
          );
          html = html.replace(
            /<meta property="twitter:image" content=".*?">/,
            () => `<meta property="twitter:image" content="${effectiveImageUrl}">`
          );

          // Product title & specs in the rendered DOM
          html = html.replace(/Aura Herringbone Snake Chain/g, () => name);
          html = html.replace(/SAT-NK-001/g, () => sku);
          html = html.replace(/₹1,699/g, () => `₹${priceRupees.toLocaleString('en-IN')}`);
          if (compareRupees) {
            html = html.replace(/₹2,499/g, () => `₹${compareRupees.toLocaleString('en-IN')}`);
          } else {
            html = html.replace(/<span class="text-xs sm:text-sm text-gray-400 line-through">₹2,499<\/span>/g, '');
          }

          if (discountPercent > 0) {
            html = html.replace(/SAVE 32%/gi, () => `Save ${discountPercent}%`);
          } else {
            html = html.replace(/<span[^>]*>\s*Save \d+%\s*<\/span>/gi, '');
          }

          // Replace primary hero image & any template Unsplash URLs (matching both & and &amp;)
          const heroImgUrl = escapeHtml(gallery[0]?.url || effectiveRawImageUrl);
          const heroImgAlt = escapeHtml(gallery[0]?.alt || rawName);
          html = html.replace(
            /<img([^>]*id="pdp-main-image"[^>]*)>/,
            (_match, attrs: string) => {
              const updated = attrs
                .replace(/\bsrc="[^"]*"/, `src="${heroImgUrl}"`)
                .replace(/\balt="[^"]*"/, `alt="${heroImgAlt}"`);
              return `<img${updated}>`;
            }
          );
          html = html.replace(
            /https:\/\/images\.unsplash\.com\/photo-1599643478518-a784e5dc4c8f\?auto=format(?:&amp;|&)fit=crop(?:&amp;|&)w=1000(?:&amp;|&)q=80/g,
            () => heroImgUrl
          );
          html = html.replace(
            /https:\/\/images\.unsplash\.com\/photo-1599643478518-a784e5dc4c8f\?auto=format(?:&amp;|&)fit=crop(?:&amp;|&)w=800(?:&amp;|&)q=80/g,
            () => heroImgUrl
          );
          html = html.replace(
            /https:\/\/images\.unsplash\.com\/photo-1602173574767-37ac01994b2a\?auto=format(?:&amp;|&)fit=crop(?:&amp;|&)w=1000(?:&amp;|&)q=80/g,
            () => heroImgUrl
          );

          // Headline & description
          html = html.replace(
            /Silky smooth liquid gold finish that lays flush against your collarbone/g,
            () => headline
          );
          html = html.replace(
            /(<p[^>]*data-pdp-description[^>]*>)[\s\S]*?(<\/p>)/,
            (_m, open: string, close: string) => `${open}${description}${close}`
          );

          // PDP add-to-bag dataset
          html = html.replace(/data-product-id="[^"]*"/g, () => `data-product-id="${idValue}"`);
          html = html.replace(/data-product-name="[^"]*"/g, () => `data-product-name="${name}"`);
          html = html.replace(/data-product-slug="[^"]*"/g, () => `data-product-slug="${slugValue}"`);
          html = html.replace(/data-product-price="[^"]*"/g, () => `data-product-price="${pricePaise}"`);
          html = html.replace(/data-product-image="[^"]*"/g, () => `data-product-image="${heroImgUrl}"`);

          // Category breadcrumb & canonical URLs
          html = html.replace(/\/collections\/necklaces/g, () => `/collections/${category}`);
          html = html.replace(/\/products\/aura-herringbone-snake-chain/g, () => `/products/${safeSlug}`);

          // Material & craftsmanship
          const specRows = [
            `<li><strong class="font-medium text-[#14110f]">Core metal:</strong> ${material}</li>`,
            `<li><strong class="font-medium text-[#14110f]">Finish:</strong> ${finish}</li>`,
            dimensions
              ? `<li><strong class="font-medium text-[#14110f]">Dimensions:</strong> ${dimensions}</li>`
              : '',
            weightGrams
              ? `<li><strong class="font-medium text-[#14110f]">Weight:</strong> ${weightGrams} grams</li>`
              : '',
            warranty
              ? `<li><strong class="font-medium text-[#14110f]">Warranty:</strong> ${warranty}</li>`
              : '',
            `<li><strong class="font-medium text-[#14110f]">Skin compatibility:</strong> Nickel-free, lead-free, hypoallergenic</li>`,
            `<li><strong class="font-medium text-[#14110f]">Country of origin:</strong> India</li>`,
            `<li><strong class="font-medium text-[#14110f]">Packed &amp; marketed by:</strong> Satvastones Jewellery (Anirudh A Verma), Chala, Vapi, Gujarat – 396191</li>`
          ].join('');
          html = html.replace(
            /(<ul[^>]*data-pdp-specs[^>]*>)[\s\S]*?(<\/ul>)/,
            (_m, open: string, close: string) => `${open}${specRows}${close}`
          );

          if (careInstructions.length) {
            const careRows = careInstructions.map((tip) => `<li>${tip}</li>`).join('');
            html = html.replace(
              /(<ul[^>]*data-pdp-care[^>]*>)[\s\S]*?(<\/ul>)/,
              (_m, open: string, close: string) => `${open}${careRows}${close}`
            );
          }

          // Gallery thumbnails and counter
          const thumbTag = html.match(/<div[^>]*data-pdp-thumbs[^>]*>/)?.[0] || '';
          const thumbCid = (thumbTag.match(/data-astro-cid-[a-z0-9]+/) || [''])[0];
          const cidAttr = thumbCid ? ` ${thumbCid}` : '';
          const thumbMarkup = gallery
            .map(
              (img, index) =>
                `<button type="button" data-img-src="${escapeHtml(img.url)}" data-img-alt="${escapeHtml(
                  img.alt
                )}" data-active="${index === 0 ? 'true' : 'false'}" class="pdp-thumb aspect-[4/5] cursor-pointer overflow-hidden border border-transparent bg-[#f1ece3] transition-opacity hover:opacity-80" aria-label="View image ${index + 1} of ${name}"${cidAttr}><img src="${escapeHtml(
                  img.url
                )}" alt="${escapeHtml(img.alt)}" width="200" height="250" loading="lazy" decoding="async" class="h-full w-full object-cover" /></button>`
            )
            .join('');
          html = html.replace(
            /(<div[^>]*data-pdp-thumbs[^>]*>)[\s\S]*?(<\/div>)/,
            (_m, open: string, close: string) => `${open}${thumbMarkup}${close}`
          );
          html = html.replace(
            /(<span[^>]*data-pdp-counter[^>]*>)[\s\S]*?(<\/span>)/,
            (_m, open: string, close: string) =>
              `${open}01 / ${String(gallery.length).padStart(2, '0')}${close}`
          );

          // Structured data: keep Product & BreadcrumbList schema 100% accurate for Google Merchant Center
          const ratingValue = Number(meta.rating);
          const reviewCount = Math.floor(Number(meta.reviewCount) || 0);
          const nextYearDate = new Date();
          nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
          const priceValidUntil = nextYearDate.toISOString().slice(0, 10);

          html = updateJsonLdNodes(html, 'Product', (node) => {
            node.name = rawName;
            node.description = rawDescription;
            node.sku = rawSku;
            node.mpn = rawSku;
            node.image = gallery.map((img) => img.url);
            node.material = materialRaw;
            node.offers = node.offers && typeof node.offers === 'object' ? node.offers : {};
            node.offers.url = `${SITE_URL}/products/${safeSlug}`;
            node.offers.price = (pricePaise / 100).toFixed(2);
            node.offers.priceValidUntil = priceValidUntil;
            node.offers.availability =
              Number(row.in_stock) === 0
                ? 'https://schema.org/OutOfStock'
                : 'https://schema.org/InStock';
            if (node.offers.shippingDetails?.shippingRate) {
              node.offers.shippingDetails.shippingRate.value = pricePaise >= 49900 ? '0.00' : '49.00';
            }
            if (Number.isFinite(ratingValue) && ratingValue > 0 && reviewCount > 0) {
              node.aggregateRating = {
                '@type': 'AggregateRating',
                ratingValue: Math.min(5, ratingValue),
                reviewCount,
                bestRating: '5',
                worstRating: '1'
              };
            } else {
              delete node.aggregateRating;
            }
          });

          html = updateJsonLdNodes(html, 'BreadcrumbList', (node) => {
            node.itemListElement = [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
              { '@type': 'ListItem', position: 3, name: category.replace(/-/g, ' '), item: `${SITE_URL}/collections/${category}` },
              { '@type': 'ListItem', position: 4, name: rawName, item: `${SITE_URL}/products/${safeSlug}` }
            ];
          });

          return new Response(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'X-Content-Type-Options': 'nosniff'
            }
          });
        } catch {
          return render404Response(request, env);
        }
        });
      }
    }

    // 4. Dynamic Journal Article SSR (/journal/<slug>) from Cloudflare D1 (Edge Cached for 200 OK only)
    if (url.pathname.startsWith('/journal/') && url.pathname !== '/journal/') {
      const slug = url.pathname.replace('/journal/', '').replace(/\/$/, '').trim();
      if (slug === '_template') {
        return render404Response(request, env);
      }
      if (slug && env.DB) {
        return withEdgeCache(request, ctx, HTML_CACHE_CONTROL, false, async () => {
        try {
          const row: any = await env.DB.prepare(
            "SELECT * FROM blogs WHERE slug = ? AND status = 'published' LIMIT 1"
          )
            .bind(slug)
            .first();

          if (!row) {
            return render404Response(request, env);
          }

          const templateReqUrl = new URL('/journal/_template/index.html', request.url);
          const templateRes = await env.ASSETS.fetch(templateReqUrl);
          if (!templateRes.ok) {
            return new Response('Journal template unavailable.', { status: 502 });
          }

          let html = await templateRes.text();

          const rawTitle = String(row.title || 'Satvastones Journal');
          const rawExcerpt = String(row.excerpt || '').trim() || rawTitle;
          const rawSeoTitle = String(row.seo_title || '').trim() || `${rawTitle} | Satvastones Journal`;
          const rawSeoDesc = String(row.seo_description || '').trim() || rawExcerpt;
          const rawAuthor = String(row.author || 'Satvastones Editorial');
          const rawCategory = String(row.category || 'Styling Guide');
          const rawCover = row.cover_image ? safeHttpUrl(row.cover_image, FALLBACK_IMAGE) : FALLBACK_IMAGE;
          const readTime = Number(row.read_time_minutes) || estimateReadTimeMinutes(row.content || '');
          const publishedIso = row.published_at || row.created_at || new Date().toISOString();
          const modifiedIso = row.updated_at || publishedIso;
          const publishedDisplay = formatReadableDate(publishedIso);
          const canonical = `${SITE_URL}/journal/${encodeURIComponent(slug)}`;

          let tags: string[] = [];
          try {
            const parsed = JSON.parse(row.tags_json || '[]');
            if (Array.isArray(parsed)) tags = parsed.filter((t) => typeof t === 'string' && t.trim());
          } catch {
            tags = [];
          }

          const renderedContentHtml = renderEditorialMarkdown(String(row.content || ''));
          const safeTitle = escapeHtml(rawSeoTitle);
          const safeDesc = escapeHtml(rawSeoDesc);
          const safeCover = escapeHtml(rawCover);

          html = html.replace(/<title>.*?<\/title>/, () => `<title>${safeTitle}</title>`);
          html = html.replace(/<meta name="title" content=".*?">/, () => `<meta name="title" content="${safeTitle}">`);
          html = html.replace(/<meta name="description" content=".*?">/, () => `<meta name="description" content="${safeDesc}">`);
          html = html.replace(/<link rel="canonical" href=".*?">/, () => `<link rel="canonical" href="${escapeHtml(canonical)}">`);
          html = html.replace(/<meta property="og:type" content=".*?">/, () => `<meta property="og:type" content="article">`);
          html = html.replace(/<meta property="og:url" content=".*?">/, () => `<meta property="og:url" content="${escapeHtml(canonical)}">`);
          html = html.replace(/<meta property="og:title" content=".*?">/, () => `<meta property="og:title" content="${safeTitle}">`);
          html = html.replace(/<meta property="og:description" content=".*?">/, () => `<meta property="og:description" content="${safeDesc}">`);
          html = html.replace(/<meta property="og:image" content=".*?">/, () => `<meta property="og:image" content="${safeCover}">`);
          html = html.replace(/<meta property="twitter:url" content=".*?">/, () => `<meta property="twitter:url" content="${escapeHtml(canonical)}">`);
          html = html.replace(/<meta property="twitter:title" content=".*?">/, () => `<meta property="twitter:title" content="${safeTitle}">`);
          html = html.replace(/<meta property="twitter:description" content=".*?">/, () => `<meta property="twitter:description" content="${safeDesc}">`);
          html = html.replace(/<meta property="twitter:image" content=".*?">/, () => `<meta property="twitter:image" content="${safeCover}">`);

          // Hydrate DOM placeholders
          html = html.replace(
            /(<span[^>]*data-blog-category[^>]*>)[\s\S]*?(<\/span>)/,
            (_m, open: string, close: string) => `${open}${escapeHtml(rawCategory)}${close}`
          );
          html = html.replace(
            /(<li[^>]*data-blog-breadcrumb-title[^>]*>)[\s\S]*?(<\/li>)/,
            (_m, open: string, close: string) => `${open}${escapeHtml(rawTitle)}${close}`
          );
          html = html.replace(
            /(<h1[^>]*data-blog-title[^>]*>)[\s\S]*?(<\/h1>)/,
            (_m, open: string, close: string) => `${open}${escapeHtml(rawTitle)}${close}`
          );
          html = html.replace(
            /(<p[^>]*data-blog-excerpt[^>]*>)[\s\S]*?(<\/p>)/,
            (_m, open: string, close: string) => `${open}${escapeHtml(rawExcerpt)}${close}`
          );
          html = html.replace(
            /(<span[^>]*data-blog-author[^>]*>)[\s\S]*?(<\/span>)/,
            (_m, open: string, close: string) => `${open}${escapeHtml(rawAuthor)}${close}`
          );
          html = html.replace(
            /(<time[^>]*data-blog-date[^>]*>)[\s\S]*?(<\/time>)/,
            (_m, open: string, close: string) => `${open}${escapeHtml(publishedDisplay)}${close}`
          );
          html = html.replace(
            /(<span[^>]*data-blog-readtime[^>]*>)[\s\S]*?(<\/span>)/,
            (_m, open: string, close: string) => `${open}${readTime} min read${close}`
          );
          if (row.cover_image) {
            html = html.replace(
              /(<div[^>]*data-blog-cover-wrap[^>]*>)[\s\S]*?(<\/div>)/,
              (_m, open: string, close: string) =>
                `${open}<img src="${safeCover}" alt="${escapeHtml(rawTitle)}" class="h-full w-full object-cover" loading="eager" decoding="async" />${close}`
            );
          } else {
            html = html.replace(/<figure[^>]*data-blog-cover-figure[^>]*>[\s\S]*?<\/figure>/, '');
          }
          html = html.replace(
            /(<div[^>]*data-blog-body[^>]*>)[\s\S]*?(<\/div>)/,
            (_m, open: string, close: string) => `${open}${renderedContentHtml}${close}`
          );
          const tagsMarkup = tags
            .map(
              (tag) =>
                `<span class="border border-[#e5ded3] bg-[#f4efe7] px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-[#5f5851]">#${escapeHtml(tag)}</span>`
            )
            .join('');
          html = html.replace(
            /(<div[^>]*data-blog-tags[^>]*>)[\s\S]*?(<\/div>)/,
            (_m, open: string, close: string) => `${open}${tagsMarkup}${close}`
          );

          // Update BlogPosting & BreadcrumbList JSON-LD
          html = updateJsonLdNodes(html, 'BlogPosting', (node) => {
            node.headline = rawTitle;
            node.description = rawSeoDesc;
            node.image = [rawCover];
            node.datePublished = publishedIso;
            node.dateModified = modifiedIso;
            node.articleSection = rawCategory;
            node.keywords = tags.join(', ');
            node.author = { '@type': 'Person', name: rawAuthor };
            node.mainEntityOfPage = { '@type': 'WebPage', '@id': canonical };
          });
          html = updateJsonLdNodes(html, 'BreadcrumbList', (node) => {
            node.itemListElement = [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Journal', item: `${SITE_URL}/journal` },
              { '@type': 'ListItem', position: 3, name: rawTitle, item: canonical }
            ];
          });

          return new Response(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'X-Content-Type-Options': 'nosniff'
            }
          });
        } catch {
          return render404Response(request, env);
        }
        });
      }
    }

    // 5. Dynamic Live D1 Products & ItemList JSON-LD for /shop, /collections/*, /journal, and SEO landing pages
    const normalizedPath = url.pathname.replace(/\/$/, '') || '/';
    const isLiveLandingPage =
      normalizedPath === '/gifts-for-girlfriend-under-500' ||
      normalizedPath === '/anti-tarnish-jewellery-vapi' ||
      normalizedPath === '/affordable-anti-tarnish-jewellery-india';

    if (
      env.DB &&
      (normalizedPath === '/shop' ||
        url.pathname.startsWith('/collections/') ||
        normalizedPath === '/journal' ||
        isLiveLandingPage)
    ) {
      return withEdgeCache(request, ctx, HTML_CACHE_CONTROL, false, async () => {
      try {
        const assetRes = await fetchStaticAssetClean(request);
        if (assetRes.ok && (assetRes.headers.get('content-type') || '').includes('text/html')) {
          let html = await assetRes.text();

          if (normalizedPath === '/journal') {
            const blogs = await loadLivePublishedBlogs(env.DB);
            html = updateJsonLdNodes(html, 'ItemList', (node) => {
              node.numberOfItems = blogs.length;
              node.itemListElement = blogs.map((b, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                url: `${SITE_URL}/journal/${b.slug}`,
                name: b.title
              }));
            });
          } else {
            const allProducts = await loadLivePublishedProducts(env.DB);
            const colSlug = url.pathname.startsWith('/collections/')
              ? url.pathname.replace('/collections/', '').replace(/\/$/, '').trim()
              : '';
            let matching = colSlug
              ? colSlug === 'bestsellers' || colSlug === 'new-arrivals'
                ? allProducts
                : colSlug === 'gifts-for-girlfriend-under-500'
                  ? allProducts.filter((p) => p.inStock && p.pricePaise <= 50000).sort((a, b) => a.pricePaise - b.pricePaise)
                  : colSlug === 'rings-under-100'
                    ? (() => {
                        const rings = allProducts.filter((p) => p.category === 'rings').sort((a, b) => a.pricePaise - b.pricePaise);
                        return rings.length ? rings : allProducts.filter((p) => p.pricePaise <= 50000).sort((a, b) => a.pricePaise - b.pricePaise);
                      })()
                    : colSlug === 'anti-tarnish-minimal-rings'
                      ? (() => {
                          const rings = allProducts.filter((p) => p.category === 'rings');
                          return rings.length ? rings : allProducts;
                        })()
                      : allProducts.filter((p) => p.category === colSlug)
              : allProducts;

            if (colSlug && matching.length > 0) {
              const prices = matching.map((p) => Math.round(p.pricePaise / 100)).filter((n) => n > 0);
              if (prices.length) {
                const lowPrice = String(Math.min(...prices));
                const highPrice = String(Math.max(...prices));
                html = updateJsonLdNodes(html, 'Product', (node) => {
                  if (node.offers && node.offers['@type'] === 'AggregateOffer') {
                    node.offers.lowPrice = lowPrice;
                    node.offers.highPrice = highPrice;
                    node.offers.offerCount = matching.length;
                    node.offers.availability = 'https://schema.org/InStock';
                  }
                });
              }
            }

            if (normalizedPath === '/gifts-for-girlfriend-under-500') {
              const under500 = allProducts
                .filter((p) => p.inStock && p.pricePaise <= 50000)
                .sort((a, b) => a.pricePaise - b.pricePaise);
              matching = under500.length ? under500 : allProducts.slice(0, 8);
            } else if (isLiveLandingPage) {
              matching = allProducts.filter((p) => p.inStock).slice(0, 8);
            }

            if (isLiveLandingPage) {
              const cardsHtml = matching.length
                ? matching
                    .map((p) => {
                      const priceRupees = Math.round(p.pricePaise / 100);
                      const compareRupees = p.compareAtPricePaise ? Math.round(p.compareAtPricePaise / 100) : null;
                      const discountPercent =
                        p.compareAtPricePaise && p.compareAtPricePaise > p.pricePaise
                          ? Math.round(((p.compareAtPricePaise - p.pricePaise) / p.compareAtPricePaise) * 100)
                          : 0;
                      const badgeHtml =
                        normalizedPath === '/gifts-for-girlfriend-under-500' && priceRupees <= 500
                          ? `<span class="bg-[#14110f] px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.18em] text-[#f6f1e8]">Under ₹500</span>`
                          : '';
                      const discHtml =
                        discountPercent > 0
                          ? `<span class="bg-[#c5a059] px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.18em] text-white">−${discountPercent}%</span>`
                          : '';
                      return `
                        <div class="product-card group relative flex flex-col">
                          <a href="/products/${encodeURIComponent(p.slug)}" class="relative block aspect-[3/4] overflow-hidden bg-[#f1ece3]" aria-label="${escapeHtml(p.name)}">
                            ${badgeHtml || discHtml ? `<div class="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">${badgeHtml}${discHtml}</div>` : ''}
                            <img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
                          </a>
                          <div class="flex flex-1 flex-col gap-2 pt-3.5">
                            <h3 class="font-serif text-[15px] leading-snug text-[#14110f] sm:text-base">
                              <a href="/products/${encodeURIComponent(p.slug)}">${escapeHtml(p.name)}</a>
                            </h3>
                            <div class="mt-auto flex items-baseline gap-2">
                              <span class="text-sm font-medium text-[#14110f]">₹${priceRupees.toLocaleString('en-IN')}</span>
                              ${compareRupees ? `<span class="text-[11px] text-[#a39a91] line-through">₹${compareRupees.toLocaleString('en-IN')}</span>` : ''}
                            </div>
                          </div>
                        </div>`;
                    })
                    .join('')
                : `<p class="col-span-full py-10 text-center text-sm text-[#5f5851]">Browse our latest pieces in the <a href="/shop" class="underline">live shop</a>.</p>`;

              html = html.replace(
                /(<div[^>]*data-live-products="[^"]*"[^>]*>)[\s\S]*?(<\/div>)/,
                (_m, open: string, close: string) =>
                  `${open.replace(/>$/, ' data-ssr-hydrated="true">')}${cardsHtml}${close}`
              );
            }

            html = updateJsonLdNodes(html, 'ItemList', (node) => {
              node.numberOfItems = matching.length;
              node.itemListElement = matching.map((p, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                url: `${SITE_URL}/products/${p.slug}`,
                name: p.name,
                image: p.imageUrl
              }));
            });
          }

          return new Response(html, {
            status: 200,
            headers: {
              'Content-Type': 'text/html; charset=utf-8',
              'X-Content-Type-Options': 'nosniff'
            }
          });
        }
        return assetRes;
      } catch {
        return env.ASSETS.fetch(request);
      }
      });
    }

    // Serve all static pages via Cloudflare Assets (200 OK directly without 307 trailing-slash redirects)
    try {
      const assetRes = await fetchStaticAssetClean(request);
      if (assetRes.status === 404) {
        const resHeaders = new Headers(assetRes.headers);
        resHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        resHeaders.set('Cloudflare-CDN-Cache-Control', 'no-cache');
        resHeaders.set('X-Robots-Tag', 'noindex, nofollow');
        return new Response(assetRes.body, {
          status: 404,
          statusText: assetRes.statusText,
          headers: resHeaders
        });
      }
      return assetRes;
    } catch {
      return new Response('Static asset unavailable.', { status: 500 });
    }
  }
};
