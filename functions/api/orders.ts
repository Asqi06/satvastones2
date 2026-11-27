// Cloudflare Pages Function: /api/orders
// Connects directly to Cloudflare D1 (SQLite) binding: context.env.DB
import { verifyAdminAuth } from '../../src/lib/server-auth';
import { clientIp, isRateLimited, readJsonBody } from '../../src/lib/http';
import { formatRupees, notifyOwnerUrgent } from '../../src/lib/growth-agent';

interface Env {
  DB: any; // D1Database
  R2_BUCKET: any; // R2Bucket
  ADMIN_SECRET_KEY?: string;
  FREE_SHIPPING_THRESHOLD_PAISE?: string;
  [key: string]: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/orders or /api/orders?ref=...
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'Cloudflare D1 Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  const url = new URL(request.url);
  const ref = url.searchParams.get('ref')?.trim();
  const contact = (url.searchParams.get('contact') || '').trim();

  try {
    if (ref) {
      const q = ref.toUpperCase();
      // Exact references only: order number or AWB. Email/phone are never used to
      // discover an order, which would allow enumeration of the customer list.
      const stmt = db.prepare(`
        SELECT * FROM orders
        WHERE UPPER(order_number) = ?
           OR UPPER(tracking_number) = ?
        LIMIT 1
      `).bind(q, q);

      const row = await stmt.first();

      if (!row) {
        return new Response(
          JSON.stringify({ success: false, message: 'No order found for that reference. Check your confirmation SMS or contact support.' }),
          { status: 404, headers: corsHeaders }
        );
      }

      const digits = (value: unknown) => String(value || '').replace(/\D/g, '');
      const contactDigits = digits(contact);
      const contactMatches =
        Boolean(contact) &&
        (String(row.email || '').toLowerCase() === contact.toLowerCase() ||
          (contactDigits.length >= 10 &&
            digits(row.phone).length >= 10 &&
            digits(row.phone).endsWith(contactDigits.slice(-10))));

      const order = formatOrderRow(row);
      if (!contactMatches) {
        // A reference alone reveals shipment status, never personal data.
        return new Response(
          JSON.stringify({
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
          }),
          { status: 200, headers: corsHeaders }
        );
      }

      return new Response(JSON.stringify({ success: true, redacted: false, order }), {
        status: 200,
        headers: corsHeaders
      });
    }

    // Admin List: Fetch latest 150 orders - Requires Admin Authentication
    const isAuth = await verifyAdminAuth(request, env);
    if (!isAuth) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication token required to view order history.' }),
        { status: 401, headers: corsHeaders }
      );
    }

    const { results } = await db.prepare(`
      SELECT * FROM orders 
      ORDER BY datetime(created_at) DESC 
      LIMIT 150
    `).all();

    const orders = (results || []).map(formatOrderRow);

    return new Response(JSON.stringify({ success: true, orders, count: orders.length }), {
      status: 200,
      headers: corsHeaders
    });
  } catch (err: any) {
    console.error('[api/orders GET]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Unable to retrieve order details.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Active promo codes used when the D1 coupons table has not been seeded yet.
const FALLBACK_COUPONS: Record<
  string,
  { discountPercent?: number; flatDiscountPaise?: number; minOrderPaise: number; freeShipping?: boolean; firstOrderOnly?: boolean }
> = {
  FIRSTBUY: { flatDiscountPaise: 20000, minOrderPaise: 249900 },
  SATVA10: { discountPercent: 10, minOrderPaise: 0 },
  FESTIVE15: { discountPercent: 15, minOrderPaise: 299900 },
  WELCOME15FREE: { discountPercent: 15, minOrderPaise: 0, freeShipping: true, firstOrderOnly: true },
  STAY10: { discountPercent: 10, minOrderPaise: 0 }
};

/** Owner-configured shipping and stack discount, with safe defaults. */
async function readGlobalSettings(db: any): Promise<Record<string, any>> {
  try {
    const row: any = await db
      .prepare(`SELECT value_json FROM site_settings WHERE key = 'global_config' LIMIT 1`)
      .first();
    if (row?.value_json) {
      const parsed = JSON.parse(row.value_json);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {
    /* settings table may not exist yet — defaults below apply */
  }
  return {};
}

/** Coupon terms are read from D1 (or the seeded defaults), never from the client. */
async function lookupCoupon(db: any, code: string) {
  const isWelcomeCode = code === 'WELCOME15FREE';
  try {
    const row: any = await db
      .prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1')
      .bind(code)
      .first();
    if (row) {
      return {
        discountPercent: Number(row.discount_percent) || undefined,
        flatDiscountPaise: Number(row.flat_discount_paise) || undefined,
        minOrderPaise: Number(row.min_order_paise) || 0,
        freeShipping: isWelcomeCode,
        firstOrderOnly: isWelcomeCode
      };
    }
  } catch {
    /* fall through to seeded defaults */
  }
  return FALLBACK_COUPONS[code] || null;
}

// POST /api/orders (Checkout completion)
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'Cloudflare D1 Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    if (isRateLimited(`order:${clientIp(request)}`, 6, 10 * 60 * 1000)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Too many order attempts. Please wait a few minutes and try again.' }),
        { status: 429, headers: corsHeaders }
      );
    }

    const data = await readJsonBody<Record<string, any>>(request, 64 * 1024);
    const settings = await readGlobalSettings(db);
    const stackDiscountPercent = Math.min(
      50,
      Math.max(0, Number(settings.stackDiscountPercent ?? env?.STACK_DISCOUNT_PERCENT) || 15)
    );

    // Server-owned immutable IDs — client cannot overwrite existing orders
    const id = `ord-${crypto.randomUUID()}`;
    const orderNumber = `SAT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const customerName = String(data.customerName || 'Valued Patron').trim().slice(0, 120);
    const email = String(data.email || '').trim().slice(0, 160);
    const phone = String(data.phone || '').trim().slice(0, 30);
    const address = String(data.address || '').trim().slice(0, 300);
    const city = String(data.city || '').trim().slice(0, 80);
    const state = String(data.state || '').trim().slice(0, 80);
    const pincode = String(data.pincode || '').replace(/[^0-9]/g, '').slice(0, 6);

    const rawItems = Array.isArray(data.items) ? data.items.slice(0, 50) : [];
    if (rawItems.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'An order must contain at least one item.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Recompute all prices & verify stock strictly from D1 — never trust client prices.
    const totalQuantity = rawItems.reduce(
      (sum: number, it: any) => sum + Math.max(1, Math.min(20, Math.floor(Number(it?.quantity) || 1))),
      0
    );
    const eligibleForStack = totalQuantity >= 2;

    const items: Array<Record<string, any>> = [];
    const stockUpdates: Array<{ productId: string; quantity: number }> = [];
    let subtotalPaise = 0;

    for (const item of rawItems) {
      const productId = String(item?.productId || item?.id || '').trim();
      const quantity = Math.max(1, Math.min(20, Math.floor(Number(item?.quantity) || 1)));
      const variantId = String(item?.variantId || '').trim();

      if (!productId) {
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid cart item.' }),
          { status: 400, headers: corsHeaders }
        );
      }

      const product: any = await db
        .prepare('SELECT id, name, slug, image_url, price_paise, in_stock FROM products WHERE id = ? LIMIT 1')
        .bind(productId)
        .first();

      if (!product || Number(product.in_stock) === 0 || Number(product.price_paise) <= 0) {
        return new Response(
          JSON.stringify({ success: false, error: 'One or more items in your bag are currently unavailable.' }),
          { status: 409, headers: corsHeaders }
        );
      }

      // Check per-item stockQuantity in product_meta if configured
      try {
        const metaRow: any = await db
          .prepare('SELECT meta_json FROM product_meta WHERE product_id = ? LIMIT 1')
          .bind(productId)
          .first();
        if (metaRow?.meta_json) {
          const meta = JSON.parse(metaRow.meta_json);
          if (typeof meta?.stockQuantity === 'number' && meta.stockQuantity < quantity) {
            return new Response(
              JSON.stringify({ success: false, error: `${product.name} does not have enough stock left.` }),
              { status: 409, headers: corsHeaders }
            );
          }
        }
      } catch {
        /* product_meta table optional */
      }

      let pricePaise = Number(product.price_paise);
      if (eligibleForStack && /^(stack|bundle)-\d+off$/.test(variantId)) {
        pricePaise = Math.round(pricePaise * (1 - stackDiscountPercent / 100));
      }

      subtotalPaise += pricePaise * quantity;
      stockUpdates.push({ productId: product.id, quantity });
      items.push({
        productId: product.id,
        name: String(product.name || ''),
        slug: String(product.slug || ''),
        image: String(product.image_url || ''),
        pricePaise,
        quantity,
        variantId: variantId || undefined
      });
    }

    const itemsJson = JSON.stringify(items);

    // Shipping follows the owner's settings, with env override for one-off deployments.
    const freeShippingThreshold = Math.max(
      0,
      Number(settings.freeShippingThresholdPaise ?? env?.FREE_SHIPPING_THRESHOLD_PAISE) || 49900
    );
    const shippingChargePaise = Math.max(
      0,
      Number(settings.shippingChargePaise ?? env?.SHIPPING_CHARGE_PAISE) || 4900
    );
    let shippingPaise = subtotalPaise >= freeShippingThreshold ? 0 : shippingChargePaise;

    // Coupon discounts (and first-order free delivery for WELCOME15FREE) are recomputed server-side.
    const couponCode = String(data.couponCode || '').trim().toUpperCase();
    let discountPaise = 0;
    let welcomeCouponRedeemed = false;
    if (couponCode) {
      const coupon = await lookupCoupon(db, couponCode);
      if (coupon && subtotalPaise >= coupon.minOrderPaise) {
        let couponAllowed = true;
        if (coupon.firstOrderOnly) {
          const cleanOrderEmail = email.toLowerCase();
          const cleanOrderPhone = phone.replace(/[^0-9]/g, '').slice(-10);
          try {
            const priorOrder = await db
              .prepare(
                `SELECT id FROM orders
                 WHERE (LOWER(email) = ? AND ? <> '')
                    OR (length(?) = 10 AND substr(replace(replace(replace(phone, ' ', ''), '-', ''), '+91', ''), -10) = ?)
                 LIMIT 1`
              )
              .bind(cleanOrderEmail, cleanOrderEmail, cleanOrderPhone, cleanOrderPhone)
              .first();
            if (priorOrder) couponAllowed = false;
          } catch {
            /* ignore if orders query fails */
          }
        }
        if (couponAllowed) {
          discountPaise = coupon.discountPercent
            ? Math.round((subtotalPaise * Math.min(100, Math.max(0, coupon.discountPercent))) / 100)
            : Math.min(subtotalPaise, Math.max(0, coupon.flatDiscountPaise || 0));
          if (coupon.freeShipping) {
            shippingPaise = 0;
          }
          if (coupon.firstOrderOnly) {
            welcomeCouponRedeemed = true;
          }
        }
      }
    }

    const paymentMethod = String(data.paymentMethod || 'RAZORPAY').slice(0, 120);
    const isCod = /cod|cash on delivery/i.test(paymentMethod);
    const codFeePaise = isCod ? 2500 : 0;
    const totalPaise = Math.max(0, subtotalPaise - discountPaise + shippingPaise + codFeePaise);

    // Server-controlled payment verification + replay protection
    let paymentStatus: 'PENDING_ON_DELIVERY' | 'PAID' | 'PENDING' = 'PENDING_ON_DELIVERY';
    let verifiedPaymentRef: string | null = null;
    if (!isCod) {
      const rzpKeyId = String(env?.RAZORPAY_KEY_ID || env?.PUBLIC_RAZORPAY_KEY_ID || settings.razorpayKeyId || '').trim();
      const rzpSecret = String(env?.RAZORPAY_KEY_SECRET || settings.razorpayKeySecret || '').trim();
      const rzpOrderId = String(data.razorpayOrderId || '').trim();
      const rzpPaymentId = String(data.razorpayPaymentId || '').trim();
      const rzpSignature = String(data.razorpaySignature || '').trim();

      if (rzpPaymentId && /^pay_[A-Za-z0-9]+$/.test(rzpPaymentId)) {
        const paymentTag = `rzp:${rzpPaymentId}`;
        const existingReplay = await db
          .prepare('SELECT id FROM orders WHERE internal_notes = ? LIMIT 1')
          .bind(paymentTag)
          .first();
        if (existingReplay) {
          return new Response(
            JSON.stringify({ success: false, error: 'This payment reference has already been used for an order.' }),
            { status: 409, headers: corsHeaders }
          );
        }
        verifiedPaymentRef = paymentTag;
      }

      if (rzpSecret && rzpOrderId && rzpPaymentId && rzpSignature) {
        // Cryptographic HMAC-SHA256 verification
        const key = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(rzpSecret),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['verify']
        );
        const sigPairs = rzpSignature.match(/.{1,2}/g) || [];
        const sigBytes = new Uint8Array(sigPairs.map((b) => parseInt(b, 16)));
        const sigOk = await crypto.subtle.verify(
          'HMAC',
          key,
          sigBytes,
          new TextEncoder().encode(`${rzpOrderId}|${rzpPaymentId}`)
        );
        if (!sigOk) {
          return new Response(
            JSON.stringify({ success: false, error: 'Payment signature verification failed.' }),
            { status: 403, headers: corsHeaders }
          );
        }
        paymentStatus = 'PAID';
      } else if (rzpKeyId && rzpSecret && /^pay_[A-Za-z0-9]+$/.test(rzpPaymentId)) {
        // Server-to-server Razorpay payment status & amount verification
        const verifyRes = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(rzpPaymentId)}`, {
          headers: { Authorization: `Basic ${btoa(`${rzpKeyId}:${rzpSecret}`)}` }
        });
        if (!verifyRes.ok) {
          return new Response(
            JSON.stringify({ success: false, error: 'Unable to verify Razorpay payment.' }),
            { status: 402, headers: corsHeaders }
          );
        }
        const paymentObj: any = await verifyRes.json();
        const validState = paymentObj?.status === 'captured' || paymentObj?.status === 'authorized';
        const validAmount = Number(paymentObj?.amount) >= totalPaise;
        if (!validState || !validAmount) {
          return new Response(
            JSON.stringify({ success: false, error: 'Payment amount or status mismatch.' }),
            { status: 402, headers: corsHeaders }
          );
        }
        paymentStatus = 'PAID';
      } else {
        // Never mark PAID without server-side cryptographic or API confirmation
        paymentStatus = 'PENDING';
      }
    }

    const fulfillmentStatus = 'VERIFIED';
    const courierPartner = 'BlueDart Express (Vapi Hub)';
    const trackingNumber = `VAP-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // Plain INSERT (never ON CONFLICT UPDATE) with payment replay tag in internal_notes
    await db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, email, phone, address, city, state, pincode,
        items_json, subtotal_paise, shipping_paise, discount_paise, total_paise,
        payment_method, payment_status, fulfillment_status, courier_partner, tracking_number, internal_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, orderNumber, customerName, email, phone, address, city, state, pincode,
      itemsJson, subtotalPaise, shippingPaise, discountPaise, totalPaise,
      paymentMethod, paymentStatus, fulfillmentStatus, courierPartner, trackingNumber, verifiedPaymentRef
    ).run();

    // Mark WhatsApp welcome offer as redeemed on first order
    if (welcomeCouponRedeemed) {
      try {
        const cleanOrderEmail = email.toLowerCase();
        const cleanOrderPhone = phone.replace(/[^0-9]/g, '').slice(-10);
        await db
          .prepare(
            `UPDATE whatsapp_leads
             SET first_order_used = 1, updated_at = datetime('now', 'utc')
             WHERE (LOWER(email) = ? AND ? <> '') OR (length(?) = 10 AND whatsapp_number = ?)`
          )
          .bind(cleanOrderEmail, cleanOrderEmail, cleanOrderPhone, cleanOrderPhone)
          .run();
      } catch {
        /* whatsapp_leads table may not exist yet */
      }
    }

    // Mark matching abandoned carts as CONVERTED so recovery stops immediately & track low stock
    const lowStockAlerts: string[] = [];
    try {
      const cleanOrderEmail = email.toLowerCase();
      const cleanOrderPhone = phone.replace(/[^0-9]/g, '').slice(-10);
      await db
        .prepare(
          `UPDATE abandoned_carts
           SET stage = 'CONVERTED', recovered_order_id = ?, updated_at = datetime('now', 'utc')
           WHERE stage <> 'CONVERTED'
             AND ((LOWER(email) = ? AND ? <> '') OR (length(?) = 10 AND whatsapp_number = ?))`
        )
        .bind(orderNumber, cleanOrderEmail, cleanOrderEmail, cleanOrderPhone, cleanOrderPhone)
        .run();
    } catch {
      /* abandoned_carts may not exist yet */
    }

    // Decrement product_meta stockQuantity & flip in_stock to 0 when depleted
    for (const upd of stockUpdates) {
      try {
        const metaRow: any = await db
          .prepare('SELECT meta_json FROM product_meta WHERE product_id = ? LIMIT 1')
          .bind(upd.productId)
          .first();
        if (metaRow?.meta_json) {
          const meta = JSON.parse(metaRow.meta_json);
          if (typeof meta?.stockQuantity === 'number') {
            const nextStock = Math.max(0, meta.stockQuantity - upd.quantity);
            meta.stockQuantity = nextStock;
            await db
              .prepare(`UPDATE product_meta SET meta_json = ?, updated_at = datetime('now', 'utc') WHERE product_id = ?`)
              .bind(JSON.stringify(meta), upd.productId)
              .run();
            if (nextStock <= 3) {
              const itemName = items.find((i) => i.productId === upd.productId)?.name || upd.productId;
              lowStockAlerts.push(`${itemName} (${nextStock === 0 ? 'SOLD OUT' : `${nextStock} left`})`);
            }
            if (nextStock === 0) {
              await db
                .prepare(`UPDATE products SET in_stock = 0, updated_at = datetime('now', 'utc') WHERE id = ?`)
                .bind(upd.productId)
                .run();
            }
          }
        }
      } catch {
        /* non-fatal if product_meta is absent */
      }
    }

    // Immediate Owner Informing Agent ping for new order (and low-stock warning if triggered)
    try {
      const itemSummary = items.map((i) => `${i.name} × ${i.quantity}`).join(', ').slice(0, 220);
      await notifyOwnerUrgent(db, env, {
        triggerType: 'new_order_confirmed',
        title: `New Order ${orderNumber} — ${formatRupees(totalPaise)}`,
        summary: `${customerName} placed an order via ${paymentMethod}${couponCode ? ` using coupon ${couponCode}` : ''}.${lowStockAlerts.length ? ` Low stock alert: ${lowStockAlerts.join(', ')}.` : ''}`,
        priority: lowStockAlerts.length ? 'HIGH' : 'MEDIUM',
        details: {
          OrderNumber: orderNumber,
          Customer: customerName,
          Contact: `${phone} · ${email}`,
          City: `${city}, ${state} (${pincode})`,
          Items: itemSummary,
          Total: formatRupees(totalPaise),
          Payment: `${paymentMethod} (${paymentStatus})`
        }
      });
    } catch {
      /* non-fatal owner notification */
    }

    return new Response(
      JSON.stringify({
        success: true,
        orderId: id,
        orderNumber,
        trackingNumber,
        courierPartner,
        paymentStatus,
        message: 'Order recorded in Cloudflare D1 edge database.'
      }),
      { status: 201, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[api/orders POST]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Unable to process order right now.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// PUT /api/orders (Admin fulfillment update)
export async function onRequestPut(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  const isAuth = await verifyAdminAuth(request, env);
  if (!isAuth) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication token required to update orders.' }),
      { status: 401, headers: corsHeaders }
    );
  }

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'Cloudflare D1 Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  try {
    const data = await request.json() as any;
    const { orderNumber, fulfillmentStatus, courierPartner, trackingNumber } = data;

    if (!orderNumber || !fulfillmentStatus) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing orderNumber or fulfillmentStatus' }),
        { status: 400, headers: corsHeaders }
      );
    }

    await db.prepare(`
      UPDATE orders
      SET fulfillment_status = ?,
          courier_partner = COALESCE(?, courier_partner),
          tracking_number = COALESCE(?, tracking_number),
          updated_at = datetime('now', 'utc')
      WHERE order_number = ?
    `).bind(fulfillmentStatus, courierPartner || null, trackingNumber || null, orderNumber).run();

    return new Response(
      JSON.stringify({ success: true, message: `Order ${orderNumber} updated successfully in Cloudflare D1.` }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[api/orders PUT]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to update order.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE /api/orders
export async function onRequestDelete(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const db = env.DB;

  if (!db) {
    return new Response(
      JSON.stringify({ success: false, error: 'Cloudflare D1 Database binding "DB" is not available.' }),
      { status: 503, headers: corsHeaders }
    );
  }

  const isAuth = await verifyAdminAuth(request, env);
  if (!isAuth) {
    return new Response(
      JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication token required to delete orders.' }),
      { status: 401, headers: corsHeaders }
    );
  }

  try {
    const url = new URL(request.url);
    const orderNumber = url.searchParams.get('orderNumber') || url.searchParams.get('id');

    if (!orderNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing orderNumber or id query param' }),
        { status: 400, headers: corsHeaders }
      );
    }

    await db.prepare(`DELETE FROM orders WHERE order_number = ? OR id = ?`).bind(orderNumber, orderNumber).run();

    return new Response(
      JSON.stringify({ success: true, message: `Order ${orderNumber} deleted.` }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[api/orders DELETE]', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to delete order.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Helper to normalize SQLite rows to AdminOrder format
function formatOrderRow(row: any) {
  let items = [];
  try {
    items = JSON.parse(row.items_json || '[]');
  } catch {
    items = [];
  }

  return {
    id: row.id,
    orderNumber: row.order_number,
    createdAt: row.created_at,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    items,
    subtotalPaise: Number(row.subtotal_paise) || 0,
    shippingPaise: Number(row.shipping_paise) || 0,
    discountPaise: Number(row.discount_paise) || 0,
    totalPaise: Number(row.total_paise) || 0,
    paymentMethod: row.payment_method || 'RAZORPAY',
    paymentStatus: row.payment_status || 'PAID',
    fulfillmentStatus: row.fulfillment_status || 'VERIFIED',
    courierPartner: row.courier_partner || 'BlueDart Air Express',
    trackingNumber: row.tracking_number || ''
  };
}
