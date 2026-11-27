// Cloudflare Worker / Pages Function: /api/whatsapp-webhook
// Handles Meta WhatsApp Cloud API Webhook verification (GET) and incoming events/statuses (POST).
// Automatically handles DPDP Act 2023 "STOP" opt-outs and notifies owner on incoming customer messages.
import {
  DEFAULT_GROWTH_CONFIG,
  ensureGrowthTables,
  loadGrowthConfig,
  normalizePhone10,
  notifyOwnerUrgent
} from '../../src/lib/growth-agent';

const STOP_KEYWORDS = new Set(['stop', 'unsubscribe', 'optout', 'opt out', 'cancel', 'no promo', 'remove']);

// GET /api/whatsapp-webhook — Meta Webhook Verification Handshake
export async function onRequestGet(context: { request: Request; env: any }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  let expectedToken = String(env?.META_WEBHOOK_VERIFY_TOKEN || DEFAULT_GROWTH_CONFIG.metaWebhookVerifyToken).trim();
  if (env?.DB) {
    try {
      const cfg = await loadGrowthConfig(env.DB, env);
      if (cfg.metaWebhookVerifyToken) expectedToken = cfg.metaWebhookVerifyToken;
    } catch {
      /* fallback to env/default verify token */
    }
  }

  if (mode === 'subscribe' && token && token === expectedToken && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }

  return new Response('Forbidden: Invalid Meta webhook verify token.', {
    status: 403,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}

// POST /api/whatsapp-webhook — Incoming Messages & Delivery Statuses from Meta
export async function onRequestPost(context: { request: Request; env: any; waitUntil?: (p: Promise<any>) => void }) {
  const { request, env, waitUntil } = context;
  const db = env?.DB;

  let payload: any = null;
  try {
    payload = await request.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  if (db && payload?.object === 'whatsapp_business_account') {
    const processJob = (async () => {
      try {
        await ensureGrowthTables(db);
        const entries = Array.isArray(payload.entry) ? payload.entry : [];

        for (const entry of entries) {
          const changes = Array.isArray(entry?.changes) ? entry.changes : [];
          for (const change of changes) {
            const value = change?.value;
            if (!value) continue;

            // 1. Incoming customer messages
            const messages = Array.isArray(value.messages) ? value.messages : [];
            const contacts = Array.isArray(value.contacts) ? value.contacts : [];
            const profileName = contacts[0]?.profile?.name || 'WhatsApp Customer';

            for (const msg of messages) {
              const fromPhone10 = normalizePhone10(msg?.from || '');
              const textBody = String(msg?.text?.body || msg?.button?.text || `[${msg?.type || 'message'}]`).trim();
              const normalizedBody = textBody.toLowerCase().replace(/[^a-z\s]/g, '').trim();

              if (!fromPhone10) continue;

              // DPDP Act 2023 Automatic Promotional Opt-Out on STOP
              if (STOP_KEYWORDS.has(normalizedBody)) {
                try {
                  await db
                    .prepare(
                      `UPDATE whatsapp_leads
                       SET promo_consent = 0, consent_timestamp_utc = ?, updated_at = datetime('now', 'utc')
                       WHERE whatsapp_number = ?`
                    )
                    .bind(new Date().toISOString(), fromPhone10)
                    .run();
                } catch {}

                await db
                  .prepare(
                    `INSERT INTO agent_outreach_logs (
                      id, channel, provider, trigger_type, recipient_name, recipient_contact,
                      message_body, status, created_at
                    ) VALUES (?, 'whatsapp', 'meta', 'customer_opt_out', ?, ?, ?, 'OPTED_OUT', datetime('now', 'utc'))`
                  )
                  .bind(`out-${crypto.randomUUID()}`, profileName, fromPhone10, `Customer replied: "${textBody}" -> Promo consent set to NO.`)
                  .run();
                continue;
              }

              // Log incoming customer reply & notify owner immediately
              await db
                .prepare(
                  `INSERT INTO agent_outreach_logs (
                    id, channel, provider, trigger_type, recipient_name, recipient_contact,
                    message_body, status, created_at
                  ) VALUES (?, 'whatsapp', 'meta', 'customer_reply', ?, ?, ?, 'RECEIVED', datetime('now', 'utc'))`
                )
                .bind(`out-${crypto.randomUUID()}`, profileName, fromPhone10, textBody.slice(0, 1000))
                .run();

              await notifyOwnerUrgent(db, env, {
                triggerType: 'whatsapp_customer_reply',
                title: `WhatsApp Reply from ${profileName} (+91 ${fromPhone10})`,
                summary: `A shopper replied to your Satvastones WhatsApp message: "${textBody.slice(0, 280)}"`,
                priority: 'HIGH',
                details: {
                  Customer: profileName,
                  WhatsApp: `+91 ${fromPhone10}`,
                  Message: textBody.slice(0, 500)
                }
              });
            }

            // 2. Delivery failure alerts from Meta statuses
            const statuses = Array.isArray(value.statuses) ? value.statuses : [];
            for (const st of statuses) {
              if (st?.status === 'failed') {
                const errTitle = st?.errors?.[0]?.title || st?.errors?.[0]?.message || 'Meta delivery failure';
                const recip = normalizePhone10(st?.recipient_id || '');
                await db
                  .prepare(
                    `INSERT INTO agent_outreach_logs (
                      id, channel, provider, trigger_type, recipient_contact,
                      message_body, status, error_message, created_at
                    ) VALUES (?, 'whatsapp', 'meta', 'meta_status_failed', ?, ?, 'FAILED', ?, datetime('now', 'utc'))`
                  )
                  .bind(`out-${crypto.randomUUID()}`, recip || 'unknown', `Meta message ${st?.id || ''} failed`, String(errTitle).slice(0, 300))
                  .run();
              }
            }
          }
        }
      } catch (err) {
        console.error('[api/whatsapp-webhook POST]', err);
      }
    })();

    if (waitUntil) waitUntil(processJob);
    else await processJob;
  }

  // Meta requires fast 200 OK acknowledgement
  return new Response('EVENT_RECEIVED', {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
