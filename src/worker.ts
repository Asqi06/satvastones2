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

    // Serve all static pages (Astro HTML, CSS, JS, images) via Cloudflare Assets
    return env.ASSETS.fetch(request);
  }
};
