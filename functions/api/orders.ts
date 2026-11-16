// Cloudflare Pages Function: /api/orders
// Connects directly to Cloudflare D1 (SQLite) binding: context.env.DB
import { verifyAdminAuth } from '../../src/lib/server-auth';

interface Env {
  DB: any; // D1Database
  R2_BUCKET: any; // R2Bucket
  ADMIN_SECRET_KEY?: string;
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

  try {
    if (ref) {
      const q = ref.toUpperCase();
      const cleanDigits = ref.replace(/[^0-9]/g, '');

      // Query by Order Number, Tracking Number, Phone, or Email
      const stmt = db.prepare(`
        SELECT * FROM orders 
        WHERE UPPER(order_number) = ? 
           OR UPPER(tracking_number) = ? 
           OR email = ? 
           OR (length(?) >= 10 AND replace(phone, ' ', '') LIKE '%' || ? || '%')
        LIMIT 1
      `).bind(q, q, ref.toLowerCase(), cleanDigits, cleanDigits);

      const row = await stmt.first();

      if (!row) {
        return new Response(
          JSON.stringify({ success: false, message: 'No order found matching reference: ' + ref }),
          { status: 404, headers: corsHeaders }
        );
      }

      const order = formatOrderRow(row);
      return new Response(JSON.stringify({ success: true, order }), { status: 200, headers: corsHeaders });
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

    const id = data.id || ('ord-' + Date.now());
    const orderNumber = data.orderNumber || ('SAT-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000));
    const customerName = data.customerName || 'Valued Patron';
    const email = data.email || '';
    const phone = data.phone || '';
    const address = data.address || '';
    const city = data.city || '';
    const state = data.state || '';
    const pincode = data.pincode || '';
    const itemsJson = JSON.stringify(data.items || []);
    const subtotalPaise = Number(data.subtotalPaise) || 0;
    const shippingPaise = Number(data.shippingPaise) || 0;
    const discountPaise = Number(data.discountPaise) || 0;
    const totalPaise = Number(data.totalPaise) || 0;
    const paymentMethod = data.paymentMethod || 'RAZORPAY';
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

  try {
    const url = new URL(request.url);
    const orderNumber = url.searchParams.get('orderNumber');

    if (!orderNumber) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing orderNumber query param' }),
        { status: 400, headers: corsHeaders }
      );
    }

    await db.prepare(`DELETE FROM orders WHERE order_number = ?`).bind(orderNumber).run();

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
