// Cloudflare Pages Function: /api/products
// Manages products catalog in Cloudflare D1
import { verifyAdminAuth } from '../../src/lib/server-auth';
import { PRODUCTS } from '../../src/data/products';

interface Env {
  DB: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/products
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');

  if (!db) {
    // If DB is offline, fallback to base products
    const filtered = slug ? PRODUCTS.filter((p) => p.slug === slug) : PRODUCTS;
    return new Response(JSON.stringify({ success: true, products: filtered, source: 'fallback' }), {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    let rows: any[] = [];
    if (slug) {
      const row = await db.prepare('SELECT * FROM products WHERE slug = ? LIMIT 1').bind(slug).first();
      if (row) rows = [row];
    } else {
      const result = await db.prepare('SELECT * FROM products ORDER BY sort_order ASC, created_at DESC').all();
      rows = result.results || [];
    }

    // If D1 is populated, format and merge with base products
    if (rows.length > 0) {
      const d1Products = rows.map((r: any) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        sku: r.sku,
        category: r.category,
        headline: r.headline || '',
        description: r.description || '',
        pricePaise: Number(r.price_paise),
        compareAtPricePaise: r.compare_at_price_paise ? Number(r.compare_at_price_paise) : undefined,
        images: r.gallery_json
          ? JSON.parse(r.gallery_json)
          : [{ url: r.image_url, alt: r.name, isPrimary: true }],
        material: r.material || '316L Surgical Stainless Steel + 18K Gold PVD',
        finish: r.finish || 'Mirror Polished',
        inStock: Boolean(r.in_stock),
        isBestseller: Boolean(r.is_bestseller),
        rating: 4.9,
        reviewsCount: 12
      }));

      // Combine: custom products first, then any base products not yet replaced
      const d1Slugs = new Set(d1Products.map((p) => p.slug));
      const combined = [...d1Products, ...PRODUCTS.filter((p) => !d1Slugs.has(p.slug))];

      return new Response(JSON.stringify({ success: true, products: combined, source: 'd1' }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // Default base products
    return new Response(JSON.stringify({ success: true, products: PRODUCTS, source: 'base' }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: true, products: PRODUCTS, error: err.message, source: 'fallback_on_error' }),
      { status: 200, headers: corsHeaders }
    );
  }
}

// POST /api/products
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  const isAuth = await verifyAdminAuth(request, env);
  if (!isAuth) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required to manage products.' }),
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
    const p = await request.json();
    if (!p.name || !p.pricePaise) {
      return new Response(JSON.stringify({ success: false, error: 'Name and price are required.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const id = p.id || `prod-${Date.now()}`;
    const slug = p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const sku = p.sku || `SAT-${p.category?.toUpperCase()?.slice(0, 2) || 'JW'}-${Math.floor(100 + Math.random() * 900)}`;
    const category = p.category || 'necklaces';
    const headline = p.headline || p.name;
    const description = p.description || `${p.name} - Anti-tarnish waterproof jewellery.`;
    const pricePaise = Number(p.pricePaise);
    const compareAtPricePaise = p.compareAtPricePaise ? Number(p.compareAtPricePaise) : null;
    const imageUrl = p.image || p.imageUrl || p.images?.[0]?.url || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80';
    const galleryJson = p.images ? JSON.stringify(p.images) : JSON.stringify([{ url: imageUrl, alt: p.name, isPrimary: true }]);
    const material = p.material || '316L Surgical Stainless Steel + 18K Gold PVD';
    const finish = p.finish || 'Mirror Polished';
    const inStock = p.inStock === false ? 0 : 1;
    const isBestseller = p.isBestseller ? 1 : 0;

    await db.prepare(`
      INSERT INTO products (
        id, name, slug, sku, category, headline, description,
        price_paise, compare_at_price_paise, image_url, gallery_json,
        material, finish, in_stock, is_bestseller, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'utc'))
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        slug = excluded.slug,
        sku = excluded.sku,
        category = excluded.category,
        headline = excluded.headline,
        description = excluded.description,
        price_paise = excluded.price_paise,
        compare_at_price_paise = excluded.compare_at_price_paise,
        image_url = excluded.image_url,
        gallery_json = excluded.gallery_json,
        material = excluded.material,
        finish = excluded.finish,
        in_stock = excluded.in_stock,
        is_bestseller = excluded.is_bestseller,
        updated_at = datetime('now', 'utc')
    `).bind(
      id, name, slug, sku, category, headline, description,
      pricePaise, compareAtPricePaise, imageUrl, galleryJson,
      material, finish, inStock, isBestseller
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Product saved to catalogue.', id, slug }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
  }
}

// DELETE /api/products
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
      return new Response(JSON.stringify({ success: false, error: 'Product ID is required.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Product removed from catalogue.' }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
  }
}
