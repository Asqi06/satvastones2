// Cloudflare Pages Function: /api/blogs
// Manages Journal / Blog articles in Cloudflare D1
import { verifyAdminAuth } from '../../src/lib/server-auth';
import { estimateReadTimeMinutes } from '../../src/lib/markdown';

interface Env {
  DB: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function ensureBlogsTable(db: any): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS blogs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        cover_image TEXT,
        category TEXT NOT NULL DEFAULT 'Styling Guide',
        tags_json TEXT DEFAULT '[]',
        author TEXT NOT NULL DEFAULT 'Satvastones Editorial',
        status TEXT NOT NULL DEFAULT 'published',
        is_featured INTEGER NOT NULL DEFAULT 0,
        seo_title TEXT,
        seo_description TEXT,
        read_time_minutes INTEGER NOT NULL DEFAULT 4,
        published_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
      )`
    )
    .run();
}

function slugify(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 120);
}

function mapBlogRow(r: any) {
  let tags: string[] = [];
  try {
    const parsed = JSON.parse(r.tags_json || '[]');
    if (Array.isArray(parsed)) tags = parsed.filter((t) => typeof t === 'string' && t.trim());
  } catch {
    tags = [];
  }
  return {
    id: String(r.id),
    title: String(r.title || ''),
    slug: String(r.slug || ''),
    excerpt: String(r.excerpt || ''),
    content: String(r.content || ''),
    coverImage: String(r.cover_image || ''),
    category: String(r.category || 'Styling Guide'),
    tags,
    author: String(r.author || 'Satvastones Editorial'),
    status: r.status === 'draft' ? 'draft' : 'published',
    isFeatured: Boolean(r.is_featured),
    seoTitle: String(r.seo_title || ''),
    seoDescription: String(r.seo_description || ''),
    readTimeMinutes: Number(r.read_time_minutes) || estimateReadTimeMinutes(r.content || ''),
    publishedAt: r.published_at || r.created_at || new Date().toISOString(),
    createdAt: r.created_at || new Date().toISOString(),
    updatedAt: r.updated_at || r.created_at || new Date().toISOString()
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/blogs
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;
  const url = new URL(request.url);
  const slug = url.searchParams.get('slug');
  const id = url.searchParams.get('id');
  const includeAll = url.searchParams.get('all') === '1' || url.searchParams.get('all') === 'true';

  if (!db) {
    return new Response(JSON.stringify({ success: true, blogs: [], source: 'offline' }), {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    await ensureBlogsTable(db);
    const isAdmin = includeAll ? await verifyAdminAuth(request, env) : false;

    if (slug || id) {
      const query = slug
        ? isAdmin
          ? 'SELECT * FROM blogs WHERE slug = ? LIMIT 1'
          : "SELECT * FROM blogs WHERE slug = ? AND status = 'published' LIMIT 1"
        : isAdmin
          ? 'SELECT * FROM blogs WHERE id = ? LIMIT 1'
          : "SELECT * FROM blogs WHERE id = ? AND status = 'published' LIMIT 1";
      const row = await db.prepare(query).bind(slug || id).first();
      if (!row) {
        return new Response(JSON.stringify({ success: false, error: 'Article not found.' }), {
          status: 404,
          headers: corsHeaders
        });
      }
      return new Response(JSON.stringify({ success: true, blog: mapBlogRow(row) }), {
        status: 200,
        headers: corsHeaders
      });
    }

    const query = isAdmin
      ? 'SELECT * FROM blogs ORDER BY is_featured DESC, COALESCE(published_at, created_at) DESC, created_at DESC'
      : "SELECT * FROM blogs WHERE status = 'published' ORDER BY is_featured DESC, COALESCE(published_at, created_at) DESC, created_at DESC";
    const result = await db.prepare(query).all();
    const blogs = (result.results || []).map(mapBlogRow);

    return new Response(JSON.stringify({ success: true, blogs, source: 'd1' }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    console.error('[api/blogs GET]', err);
    return new Response(JSON.stringify({ success: false, error: 'Failed to load articles.' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// POST / PUT /api/blogs (Admin Create or Update)
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  const isAuth = await verifyAdminAuth(request, env);
  if (!isAuth) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required to manage journal articles.' }),
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
    await ensureBlogsTable(db);
    const body = await request.json();
    const b = body?.blog || body;

    const title = String(b?.title || '').trim();
    const content = String(b?.content || '').trim();

    if (!title || title.length < 3) {
      return new Response(JSON.stringify({ success: false, error: 'Article title is required (at least 3 characters).' }), {
        status: 400,
        headers: corsHeaders
      });
    }
    if (!content || content.length < 20) {
      return new Response(JSON.stringify({ success: false, error: 'Article content is required (at least 20 characters).' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const id = String(b.id || `blog-${Date.now()}`).trim();
    const rawSlug = b.slug ? slugify(String(b.slug)) : slugify(title);
    const slug = rawSlug.length >= 3 ? rawSlug : `article-${Date.now()}`;

    const slugClash = await db
      .prepare('SELECT id, title FROM blogs WHERE slug = ? AND id <> ? LIMIT 1')
      .bind(slug, id)
      .first();
    if (slugClash) {
      return new Response(
        JSON.stringify({ success: false, error: `URL slug "${slug}" is already used by "${slugClash.title}".` }),
        { status: 409, headers: corsHeaders }
      );
    }

    const existing = await db
      .prepare('SELECT slug, status, published_at FROM blogs WHERE id = ? LIMIT 1')
      .bind(id)
      .first();

    const excerpt =
      String(b.excerpt || '').trim() ||
      content
        .replace(/[#*_`>\-\[\]()]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 180);
    const coverImage = String(b.coverImage || b.cover_image || '').trim();
    const category = String(b.category || 'Styling Guide').trim() || 'Styling Guide';
    const tags = Array.isArray(b.tags)
      ? b.tags.map((t: unknown) => String(t).trim()).filter(Boolean)
      : String(b.tags || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
    const author = String(b.author || 'Satvastones Editorial').trim() || 'Satvastones Editorial';
    const status = b.status === 'draft' ? 'draft' : 'published';
    const isFeatured = b.isFeatured ? 1 : 0;
    const seoTitle = String(b.seoTitle || '').trim();
    const seoDescription = String(b.seoDescription || '').trim();
    const readTimeMinutes = estimateReadTimeMinutes(content);
    const publishedAt =
      b.publishedAt ||
      existing?.published_at ||
      (status === 'published' ? new Date().toISOString() : null);

    await db
      .prepare(
        `INSERT INTO blogs (
          id, title, slug, excerpt, content, cover_image, category, tags_json,
          author, status, is_featured, seo_title, seo_description, read_time_minutes,
          published_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'utc'))
        ON CONFLICT(id) DO UPDATE SET
          title = excluded.title,
          slug = excluded.slug,
          excerpt = excluded.excerpt,
          content = excluded.content,
          cover_image = excluded.cover_image,
          category = excluded.category,
          tags_json = excluded.tags_json,
          author = excluded.author,
          status = excluded.status,
          is_featured = excluded.is_featured,
          seo_title = excluded.seo_title,
          seo_description = excluded.seo_description,
          read_time_minutes = excluded.read_time_minutes,
          published_at = COALESCE(excluded.published_at, blogs.published_at),
          updated_at = datetime('now', 'utc')`
      )
      .bind(
        id,
        title,
        slug,
        excerpt,
        content,
        coverImage,
        category,
        JSON.stringify(tags),
        author,
        status,
        isFeatured,
        seoTitle,
        seoDescription,
        readTimeMinutes,
        publishedAt
      )
      .run();

    const saved = await db.prepare('SELECT * FROM blogs WHERE id = ? LIMIT 1').bind(id).first();
    return new Response(
      JSON.stringify({
        success: true,
        message: status === 'published' ? 'Article published to Journal.' : 'Draft saved.',
        previousSlug:
          existing?.slug && String(existing.slug) !== slug ? String(existing.slug) : undefined,
        previousStatus: existing?.status ? String(existing.status) : undefined,
        blog: saved ? mapBlogRow(saved) : { id, title, slug, status }
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[api/blogs POST]', err);
    return new Response(JSON.stringify({ success: false, error: 'Failed to save article.' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestPut(context: { request: Request; env: Env }) {
  return onRequestPost(context);
}

// DELETE /api/blogs?id=...
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
    await ensureBlogsTable(db);
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const slug = url.searchParams.get('slug');
    if (!id && !slug) {
      return new Response(JSON.stringify({ success: false, error: 'Article ID or slug is required.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const existingRow = await db
      .prepare('SELECT id, slug, status FROM blogs WHERE id = ? OR slug = ? LIMIT 1')
      .bind(id || '', slug || id || '')
      .first();

    await db.prepare('DELETE FROM blogs WHERE id = ? OR slug = ?').bind(id || '', slug || id || '').run();
    return new Response(
      JSON.stringify({
        success: true,
        deletedSlug: existingRow?.slug ? String(existingRow.slug) : slug || undefined,
        deletedStatus: existingRow?.status ? String(existingRow.status) : undefined,
        message: 'Article deleted from Journal.'
      }),
      {
        status: 200,
        headers: corsHeaders
      }
    );
  } catch (err: any) {
    console.error('[api/blogs DELETE]', err);
    return new Response(JSON.stringify({ success: false, error: 'Failed to delete article.' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
