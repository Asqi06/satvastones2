// Cloudflare Pages Function: /api/reviews
// Manages real customer reviews in Cloudflare D1
import { verifyAdminAuth } from '../../src/lib/server-auth';
import { clientIp, isRateLimited, readJsonBody } from '../../src/lib/http';

interface Env {
  DB: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

/** Review text limits keep spam, storage abuse and layout breakage bounded. */
const REVIEW_LIMITS = {
  authorName: 60,
  city: 60,
  title: 120,
  content: 2000,
  productId: 120,
  productName: 160
} as const;

function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? '')
    // Strip control characters, keeping ordinary punctuation.
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

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
    const body = await readJsonBody<Record<string, any>>(request, 64 * 1024);
    const isAdmin = await verifyAdminAuth(request, env);

    // Anonymous submissions are unverified reviews. Only an authenticated admin
    // may import a review that already carries a verified-purchase badge.
    if (!isAdmin && isRateLimited(`review:${clientIp(request)}`, 5, 10 * 60 * 1000)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Too many reviews from this connection. Please try again later.' }),
        { status: 429, headers: corsHeaders }
      );
    }

    const authorName = cleanText(body.authorName, REVIEW_LIMITS.authorName);
    const content = cleanText(body.content, REVIEW_LIMITS.content);
    const ratingValue = Number(body.rating);

    if (!authorName || !content || !Number.isFinite(ratingValue)) {
      return new Response(JSON.stringify({ success: false, error: 'Author name, rating, and review text are required.' }), {
        status: 400,
        headers: corsHeaders
      });
    }
    if (authorName.length < 2) {
      return new Response(JSON.stringify({ success: false, error: 'Please enter your full name.' }), {
        status: 400,
        headers: corsHeaders
      });
    }
    if (content.length < 10) {
      return new Response(JSON.stringify({ success: false, error: 'Please write at least a sentence about the piece.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Ids and timestamps are server-owned so a visitor cannot overwrite an
    // existing review by reusing its id.
    const id = isAdmin && typeof body.id === 'string' && /^[A-Za-z0-9_-]{1,80}$/.test(body.id)
      ? body.id
      : `rev-${crypto.randomUUID()}`;
    const productId = cleanText(body.productId, REVIEW_LIMITS.productId);
    const productName = cleanText(body.productName, REVIEW_LIMITS.productName) || 'Satvastones Jewellery';
    const city = cleanText(body.city, REVIEW_LIMITS.city) || 'India';
    const rating = Math.min(5, Math.max(1, Math.round(ratingValue)));
    const title = cleanText(body.title, REVIEW_LIMITS.title) || 'Customer review';
    const verifiedBuyer = isAdmin && body.verifiedBuyer === true ? 1 : 0;
    const createdAt = Date.now();
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
    const tooLarge = String(err?.message || '').includes('Payload too large');
    return new Response(JSON.stringify({ success: false, error: tooLarge ? 'Review is too long.' : 'Review could not be saved.' }), {
      status: tooLarge ? 413 : 500,
      headers: corsHeaders
    });
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
