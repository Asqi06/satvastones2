// Cloudflare Pages Function: /api/coupons
// Manages coupon codes in Cloudflare D1
import { verifyAdminAuth } from '../../src/lib/server-auth';

interface Env {
  DB: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

const DEFAULT_COUPONS = [
  {
    id: 'coup-1',
    code: 'FIRSTBUY',
    flatDiscountPaise: 20000,
    minOrderPaise: 249900,
    isActive: true,
    description: 'Flat ₹200 OFF on orders above ₹2,499'
  },
  {
    id: 'coup-2',
    code: 'SATVA10',
    discountPercent: 10,
    minOrderPaise: 0,
    isActive: true,
    description: '10% OFF on all fine anti-tarnish jewellery'
  },
  {
    id: 'coup-3',
    code: 'FESTIVE15',
    discountPercent: 15,
    minOrderPaise: 299900,
    isActive: true,
    description: '15% Privilege savings on festive orders above ₹2,999'
  }
];

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/coupons
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;
  const url = new URL(request.url);
  const codeParam = url.searchParams.get('code');

  if (!db) {
    if (codeParam) {
      const match = DEFAULT_COUPONS.find((c) => c.code === codeParam.toUpperCase());
      return new Response(JSON.stringify({ success: true, coupon: match || null }), { status: 200, headers: corsHeaders });
    }
    return new Response(JSON.stringify({ success: true, coupons: DEFAULT_COUPONS }), { status: 200, headers: corsHeaders });
  }

  try {
    if (codeParam) {
      const row = await db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1')
        .bind(codeParam.toUpperCase()).first();

      if (!row) {
        // Fallback check against default coupons
        const fallback = DEFAULT_COUPONS.find((c) => c.code === codeParam.toUpperCase());
        return new Response(JSON.stringify({ success: true, coupon: fallback || null }), { status: 200, headers: corsHeaders });
      }

      const coupon = {
        id: row.id,
        code: row.code,
        discountPercent: row.discount_percent || undefined,
        flatDiscountPaise: row.flat_discount_paise || undefined,
        minOrderPaise: Number(row.min_order_paise || 0),
        isActive: Boolean(row.is_active),
        description: row.description || ''
      };
      return new Response(JSON.stringify({ success: true, coupon }), { status: 200, headers: corsHeaders });
    }

    const result = await db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
    const rows = result.results || [];

    if (rows.length === 0) {
      return new Response(JSON.stringify({ success: true, coupons: DEFAULT_COUPONS }), { status: 200, headers: corsHeaders });
    }

    const coupons = rows.map((r: any) => ({
      id: r.id,
      code: r.code,
      discountPercent: r.discount_percent || undefined,
      flatDiscountPaise: r.flat_discount_paise || undefined,
      minOrderPaise: Number(r.min_order_paise || 0),
      isActive: Boolean(r.is_active),
      description: r.description || ''
    }));

    return new Response(JSON.stringify({ success: true, coupons }), { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: true, coupons: DEFAULT_COUPONS, error: err.message }), {
      status: 200,
      headers: corsHeaders
    });
  }
}

// POST /api/coupons
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  const isAuth = await verifyAdminAuth(request, env);
  if (!isAuth) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required.' }),
      { status: 401, headers: corsHeaders }
    );
  }

  if (!db) {
    return new Response(JSON.stringify({ success: false, error: 'D1 Database binding not available.' }), {
      status: 503,
      headers: corsHeaders
    });
  }

  try {
    const c = await request.json();
    if (!c.code) {
      return new Response(JSON.stringify({ success: false, error: 'Coupon code is required.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const id = c.id || `coup-${Date.now()}`;
    const code = c.code.trim().toUpperCase();
    const discountPercent = c.discountPercent ? Number(c.discountPercent) : null;
    const flatDiscountPaise = c.flatDiscountPaise ? Number(c.flatDiscountPaise) : null;
    const minOrderPaise = Number(c.minOrderPaise || 0);
    const isActive = c.isActive === false ? 0 : 1;
    const description = c.description || (discountPercent ? `${discountPercent}% OFF` : `₹${(flatDiscountPaise || 0) / 100} OFF`);

    await db.prepare(`
      INSERT INTO coupons (id, code, discount_percent, flat_discount_paise, min_order_paise, is_active, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        code = excluded.code,
        discount_percent = excluded.discount_percent,
        flat_discount_paise = excluded.flat_discount_paise,
        min_order_paise = excluded.min_order_paise,
        is_active = excluded.is_active,
        description = excluded.description
    `).bind(id, code, discountPercent, flatDiscountPaise, minOrderPaise, isActive, description).run();

    return new Response(JSON.stringify({ success: true, message: 'Coupon saved successfully.', id, code }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
  }
}

// DELETE /api/coupons
export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  const isAuth = await verifyAdminAuth(request, env);
  if (!isAuth) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required.' }),
      { status: 401, headers: corsHeaders }
    );
  }

  if (!db) {
    return new Response(JSON.stringify({ success: false, error: 'D1 Database binding not available.' }), {
      status: 503,
      headers: corsHeaders
    });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Coupon ID is required.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    await db.prepare('DELETE FROM coupons WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Coupon deleted.' }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
  }
}
