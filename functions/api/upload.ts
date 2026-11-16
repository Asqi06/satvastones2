// Cloudflare Pages Function: /api/upload
// Direct zero-egress file storage & retrieval via Cloudflare R2 binding: context.env.R2_BUCKET

interface Env {
  DB: any;
  R2_BUCKET: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-filename, x-content-type'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/upload?key=... (Stream file from R2)
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const bucket = env.R2_BUCKET;

  if (!bucket) {
    return new Response(
      JSON.stringify({ success: false, error: 'Cloudflare R2 Bucket binding "R2_BUCKET" is not configured.' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!key) {
    return new Response(
      JSON.stringify({ success: false, error: 'Missing "key" query parameter.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const object = await bucket.get(key);

    if (!object) {
      return new Response('File not found in R2 storage.', { status: 404, headers: corsHeaders });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(object.body, { headers });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// POST /api/upload (Upload video or image directly into R2)
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const bucket = env.R2_BUCKET;

  if (!bucket) {
    return new Response(
      JSON.stringify({ success: false, error: 'Cloudflare R2 Bucket binding "R2_BUCKET" is not configured.' }),
      { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const contentType = request.headers.get('content-type') || '';

    // 1. Multipart Form Data (from file upload input)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return new Response(
          JSON.stringify({ success: false, error: 'No file found in formData field "file".' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const ext = file.name.split('.').pop() || 'bin';
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${cleanName}`;

      await bucket.put(key, file.stream(), {
        httpMetadata: {
          contentType: file.type || 'application/octet-stream'
        }
      });

      const url = new URL(request.url);
      const publicUrl = `${url.origin}/api/upload?key=${encodeURIComponent(key)}`;

      return new Response(
        JSON.stringify({
          success: true,
          key,
          url: publicUrl,
          size: file.size,
          type: file.type
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Direct binary stream with headers
    const rawKey = request.headers.get('x-filename') || `asset-${Date.now()}.bin`;
    const mimeType = request.headers.get('x-content-type') || 'application/octet-stream';
    const key = `${Date.now()}-${rawKey.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    await bucket.put(key, request.body, {
      httpMetadata: { contentType: mimeType }
    });

    const url = new URL(request.url);
    const publicUrl = `${url.origin}/api/upload?key=${encodeURIComponent(key)}`;

    return new Response(
      JSON.stringify({
        success: true,
        key,
        url: publicUrl
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'R2 upload failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
