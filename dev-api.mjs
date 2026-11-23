/**
 * Local API emulation for `astro dev`.
 *
 * Production runs the Cloudflare Worker in `src/worker.ts` (D1 + R2). `astro dev`
 * does not execute Workers, so every `/api/*` call 404s and the admin panel silently
 * falls back to per-browser localStorage. That is why the storefront kept showing the
 * build-time demo catalogue instead of the products saved in the admin panel.
 *
 * This plugin gives localhost the same endpoints, backed by `.data/dev-store.json`,
 * so admin writes are shared, persistent and visible to every visitor/browser exactly
 * like production. It only runs for `astro dev`; production code is untouched.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const API_PREFIX = '/api/';
const DEMO_TOKEN = 'dev-admin-token';

// Launch offers mirrored from the production coupons endpoint.
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

function json(status, body, extraHeaders = {}) {
  return {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders },
    body: JSON.stringify(body)
  };
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks);
      resolve({ raw, text: raw.toString('utf8') });
    });
    req.on('error', () => resolve({ raw: Buffer.alloc(0), text: '' }));
  });
}

function parseJsonBody(text) {
  try {
    return JSON.parse(text || '{}');
  } catch {
    return {};
  }
}

function isAuthed(req) {
  const auth = req.headers.authorization || '';
  if (auth.startsWith('Bearer ') && auth.slice(7).trim() === DEMO_TOKEN) return true;
  const cookie = req.headers.cookie || '';
  return /satva_admin_session=([^;]+)/.test(cookie);
}

function normalizeProduct(input) {
  const name = String(input.name || '').trim();
  const pricePaise = Number(input.pricePaise) || Math.round(Number(input.price) * 100) || 0;
  const compareAt = Number(input.compareAtPricePaise) || Math.round(Number(input.compareAtPrice) * 100) || null;
  const gallery = Array.isArray(input.images) && input.images.length
    ? input.images
        .map((img, index) =>
          typeof img === 'string'
            ? { url: img, alt: name, isPrimary: index === 0 }
            : { url: img.url, alt: img.alt || name, isPrimary: Boolean(img.isPrimary) || index === 0 }
        )
        .filter((img) => img.url)
    : [];
  const image = input.image || input.imageUrl || gallery[0]?.url || '';
  if (image && !gallery.some((img) => img.url === image)) {
    gallery.unshift({ url: image, alt: name, isPrimary: true });
  }
  // Mirror the production API: extra gallery shots arrive as `gallery`.
  if (Array.isArray(input.gallery)) {
    for (const url of input.gallery) {
      if (typeof url === 'string' && url && !gallery.some((img) => img.url === url)) {
        gallery.push({ url, alt: `${name} detail ${gallery.length}`, isPrimary: false });
      }
    }
  }
  if (gallery.length) gallery[0].isPrimary = true;

  return {
    id: input.id || `prod-${Date.now()}`,
    name,
    slug: input.slug || slugify(name),
    sku: input.sku || `SAT-${(input.category || 'JW').toString().slice(0, 2).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
    category: input.category || 'necklaces',
    collection: input.collection || '',
    headline: input.headline || name,
    description: input.description || `${name} — anti-tarnish, waterproof fine jewellery.`,
    pricePaise,
    compareAtPricePaise: compareAt && compareAt > pricePaise ? compareAt : null,
    image,
    images: gallery,
    material: input.material || '316L Surgical Stainless Steel + 18K Gold PVD',
    finish: input.finish || 'Mirror Polished',
    dimensions: input.dimensions || '',
    weightGrams: input.weightGrams ? Number(input.weightGrams) : null,
    careInstructions: Array.isArray(input.careInstructions) ? input.careInstructions : [],
    warranty: input.warranty || '6 Months Anti-Tarnish Assurance',
    inStock: input.inStock !== false,
    stockQuantity: Number.isFinite(Number(input.stockQuantity)) ? Number(input.stockQuantity) : null,
    lowStockThreshold: Number.isFinite(Number(input.lowStockThreshold)) ? Number(input.lowStockThreshold) : 3,
    isBestseller: Boolean(input.isBestseller),
    isNewArrival: Boolean(input.isNewArrival),
    isPublished: input.isPublished !== false,
    tags: Array.isArray(input.tags) ? input.tags : String(input.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    seoTitle: input.seoTitle || '',
    seoDescription: input.seoDescription || '',
    costPaise: Number(input.costPaise) || 0,
    hsnCode: input.hsnCode || '',
    gstRate: Number.isFinite(Number(input.gstRate)) ? Number(input.gstRate) : 3,
    sortOrder: Number.isFinite(Number(input.sortOrder)) ? Number(input.sortOrder) : 0,
    variants: Array.isArray(input.variants) ? input.variants : [],
    isDemo: Boolean(input.isDemo),
    rating: Number(input.rating) || 4.9,
    reviewCount: Number(input.reviewCount) || 0,
    createdAt: input.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function seedProduct(product) {
  return normalizeProduct({
    ...product,
    image: product.images?.[0]?.url || '',
    isDemo: true,
    stockQuantity: 25,
    isPublished: true
  });
}

export function devApi() {
  /** @type {import('vite').Plugin} */
  const plugin = {
    name: 'satvastones-dev-api',
    apply: 'serve',
    configureServer(server) {
      const root = server.config.root;
      const storeDir = path.join(root, '.data');
      const storeFile = path.join(storeDir, 'dev-store.json');
      let store = null;
      let writeTimer = null;

      async function loadSeed() {
        try {
          const mod = await server.ssrLoadModule('/src/data/products.ts');
          return Array.isArray(mod.PRODUCTS) ? mod.PRODUCTS : [];
        } catch (err) {
          server.config.logger.warn(`[dev-api] could not load demo catalogue: ${err.message}`);
          return [];
        }
      }

      async function persist() {
        if (writeTimer) clearTimeout(writeTimer);
        writeTimer = setTimeout(async () => {
          try {
            await fs.mkdir(storeDir, { recursive: true });
            const tmp = `${storeFile}.${process.pid}.tmp`;
            await fs.writeFile(tmp, JSON.stringify(store, null, 2), 'utf8');
            await fs.rename(tmp, storeFile);
          } catch (err) {
            server.config.logger.error(`[dev-api] failed to persist store: ${err.message}`);
          }
        }, 40);
      }

      async function getStore() {
        if (store) return store;
        try {
          store = JSON.parse(await fs.readFile(storeFile, 'utf8'));
        } catch {
          const seed = await loadSeed();
          store = {
            version: 1,
            products: seed.map(seedProduct),
            coupons: DEFAULT_COUPONS.map((c) => ({ ...c })),
            orders: [],
            reviews: [],
            claims: [],
            settings: null,
            consent: [],
            privacyRequests: []
          };
          await persist();
        }
        store.products ||= [];
        if (!Array.isArray(store.coupons) || store.coupons.length === 0) {
          store.coupons = DEFAULT_COUPONS.map((c) => ({ ...c }));
        }
        store.orders ||= [];
        store.reviews ||= [];
        store.claims ||= [];
        store.consent ||= [];
        store.privacyRequests ||= [];
        store.blogs ||= [];
        return store;
      }

      async function handle(req, res, next) {
        const reqPath = (req.url || '').split('?')[0];
        if (reqPath.startsWith('/journal/') && reqPath !== '/journal/' && reqPath !== '/journal/_template') {
          req.url = '/journal/_template';
          return next();
        }
        if (reqPath === '/sitemap.xml' || reqPath === '/feeds/google-merchant.xml' || reqPath === '/google-merchant.xml') {
          try {
            const db = await getStore();
            const published = (db.products || []).filter((p) => p.isPublished !== false && p.slug);
            const blogs = (db.blogs || []).filter((b) => b.status !== 'draft' && b.slug);
            const esc = (v) =>
              String(v ?? '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
            const absUrl = (u) => (!u ? 'https://www.satvastones.in/satvastones-logo.png' : u.startsWith('http') ? u : `https://www.satvastones.in${u.startsWith('/') ? '' : '/'}${u}`);

            if (reqPath === '/sitemap.xml') {
              const today = new Date().toISOString().slice(0, 10);
              const urls = [
                '/', '/shop', '/journal', '/stack-builder', '/about', '/materials', '/jewellery-care', '/faqs', '/contact',
                ...published.map((p) => `/products/${p.slug}`),
                ...blogs.map((b) => `/journal/${b.slug}`)
              ];
              const xml =
                `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
                urls.map((u) => `  <url><loc>https://www.satvastones.in${esc(u)}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
                `\n</urlset>\n`;
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/xml; charset=utf-8');
              res.end(xml);
              return;
            }

            const items = published
              .map((p) => {
                const price = (Number(p.pricePaise || 0) / 100).toFixed(2);
                const img = absUrl(p.image || p.images?.[0]?.url);
                return `    <item>\n      <g:id>${esc(p.sku || p.id)}</g:id>\n      <g:title>${esc(p.seoTitle || p.name)}</g:title>\n      <g:description>${esc(p.description || p.headline || p.name)}</g:description>\n      <g:link>https://www.satvastones.in/products/${esc(p.slug)}</g:link>\n      <g:image_link>${esc(img)}</g:image_link>\n      <g:availability>${p.inStock === false ? 'out_of_stock' : 'in_stock'}</g:availability>\n      <g:price>${price} INR</g:price>\n      <g:brand>Satvastones</g:brand>\n      <g:condition>new</g:condition>\n      <g:identifier_exists>no</g:identifier_exists>\n    </item>`;
              })
              .join('\n');
            const feedXml = `<?xml version="1.0" encoding="UTF-8"?>\n<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n  <channel>\n    <title>Satvastones Jewellery — Live Product Catalog</title>\n    <link>https://www.satvastones.in</link>\n${items}\n  </channel>\n</rss>\n`;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.end(feedXml);
            return;
          } catch {
            return next();
          }
        }

        if (!req.url?.startsWith(API_PREFIX)) return next();
        const url = new URL(req.url, 'http://localhost');
        const route = url.pathname.replace(/\/+$/, '');
        const method = (req.method || 'GET').toUpperCase();
        const db = await getStore();
        const rawBody = method === 'GET' || method === 'HEAD' ? Buffer.alloc(0) : (await readBody(req)).raw;
        const bodyText = rawBody.toString('utf8');

        const send = (payload) => {
          res.statusCode = payload.status;
          for (const [key, value] of Object.entries(payload.headers || {})) res.setHeader(key, value);
          res.end(payload.body);
        };

        try {
          if (method === 'OPTIONS') return send(json(204, {}));

          // ---- Auth -------------------------------------------------------
          if (route === '/api/admin/auth') {
            if (method === 'GET') {
              return send(
                isAuthed(req)
                  ? json(200, { success: true, authenticated: true, user: '@dmin', mode: 'dev' })
                  : json(401, { success: false, authenticated: false })
              );
            }
            if (method === 'POST') {
              const { username, password } = parseJsonBody(bodyText);
              const expectedUser = process.env.ADMIN_USERNAME || '@dmin';
              const expectedPass = process.env.ADMIN_PASSWORD || '@dmin060409';
              if (username === expectedUser && password === expectedPass) {
                return send(
                  json(200, { success: true, token: DEMO_TOKEN, user: username, mode: 'dev' }, {
                    'Set-Cookie': `satva_admin_session=${DEMO_TOKEN}; Path=/; SameSite=Lax; Max-Age=43200`
                  })
                );
              }
              return send(json(401, { success: false, error: 'Invalid dev credentials. Use the values from ADMIN_USERNAME / ADMIN_PASSWORD.' }));
            }
          }

          // ---- Products ---------------------------------------------------
          if (route === '/api/products') {
            if (method === 'GET') {
              const slug = url.searchParams.get('slug');
              const id = url.searchParams.get('id');
              let rows = db.products;
              if (slug) rows = rows.filter((p) => p.slug === slug);
              else if (id) rows = rows.filter((p) => p.id === id);
              return send(json(200, { success: true, products: rows, source: 'dev' }));
            }
            if (!isAuthed(req)) return send(json(401, { success: false, error: 'Unauthorized' }));
            if (method === 'POST') {
              const payload = parseJsonBody(bodyText);
              const input = payload.product || payload;
              const product = normalizeProduct(input);
              const clash = db.products.find((p) => p.slug === product.slug && p.id !== product.id);
              if (clash) return send(json(409, { success: false, error: `Slug "${product.slug}" already belongs to ${clash.name}.` }));
              const index = db.products.findIndex((p) => p.id === product.id);
              if (index >= 0) db.products[index] = { ...db.products[index], ...product, isDemo: false };
              else db.products.unshift({ ...product, isDemo: false });
              await persist();
              return send(json(200, { success: true, product, message: 'Saved to local dev catalogue.' }));
            }
            if (method === 'DELETE') {
              const id = url.searchParams.get('id');
              const slug = url.searchParams.get('slug');
              const before = db.products.length;
              db.products = db.products.filter((p) => p.id !== id && p.slug !== slug);
              await persist();
              return send(json(200, { success: true, removed: before - db.products.length }));
            }
          }

          // ---- Catalogue housekeeping ------------------------------------
          if (route === '/api/products/demo' && method === 'DELETE') {
            if (!isAuthed(req)) return send(json(401, { success: false, error: 'Unauthorized' }));
            const before = db.products.length;
            db.products = db.products.filter((p) => !p.isDemo);
            await persist();
            return send(json(200, { success: true, removed: before - db.products.length }));
          }

          // ---- Coupons -----------------------------------------------------
          if (route === '/api/coupons') {
            if (method === 'GET') {
              const code = url.searchParams.get('code');
              const coupons = code
                ? db.coupons.filter((c) => String(c.code).toUpperCase() === code.toUpperCase() && c.isActive)
                : db.coupons;
              return send(json(200, code ? { success: true, coupon: coupons[0] || null } : { success: true, coupons }));
            }
            if (!isAuthed(req)) return send(json(401, { success: false, error: 'Unauthorized' }));
            if (method === 'POST') {
              const input = parseJsonBody(bodyText);
              const coupon = { ...input, id: input.id || `coup-${Date.now()}` };
              const index = db.coupons.findIndex((c) => c.id === coupon.id);
              if (index >= 0) db.coupons[index] = coupon;
              else db.coupons.unshift(coupon);
              await persist();
              return send(json(200, { success: true, coupon }));
            }
            if (method === 'DELETE') {
              const id = url.searchParams.get('id');
              db.coupons = db.coupons.filter((c) => c.id !== id);
              await persist();
              return send(json(200, { success: true }));
            }
          }

          // ---- Settings ----------------------------------------------------
          if (route === '/api/settings') {
            if (method === 'GET') {
              const settings = { ...(db.settings || {}) };
              if (!isAuthed(req) && settings.razorpayKeySecret) settings.razorpayKeySecret = '••••••••••••••••';
              return send(json(200, { success: true, settings }));
            }
            if (!isAuthed(req)) return send(json(401, { success: false, error: 'Unauthorized' }));
            if (method === 'POST') {
              const input = parseJsonBody(bodyText);
              if (input.razorpayKeySecret && /^[•*]+$/.test(String(input.razorpayKeySecret))) {
                input.razorpayKeySecret = db.settings?.razorpayKeySecret || '';
              }
              db.settings = { ...(db.settings || {}), ...input };
              await persist();
              return send(json(200, { success: true, settings: db.settings }));
            }
          }

          // ---- Orders ------------------------------------------------------
          if (route === '/api/orders') {
            if (method === 'GET') {
              const ref = url.searchParams.get('ref');
              const contact = (url.searchParams.get('contact') || '').trim();
              if (ref) {
                const q = ref.trim().toUpperCase();
                const order = db.orders.find(
                  (o) =>
                    String(o.orderNumber).toUpperCase() === q ||
                    String(o.trackingNumber || '').toUpperCase() === q
                );
                if (!order) return send(json(404, { success: false, message: 'No order found.' }));
                const digits = (value) => String(value || '').replace(/\D/g, '');
                const contactMatches =
                  Boolean(contact) &&
                  (String(order.email || '').toLowerCase() === contact.toLowerCase() ||
                    (digits(contact).length >= 10 && digits(order.phone).length >= 10 && digits(order.phone).endsWith(digits(contact).slice(-10))));
                if (!contactMatches) {
                  return send(
                    json(200, {
                      success: true,
                      redacted: true,
                      order: {
                        ...order,
                        customerName: 'Verified patron',
                        email: '',
                        phone: '',
                        address: '',
                        city: '',
                        state: '',
                        pincode: '',
                        items: []
                      },
                      message: 'Add the email or phone used at checkout to see full order details.'
                    })
                  );
                }
                return send(json(200, { success: true, redacted: false, order }));
              }
              if (!isAuthed(req)) return send(json(401, { success: false, error: 'Unauthorized' }));
              return send(json(200, { success: true, orders: db.orders, count: db.orders.length }));
            }
            if (method === 'POST') {
              const input = parseJsonBody(bodyText);
              const settings = db.settings || {};
              const stackDiscount = Math.min(
                50,
                Math.max(0, Number(settings.stackDiscountPercent ?? 15) || 15)
              );
              const rawItems = Array.isArray(input.items) ? input.items.slice(0, 50) : [];
              let subtotalPaise = 0;
              const items = rawItems.map((item) => {
                const quantity = Math.max(1, Math.min(99, Math.floor(Number(item?.quantity) || 1)));
                const productId = String(item?.productId || item?.id || '');
                const product = db.products.find((p) => p.id === productId);
                let pricePaise = product?.pricePaise
                  ? Number(product.pricePaise)
                  : Math.max(0, Math.round(Number(item?.pricePaise) || 0));
                const variantId = String(item?.variantId || '');
                if (/^(stack|bundle)-\d+off$/.test(variantId)) {
                  pricePaise = Math.round(pricePaise * (1 - stackDiscount / 100));
                }
                subtotalPaise += pricePaise * quantity;
                return {
                  productId,
                  name: String(item?.name || ''),
                  slug: String(item?.slug || ''),
                  image: String(item?.image || ''),
                  pricePaise,
                  quantity,
                  variantId: variantId || undefined
                };
              });

              const freeShippingThreshold = Number(settings.freeShippingThresholdPaise ?? 49900) || 49900;
              const shippingCharge = Number(settings.shippingChargePaise ?? 4900) || 4900;
              const shippingPaise = subtotalPaise >= freeShippingThreshold ? 0 : shippingCharge;

              const couponCode = String(input.couponCode || '').trim().toUpperCase();
              let discountPaise = 0;
              if (couponCode) {
                const coupon = db.coupons.find(
                  (c) => String(c.code).toUpperCase() === couponCode && c.isActive
                );
                if (coupon && subtotalPaise >= Number(coupon.minOrderPaise || 0)) {
                  discountPaise = coupon.discountPercent
                    ? Math.round((subtotalPaise * Math.min(100, Math.max(0, Number(coupon.discountPercent)))) / 100)
                    : Math.min(subtotalPaise, Math.max(0, Number(coupon.flatDiscountPaise) || 0));
                }
              }

              const paymentMethod = input.paymentMethod || 'RAZORPAY';
              const codFeePaise = /cod|cash on delivery/i.test(paymentMethod) ? 2500 : 0;
              const order = {
                ...input,
                id: input.id || `ord-${Date.now()}`,
                orderNumber: input.orderNumber || `SAT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
                createdAt: input.createdAt || new Date().toISOString(),
                items,
                subtotalPaise,
                shippingPaise,
                discountPaise,
                couponCode: couponCode || undefined,
                totalPaise: Math.max(0, subtotalPaise - discountPaise + shippingPaise + codFeePaise)
              };
              const index = db.orders.findIndex((o) => o.id === order.id || o.orderNumber === order.orderNumber);
              if (index >= 0) db.orders[index] = order;
              else db.orders.unshift(order);
              await persist();
              return send(json(200, { success: true, order }));
            }
            if (method === 'DELETE') {
              const ref = url.searchParams.get('orderNumber') || url.searchParams.get('id');
              db.orders = db.orders.filter((o) => o.orderNumber !== ref && o.id !== ref);
              await persist();
              return send(json(200, { success: true }));
            }
          }

          // ---- Blogs / Journal --------------------------------------------
          if (route === '/api/blogs') {
            if (method === 'GET') {
              const slug = url.searchParams.get('slug');
              const id = url.searchParams.get('id');
              const includeAll = url.searchParams.get('all') === '1' || url.searchParams.get('all') === 'true';
              const isAdmin = includeAll && isAuthed(req);
              let rows = isAdmin ? db.blogs : db.blogs.filter((b) => b.status !== 'draft');
              if (slug || id) {
                const found = rows.find((b) => (slug ? b.slug === slug : b.id === id));
                if (!found) return send(json(404, { success: false, error: 'Article not found.' }));
                return send(json(200, { success: true, blog: found }));
              }
              return send(json(200, { success: true, blogs: rows, source: 'dev' }));
            }
            if (!isAuthed(req)) return send(json(401, { success: false, error: 'Unauthorized' }));
            if (method === 'POST' || method === 'PUT') {
              const payload = parseJsonBody(bodyText);
              const b = payload.blog || payload;
              const title = String(b?.title || '').trim();
              const content = String(b?.content || '').trim();
              if (!title || title.length < 3) return send(json(400, { success: false, error: 'Article title is required.' }));
              if (!content || content.length < 20) return send(json(400, { success: false, error: 'Article content is required.' }));
              const id = String(b.id || `blog-${Date.now()}`).trim();
              const slug = slugify(b.slug || title) || `article-${Date.now()}`;
              const clash = db.blogs.find((item) => item.slug === slug && item.id !== id);
              if (clash) return send(json(409, { success: false, error: `Slug "${slug}" already belongs to "${clash.title}".` }));
              const nowIso = new Date().toISOString();
              const words = content.split(/\s+/).filter(Boolean).length;
              const blog = {
                id,
                title,
                slug,
                excerpt: String(b.excerpt || '').trim() || content.replace(/[#*_`>\-\[\]()]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 180),
                content,
                coverImage: String(b.coverImage || '').trim(),
                category: String(b.category || 'Styling Guide').trim() || 'Styling Guide',
                tags: Array.isArray(b.tags)
                  ? b.tags.map((t) => String(t).trim()).filter(Boolean)
                  : String(b.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
                author: String(b.author || 'Satvastones Editorial').trim() || 'Satvastones Editorial',
                status: b.status === 'draft' ? 'draft' : 'published',
                isFeatured: Boolean(b.isFeatured),
                seoTitle: String(b.seoTitle || '').trim(),
                seoDescription: String(b.seoDescription || '').trim(),
                readTimeMinutes: Math.max(1, Math.ceil(words / 200)),
                publishedAt: b.publishedAt || nowIso,
                createdAt: b.createdAt || nowIso,
                updatedAt: nowIso
              };
              const idx = db.blogs.findIndex((item) => item.id === id);
              if (idx >= 0) db.blogs[idx] = { ...db.blogs[idx], ...blog };
              else db.blogs.unshift(blog);
              await persist();
              return send(json(200, { success: true, blog, message: 'Article saved.' }));
            }
            if (method === 'DELETE') {
              const id = url.searchParams.get('id');
              const slug = url.searchParams.get('slug');
              db.blogs = db.blogs.filter((b) => b.id !== id && b.slug !== slug);
              await persist();
              return send(json(200, { success: true, message: 'Article deleted.' }));
            }
          }

          // ---- Reviews -----------------------------------------------------
          if (route === '/api/reviews') {
            if (method === 'GET') {
              const productId = url.searchParams.get('productId');
              const rows = productId ? db.reviews.filter((r) => r.productId === productId) : db.reviews;
              return send(json(200, { success: true, reviews: rows }));
            }
            if (method === 'POST') {
              const input = parseJsonBody(bodyText);
              const review = {
                ...input,
                id: input.id || `rev-${Date.now()}`,
                createdAt: input.createdAt || new Date().toISOString()
              };
              db.reviews.unshift(review);
              await persist();
              return send(json(201, { success: true, review }));
            }
            if (method === 'DELETE') {
              if (!isAuthed(req)) return send(json(401, { success: false, error: 'Unauthorized' }));
              const id = url.searchParams.get('id');
              db.reviews = db.reviews.filter((r) => r.id !== id);
              await persist();
              return send(json(200, { success: true }));
            }
          }

          // ---- Damage claims ----------------------------------------------
          if (route === '/api/claims') {
            if (method === 'GET') {
              if (!isAuthed(req)) return send(json(401, { success: false, error: 'Unauthorized' }));
              return send(json(200, { success: true, claims: db.claims }));
            }
            if (method === 'POST') {
              const input = parseJsonBody(bodyText);
              const claim = { ...input, id: input.id || `claim-${Date.now()}` };
              db.claims.unshift(claim);
              await persist();
              return send(json(201, { success: true, claim }));
            }
          }

          // ---- Consent & privacy requests ----------------------------------
          if (route === '/api/consent' && method === 'POST') {
            db.consent.unshift({ ...parseJsonBody(bodyText), id: `consent-${Date.now()}`, createdAt: new Date().toISOString() });
            await persist();
            return send(json(201, { success: true }));
          }

          if (route === '/api/privacy-requests') {
            if (method === 'GET') {
              if (!isAuthed(req)) return send(json(401, { success: false, error: 'Unauthorized' }));
              return send(json(200, { success: true, requests: db.privacyRequests }));
            }
            if (method === 'POST') {
              const input = parseJsonBody(bodyText);
              const ticket = `DPDP-${Date.now().toString().slice(-6)}`;
              db.privacyRequests.unshift({ ...input, ticket_number: ticket, status: 'RECEIVED', created_at: new Date().toISOString() });
              await persist();
              return send(json(201, { success: true, ticket_number: ticket }));
            }
          }

          // ---- Media upload (dev) ------------------------------------------
          if (route === '/api/upload') {
            if (method === 'GET') {
              const key = url.searchParams.get('key');
              const file = path.join(root, 'public', 'uploads', path.basename(key || ''));
              try {
                const data = await fs.readFile(file);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/octet-stream');
                res.end(data);
                return;
              } catch {
                return send(json(404, { success: false, error: 'Not found' }));
              }
            }
            if (!isAuthed(req)) return send(json(401, { success: false, error: 'Unauthorized' }));
            if (method === 'POST') {
              const contentType = req.headers['content-type'] || '';
              let key = `asset-${Date.now()}.bin`;
              let payload = rawBody;
              if (contentType.includes('multipart/form-data')) {
                const boundary = '--' + contentType.split('boundary=')[1];
                const text = raw.toString('latin1');
                const parts = text.split(boundary).filter((p) => p.includes('filename='));
                if (!parts.length) return send(json(400, { success: false, error: 'No file in form data' }));
                const part = parts[0];
                const nameMatch = part.match(/filename="([^"]+)"/);
                const headerEnd = part.indexOf('\r\n\r\n');
                const body = part.slice(headerEnd + 4, part.lastIndexOf('\r\n'));
                key = `${Date.now()}-${path.basename(nameMatch?.[1] || 'upload.bin').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
                payload = Buffer.from(body, 'latin1');
              }
              const dir = path.join(root, 'public', 'uploads');
              await fs.mkdir(dir, { recursive: true });
              await fs.writeFile(path.join(dir, key), payload);
              return send(json(201, { success: true, key, url: `/uploads/${key}` }));
            }
          }

          return send(json(404, { success: false, error: `No dev handler for ${method} ${route}` }));
        } catch (err) {
          return send(json(500, { success: false, error: err?.message || 'Dev API error' }));
        }
      }

      server.middlewares.use(handle);
      server.config.logger.info('[dev-api] /api/* is served locally from .data/dev-store.json');
    }
  };
  return plugin;
}

export default devApi;
