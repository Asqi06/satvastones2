// Cloudflare Pages Function: /api/upload
// Direct zero-egress file storage & retrieval via Cloudflare R2 binding: context.env.R2_BUCKET
import { verifyAdminAuth } from '../../src/lib/server-auth';

interface Env {
  DB: any;
  R2_BUCKET: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-filename, x-content-type'
};

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
// SVG/HTML are deliberately excluded: they can execute script when opened directly.
const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'video/mp4',
  'video/webm'
]);

/** Inspect actual file header magic bytes instead of trusting client-supplied MIME types. */
function detectMagicMime(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return 'image/png';
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'image/gif';
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return 'image/webp';
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return 'video/webm';
  // ISO BMFF (ftyp box): MP4 or AVIF
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) {
    const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
    if (brand === 'avif' || brand === 'avis') return 'image/avif';
    return 'video/mp4';
  }
  return null;
}

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
    headers.set('X-Content-Type-Options', 'nosniff');

    return new Response(object.body, { headers });
  } catch (err: any) {
    console.error('[api/upload GET]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Unable to retrieve media file.' }),
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

  const isAuth = await verifyAdminAuth(request, env);
  if (!isAuth) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: admin session required to upload media.' }),
      { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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

      const bytes = new Uint8Array(await file.arrayBuffer());
      if (bytes.byteLength > MAX_UPLOAD_BYTES) {
        return new Response(
          JSON.stringify({ success: false, error: 'File exceeds the 8 MB upload limit.' }),
          { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const verifiedMime = detectMagicMime(bytes);
      if (!verifiedMime || !ALLOWED_MIME.has(verifiedMime)) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid or unsupported file signature. Upload JPEG, PNG, WebP, AVIF, GIF, MP4 or WebM.' }),
          { status: 415, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const cleanName = (file.name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
      const key = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${cleanName}`;

      await bucket.put(key, bytes, {
        httpMetadata: {
          contentType: verifiedMime
        }
      });

      const url = new URL(request.url);
      const publicUrl = `${url.origin}/api/upload?key=${encodeURIComponent(key)}`;

      return new Response(
        JSON.stringify({
          success: true,
          key,
          url: publicUrl,
          size: bytes.byteLength,
          type: verifiedMime
        }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Direct binary stream with strict byte-size & magic-byte verification
    const rawKey = request.headers.get('x-filename') || `asset-${Date.now()}.bin`;
    const declaredLength = Number(request.headers.get('content-length') || 0);
    if (declaredLength > MAX_UPLOAD_BYTES) {
      return new Response(
        JSON.stringify({ success: false, error: 'File exceeds the 8 MB upload limit.' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bytes = new Uint8Array(await request.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_UPLOAD_BYTES) {
      return new Response(
        JSON.stringify({ success: false, error: 'File is empty or exceeds the 8 MB upload limit.' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const verifiedMime = detectMagicMime(bytes);
    if (!verifiedMime || !ALLOWED_MIME.has(verifiedMime)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or unsupported file signature. Upload JPEG, PNG, WebP, AVIF, GIF, MP4 or WebM.' }),
        { status: 415, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const key = `${Date.now()}-${rawKey.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80)}`;

    await bucket.put(key, bytes, {
      httpMetadata: { contentType: verifiedMime }
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
    console.error('[api/upload POST]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Media upload failed.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
