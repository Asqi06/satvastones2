// Cloudflare Worker / Pages Function: /api/growth-agent
// Admin-only dashboard API for Conversion Funnel Analytics, Autonomous Manager Controls,
// WAHA/Webhook/Email transport config, manual agent runs, and nightly owner report previews.
import { verifyAdminAuth } from '../../src/lib/server-auth';
import {
  buildAnalyticsSnapshot,
  dispatchEmail,
  dispatchWhatsapp,
  ensureGrowthTables,
  formatRupees,
  loadGrowthConfig,
  normalizePhone10,
  runAutonomousGrowthCycle,
  saveGrowthConfig,
  sendNightlyOwnerReport
} from '../../src/lib/growth-agent';
import { readJsonBody } from '../../src/lib/http';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

// GET /api/growth-agent?days=7
export async function onRequestGet(context: { request: Request; env: any }) {
  const { request, env } = context;
  const db = env?.DB;

  const isAdmin = await verifyAdminAuth(request, env);
  if (!isAdmin) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized: Admin authentication required.' }), {
      status: 401,
      headers: corsHeaders
    });
  }

  if (!db) {
    return new Response(JSON.stringify({ success: false, error: 'D1 Database binding not available.' }), {
      status: 503,
      headers: corsHeaders
    });
  }

  try {
    await ensureGrowthTables(db);
    const url = new URL(request.url);
    const days = Math.max(1, Math.min(90, Number(url.searchParams.get('days')) || 7));
    const [config, analytics] = await Promise.all([
      loadGrowthConfig(db, env),
      buildAnalyticsSnapshot(db, days)
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        config: {
          ...config,
          metaAccessTokenSet: Boolean(config.metaAccessToken),
          wahaApiKeySet: Boolean(config.wahaApiKey),
          webhookSecretSet: Boolean(config.webhookSecret),
          emailApiKeySet: Boolean(config.emailApiKey),
          // Never expose raw secrets unnecessarily — send empty placeholders if env-provided
          metaAccessToken: config.metaAccessToken ? '••••••••' : '',
          wahaApiKey: config.wahaApiKey ? '••••••••' : '',
          webhookSecret: config.webhookSecret ? '••••••••' : '',
          emailApiKey: config.emailApiKey ? '••••••••' : ''
        },
        analytics
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[api/growth-agent GET]', err);
    return new Response(JSON.stringify({ success: false, error: 'Unable to load growth analytics.' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// PUT /api/growth-agent (Save autonomous manager & channel configuration)
export async function onRequestPut(context: { request: Request; env: any }) {
  const { request, env } = context;
  const db = env?.DB;

  const isAdmin = await verifyAdminAuth(request, env);
  if (!isAdmin) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized.' }), {
      status: 401,
      headers: corsHeaders
    });
  }

  if (!db) {
    return new Response(JSON.stringify({ success: false, error: 'Database unavailable.' }), {
      status: 503,
      headers: corsHeaders
    });
  }

  try {
    await ensureGrowthTables(db);
    const body = await readJsonBody<Record<string, any>>(request, 32 * 1024);
    const current = await loadGrowthConfig(db, env);

    // Keep existing secrets if the UI sent the masked placeholder
    const keepIfMasked = (incoming: unknown, existing: string) => {
      const str = String(incoming ?? '').trim();
      if (!str || str === '••••••••') return existing;
      return str;
    };

    const updated = await saveGrowthConfig(db, {
      enabled: body.enabled !== undefined ? Boolean(body.enabled) : current.enabled,
      whatsappProvider: ['copilot', 'meta', 'waha', 'webhook'].includes(body.whatsappProvider)
        ? body.whatsappProvider
        : current.whatsappProvider,
      metaPhoneNumberId:
        body.metaPhoneNumberId !== undefined ? String(body.metaPhoneNumberId).trim() : current.metaPhoneNumberId,
      metaAccessToken:
        body.metaAccessToken !== undefined
          ? keepIfMasked(body.metaAccessToken, current.metaAccessToken)
          : current.metaAccessToken,
      metaTemplateName:
        body.metaTemplateName !== undefined ? String(body.metaTemplateName).trim() || 'hello_world' : current.metaTemplateName,
      metaTemplateLang:
        body.metaTemplateLang !== undefined ? String(body.metaTemplateLang).trim() || 'en_US' : current.metaTemplateLang,
      metaWebhookVerifyToken:
        body.metaWebhookVerifyToken !== undefined
          ? String(body.metaWebhookVerifyToken).trim() || 'satvastones_wa_verify_2026'
          : current.metaWebhookVerifyToken,
      wahaBaseUrl: body.wahaBaseUrl !== undefined ? String(body.wahaBaseUrl).trim() : current.wahaBaseUrl,
      wahaApiKey: body.wahaApiKey !== undefined ? keepIfMasked(body.wahaApiKey, current.wahaApiKey) : current.wahaApiKey,
      wahaSession: body.wahaSession !== undefined ? String(body.wahaSession).trim() || 'default' : current.wahaSession,
      webhookUrl: body.webhookUrl !== undefined ? String(body.webhookUrl).trim() : current.webhookUrl,
      webhookSecret:
        body.webhookSecret !== undefined ? keepIfMasked(body.webhookSecret, current.webhookSecret) : current.webhookSecret,
      emailProvider: ['off', 'resend', 'brevo'].includes(body.emailProvider)
        ? body.emailProvider
        : current.emailProvider,
      emailApiKey: body.emailApiKey !== undefined ? keepIfMasked(body.emailApiKey, current.emailApiKey) : current.emailApiKey,
      emailFrom: body.emailFrom !== undefined ? String(body.emailFrom).trim() : current.emailFrom,
      ownerEmail: body.ownerEmail !== undefined ? String(body.ownerEmail).trim() : current.ownerEmail,
      ownerUrgentAlertsEnabled:
        body.ownerUrgentAlertsEnabled !== undefined
          ? Boolean(body.ownerUrgentAlertsEnabled)
          : current.ownerUrgentAlertsEnabled,
      urgentCartThresholdPaise:
        body.urgentCartThresholdPaise !== undefined
          ? Math.max(0, Number(body.urgentCartThresholdPaise) || 79900)
          : current.urgentCartThresholdPaise,
      dailyReportEnabled:
        body.dailyReportEnabled !== undefined ? Boolean(body.dailyReportEnabled) : current.dailyReportEnabled,
      dailyReportHourIst:
        body.dailyReportHourIst !== undefined ? Number(body.dailyReportHourIst) : current.dailyReportHourIst,
      maxDailyWhatsapp:
        body.maxDailyWhatsapp !== undefined ? Number(body.maxDailyWhatsapp) : current.maxDailyWhatsapp,
      quietHoursEnabled:
        body.quietHoursEnabled !== undefined ? Boolean(body.quietHoursEnabled) : current.quietHoursEnabled,
      checkoutAbandonDelayMins:
        body.checkoutAbandonDelayMins !== undefined
          ? Number(body.checkoutAbandonDelayMins)
          : current.checkoutAbandonDelayMins,
      exitOfferCouponCode:
        body.exitOfferCouponCode !== undefined
          ? String(body.exitOfferCouponCode).trim().toUpperCase() || 'STAY10'
          : current.exitOfferCouponCode
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Growth Manager & Informing Agent configuration saved.',
        config: {
          ...updated,
          metaAccessToken: updated.metaAccessToken ? '••••••••' : '',
          wahaApiKey: updated.wahaApiKey ? '••••••••' : '',
          webhookSecret: updated.webhookSecret ? '••••••••' : '',
          emailApiKey: updated.emailApiKey ? '••••••••' : ''
        }
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error('[api/growth-agent PUT]', err);
    return new Response(JSON.stringify({ success: false, error: 'Failed to save configuration.' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

// POST /api/growth-agent (Execute manual actions: run_cycle, send_daily_report, test_whatsapp, test_email, nudge_cart)
export async function onRequestPost(context: { request: Request; env: any }) {
  const { request, env } = context;
  const db = env?.DB;

  const isAdmin = await verifyAdminAuth(request, env);
  if (!isAdmin) {
    return new Response(JSON.stringify({ success: false, error: 'Unauthorized.' }), {
      status: 401,
      headers: corsHeaders
    });
  }

  if (!db) {
    return new Response(JSON.stringify({ success: false, error: 'Database unavailable.' }), {
      status: 503,
      headers: corsHeaders
    });
  }

  try {
    await ensureGrowthTables(db);
    const body = await readJsonBody<Record<string, any>>(request, 16 * 1024);
    const action = String(body.action || '').trim();
    const config = await loadGrowthConfig(db, env);

    if (action === 'run_cycle') {
      const summary = await runAutonomousGrowthCycle(db, env, {
        manual: true,
        bypassQuietHours: Boolean(body.bypassQuietHours)
      });
      return new Response(JSON.stringify({ success: true, summary }), { status: 200, headers: corsHeaders });
    }

    if (action === 'send_daily_report') {
      const report = await sendNightlyOwnerReport(db, env, true);
      return new Response(JSON.stringify({ success: true, report }), { status: 200, headers: corsHeaders });
    }

    if (action === 'test_whatsapp') {
      const phone = normalizePhone10(body.phone || '');
      const res = await dispatchWhatsapp(db, config, {
        phone10: phone,
        recipientName: 'Owner Test',
        message: 'Satvastones Autonomous Growth Manager test ping ✨ Your WAHA / Webhook WhatsApp transport is connected and working!',
        triggerType: 'admin_test_whatsapp'
      });
      return new Response(JSON.stringify({ success: res.ok, result: res }), {
        status: res.ok ? 200 : 502,
        headers: corsHeaders
      });
    }

    if (action === 'test_email') {
      const targetEmail = String(body.email || config.ownerEmail || '').trim();
      const res = await dispatchEmail(db, config, {
        to: targetEmail,
        recipientName: 'Satvastones Owner',
        subject: 'Satvastones AI Store Manager — Test Email Confirmed ✓',
        html: '<p>Your Satvastones Informing Agent email channel is connected and ready for urgent store alerts and nightly daily reports.</p>',
        text: 'Your Satvastones Informing Agent email channel is connected and ready for urgent store alerts and nightly daily reports.',
        channel: 'owner_alert',
        triggerType: 'admin_test_email'
      });
      return new Response(JSON.stringify({ success: res.ok, result: res }), {
        status: res.ok ? 200 : 502,
        headers: corsHeaders
      });
    }

    if (action === 'nudge_cart') {
      const cartId = String(body.cartId || '').trim();
      const cart: any = await db.prepare('SELECT * FROM abandoned_carts WHERE id = ? LIMIT 1').bind(cartId).first();
      if (!cart) {
        return new Response(JSON.stringify({ success: false, error: 'Abandoned cart not found.' }), {
          status: 404,
          headers: corsHeaders
        });
      }
      let items: any[] = [];
      try {
        items = JSON.parse(cart.items_json || '[]');
      } catch {}
      const leadItem = items[0]?.name || 'your Satvastones piece';
      const couponCode = config.exitOfferCouponCode || 'STAY10';
      const name = String(cart.full_name || 'there');
      const waMsg = `Hi ${name} ✨ Your *${leadItem}* (${formatRupees(cart.subtotal_paise)}) is still saved at Satvastones! Apply code *${couponCode}* for an instant *10% OFF*: https://www.satvastones.in/checkout`;

      const results: Record<string, any> = {};
      if (cart.whatsapp_number) {
        results.whatsapp = await dispatchWhatsapp(db, config, {
          phone10: String(cart.whatsapp_number),
          recipientName: name,
          message: waMsg,
          triggerType: 'manual_admin_nudge',
          couponCode
        });
      }
      if (cart.email) {
        results.email = await dispatchEmail(db, config, {
          to: String(cart.email),
          recipientName: name,
          subject: `10% OFF (${couponCode}) waiting on your Satvastones bag`,
          html: `<p>Hi ${name},</p><p>Your <strong>${leadItem}</strong> (${formatRupees(cart.subtotal_paise)}) is still reserved. Use code <strong>${couponCode}</strong> at <a href="https://www.satvastones.in/checkout">checkout</a> for 10% OFF.</p>`,
          text: waMsg,
          channel: 'email',
          triggerType: 'manual_admin_nudge',
          couponCode
        });
      }
      await db
        .prepare(
          `UPDATE abandoned_carts SET recovery_step = MAX(recovery_step, 1), last_reminded_at = datetime('now', 'utc'), updated_at = datetime('now', 'utc') WHERE id = ?`
        )
        .bind(cartId)
        .run();

      return new Response(JSON.stringify({ success: true, results }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: false, error: 'Unknown action.' }), {
      status: 400,
      headers: corsHeaders
    });
  } catch (err: any) {
    console.error('[api/growth-agent POST]', err);
    return new Response(JSON.stringify({ success: false, error: 'Agent action failed.' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
