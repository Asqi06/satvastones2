// Cloudflare Pages Function: /api/orders
// Connects directly to Cloudflare D1 (SQLite) binding: context.env.DB
import { verifyAdminAuth } from '../../src/lib/server-auth';

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
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Database query failed' }),
      { status: 500, headers: corsHeaders }
    );
  }
}

// Active promo codes used when the D1 coupons table has not been seeded yet.
const FALLBACK_COUPONS: Record<string, { discountPercent?: number; flatDiscountPaise?: number; minOrderPaise: number }> = {
  FIRSTBUY: { flatDiscountPaise: 20000, minOrderPaise: 249900 },
  SATVA10: { discountPercent: 10, minOrderPaise: 0 },
  FESTIVE15: { discountPercent: 15, minOrderPaise: 299900 }
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
  try {
    const row: any = await db
      .prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1')
      .bind(code)
      .first();
    if (row) {
      return {
        discountPercent: Number(row.discount_percent) || undefined,
        flatDiscountPaise: Number(row.flat_discount_paise) || undefined,
        minOrderPaise: Number(row.min_order_paise) || 0
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
    const data = await request.json() as any;
    const settings = await readGlobalSettings(db);
    const stackDiscountPercent = Math.min(
      50,
      Math.max(0, Number(settings.stackDiscountPercent ?? env?.STACK_DISCOUNT_PERCENT) || 15)
    );

    const id = data.id || ('ord-' + Date.now());
    const orderNumber = data.orderNumber || ('SAT-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000));
    const customerName = data.customerName || 'Valued Patron';
    const email = data.email || '';
    const phone = data.phone || '';
    const address = data.address || '';
    const city = data.city || '';
    const state = data.state || '';
    const pincode = data.pincode || '';

    const rawItems = Array.isArray(data.items) ? data.items.slice(0, 50) : [];
    if (rawItems.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'An order must contain at least one item.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Recompute money server-side. Product prices are taken from D1 when the SKU is
    // known; the client's subtotal/shipping/discount/total are never trusted. Stack
    // and bundle pricing is re-applied from the configured discount, not the payload.
    const items: Array<Record<string, any>> = [];
    let subtotalPaise = 0;
    for (const item of rawItems) {
      const productId = String(item?.productId || item?.id || '');
      const quantity = Math.max(1, Math.min(99, Math.floor(Number(item?.quantity) || 1)));
      let pricePaise = Math.max(0, Math.round(Number(item?.pricePaise) || 0));
      const variantId = String(item?.variantId || '');

      if (productId) {
        try {
          const product: any = await db
            .prepare('SELECT price_paise FROM products WHERE id = ? LIMIT 1')
            .bind(productId)
            .first();
          if (product && Number(product.price_paise) > 0) pricePaise = Number(product.price_paise);
        } catch {
          /* products table may not exist yet — keep the supplied price */
        }
      }

      if (/^(stack|bundle)-\d+off$/.test(variantId)) {
        pricePaise = Math.round(pricePaise * (1 - stackDiscountPercent / 100));
      }

      subtotalPaise += pricePaise * quantity;
      items.push({
        productId,
        name: String(item?.name || ''),
        slug: String(item?.slug || ''),
        image: String(item?.image || ''),
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
    const shippingPaise = subtotalPaise >= freeShippingThreshold ? 0 : shippingChargePaise;

    // Coupon discounts are recomputed from the code's own terms.
    const couponCode = String(data.couponCode || '').trim().toUpperCase();
    let discountPaise = 0;
    if (couponCode) {
      const coupon = await lookupCoupon(db, couponCode);
      if (coupon && subtotalPaise >= coupon.minOrderPaise) {
        discountPaise = coupon.discountPercent
          ? Math.round((subtotalPaise * Math.min(100, Math.max(0, coupon.discountPercent))) / 100)
          : Math.min(subtotalPaise, Math.max(0, coupon.flatDiscountPaise || 0));
      }
    }

    const paymentMethod = data.paymentMethod || 'RAZORPAY';
    // Cash-on-delivery carries the same ₹25 handling fee the checkout screen shows.
    const codFeePaise = /cod|cash on delivery/i.test(paymentMethod) ? 2500 : 0;
    const totalPaise = Math.max(0, subtotalPaise - discountPaise + shippingPaise + codFeePaise);
    const paymentStatus = data.paymentStatus || 'PAID';
    const fulfillmentStatus = data.fulfillmentStatus || 'VERIFIED';
    const courierPartner = data.courierPartner || 'BlueDart Express (Vapi Hub)';
    const trackingNumber = data.trackingNumber || ('VAP-' + Math.floor(10000000 + Math.random() * 90000000));

    await db.prepare(`
      INSERT INTO orders (
        id, order_number, customer_name, email, phone, address, city, state, pincode,
        items_json, subtotal_paise, shipping_paise, discount_paise, total_paise,
        payment_method, payment_status, fulfillment_status, courier_partner, tracking_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        payment_status = excluded.payment_status,
        fulfillment_status = excluded.fulfillment_status,
        courier_partner = excluded.courier_partner,
        tracking_number = excluded.tracking_number,
        updated_at = datetime('now', 'utc')
    `).bind(
      id, orderNumber, customerName, email, phone, address, city, state, pincode,
      itemsJson, subtotalPaise, shippingPaise, discountPaise, totalPaise,
      paymentMethod, paymentStatus, fulfillmentStatus, courierPartner, trackingNumber
    ).run();

    return new Response(
      JSON.stringify({
        success: true,
        orderId: id,
        orderNumber,
        trackingNumber,
        courierPartner,
        message: 'Order recorded in Cloudflare D1 edge database.'
      }),
      { status: 201, headers: corsHeaders }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Failed to insert order into D1' }),
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
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Failed to update order in D1' }),
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
    return new Response(
      JSON.stringify({ success: false, error: err.message || 'Failed to delete order' }),
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
