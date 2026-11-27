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
import * as whatsappLeadsHandler from '../functions/api/whatsapp-leads';
import { applyCorsPolicy, escapeHtml, isAllowedOrigin, safeHttpUrl } from './lib/http';
import {
  computeLatestContentDate,
  filterCollectionProducts,
  generateGoogleMerchantFeedXml,
  generateLlmsFullTxt,
  generateLlmsTxt,
  generateSitemapXml,
  inferProductColor,
  type FeedBlog,
  type FeedProduct
} from './lib/feeds';
import { notifyIndexNow } from './lib/indexnow';
import { estimateReadTimeMinutes, renderEditorialMarkdown } from './lib/markdown';

export interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
  DB: any;
  R2_BUCKET?: any;
  ENVIRONMENT?: string;
  INDEXNOW_KEY?: string;
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

async function computeStrongEtag(body: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', body);
  const bytes = new Uint8Array(hashBuffer);
  let hex = '';
  for (let i = 0; i < 12; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return `"${hex}"`;
}

function toHttpDate(value?: string | Date | null): string | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toUTCString();
}

function normalizeEtagValue(tag: string): string {
  return tag.trim().replace(/^W\//i, '');
}

function isConditionalNotModified(
  request: Request,
  etag: string | null,
  lastModified: string | null
): boolean {
  const ifNoneMatch = request.headers.get('If-None-Match');
  if (ifNoneMatch) {
    if (!etag) return false;
    const normalizedTarget = normalizeEtagValue(etag);
    return ifNoneMatch
      .split(',')
      .some((candidate) => candidate.trim() === '*' || normalizeEtagValue(candidate) === normalizedTarget);
  }

  const ifModifiedSince = request.headers.get('If-Modified-Since');
  if (ifModifiedSince && lastModified) {
    const imsMs = Date.parse(ifModifiedSince);
    const lmMs = Date.parse(lastModified);
    if (!Number.isNaN(imsMs) && !Number.isNaN(lmMs)) {
      return Math.floor(lmMs / 1000) <= Math.floor(imsMs / 1000);
    }
  }

  return false;
}

function buildNotModifiedResponse(sourceHeaders: Headers, cacheStatus: string): Response {
  const headers = new Headers();
  const preserved = ['ETag', 'Last-Modified', 'Cache-Control', 'Vary'];
  for (const name of preserved) {
    const val = sourceHeaders.get(name);
    if (val) headers.set(name, val);
  }
  headers.set('X-Satva-Cache', cacheStatus);
  return new Response(null, { status: 304, headers });
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
        if (
          isConditionalNotModified(
            request,
            cached.headers.get('ETag'),
            cached.headers.get('Last-Modified')
          )
        ) {
          return buildNotModifiedResponse(cached.headers, 'HIT');
        }
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

  const bodyBuf = await fresh.arrayBuffer();
  const headers = new Headers(fresh.headers);
  headers.set('Cache-Control', cacheControl);
  headers.delete('Cloudflare-CDN-Cache-Control');
  if (!headers.has('ETag')) {
    try {
      headers.set('ETag', await computeStrongEtag(bodyBuf));
    } catch {
      /* ignore hashing failure */
    }
  }
  headers.set('X-Satva-Cache', 'MISS');

  if (cache) {
    try {
      const toStore = new Response(bodyBuf, {
        status: fresh.status,
        statusText: fresh.statusText,
        headers: new Headers(headers)
      });
      const putPromise = cache.put(cacheKey, toStore).catch(() => {});
      if (ctx?.waitUntil) ctx.waitUntil(putPromise);
      else await putPromise;
    } catch {
      /* ignore cache write failure */
    }
  }

  if (isConditionalNotModified(request, headers.get('ETag'), headers.get('Last-Modified'))) {
    return buildNotModifiedResponse(headers, 'MISS');
  }

  return new Response(bodyBuf, {
    status: fresh.status,
    statusText: fresh.statusText,
    headers
  });
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
    if (request.method === 'DELETE') return adminAuthHandler.onRequestDelete();
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

  if (url.pathname === '/api/whatsapp-leads' || url.pathname.startsWith('/api/whatsapp-leads/')) {
    if (request.method === 'OPTIONS') return whatsappLeadsHandler.onRequestOptions();
    if (request.method === 'GET') return whatsappLeadsHandler.onRequestGet(context as any);
    if (request.method === 'POST') return whatsappLeadsHandler.onRequestPost(context as any);
    if (request.method === 'PUT') return whatsappLeadsHandler.onRequestPut(context as any);
    if (request.method === 'DELETE') return whatsappLeadsHandler.onRequestDelete(context as any);
  }

  return null;
}

function clampMetaText(value: string, maxLen: number): string {
  const clean = String(value || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const sliced = clean.slice(0, maxLen - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  const trimmed = lastSpace > Math.floor(maxLen * 0.6) ? sliced.slice(0, lastSpace) : sliced;
  return `${trimmed.replace(/[,;:\-–—]+$/, '').trim()}…`;
}

function buildBrandedTitle(primary: string, suffix = ' | Satvastones', maxLen = 60): string {
  const clean = String(primary || '').replace(/\s+/g, ' ').trim();
  if (`${clean}${suffix}`.length <= maxLen) return `${clean}${suffix}`;
  const budget = Math.max(18, maxLen - suffix.length);
  const sliced = clean.slice(0, budget);
  const lastSpace = sliced.lastIndexOf(' ');
  const base = (lastSpace > Math.floor(budget * 0.55) ? sliced.slice(0, lastSpace) : sliced)
    .replace(/[,;:\-–—]+$/, '')
    .trim();
  return `${base}${suffix}`;
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

const HTML_CSP =
  "default-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self'; script-src 'self' 'unsafe-inline' https://checkout.razorpay.com https://widget.cloudinary.com https://upload-widget.cloudinary.com https://*.cloudinary.com https://www.googletagmanager.com https://accounts.google.com; frame-src 'self' https://upload-widget.cloudinary.com https://widget.cloudinary.com https://*.cloudinary.com https://api.razorpay.com https://checkout.razorpay.com https://accounts.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://*.cloudinary.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: https://*.cloudinary.com https://res.cloudinary.com; media-src 'self' blob: https: https://*.cloudinary.com https://res.cloudinary.com; connect-src 'self' https://api.razorpay.com https://lumberjack.razorpay.com https://api.cloudinary.com https://upload-widget.cloudinary.com https://widget.cloudinary.com https://*.cloudinary.com https://res.cloudinary.com https://*.supabase.co https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com https://accounts.google.com; child-src 'self' blob: https://upload-widget.cloudinary.com https://widget.cloudinary.com https://*.cloudinary.com;";

function optimizeSsrImage(url: string, width = 450): string {
  if (!url) return url;
  if (url.includes('res.cloudinary.com') && url.includes('/image/upload/')) {
    const parts = url.split('/image/upload/');
    if (parts.length === 2) {
      const rest = parts[1].replace(/^(?:(?:[a-z]{1,3}_[^/]+)(?:\/|$))+/i, '');
      return `${parts[0]}/image/upload/f_auto,q_auto,w_${width},c_limit/${rest}`;
    }
  }
  return url;
}

function replaceBalancedDiv(html: string, openTagRegex: RegExp, newInnerHtml: string, addAttr?: string): string {
  const match = openTagRegex.exec(html);
  if (!match) return html;
  const openStart = match.index;
  const openEnd = openStart + match[0].length;
  let depth = 1;
  const tagRegex = /<\/?div\b[^>]*>/gi;
  tagRegex.lastIndex = openEnd;
  let closeStart = -1;
  let m: RegExpExecArray | null;
  while ((m = tagRegex.exec(html)) !== null) {
    if (m[0].startsWith('</')) {
      depth -= 1;
      if (depth === 0) {
        closeStart = m.index;
        break;
      }
    } else if (!m[0].endsWith('/>')) {
      depth += 1;
    }
  }
  if (closeStart === -1) return html;
  const openTag = addAttr && !match[0].includes(addAttr) ? match[0].replace(/>$/, ` ${addAttr}>`) : match[0];
  return html.slice(0, openStart) + openTag + newInnerHtml + html.slice(closeStart);
}

function renderSsrProductCard(p: FeedProduct, badgeText = ''): string {
  const priceRupees = Math.round(p.pricePaise / 100);
  const compareRupees = p.compareAtPricePaise ? Math.round(p.compareAtPricePaise / 100) : null;
  const discountPercent =
    p.compareAtPricePaise && p.compareAtPricePaise > p.pricePaise
      ? Math.round(((p.compareAtPricePaise - p.pricePaise) / p.compareAtPricePaise) * 100)
      : 0;
  const badgeHtml = badgeText
    ? `<span class="bg-[#14110f] px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.18em] text-[#f6f1e8]">${escapeHtml(badgeText)}</span>`
    : '';
  const discHtml =
    discountPercent > 0
      ? `<span class="bg-[#c5a059] px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.18em] text-white">−${discountPercent}%</span>`
      : '';
  const img450 = escapeHtml(optimizeSsrImage(p.imageUrl, 450));
  const srcset = `${escapeHtml(optimizeSsrImage(p.imageUrl, 300))} 300w, ${img450} 450w, ${escapeHtml(optimizeSsrImage(p.imageUrl, 600))} 600w`;
  return `
    <div class="shop-item" data-price="${p.pricePaise}" data-name="${escapeHtml(p.name)}">
      <div class="product-card group relative flex flex-col" data-product-card>
        <a href="/products/${encodeURIComponent(p.slug)}" class="relative block aspect-[3/4] overflow-hidden bg-[#f1ece3]" aria-label="${escapeHtml(p.name)}">
          ${badgeHtml || discHtml ? `<div class="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">${badgeHtml}${discHtml}</div>` : ''}
          <img src="${img450}" srcset="${srcset}" sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 320px" alt="${escapeHtml(p.name)}" width="400" height="533" loading="lazy" decoding="async" class="product-card-image h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </a>
        <div class="flex flex-1 flex-col gap-2 pt-3.5">
          <h3 class="font-serif text-[15px] leading-snug text-[#14110f] sm:text-base">
            <a href="/products/${encodeURIComponent(p.slug)}">${escapeHtml(p.name)}</a>
          </h3>
          <p class="line-clamp-1 text-[9px] uppercase tracking-[0.14em] text-[#8b837a]">${escapeHtml(p.material || '316L Surgical Stainless Steel + 18K Gold PVD')}</p>
          <div class="mt-auto flex items-baseline gap-2">
            <span class="text-sm font-medium text-[#14110f]">₹${priceRupees.toLocaleString('en-IN')}</span>
            ${compareRupees && compareRupees > priceRupees ? `<span class="text-[11px] text-[#a39a91] line-through">₹${compareRupees.toLocaleString('en-IN')}</span>` : ''}
          </div>
        </div>
      </div>
    </div>`;
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
  if (!headers.has('Cross-Origin-Opener-Policy')) {
    headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  }
  const contentType = headers.get('Content-Type') || '';
  if (contentType.includes('text/html') && !headers.has('Content-Security-Policy')) {
    headers.set('Content-Security-Policy', HTML_CSP);
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
        '/policies/terms': '/terms-and-conditions',
        '/gifts-for-girlfriend-under-500': '/collections/gifts-for-girlfriend-under-500'
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
          // Automatically purge edge cache & stream IndexNow pings whenever an admin mutates products or blogs
          if (
            apiResponse.status < 400 &&
            (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE')
          ) {
            if (url.pathname === '/api/products' || url.pathname.startsWith('/api/products/')) {
              const slugParam = url.searchParams.get('slug');
              const purgeTargets = [
                '/',
                '/api/products',
                '/shop',
                '/stack-builder',
                '/llms.txt',
                '/llms-full.txt',
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
              const indexNowTargets: string[] = ['/', '/shop'];
              if (slugParam) indexNowTargets.push(`/products/${slugParam}`);
              try {
                const cloned = apiResponse.clone();
                const data: any = await cloned.json().catch(() => null);
                const slugsToTouch = [
                  data?.slug,
                  data?.product?.slug,
                  data?.previousSlug,
                  data?.deletedSlug,
                  ...(Array.isArray(data?.deletedSlugs) ? data.deletedSlugs : [])
                ].filter((s: unknown): s is string => typeof s === 'string' && s.trim().length > 0);
                for (const s of slugsToTouch) {
                  purgeTargets.push(`/products/${s}`);
                  indexNowTargets.push(`/products/${s}`);
                }
                const categoriesToTouch = [
                  data?.product?.category,
                  data?.previousCategory,
                  data?.deletedCategory
                ].filter((c: unknown): c is string => typeof c === 'string' && ALLOWED_CATEGORIES.has(c));
                for (const cat of categoriesToTouch) {
                  indexNowTargets.push(`/collections/${cat}`);
                  if (cat === 'rings') {
                    indexNowTargets.push('/collections/anti-tarnish-minimal-rings', '/collections/rings-under-100');
                  }
                }
                if (Number(data?.product?.pricePaise) > 0 && Number(data?.product?.pricePaise) <= 49900) {
                  indexNowTargets.push('/collections/gifts-for-girlfriend-under-500');
                }
              } catch {
                /* ignore */
              }
              const backgroundJob = Promise.all([
                purgeEdgePaths(url.origin, purgeTargets),
                notifyIndexNow(env, request.url, indexNowTargets)
              ]);
              if (ctx?.waitUntil) ctx.waitUntil(backgroundJob);
            } else if (url.pathname === '/api/blogs' || url.pathname.startsWith('/api/blogs/')) {
              const slugParam = url.searchParams.get('slug');
              const purgeTargets = [
                '/api/blogs',
                '/journal',
                '/sitemap.xml',
                '/llms.txt',
                '/llms-full.txt',
                ...(slugParam ? [`/journal/${slugParam}`] : [])
              ];
              const indexNowTargets: string[] = [];
              try {
                const cloned = apiResponse.clone();
                const data: any = await cloned.json().catch(() => null);
                const currentSlug = typeof data?.blog?.slug === 'string' ? data.blog.slug.trim() : '';
                const currentStatus = String(data?.blog?.status || '');
                const prevSlug = typeof data?.previousSlug === 'string' ? data.previousSlug.trim() : '';
                const prevStatus = String(data?.previousStatus || '');
                const deletedSlug = typeof data?.deletedSlug === 'string' ? data.deletedSlug.trim() : '';
                const deletedStatus = String(data?.deletedStatus || '');

                if (currentSlug) purgeTargets.push(`/journal/${currentSlug}`);
                if (prevSlug) purgeTargets.push(`/journal/${prevSlug}`);
                if (deletedSlug) purgeTargets.push(`/journal/${deletedSlug}`);

                if (request.method === 'DELETE') {
                  const removedSlug = deletedSlug || slugParam || '';
                  if (removedSlug && deletedStatus !== 'draft') {
                    indexNowTargets.push(`/journal/${removedSlug}`, '/journal');
                  }
                } else {
                  if (currentSlug && currentStatus === 'published') {
                    indexNowTargets.push(`/journal/${currentSlug}`, '/journal');
                  }
                  if (prevStatus === 'published' && currentStatus === 'draft') {
                    const unpublishedSlug = prevSlug || currentSlug;
                    if (unpublishedSlug) indexNowTargets.push(`/journal/${unpublishedSlug}`, '/journal');
                  }
                  if (prevSlug && prevStatus === 'published') {
                    indexNowTargets.push(`/journal/${prevSlug}`);
                  }
                }
              } catch {
                /* ignore */
              }
              const backgroundJob = Promise.all([
                purgeEdgePaths(url.origin, purgeTargets),
                notifyIndexNow(env, request.url, indexNowTargets)
              ]);
              if (ctx?.waitUntil) ctx.waitUntil(backgroundJob);
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
        const lastMod = toHttpDate(computeLatestContentDate(products, blogs));
        const headers: Record<string, string> = {
          'Content-Type': 'application/xml; charset=utf-8',
          'X-Content-Type-Options': 'nosniff'
        };
        if (lastMod) headers['Last-Modified'] = lastMod;
        return new Response(xml, {
          status: 200,
          headers
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

    // 2b. Dynamic /llms.txt & /llms-full.txt directly from live Cloudflare D1 (GEO for ChatGPT, Perplexity, Claude, Gemini)
    if ((url.pathname === '/llms.txt' || url.pathname === '/llms-full.txt') && env.DB) {
      return withEdgeCache(request, ctx, FEED_CACHE_CONTROL, false, async () => {
        const [products, blogs] = await Promise.all([
          loadLivePublishedProducts(env.DB),
          loadLivePublishedBlogs(env.DB)
        ]);
        const body =
          url.pathname === '/llms-full.txt'
            ? generateLlmsFullTxt(products, blogs)
            : generateLlmsTxt(products, blogs);
        return new Response(body, {
          status: 200,
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
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

          const lowerNameDesc = `${rawName} ${rawDescription}`.toLowerCase();
          const isHoopOrBali =
            category === 'earrings' &&
            (lowerNameDesc.includes('hoop') ||
              lowerNameDesc.includes('bali') ||
              lowerNameDesc.includes('huggie') ||
              lowerNameDesc.includes('ring') ||
              lowerNameDesc.includes('cuff'));

          const priceText = `₹${priceRupees.toLocaleString('en-IN')}`;
          const candidatePdpTitle =
            category === 'earrings'
              ? isHoopOrBali
                ? `${rawName} — Gold Bali Hoops (${priceText})`
                : `${rawName} — Nickel-Free Earrings (${priceText})`
              : category === 'rings'
                ? `${rawName} — 18K Gold Ring (${priceText})`
                : `${rawName} — 18K Gold PVD (${priceText})`;

          const rawCustomTitle = typeof meta.seoTitle === 'string' ? meta.seoTitle.trim() : '';
          const finalRawTitle = rawCustomTitle
            ? clampMetaText(rawCustomTitle, 60)
            : candidatePdpTitle.length + ' | Satvastones'.length <= 60
              ? `${candidatePdpTitle} | Satvastones`
              : buildBrandedTitle(`${rawName} (${priceText})`, ' | Satvastones', 60);
          const title = escapeHtml(finalRawTitle);

          const generatedRawDescription =
            category === 'earrings'
              ? `Buy ${rawName} for ${priceText}. Nickel-free, hypoallergenic 18K gold-plated${isHoopOrBali ? ' Bali hoop' : ''} earrings. Free India shipping > ₹499 & COD.`
              : category === 'rings'
                ? `Buy ${rawName} for ${priceText}. Waterproof 18K gold-plated anti-tarnish ring on 316L steel that never turns fingers green. Free delivery > ₹499 & COD.`
                : `Buy ${rawName} online in India for ${priceText}. Waterproof 18K gold-plated anti-tarnish 316L steel. Free PAN-India delivery > ₹499 & COD.`;

          const rawCustomDesc = typeof meta.seoDescription === 'string' ? meta.seoDescription.trim() : '';
          const finalRawDesc = clampMetaText(rawCustomDesc || generatedRawDescription, 155);
          const seoDescription = escapeHtml(finalRawDesc);

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

          // Structured data & live D1 related/bundle hydration: zero mock 404 links & zero fake reviews
          const ratingValue = Number(meta.rating);
          const reviewCount = Math.floor(Number(meta.reviewCount) || 0);
          const nextYearDate = new Date();
          nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
          const priceValidUntil = nextYearDate.toISOString().slice(0, 10);

          // Hydrate category-specific badges & key feature bullets (Nickel-Free & Hypoallergenic / 18K Gold Plated / Sona Bali)
          const pdpBadgesHtml =
            category === 'earrings'
              ? `<span class="bg-[#f4efe7] px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-[#8d3f3d]">✦ Nickel-Free &amp; Hypoallergenic (Safe for Sensitive Ears)</span><span class="border border-[#d8c3a6] bg-[#fbf9f5] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-[#14110f]">${isHoopOrBali ? 'Gold-Plated Bali Hoop Style' : '18K Gold-Plated · Anti-Tarnish'}</span>`
              : category === 'rings'
                ? `<span class="bg-[#f4efe7] px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-[#8d3f3d]">✦ 18K Gold Plated · Anti-Tarnish</span><span class="border border-[#d8c3a6] bg-[#fbf9f5] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-[#14110f]">Real-Gold Daily Look · ₹${priceRupees.toLocaleString('en-IN')}</span>`
                : `<span class="bg-[#f4efe7] px-2.5 py-1 text-[9px] uppercase tracking-[0.18em] text-[#8d3f3d]">✦ 18K Gold Plated · Anti-Tarnish</span><span class="border border-[#d8c3a6] bg-[#fbf9f5] px-2.5 py-1 text-[9px] uppercase tracking-[0.16em] text-[#14110f]">Waterproof &amp; Skin-Safe</span>`;
          html = replaceBalancedDiv(html, /<div[^>]*data-pdp-badges[^>]*>/, pdpBadgesHtml);

          if (category === 'earrings') {
            const earringHighlights = `<li class="flex gap-2.5"><span class="mt-0.5 text-[#c5a059]" aria-hidden="true">✦</span><span><strong class="block font-medium text-[#14110f]">Nickel-Free &amp; Hypoallergenic</strong>Safe for Sensitive Ears · Zero itch</span></li><li class="flex gap-2.5"><span class="mt-0.5 text-[#c5a059]" aria-hidden="true">✦</span><span><strong class="block font-medium text-[#14110f]">${isHoopOrBali ? 'Gold-Plated Bali Hoop Earrings' : '18K Gold-Plated &amp; Anti-Tarnish'}</strong>Waterproof daily shine at ₹${priceRupees.toLocaleString('en-IN')}</span></li><li class="flex gap-2.5"><span class="mt-0.5 text-[#c5a059]" aria-hidden="true">✦</span><span><strong class="block font-medium text-[#14110f]">Featherlight All-Day Comfort</strong>Gentle on sensitive piercings</span></li><li class="flex gap-2.5"><span class="mt-0.5 text-[#c5a059]" aria-hidden="true">✦</span><span><strong class="block font-medium text-[#14110f]">Free Shipping &gt; ₹499 &amp; COD</strong>24–48h dispatch · 7-day returns</span></li>`;
            html = html.replace(
              /(<ul[^>]*data-pdp-highlights[^>]*>)[\s\S]*?(<\/ul>)/,
              (_m, o: string, c: string) => `${o}${earringHighlights}${c}`
            );
          } else if (category === 'rings') {
            const ringHighlights = `<li class="flex gap-2.5"><span class="mt-0.5 text-[#c5a059]" aria-hidden="true">✦</span><span><strong class="block font-medium text-[#14110f]">18K Gold Plated</strong>Real-gold everyday look at ₹${priceRupees.toLocaleString('en-IN')}</span></li><li class="flex gap-2.5"><span class="mt-0.5 text-[#c5a059]" aria-hidden="true">✦</span><span><strong class="block font-medium text-[#14110f]">Anti-Tarnish &amp; Waterproof</strong>Zero green finger marks</span></li><li class="flex gap-2.5"><span class="mt-0.5 text-[#c5a059]" aria-hidden="true">✦</span><span><strong class="block font-medium text-[#14110f]">Nickel-Free 316L Steel</strong>Handwash &amp; shower safe</span></li><li class="flex gap-2.5"><span class="mt-0.5 text-[#c5a059]" aria-hidden="true">✦</span><span><strong class="block font-medium text-[#14110f]">7-Day Size Exchange</strong>COD &amp; free shipping &gt; ₹499</span></li>`;
            html = html.replace(
              /(<ul[^>]*data-pdp-highlights[^>]*>)[\s\S]*?(<\/ul>)/,
              (_m, o: string, c: string) => `${o}${ringHighlights}${c}`
            );
          }

          // Hydrate Buy Box rating block honestly (only display stars when verified reviews exist)
          const ratingMarkup =
            Number.isFinite(ratingValue) && ratingValue > 0 && reviewCount > 0
              ? `<a href="#reviews" class="flex items-center gap-1.5" aria-label="Read verified customer reviews"><span class="font-medium text-[#14110f]">★ ${ratingValue.toFixed(1)}</span><span class="underline decoration-[#d8d0c4] underline-offset-2">(${reviewCount} reviews)</span></a>`
              : `<a href="#reviews" class="text-[10px] uppercase tracking-[0.14em] text-[#8d3f3d] underline decoration-[#d8c3a6] underline-offset-2">Be the first to review</a>`;
          html = replaceBalancedDiv(html, /<div[^>]*data-pdp-rating[^>]*>/, ratingMarkup);

          // Hydrate stack partner, bundle checkboxes, and related products from live D1 (eliminating 404 mock links)
          const allLiveProducts = await loadLivePublishedProducts(env.DB);
          const otherLive = allLiveProducts.filter((p) => p.id !== String(row.id) && p.slug !== safeSlug && p.inStock);
          const sameCatLive = otherLive.filter((p) => p.category === category);
          const relatedLive = (sameCatLive.length >= 2 ? sameCatLive : otherLive).slice(0, 4);
          const bundleComp = otherLive.slice(0, 2);

          const stackPartnerMarkup = bundleComp[0]
            ? `<a href="#complete-the-stack" class="group mt-6 flex items-center gap-4 border border-[#e0d7c9] bg-[#f4efe7] p-3 transition-colors hover:border-[#c5a059]"><img src="${escapeHtml(optimizeSsrImage(bundleComp[0].imageUrl, 160))}" alt="${escapeHtml(bundleComp[0].name)}" width="64" height="80" loading="lazy" class="h-16 w-14 shrink-0 object-cover" /><div class="min-w-0 flex-1"><p class="text-[9px] uppercase tracking-[0.2em] text-[#8d3f3d]">The stacking edit</p><p class="mt-0.5 truncate text-[13px] text-[#14110f]">Add ${escapeHtml(bundleComp[0].name)}</p><p class="text-[11px] text-[#6f675f]">Stack any two pieces and save 15%</p></div><span class="text-[#14110f] transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></a>`
            : '';
          html = replaceBalancedDiv(html, /<div[^>]*data-pdp-stack-partner[^>]*>/, stackPartnerMarkup);

          const currentAsFeed: FeedProduct = {
            id: String(row.id),
            name: rawName,
            slug: safeSlug,
            sku: rawSku,
            category,
            pricePaise,
            imageUrl: effectiveRawImageUrl,
            material: materialRaw,
            finish: finishRaw,
            inStock: Number(row.in_stock) !== 0
          };
          const liveBundleItems = [currentAsFeed, ...bundleComp];
          const bundleGridMarkup = liveBundleItems
            .map((item, idx) => {
              const itemImg = escapeHtml(optimizeSsrImage(item.imageUrl, 200));
              const itemRupees = Math.round(item.pricePaise / 100).toLocaleString('en-IN');
              return `<label class="group relative flex cursor-pointer items-center gap-4 border border-[#ded5c7] bg-[#fbf9f5] p-3 transition-colors has-[:checked]:border-[#14110f]"><input type="checkbox" checked ${idx === 0 ? 'disabled' : ''} class="bundle-item-check h-4 w-4 shrink-0 accent-[#14110f]" data-item-id="${escapeHtml(item.id)}" data-item-name="${escapeHtml(item.name)}" data-item-slug="${escapeHtml(item.slug)}" data-item-price="${item.pricePaise}" data-item-image="${itemImg}" aria-label="Include ${escapeHtml(item.name)} in the bundle" /><img src="${itemImg}" alt="${escapeHtml(item.name)}" width="80" height="100" loading="lazy" class="h-[84px] w-[68px] shrink-0 object-cover" /><div class="min-w-0 flex-1"><p class="text-[9px] uppercase tracking-[0.16em] text-[#8d3f3d]">${idx === 0 ? 'This piece' : 'Pairs with'}</p><p class="mt-0.5 line-clamp-2 text-[12px] leading-snug text-[#14110f]">${escapeHtml(item.name)}</p><p class="mt-1 text-[12px] font-medium">₹${itemRupees}</p></div></label>`;
            })
            .join('');
          html = replaceBalancedDiv(html, /<div[^>]*data-pdp-bundle-grid[^>]*>/, bundleGridMarkup);

          const rawBundleSum = liveBundleItems.reduce((sum, it) => sum + it.pricePaise, 0);
          const bundleDisc = liveBundleItems.length >= 2 ? Math.round(rawBundleSum * 0.15) : 0;
          const bundleFinal = rawBundleSum - bundleDisc;
          html = html.replace(
            /(<span[^>]*id="bundle-raw-val"[^>]*>)[\s\S]*?(<\/span>)/,
            (_m, o: string, c: string) => `${o}₹${Math.round(rawBundleSum / 100).toLocaleString('en-IN')}${c}`
          );
          html = html.replace(
            /(<span[^>]*id="bundle-savings-val"[^>]*>)[\s\S]*?(<\/span>)/,
            (_m, o: string, c: string) => `${o}− ₹${Math.round(bundleDisc / 100).toLocaleString('en-IN')}${c}`
          );
          html = html.replace(
            /(<span[^>]*id="bundle-final-val"[^>]*>)[\s\S]*?(<\/span>)/,
            (_m, o: string, c: string) => `${o}₹${Math.round(bundleFinal / 100).toLocaleString('en-IN')}${c}`
          );

          html = html.replace(/data-catalog-exclude="[^"]*"/, `data-catalog-exclude="${idValue}"`);
          html = html.replace(/data-catalog-grid="[^"]*"/, `data-catalog-grid="${escapeHtml(category)}"`);
          html = replaceBalancedDiv(
            html,
            /<div[^>]*data-pdp-related-grid[^>]*>/,
            relatedLive.map((p) => renderSsrProductCard(p)).join(''),
            'data-ssr-hydrated="true"'
          );

          const canonicalPdpUrl = `${SITE_URL}/products/${safeSlug}`;

          html = updateJsonLdNodes(html, 'Product', (node) => {
            node.name = rawName;
            node.description = rawDescription;
            node.sku = rawSku;
            node.mpn = rawSku;
            node.category = category;
            node.color = inferProductColor(currentAsFeed);
            node.image = gallery.map((img) => img.url);
            node.material = materialRaw;
            node.audience = { '@type': 'PeopleAudience', suggestedGender: 'female' };
            node.offers = node.offers && typeof node.offers === 'object' ? node.offers : {};
            node.offers.url = canonicalPdpUrl;
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

          html = updateJsonLdNodes(html, 'WebPage', (node) => {
            node['@id'] = `${canonicalPdpUrl}#webpage`;
            node.url = canonicalPdpUrl;
            node.name = rawName;
            node.description = rawDescription;
          });

          html = updateJsonLdNodes(html, 'BreadcrumbList', (node) => {
            node.itemListElement = [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Shop', item: `${SITE_URL}/shop` },
              { '@type': 'ListItem', position: 3, name: category.replace(/-/g, ' '), item: `${SITE_URL}/collections/${category}` },
              { '@type': 'ListItem', position: 4, name: rawName, item: `${SITE_URL}/products/${safeSlug}` }
            ];
          });

          const pdpHeaders: Record<string, string> = {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Content-Type-Options': 'nosniff'
          };
          const pdpLastMod = toHttpDate(row.updated_at || row.created_at);
          if (pdpLastMod) pdpHeaders['Last-Modified'] = pdpLastMod;

          return new Response(html, {
            status: 200,
            headers: pdpHeaders
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
          const customBlogTitle = String(row.seo_title || '').trim();
          const rawSeoTitle = customBlogTitle
            ? clampMetaText(customBlogTitle, 60)
            : buildBrandedTitle(rawTitle, ' | Satvastones', 60);
          const customBlogDesc = String(row.seo_description || '').trim();
          const baseBlogDesc = customBlogDesc || rawExcerpt;
          const rawSeoDesc = clampMetaText(
            baseBlogDesc.length < 55
              ? `${baseBlogDesc} — Read the full anti-tarnish 18K gold PVD jewellery guide from Satvastones India.`
              : baseBlogDesc,
            155
          );
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
          html = updateJsonLdNodes(html, 'WebPage', (node) => {
            if (node['@id'] && String(node['@id']).endsWith('#webpage')) {
              node['@id'] = `${canonical}#webpage`;
              node.url = canonical;
              node.name = rawSeoTitle;
              node.description = rawSeoDesc;
            }
          });
          html = html.replace(
            /<link rel="alternate" hreflang="en-in" href="[^"]*">/,
            () => `<link rel="alternate" hreflang="en-in" href="${escapeHtml(canonical)}">`
          );
          html = html.replace(
            /<link rel="alternate" hreflang="x-default" href="[^"]*">/,
            () => `<link rel="alternate" hreflang="x-default" href="${escapeHtml(canonical)}">`
          );

          const blogHeaders: Record<string, string> = {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Content-Type-Options': 'nosniff'
          };
          const blogLastMod = toHttpDate(modifiedIso);
          if (blogLastMod) blogHeaders['Last-Modified'] = blogLastMod;

          return new Response(html, {
            status: 200,
            headers: blogHeaders
          });
        } catch {
          return render404Response(request, env);
        }
        });
      }
    }

    // 5. Dynamic Live D1 Products & ItemList JSON-LD for /, /shop, /stack-builder, /collections/*, /journal, and SEO landing pages
    const normalizedPath = url.pathname.replace(/\/$/, '') || '/';
    const isLiveLandingPage =
      normalizedPath === '/gifts-for-girlfriend-under-500' ||
      normalizedPath === '/anti-tarnish-jewellery-vapi' ||
      normalizedPath === '/affordable-anti-tarnish-jewellery-india';

    if (
      env.DB &&
      (normalizedPath === '/' ||
        normalizedPath === '/shop' ||
        normalizedPath === '/stack-builder' ||
        url.pathname.startsWith('/collections/') ||
        normalizedPath === '/journal' ||
        isLiveLandingPage)
    ) {
      return withEdgeCache(request, ctx, HTML_CACHE_CONTROL, false, async () => {
      try {
        const assetRes = await fetchStaticAssetClean(request);
        if (assetRes.ok && (assetRes.headers.get('content-type') || '').includes('text/html')) {
          let html = await assetRes.text();
          let listingLastMod: string | null = null;

          if (normalizedPath === '/journal') {
            const blogs = await loadLivePublishedBlogs(env.DB);
            listingLastMod = toHttpDate(computeLatestContentDate([], blogs));
            if (blogs.length > 0) {
              const articlesHtml = blogs
                .map((b) => {
                  const dateLabel = formatReadableDate(b.publishedAt || b.updatedAt);
                  const imgHtml = b.coverImage
                    ? `<a href="/journal/${encodeURIComponent(b.slug)}" class="block aspect-[16/10] overflow-hidden bg-[#ebe4d9]"><img src="${escapeHtml(optimizeSsrImage(b.coverImage, 600))}" alt="${escapeHtml(b.title)}" loading="lazy" decoding="async" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /></a>`
                    : '';
                  return `<article class="group flex flex-col border border-[#e5ded3] bg-white transition-colors hover:border-[#c5a059]">${imgHtml}<div class="flex flex-1 flex-col p-5"><div class="flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-[#8d3f3d]"><span>${escapeHtml(b.category || 'Styling Guide')}</span>${dateLabel ? `<span class="text-[#c5a059]">·</span><time class="text-[#8a8279]">${escapeHtml(dateLabel)}</time>` : ''}</div><h2 class="mt-2 font-display text-2xl leading-snug text-[#14110f] group-hover:text-[#8d3f3d]"><a href="/journal/${encodeURIComponent(b.slug)}">${escapeHtml(b.title)}</a></h2><p class="mt-2 line-clamp-3 text-[13px] leading-relaxed text-[#5f5851]">${escapeHtml(b.excerpt || '')}</p><a href="/journal/${encodeURIComponent(b.slug)}" class="mt-auto pt-4 text-[10px] uppercase tracking-[0.16em] text-[#14110f] underline decoration-[#d8c3a6] underline-offset-4">Read guide →</a></div></article>`;
                })
                .join('');
              html = html.replace(
                /<div id="journal-loading" class="([^"]*)"/,
                (_m, cls: string) => `<div id="journal-loading" class="${cls} hidden"`
              );
              html = html.replace(
                /(<section id="journal-grid" class=")([^"]*)(">)[\s\S]*?(<\/section>)/,
                (_m, o: string, cls: string, mid: string, c: string) =>
                  `${o}${cls.replace(/\bhidden\b\s*/g, '')}${mid}${articlesHtml}${c}`
              );
            }
            html = updateJsonLdNodes(html, 'ItemList', (node) => {
              node.numberOfItems = blogs.length;
              node.itemListElement = blogs.map((b, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                url: `${SITE_URL}/journal/${b.slug}`,
                name: b.title
              }));
            });
          } else if (normalizedPath === '/stack-builder') {
            const allProducts = await loadLivePublishedProducts(env.DB);
            listingLastMod = toHttpDate(computeLatestContentDate(allProducts, []));
            const liveInStock = allProducts.filter((p) => p.inStock);
            const stepMap: Array<{ key: string; cat: string }> = [
              { key: 'necklace', cat: 'necklaces' },
              { key: 'ring', cat: 'rings' },
              { key: 'earring', cat: 'earrings' }
            ];
            stepMap.forEach(({ key, cat }, stepIdx) => {
              const exact = liveInStock.filter((p) => p.category === cat);
              const fallbackSlice = liveInStock.slice(stepIdx, stepIdx + 3);
              const stepItems = exact.length ? exact : fallbackSlice.length ? fallbackSlice : liveInStock.slice(0, 3);
              const stepMarkup = stepItems
                .map((item, idx) => {
                  const img = escapeHtml(optimizeSsrImage(item.imageUrl, 300));
                  const inr = Math.round(item.pricePaise / 100).toLocaleString('en-IN');
                  return `<label class="stack-option-card group relative flex cursor-pointer flex-col border border-[#ded5c7] bg-[#fbf9f5] p-2 transition-colors hover:border-[#b9ae9f] has-[:checked]:border-[#14110f] has-[:checked]:bg-[#f4efe7]"><input type="radio" name="stack-${key}" value="${escapeHtml(item.id)}" ${idx === 0 ? 'checked' : ''} data-name="${escapeHtml(item.name)}" data-price="${item.pricePaise}" data-image="${img}" data-slug="${escapeHtml(item.slug)}" class="sr-only stack-radio" aria-label="${escapeHtml(item.name)} — ₹${inr}" /><img src="${img}" alt="${escapeHtml(item.name)}" width="300" height="300" loading="${stepIdx === 0 ? 'eager' : 'lazy'}" decoding="async" class="aspect-square w-full bg-[#f1ece3] object-cover transition-opacity group-hover:opacity-90" /><div class="mt-2 min-w-0"><p class="line-clamp-1 text-[11px] leading-snug text-[#14110f]">${escapeHtml(item.name)}</p><p class="mt-0.5 text-[11px] font-medium text-[#8d3f3d]">₹${inr}</p></div><span class="selected-check absolute right-2 top-2 ${idx === 0 ? 'flex' : 'hidden'} h-5 w-5 items-center justify-center bg-[#14110f] text-[#f6f1e8]">✓</span></label>`;
                })
                .join('');
              html = replaceBalancedDiv(
                html,
                new RegExp(`<div[^>]*data-stack-group="${key}"[^>]*>`),
                stepMarkup
              );
            });
            const wristItems = liveInStock.filter((p) => p.category === 'bracelets' || p.category === 'bangles');
            const wristCards = (wristItems.length ? wristItems : liveInStock).slice(0, 4).map((p) => renderSsrProductCard(p)).join('');
            html = replaceBalancedDiv(
              html,
              /<div[^>]*data-stack-bracelets-grid[^>]*>/,
              wristCards,
              'data-ssr-hydrated="true"'
            );
          } else {
            const allProducts = await loadLivePublishedProducts(env.DB);
            const colSlug = url.pathname.startsWith('/collections/')
              ? url.pathname.replace('/collections/', '').replace(/\/$/, '').trim()
              : '';
            let matching = colSlug ? filterCollectionProducts(allProducts, colSlug) : allProducts;
            listingLastMod = toHttpDate(
              computeLatestContentDate(matching.length ? matching : allProducts, [])
            );

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
                html = html.replace(
                  /(<span[^>]*data-collection-starting-price[^>]*>)[\s\S]*?(<\/span>)/,
                  (_m, o: string, c: string) => `${o}Starting at ₹${Number(lowPrice).toLocaleString('en-IN')}${c}`
                );
                html = html.replace(
                  /(<strong[^>]*data-collection-low-inline[^>]*>)[\s\S]*?(<\/strong>)/g,
                  (_m, o: string, c: string) => `${o}₹${Number(lowPrice).toLocaleString('en-IN')}${c}`
                );
              }
            }

            if (isLiveLandingPage || normalizedPath === '/') {
              matching = allProducts.filter((p) => p.inStock).slice(0, 8);
            }

            const cardBadgeFor = (p: FeedProduct) => {
              if (colSlug === 'gifts-for-girlfriend-under-500' && p.pricePaise <= 49900) return 'Under ₹500';
              if (colSlug === 'earrings' || p.category === 'earrings') return 'Nickel-Free';
              if (colSlug === 'rings' || colSlug === 'anti-tarnish-minimal-rings') return '18K Gold Plated';
              return '';
            };

            const buildCards = (items: FeedProduct[]) =>
              items.length
                ? items.map((p) => renderSsrProductCard(p, cardBadgeFor(p))).join('')
                : `<p class="col-span-full py-10 text-center text-sm text-[#5f5851]">New handcrafted pieces are arriving shortly. Browse our <a href="/shop" class="underline">live shop</a>.</p>`;

            if (normalizedPath === '/') {
              html = replaceBalancedDiv(
                html,
                /<div[^>]*data-catalog-grid="bestsellers"[^>]*>/,
                buildCards(matching),
                'data-ssr-hydrated="true"'
              );
            } else if (normalizedPath === '/shop') {
              html = replaceBalancedDiv(
                html,
                /<div[^>]*id="shop-products-grid"[^>]*>/,
                buildCards(matching),
                'data-ssr-hydrated="true"'
              );
              html = html.replace(
                /(<span[^>]*id="shop-all-count"[^>]*>)[\s\S]*?(<\/span>)/,
                (_m, open: string, close: string) => `${open}${matching.length}${close}`
              );
            } else if (colSlug) {
              html = replaceBalancedDiv(
                html,
                /<div[^>]*id="collection-products-grid"[^>]*>/,
                buildCards(matching),
                'data-ssr-hydrated="true"'
              );
              // Prevent empty category collections from triggering Soft 404 in Google Search Console
              if (matching.length === 0) {
                html = html.replace(
                  /<meta name="robots" content="[^"]*">/,
                  '<meta name="robots" content="noindex, follow">'
                );
                html = html.replace(
                  /<meta name="googlebot" content="[^"]*">/,
                  '<meta name="googlebot" content="noindex, follow">'
                );
              }
            } else if (isLiveLandingPage) {
              html = replaceBalancedDiv(
                html,
                /<div[^>]*data-live-products="[^"]*"[^>]*>/,
                buildCards(matching),
                'data-ssr-hydrated="true"'
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

          const listingHeaders: Record<string, string> = {
            'Content-Type': 'text/html; charset=utf-8',
            'X-Content-Type-Options': 'nosniff'
          };
          if (listingLastMod) listingHeaders['Last-Modified'] = listingLastMod;

          return new Response(html, {
            status: 200,
            headers: listingHeaders
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
