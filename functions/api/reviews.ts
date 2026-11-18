// Cloudflare Pages Function: /api/reviews
// Manages real customer reviews in Cloudflare D1
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

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/reviews?productId=...
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;
  const url = new URL(request.url);
  const productId = url.searchParams.get('productId');

  if (!db) {
    return new Response(JSON.stringify({ success: true, reviews: [] }), { status: 200, headers: corsHeaders });
  }

  try {
    let result;
    if (productId) {
      result = await db.prepare(`
        SELECT * FROM reviews 
        WHERE (product_id = ? OR product_id = '') AND status = 'APPROVED'
        ORDER BY created_at DESC
      `).bind(productId).all();
    } else {
      result = await db.prepare(`
        SELECT * FROM reviews 
        WHERE status = 'APPROVED'
        ORDER BY created_at DESC
      `).all();
    }

    const rows = result.results || [];
    const reviews = rows.map((r: any) => ({
      id: r.id,
      productId: r.product_id,
      productName: r.product_name,
      authorName: r.author_name,
      city: r.city,
      rating: Number(r.rating),
      title: r.title,
      content: r.content,
      verifiedBuyer: Boolean(r.verified_buyer),
      createdAt: Number(r.created_at),
      date: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(Number(r.created_at)))
    }));

    return new Response(JSON.stringify({ success: true, reviews }), { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message, reviews: [] }), {
      status: 200,
      headers: corsHeaders
    });
  }
}

// POST /api/reviews
// Can be submitted by verified customer on product page, or by store admin
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) {
    return new Response(JSON.stringify({ success: false, error: 'D1 Database binding not available.' }), {
      status: 503,
      headers: corsHeaders
    });
  }

  try {
    const body = await request.json();
    if (!body.authorName || !body.content || !body.rating) {
      return new Response(JSON.stringify({ success: false, error: 'Author name, rating, and review text are required.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const id = body.id || `rev-${Date.now()}`;
    const productId = body.productId || '';
    const productName = body.productName || 'Satvastones Jewellery';
    const authorName = body.authorName.trim();
    const city = body.city?.trim() || 'Verified Indian Patron';
    const rating = Math.min(5, Math.max(1, Number(body.rating)));
    const title = body.title?.trim() || 'Verified Customer Review';
    const content = body.content.trim();
    const verifiedBuyer = 1;
    const createdAt = body.createdAt || Date.now();
    const status = 'APPROVED';

    await db.prepare(`
      INSERT INTO reviews (
        id, product_id, product_name, author_name, city,
        rating, title, content, verified_buyer, created_at, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        rating = excluded.rating,
        title = excluded.title,
        content = excluded.content,
        status = excluded.status
    `).bind(
      id, productId, productName, authorName, city,
      rating, title, content, verifiedBuyer, createdAt, status
    ).run();

    return new Response(JSON.stringify({ success: true, message: 'Review successfully recorded.', id }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
  }
}

// DELETE /api/reviews
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
      return new Response(JSON.stringify({ success: false, error: 'Review ID is required.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    await db.prepare('DELETE FROM reviews WHERE id = ?').bind(id).run();
    return new Response(JSON.stringify({ success: true, message: 'Review deleted.' }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500, headers: corsHeaders });
  }
}
