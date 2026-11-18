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

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);

    // Route /api/* requests to serverless D1 handlers
    if (url.pathname.startsWith('/api/')) {
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
        if (request.method === 'PUT') return (ordersHandler as any).onRequestPut ? (ordersHandler as any).onRequestPut(context as any) : new Response('Method Not Allowed', { status: 405 });
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
    }

    // Dynamic Product Detail Page (PDP) resolution from Cloudflare D1
    if (url.pathname.startsWith('/products/')) {
      const slug = url.pathname.replace('/products/', '').replace(/\/$/, '').trim();
      if (slug && env.DB) {
        try {
          const row: any = await env.DB.prepare(
            'SELECT * FROM products WHERE slug = ? OR id = ? LIMIT 1'
          ).bind(slug, slug).first();

          if (row) {
            const templateReqUrl = new URL('/products/aura-herringbone-snake-chain/index.html', request.url);
            const templateRes = await env.ASSETS.fetch(templateReqUrl);

            if (!templateRes.ok) {
              return new Response(`Template fetch failed with status: ${templateRes.status}`, { status: 500 });
            }

            let html = await templateRes.text();
              const name = row.name || '';
              const pricePaise = Number(row.price_paise) || 0;
              const compareAtPricePaise = row.compare_at_price_paise ? Number(row.compare_at_price_paise) : null;
              const priceRupees = Math.round(pricePaise / 100);
              const compareRupees = compareAtPricePaise ? Math.round(compareAtPricePaise / 100) : null;
              const discountPercent = compareAtPricePaise && compareAtPricePaise > pricePaise
                ? Math.round(((compareAtPricePaise - pricePaise) / compareAtPricePaise) * 100)
                : 0;
              const imageUrl = row.image_url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';
              const headline = row.headline || name;
              const description = row.description || `${name} - Handcrafted waterproof fine jewellery in 316L stainless steel & 18K vacuum gold PVD.`;
              const sku = row.sku || `SAT-${row.id}`;

              // SEO & Metadata updates
              html = html.replace(/<title>.*?<\/title>/, `<title>${name} – 18K Gold PVD | Buy Online at Satvastones India</title>`);
              html = html.replace(/<meta name="title" content=".*?">/, `<meta name="title" content="${name} – 18K Gold PVD | Buy Online at Satvastones India">`);
              html = html.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="Buy ${name} online in India for ₹${priceRupees.toLocaleString('en-IN')}. Waterproof 18K gold PVD steel. Free PAN-India delivery > ₹499 &amp; 7-day returns.">`);
              html = html.replace(/<meta property="og:title" content=".*?">/, `<meta property="og:title" content="${name} – 18K Gold PVD | Buy Online at Satvastones India">`);
              html = html.replace(/<meta property="twitter:title" content=".*?">/, `<meta property="twitter:title" content="${name} – 18K Gold PVD | Buy Online at Satvastones India">`);

              // Product Title & Specs in DOM
              html = html.replace(/Aura Herringbone Snake Chain/g, name);
              html = html.replace(/SAT-NK-001/g, sku);
              html = html.replace(/₹1,699/g, `₹${priceRupees.toLocaleString('en-IN')}`);
              if (compareRupees) {
                html = html.replace(/₹2,499/g, `₹${compareRupees.toLocaleString('en-IN')}`);
              } else {
                html = html.replace(/<span class="text-xs sm:text-sm text-gray-400 line-through">₹2,499<\/span>/g, '');
              }

              if (discountPercent > 0) {
                html = html.replace(/SAVE 32%/g, `SAVE ${discountPercent}%`);
              } else {
                html = html.replace(/<span class="absolute top-3.5 left-3.5[^>]*>SAVE \d+%<\/span>/g, '');
              }

              // Replace Image URL
              html = html.replace(/https:\/\/images\.unsplash\.com\/photo-1599643478518-a784e5dc4c8f\?auto=format&fit=crop&w=1000&q=80/g, imageUrl);
              html = html.replace(/https:\/\/images\.unsplash\.com\/photo-1599643478518-a784e5dc4c8f\?auto=format&fit=crop&w=800&q=80/g, imageUrl);

              // Replace Headline and Description
              html = html.replace(/Silky smooth liquid gold finish that lays flush against your collarbone/g, headline);
              html = html.replace(/The Aura Snake Chain embodies timeless Italian craftsmanship reimagined for Indian tropical climates\.[^<]*/g, description);

              // Update PDP Add to Bag dataset attributes
              html = html.replace(/data-product-id="[^"]*"/g, `data-product-id="${row.id}"`);
              html = html.replace(/data-product-name="[^"]*"/g, `data-product-name="${name}"`);
              html = html.replace(/data-product-slug="[^"]*"/g, `data-product-slug="${row.slug}"`);
              html = html.replace(/data-product-price="[^"]*"/g, `data-product-price="${pricePaise}"`);
              html = html.replace(/data-product-image="[^"]*"/g, `data-product-image="${imageUrl}"`);

              return new Response(html, {
                status: 200,
                headers: {
                  'Content-Type': 'text/html; charset=utf-8',
                  'Cache-Control': 'public, max-age=120'
                }
              });
          }
        } catch (err: any) {
          return new Response(`Worker PDP Error: ${err.message}\n${err.stack}`, { status: 500 });
        }
      }
    }

    // Serve all static pages via Cloudflare Assets
    try {
      return await env.ASSETS.fetch(request);
    } catch (err: any) {
      return new Response(`Worker Asset Error: ${err.message}\n${err.stack}`, { status: 500 });
    }
  }
};
