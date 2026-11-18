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
import { applyCorsPolicy, escapeHtml, safeHttpUrl } from './lib/http';

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

const ALLOWED_CATEGORIES = new Set(['rings', 'necklaces', 'bracelets', 'earrings', 'bangles', 'gift-sets']);
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';

function jsonError(message: string, status = 500): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Rewrites the Product node inside any JSON-LD block with live D1 values.
 * Falls back to the untouched block when the JSON cannot be parsed, so a
 * malformed schema never breaks the page.
 */
function updateProductSchema(
  html: string,
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
          if (node['@type'] === 'Product') update(node);
          for (const key of Object.keys(node)) {
            if (key !== '@type') visit(node[key]);
          }
        };
        visit(data);
        // `<` must be escaped so owner copy can never close the script tag.
        return `${open}${JSON.stringify(data).replace(/</g, '\\u003c')}${close}`;
      } catch {
        return match;
      }
    }
  );
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

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // Route /api/* requests to serverless D1 handlers, then normalise CORS.
    if (url.pathname.startsWith('/api/')) {
      try {
        const apiResponse = await routeApi(request, env, ctx);
        if (apiResponse) return applyCorsPolicy(request, apiResponse);
        return applyCorsPolicy(request, jsonError('Not Found', 404));
      } catch {
        return applyCorsPolicy(request, jsonError('Request failed', 500));
      }
    }

    // Dynamic Product Detail Page (PDP) resolution from Cloudflare D1
    if (url.pathname.startsWith('/products/')) {
      const slug = url.pathname.replace('/products/', '').replace(/\/$/, '').trim();
      if (slug && env.DB) {
        try {
          const row: any = await env.DB.prepare(
            'SELECT * FROM products WHERE slug = ? OR id = ? LIMIT 1'
          )
            .bind(slug, slug)
            .first();

          if (row) {
            const templateReqUrl = new URL('/products/aura-herringbone-snake-chain/index.html', request.url);
            const templateRes = await env.ASSETS.fetch(templateReqUrl);

            if (!templateRes.ok) {
              return new Response('Product template unavailable.', { status: 502 });
            }

            let html = await templateRes.text();

            // Extended catalogue fields are stored in an additive side table. A
            // deployment that never opened the new admin form simply has no row.
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

            // Everything below is owner-supplied data. It is escaped before it can
            // reach an HTML text node, an attribute or a JSON-LD block.
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
            const imageUrl = escapeHtml(safeHttpUrl(row.image_url, FALLBACK_IMAGE));
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

            // Owner-authored copy wins over the generated defaults.
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

            // Gallery: the API stores [{url, alt, isPrimary}]; older rows may only
            // have the hero image.
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
            if (!gallery.length) {
              gallery = [{ url: safeHttpUrl(row.image_url, FALLBACK_IMAGE), alt: rawName }];
            }

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
              html = html.replace(/SAVE 32%/g, () => `SAVE ${discountPercent}%`);
            } else {
              html = html.replace(/<span class="absolute top-3.5 left-3.5[^>]*>SAVE \d+%<\/span>/g, '');
            }

            // Replace image URLs
            html = html.replace(
              /https:\/\/images\.unsplash\.com\/photo-1599643478518-a784e5dc4c8f\?auto=format&fit=crop&w=1000&q=80/g,
              () => imageUrl
            );
            html = html.replace(
              /https:\/\/images\.unsplash\.com\/photo-1599643478518-a784e5dc4c8f\?auto=format&fit=crop&w=800&q=80/g,
              () => imageUrl
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
            html = html.replace(/data-product-image="[^"]*"/g, () => `data-product-image="${imageUrl}"`);

            // Category breadcrumb
            html = html.replace(/\/collections\/necklaces/g, () => `/collections/${category}`);

            // Canonical, Open Graph and JSON-LD URLs must point at this product,
            // not the static template used as the rendering shell.
            html = html.replace(/\/products\/aura-herringbone-snake-chain/g, () => `/products/${safeSlug}`);

            // Material & craftsmanship — rebuilt from owner data.
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
              `<li><strong class="font-medium text-[#14110f]">Skin compatibility:</strong> Nickel-free, lead-free, hypoallergenic</li>`
            ].join('');
            html = html.replace(
              /(<ul[^>]*data-pdp-specs[^>]*>)[\s\S]*?(<\/ul>)/,
              (_m, open: string, close: string) => `${open}${specRows}${close}`
            );

            // Care guide — owner steps replace the generic template list.
            if (careInstructions.length) {
              const careRows = careInstructions.map((tip) => `<li>${tip}</li>`).join('');
              html = html.replace(
                /(<ul[^>]*data-pdp-care[^>]*>)[\s\S]*?(<\/ul>)/,
                (_m, open: string, close: string) => `${open}${careRows}${close}`
              );
            }

            // Gallery thumbnails and the image counter.
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

            // Structured data: keep Product schema truthful for admin products.
            const ratingValue = Number(meta.rating);
            const reviewCount = Math.floor(Number(meta.reviewCount) || 0);
            html = updateProductSchema(html, (node) => {
              node.name = rawName;
              node.description = rawDescription;
              node.sku = rawSku;
              node.mpn = rawSku;
              node.image = gallery.map((img) => img.url);
              node.material = materialRaw;
              node.offers = node.offers && typeof node.offers === 'object' ? node.offers : {};
              node.offers.url = `https://www.satvastones.in/products/${safeSlug}/`;
              node.offers.price = (pricePaise / 100).toFixed(2);
              node.offers.availability =
                Number(row.in_stock) === 0
                  ? 'https://schema.org/OutOfStock'
                  : 'https://schema.org/InStock';
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

            return new Response(html, {
              status: 200,
              headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Cloudflare-CDN-Cache-Control': 'no-cache',
                'X-Content-Type-Options': 'nosniff'
              }
            });
          }
        } catch {
          // Fall through to static assets; never leak stack traces to the client.
        }
      }
    }

    // Serve all static pages via Cloudflare Assets
    try {
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status === 404) {
        const resHeaders = new Headers(assetRes.headers);
        resHeaders.set('Cache-Control', 'no-cache, no-store, must-revalidate');
        resHeaders.set('Cloudflare-CDN-Cache-Control', 'no-cache');
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
