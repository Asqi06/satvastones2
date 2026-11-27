// Cloudflare Worker / Pages Function: /api/funnel-events
// Ingests first-party shopper interaction events and syncs live abandoned_carts state in D1.
import {
  ensureGrowthTables,
  formatRupees,
  loadGrowthConfig,
  normalizePhone10,
  notifyOwnerUrgent
} from '../../src/lib/growth-agent';
import { clientIp, isRateLimited, readJsonBody } from '../../src/lib/http';

const ALLOWED_EVENTS = new Set([
  'page_view',
  'product_view',
  'add_to_cart',
  'checkout_started',
  'checkout_field_filled',
  'exit_offer_shown',
  'exit_offer_accepted',
  'checkout_abandoned',
  'order_completed'
]);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function onRequestPost(context: { request: Request; env: any; waitUntil?: (p: Promise<any>) => void }) {
  const { request, env, waitUntil } = context;
  const db = env?.DB;

  if (!db) {
    return new Response(JSON.stringify({ success: false, error: 'Database unavailable.' }), {
      status: 503,
      headers: corsHeaders
    });
  }

  const ip = clientIp(request);
  if (isRateLimited(`funnel:${ip}`, 120, 60 * 1000)) {
    return new Response(JSON.stringify({ success: false, error: 'Rate limit exceeded.' }), {
      status: 429,
      headers: corsHeaders
    });
  }

  try {
    await ensureGrowthTables(db);
    const data = await readJsonBody<Record<string, any>>(request, 32 * 1024);

    const eventType = String(data.eventType || '').trim();
    if (!ALLOWED_EVENTS.has(eventType)) {
      return new Response(JSON.stringify({ success: false, error: 'Unsupported event type.' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const sessionId = String(data.sessionId || '').trim().slice(0, 80) || `sess-${crypto.randomUUID().slice(0, 12)}`;
    const customerId = data.customerId ? String(data.customerId).trim().slice(0, 80) : null;
    const fullName = String(data.fullName || '').trim().slice(0, 120);
    const email = String(data.email || '').trim().toLowerCase().slice(0, 160);
    const whatsappNumber = normalizePhone10(data.whatsappNumber || data.phone || '');
    const pagePath = String(data.pagePath || '').trim().slice(0, 220);
    const productId = data.productId ? String(data.productId).trim().slice(0, 80) : null;
    const productSlug = data.productSlug ? String(data.productSlug).trim().slice(0, 140) : null;
    const productName = data.productName ? String(data.productName).trim().slice(0, 180) : null;
    const valuePaise = Math.max(0, Math.round(Number(data.valuePaise) || 0));
    const metadataJson = data.metadata ? JSON.stringify(data.metadata).slice(0, 2000) : null;

    // 1. Insert event into funnel_events
    await db
      .prepare(
        `INSERT INTO funnel_events (
          id, session_id, customer_id, email, whatsapp_number, event_type,
          page_path, product_id, product_slug, product_name, value_paise, metadata_json, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'utc'))`
      )
      .bind(
        `ev-${crypto.randomUUID()}`,
        sessionId,
        customerId,
        email || null,
        whatsappNumber || null,
        eventType,
        pagePath,
        productId,
        productSlug,
        productName,
        valuePaise,
        metadataJson
      )
      .run();

    // 2. Sync live abandoned_carts record for cart & checkout funnel stages
    const cartEvents = new Set([
      'add_to_cart',
      'checkout_started',
      'checkout_field_filled',
      'exit_offer_shown',
      'exit_offer_accepted',
      'checkout_abandoned',
      'order_completed'
    ]);

    if (cartEvents.has(eventType)) {
      const items = Array.isArray(data.items)
        ? data.items.slice(0, 25).map((it: any) => ({
            productId: String(it?.productId || ''),
            name: String(it?.name || '').slice(0, 140),
            slug: String(it?.slug || '').slice(0, 140),
            pricePaise: Math.max(0, Math.round(Number(it?.pricePaise) || 0)),
            quantity: Math.max(1, Math.min(20, Math.round(Number(it?.quantity) || 1)))
          }))
        : [];
      const itemsJson = items.length ? JSON.stringify(items) : null;
      const subtotalPaise =
        Number(data.subtotalPaise) > 0
          ? Math.round(Number(data.subtotalPaise))
          : items.reduce((sum: number, it: any) => sum + it.pricePaise * it.quantity, 0) || valuePaise;

      let nextStage = 'CART_ACTIVE';
      if (eventType === 'checkout_started' || eventType === 'checkout_field_filled' || eventType === 'exit_offer_shown' || eventType === 'exit_offer_accepted') {
        nextStage = 'CHECKOUT_STARTED';
      } else if (eventType === 'checkout_abandoned') {
        nextStage = 'CHECKOUT_ABANDONED';
      } else if (eventType === 'order_completed') {
        nextStage = 'CONVERTED';
      }

      const exitShown = eventType === 'exit_offer_shown' || eventType === 'exit_offer_accepted' ? 1 : 0;
      const exitAccepted = eventType === 'exit_offer_accepted' ? 1 : 0;
      const fieldsJson = data.checkoutFields ? JSON.stringify(data.checkoutFields).slice(0, 500) : null;
      const orderRef = data.orderNumber ? String(data.orderNumber).slice(0, 64) : null;

      await db
        .prepare(
          `INSERT INTO abandoned_carts (
            id, session_id, customer_id, full_name, email, whatsapp_number,
            items_json, subtotal_paise, stage, checkout_fields_json,
            exit_offer_shown, exit_offer_accepted, recovered_order_id, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'utc'), datetime('now', 'utc'))
          ON CONFLICT(session_id) DO UPDATE SET
            customer_id = COALESCE(excluded.customer_id, abandoned_carts.customer_id),
            full_name = CASE WHEN excluded.full_name <> '' THEN excluded.full_name ELSE abandoned_carts.full_name END,
            email = CASE WHEN excluded.email <> '' THEN excluded.email ELSE abandoned_carts.email END,
            whatsapp_number = CASE WHEN excluded.whatsapp_number <> '' THEN excluded.whatsapp_number ELSE abandoned_carts.whatsapp_number END,
            items_json = CASE WHEN excluded.items_json <> '[]' THEN excluded.items_json ELSE abandoned_carts.items_json END,
            subtotal_paise = CASE WHEN excluded.subtotal_paise > 0 THEN excluded.subtotal_paise ELSE abandoned_carts.subtotal_paise END,
            stage = CASE
              WHEN abandoned_carts.stage = 'CONVERTED' THEN 'CONVERTED'
              WHEN excluded.stage = 'CONVERTED' THEN 'CONVERTED'
              WHEN excluded.stage = 'CHECKOUT_ABANDONED' THEN 'CHECKOUT_ABANDONED'
              WHEN excluded.stage = 'CHECKOUT_STARTED' THEN 'CHECKOUT_STARTED'
              ELSE abandoned_carts.stage
            END,
            checkout_fields_json = COALESCE(excluded.checkout_fields_json, abandoned_carts.checkout_fields_json),
            exit_offer_shown = MAX(abandoned_carts.exit_offer_shown, excluded.exit_offer_shown),
            exit_offer_accepted = MAX(abandoned_carts.exit_offer_accepted, excluded.exit_offer_accepted),
            recovered_order_id = COALESCE(excluded.recovered_order_id, abandoned_carts.recovered_order_id),
            updated_at = datetime('now', 'utc')`
        )
        .bind(
          `cart-${crypto.randomUUID()}`,
          sessionId,
          customerId,
          fullName,
          email,
          whatsappNumber,
          itemsJson || '[]',
          subtotalPaise,
          nextStage,
          fieldsJson,
          exitShown,
          exitAccepted,
          orderRef
        )
        .run();

      // Immediate urgent owner email alert when a high-value checkout abandons with contact details
      if (eventType === 'checkout_abandoned' && (email || whatsappNumber)) {
        const alertJob = (async () => {
          const config = await loadGrowthConfig(db, env);
          if (subtotalPaise >= config.urgentCartThresholdPaise) {
            const existing: any = await db
              .prepare('SELECT id, urgent_alert_sent FROM abandoned_carts WHERE session_id = ? LIMIT 1')
              .bind(sessionId)
              .first();
            if (existing && Number(existing.urgent_alert_sent) === 0) {
              await db.prepare('UPDATE abandoned_carts SET urgent_alert_sent = 1 WHERE id = ?').bind(existing.id).run();
              const leadItem = items[0]?.name || 'Jewellery Bag';
              await notifyOwnerUrgent(db, env, {
                triggerType: 'checkout_abandoned_live',
                title: `Checkout Abandoned Live (${formatRupees(subtotalPaise)})`,
                summary: `${fullName || 'A shopper'} filled checkout details for ${leadItem} and left after seeing the exit offer. Automated WhatsApp/Email recovery is scheduled within ${config.checkoutAbandonDelayMins} mins.`,
                priority: 'HIGH',
                details: {
                  Customer: fullName || 'Guest',
                  Email: email || 'Not entered',
                  WhatsApp: whatsappNumber ? `+91 ${whatsappNumber}` : 'Not entered',
                  CartValue: formatRupees(subtotalPaise),
                  LeadItem: leadItem
                }
              });
            }
          }
        })();
        if (waitUntil) waitUntil(alertJob);
      }
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
  } catch (err: any) {
    console.error('[api/funnel-events POST]', err);
    return new Response(JSON.stringify({ success: false, error: 'Failed to record event.' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
