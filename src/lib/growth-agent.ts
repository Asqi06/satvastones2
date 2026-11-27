// Autonomous Conversion Funnel, Cart Recovery & Owner Informing Agent
// Runs natively on Cloudflare Workers + D1 + Cron Triggers (every 10 mins)
// Supports pluggable WAHA HTTP API, Custom Webhooks (Evolution/n8n/Make), Resend/Brevo Email, and Co-Pilot Mode.

const SITE_URL = 'https://www.satvastones.in';

export interface GrowthAgentConfig {
  enabled: boolean;
  whatsappProvider: 'copilot' | 'waha' | 'webhook';
  wahaBaseUrl: string;
  wahaApiKey: string;
  wahaSession: string;
  webhookUrl: string;
  webhookSecret: string;
  emailProvider: 'off' | 'resend' | 'brevo';
  emailApiKey: string;
  emailFrom: string;
  ownerEmail: string;
  ownerUrgentAlertsEnabled: boolean;
  urgentCartThresholdPaise: number;
  dailyReportEnabled: boolean;
  dailyReportHourIst: number;
  maxDailyWhatsapp: number;
  quietHoursEnabled: boolean;
  checkoutAbandonDelayMins: number;
  exitOfferCouponCode: string;
  lastDailyReportDateIst: string;
}

export const DEFAULT_GROWTH_CONFIG: GrowthAgentConfig = {
  enabled: true,
  whatsappProvider: 'copilot',
  wahaBaseUrl: '',
  wahaApiKey: '',
  wahaSession: 'default',
  webhookUrl: '',
  webhookSecret: '',
  emailProvider: 'off',
  emailApiKey: '',
  emailFrom: 'Satvastones Jewellery <hello@satvastones.in>',
  ownerEmail: 'support@satvastones.in',
  ownerUrgentAlertsEnabled: true,
  urgentCartThresholdPaise: 79900, // ₹799+ abandoned checkout triggers immediate owner alert
  dailyReportEnabled: true,
  dailyReportHourIst: 21, // 9:00 PM IST
  maxDailyWhatsapp: 30,
  quietHoursEnabled: true,
  checkoutAbandonDelayMins: 12, // 10–15 min fast recovery
  exitOfferCouponCode: 'STAY10',
  lastDailyReportDateIst: ''
};

export async function ensureGrowthTables(db: any): Promise<void> {
  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS funnel_events (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        customer_id TEXT,
        email TEXT,
        whatsapp_number TEXT,
        event_type TEXT NOT NULL,
        page_path TEXT,
        product_id TEXT,
        product_slug TEXT,
        product_name TEXT,
        value_paise INTEGER NOT NULL DEFAULT 0,
        metadata_json TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS abandoned_carts (
        id TEXT PRIMARY KEY,
        session_id TEXT UNIQUE NOT NULL,
        customer_id TEXT,
        full_name TEXT,
        email TEXT,
        whatsapp_number TEXT,
        items_json TEXT NOT NULL DEFAULT '[]',
        subtotal_paise INTEGER NOT NULL DEFAULT 0,
        stage TEXT NOT NULL DEFAULT 'CART_ACTIVE',
        checkout_fields_json TEXT,
        exit_offer_shown INTEGER NOT NULL DEFAULT 0,
        exit_offer_accepted INTEGER NOT NULL DEFAULT 0,
        recovery_step INTEGER NOT NULL DEFAULT 0,
        last_reminded_at TEXT,
        urgent_alert_sent INTEGER NOT NULL DEFAULT 0,
        recovered_order_id TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
      )`
    )
    .run();

  await db
    .prepare(
      `CREATE TABLE IF NOT EXISTS agent_outreach_logs (
        id TEXT PRIMARY KEY,
        channel TEXT NOT NULL,
        provider TEXT NOT NULL,
        trigger_type TEXT NOT NULL,
        recipient_name TEXT,
        recipient_contact TEXT NOT NULL,
        coupon_code TEXT,
        subject TEXT,
        message_body TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'QUEUED',
        error_message TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now', 'utc'))
      )`
    )
    .run();

  await db.prepare('CREATE INDEX IF NOT EXISTS idx_funnel_type_time ON funnel_events(event_type, created_at)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_funnel_product ON funnel_events(product_slug, event_type)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_funnel_session ON funnel_events(session_id)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_abandoned_stage ON abandoned_carts(stage, updated_at)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS idx_outreach_time ON agent_outreach_logs(created_at)').run();
}

export function normalizePhone10(raw: unknown): string {
  const digits = String(raw || '').replace(/[^0-9]/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

export function formatRupees(paise: number): string {
  return `₹${Math.round(Number(paise || 0) / 100).toLocaleString('en-IN')}`;
}

export function getIstNow(): { dateStr: string; hour: number; minute: number } {
  const now = new Date();
  const istMs = now.getTime() + 330 * 60 * 1000; // UTC + 5:30
  const ist = new Date(istMs);
  return {
    dateStr: ist.toISOString().slice(0, 10),
    hour: ist.getUTCHours(),
    minute: ist.getUTCMinutes()
  };
}

export function isIstQuietHours(): boolean {
  const { hour, minute } = getIstNow();
  // Quiet hours: 21:00 (9:00 PM) to 09:30 (9:30 AM) IST
  if (hour >= 21 || hour < 9) return true;
  if (hour === 9 && minute < 30) return true;
  return false;
}

export async function loadGrowthConfig(db: any, env?: Record<string, any>): Promise<GrowthAgentConfig> {
  let stored: Partial<GrowthAgentConfig> = {};
  try {
    const row: any = await db
      .prepare(`SELECT value_json FROM site_settings WHERE key = 'growth_agent_config' LIMIT 1`)
      .first();
    if (row?.value_json) {
      const parsed = JSON.parse(row.value_json);
      if (parsed && typeof parsed === 'object') stored = parsed;
    }
  } catch {
    /* site_settings may not have key yet */
  }

  return {
    ...DEFAULT_GROWTH_CONFIG,
    ...stored,
    // Environment secrets override empty UI fields safely
    wahaBaseUrl: String(stored.wahaBaseUrl || env?.WAHA_BASE_URL || '').trim().replace(/\/+$/, ''),
    wahaApiKey: String(stored.wahaApiKey || env?.WAHA_API_KEY || '').trim(),
    wahaSession: String(stored.wahaSession || env?.WAHA_SESSION || 'default').trim() || 'default',
    webhookUrl: String(stored.webhookUrl || env?.WHATSAPP_WEBHOOK_URL || '').trim(),
    webhookSecret: String(stored.webhookSecret || env?.WHATSAPP_WEBHOOK_SECRET || '').trim(),
    emailApiKey: String(stored.emailApiKey || env?.RESEND_API_KEY || env?.BREVO_API_KEY || '').trim(),
    ownerEmail: String(stored.ownerEmail || env?.OWNER_ALERT_EMAIL || env?.SUPPORT_EMAIL || 'support@satvastones.in').trim()
  };
}

export async function saveGrowthConfig(db: any, partial: Partial<GrowthAgentConfig>): Promise<GrowthAgentConfig> {
  const current = await loadGrowthConfig(db);
  const next: GrowthAgentConfig = {
    ...current,
    ...partial,
    wahaBaseUrl: String(partial.wahaBaseUrl ?? current.wahaBaseUrl).trim().replace(/\/+$/, ''),
    wahaSession: String(partial.wahaSession ?? current.wahaSession).trim() || 'default',
    maxDailyWhatsapp: Math.max(1, Math.min(200, Number(partial.maxDailyWhatsapp ?? current.maxDailyWhatsapp) || 30)),
    checkoutAbandonDelayMins: Math.max(
      5,
      Math.min(120, Number(partial.checkoutAbandonDelayMins ?? current.checkoutAbandonDelayMins) || 12)
    ),
    dailyReportHourIst: Math.max(0, Math.min(23, Number(partial.dailyReportHourIst ?? current.dailyReportHourIst) ?? 21))
  };

  await db
    .prepare(
      `INSERT INTO site_settings (key, value_json, updated_at)
       VALUES ('growth_agent_config', ?, datetime('now', 'utc'))
       ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = datetime('now', 'utc')`
    )
    .bind(JSON.stringify(next))
    .run();

  return next;
}

async function logOutreach(
  db: any,
  entry: {
    channel: 'whatsapp' | 'email' | 'owner_alert' | 'daily_report';
    provider: string;
    triggerType: string;
    recipientName?: string;
    recipientContact: string;
    couponCode?: string | null;
    subject?: string | null;
    messageBody: string;
    status: string;
    errorMessage?: string | null;
  }
): Promise<string> {
  const id = `out-${crypto.randomUUID()}`;
  await db
    .prepare(
      `INSERT INTO agent_outreach_logs (
        id, channel, provider, trigger_type, recipient_name, recipient_contact,
        coupon_code, subject, message_body, status, error_message, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', 'utc'))`
    )
    .bind(
      id,
      entry.channel,
      entry.provider,
      entry.triggerType,
      String(entry.recipientName || '').slice(0, 120),
      String(entry.recipientContact || '').slice(0, 160),
      entry.couponCode || null,
      entry.subject ? String(entry.subject).slice(0, 200) : null,
      String(entry.messageBody || '').slice(0, 4000),
      entry.status,
      entry.errorMessage ? String(entry.errorMessage).slice(0, 400) : null
    )
    .run();
  return id;
}

/** Pluggable WhatsApp dispatcher: WAHA HTTP API, Custom Webhook (Evolution/n8n/Make), or Co-Pilot Draft */
export async function dispatchWhatsapp(
  db: any,
  config: GrowthAgentConfig,
  params: {
    phone10: string;
    recipientName?: string;
    message: string;
    triggerType: string;
    couponCode?: string | null;
    metadata?: Record<string, any>;
  }
): Promise<{ ok: boolean; status: string; error?: string }> {
  const cleanPhone = normalizePhone10(params.phone10);
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    return { ok: false, status: 'FAILED', error: 'Invalid Indian mobile number.' };
  }

  // Co-pilot mode or unconfigured endpoint -> queue ready-to-send draft in Admin Desk
  if (
    config.whatsappProvider === 'copilot' ||
    (config.whatsappProvider === 'waha' && !config.wahaBaseUrl) ||
    (config.whatsappProvider === 'webhook' && !config.webhookUrl)
  ) {
    await logOutreach(db, {
      channel: 'whatsapp',
      provider: 'copilot',
      triggerType: params.triggerType,
      recipientName: params.recipientName,
      recipientContact: cleanPhone,
      couponCode: params.couponCode,
      messageBody: params.message,
      status: 'COPILOT_DRAFT'
    });
    return { ok: true, status: 'COPILOT_DRAFT' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    if (config.whatsappProvider === 'waha') {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (config.wahaApiKey) headers['X-Api-Key'] = config.wahaApiKey;

      const res = await fetch(`${config.wahaBaseUrl}/api/sendText`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session: config.wahaSession || 'default',
          chatId: `91${cleanPhone}@c.us`,
          text: params.message
        }),
        signal: controller.signal
      });

      const ok = res.ok;
      const errText = ok ? null : `WAHA HTTP ${res.status}: ${(await res.text().catch(() => '')).slice(0, 180)}`;
      await logOutreach(db, {
        channel: 'whatsapp',
        provider: 'waha',
        triggerType: params.triggerType,
        recipientName: params.recipientName,
        recipientContact: cleanPhone,
        couponCode: params.couponCode,
        messageBody: params.message,
        status: ok ? 'SENT' : 'FAILED',
        errorMessage: errText
      });
      return { ok, status: ok ? 'SENT' : 'FAILED', error: errText || undefined };
    }

    // Custom Webhook (Evolution API, n8n, Make, Pabbly, Aisensy, etc.)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (config.webhookSecret) headers['X-Webhook-Secret'] = config.webhookSecret;

    const res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        phone: `91${cleanPhone}`,
        phone10: cleanPhone,
        name: params.recipientName || 'Patron',
        message: params.message,
        couponCode: params.couponCode || null,
        triggerType: params.triggerType,
        checkoutUrl: `${SITE_URL}/checkout`,
        ...(params.metadata || {})
      }),
      signal: controller.signal
    });

    const ok = res.ok;
    const errText = ok ? null : `Webhook HTTP ${res.status}: ${(await res.text().catch(() => '')).slice(0, 180)}`;
    await logOutreach(db, {
      channel: 'whatsapp',
      provider: 'webhook',
      triggerType: params.triggerType,
      recipientName: params.recipientName,
      recipientContact: cleanPhone,
      couponCode: params.couponCode,
      messageBody: params.message,
      status: ok ? 'SENT' : 'FAILED',
      errorMessage: errText
    });
    return { ok, status: ok ? 'SENT' : 'FAILED', error: errText || undefined };
  } catch (err: any) {
    const errMsg = String(err?.message || 'WhatsApp transport failed');
    await logOutreach(db, {
      channel: 'whatsapp',
      provider: config.whatsappProvider,
      triggerType: params.triggerType,
      recipientName: params.recipientName,
      recipientContact: cleanPhone,
      couponCode: params.couponCode,
      messageBody: params.message,
      status: 'FAILED',
      errorMessage: errMsg
    });
    return { ok: false, status: 'FAILED', error: errMsg };
  } finally {
    clearTimeout(timer);
  }
}

/** Pluggable Email dispatcher: Resend (3,000 free/mo), Brevo (300 free/day), or Co-Pilot Draft */
export async function dispatchEmail(
  db: any,
  config: GrowthAgentConfig,
  params: {
    to: string;
    recipientName?: string;
    subject: string;
    html: string;
    text: string;
    channel?: 'email' | 'owner_alert' | 'daily_report';
    triggerType: string;
    couponCode?: string | null;
  }
): Promise<{ ok: boolean; status: string; error?: string }> {
  const toEmail = String(params.to || '').trim().toLowerCase();
  const channel = params.channel || 'email';
  if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
    return { ok: false, status: 'FAILED', error: 'Invalid recipient email.' };
  }

  if (config.emailProvider === 'off' || !config.emailApiKey) {
    await logOutreach(db, {
      channel,
      provider: 'copilot',
      triggerType: params.triggerType,
      recipientName: params.recipientName,
      recipientContact: toEmail,
      couponCode: params.couponCode,
      subject: params.subject,
      messageBody: params.text,
      status: 'COPILOT_DRAFT'
    });
    return { ok: true, status: 'COPILOT_DRAFT' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    if (config.emailProvider === 'resend') {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.emailApiKey}`
        },
        body: JSON.stringify({
          from: config.emailFrom || 'Satvastones Jewellery <hello@satvastones.in>',
          to: [toEmail],
          subject: params.subject,
          html: params.html,
          text: params.text
        }),
        signal: controller.signal
      });
      const ok = res.ok;
      const errText = ok ? null : `Resend HTTP ${res.status}: ${(await res.text().catch(() => '')).slice(0, 180)}`;
      await logOutreach(db, {
        channel,
        provider: 'resend',
        triggerType: params.triggerType,
        recipientName: params.recipientName,
        recipientContact: toEmail,
        couponCode: params.couponCode,
        subject: params.subject,
        messageBody: params.text,
        status: ok ? 'SENT' : 'FAILED',
        errorMessage: errText
      });
      return { ok, status: ok ? 'SENT' : 'FAILED', error: errText || undefined };
    }

    // Brevo transactional API
    const fromMatch = (config.emailFrom || 'Satvastones <hello@satvastones.in>').match(/^(.*?)<([^>]+)>$/);
    const senderName = fromMatch ? fromMatch[1].trim() || 'Satvastones Jewellery' : 'Satvastones Jewellery';
    const senderEmail = fromMatch ? fromMatch[2].trim() : config.emailFrom || 'hello@satvastones.in';

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': config.emailApiKey
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: toEmail, name: params.recipientName || undefined }],
        subject: params.subject,
        htmlContent: params.html,
        textContent: params.text
      }),
      signal: controller.signal
    });
    const ok = res.ok;
    const errText = ok ? null : `Brevo HTTP ${res.status}: ${(await res.text().catch(() => '')).slice(0, 180)}`;
    await logOutreach(db, {
      channel,
      provider: 'brevo',
      triggerType: params.triggerType,
      recipientName: params.recipientName,
      recipientContact: toEmail,
      couponCode: params.couponCode,
      subject: params.subject,
      messageBody: params.text,
      status: ok ? 'SENT' : 'FAILED',
      errorMessage: errText
    });
    return { ok, status: ok ? 'SENT' : 'FAILED', error: errText || undefined };
  } catch (err: any) {
    const errMsg = String(err?.message || 'Email delivery failed');
    await logOutreach(db, {
      channel,
      provider: config.emailProvider,
      triggerType: params.triggerType,
      recipientName: params.recipientName,
      recipientContact: toEmail,
      couponCode: params.couponCode,
      subject: params.subject,
      messageBody: params.text,
      status: 'FAILED',
      errorMessage: errMsg
    });
    return { ok: false, status: 'FAILED', error: errMsg };
  } finally {
    clearTimeout(timer);
  }
}

/** Immediate Owner Informing Agent ping for urgent store events */
export async function notifyOwnerUrgent(
  db: any,
  env: Record<string, any> | undefined,
  alert: {
    triggerType: string;
    title: string;
    summary: string;
    details: Record<string, string | number>;
    priority?: 'HIGH' | 'MEDIUM';
  }
): Promise<void> {
  try {
    await ensureGrowthTables(db);
    const config = await loadGrowthConfig(db, env);
    if (!config.ownerUrgentAlertsEnabled || !config.ownerEmail) return;

    const badge = alert.priority === 'HIGH' ? '🚨 URGENT' : '⚡ STORE ALERT';
    const detailRows = Object.entries(alert.details)
      .map(
        ([k, v]) =>
          `<tr><td style="padding:6px 10px;border-bottom:1px solid #e5ded3;color:#6f675f;font-size:12px;">${k}</td><td style="padding:6px 10px;border-bottom:1px solid #e5ded3;color:#14110f;font-weight:600;font-size:12px;">${v}</td></tr>`
      )
      .join('');
    const plainDetails = Object.entries(alert.details)
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fbf9f5;border:1px solid #e5ded3;color:#14110f;">
        <div style="background:#14110f;padding:18px 22px;color:#f6f1e8;">
          <p style="margin:0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#e3c98d;">${badge} · Satvastones AI Manager</p>
          <h2 style="margin:6px 0 0;font-size:20px;font-weight:500;">${alert.title}</h2>
        </div>
        <div style="padding:20px 22px;">
          <p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#4a443f;">${alert.summary}</p>
          <table style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e5ded3;">${detailRows}</table>
          <p style="margin:18px 0 0;"><a href="${SITE_URL}/admin" style="display:inline-block;background:#14110f;color:#f6f1e8;text-decoration:none;padding:10px 18px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Open Admin Growth Desk →</a></p>
        </div>
      </div>
    `;
    const text = `[${badge}] ${alert.title}\n\n${alert.summary}\n\n${plainDetails}\n\nAdmin Desk: ${SITE_URL}/admin`;

    await dispatchEmail(db, config, {
      to: config.ownerEmail,
      recipientName: 'Anirudh (Satvastones Owner)',
      subject: `${badge}: ${alert.title}`,
      html,
      text,
      channel: 'owner_alert',
      triggerType: alert.triggerType
    });
  } catch {
    /* owner alerts must never interrupt storefront traffic */
  }
}

async function hasWhatsappPromoConsent(db: any, phone10: string): Promise<boolean> {
  if (!/^[6-9]\d{9}$/.test(phone10)) return false;
  try {
    const row: any = await db
      .prepare('SELECT promo_consent FROM whatsapp_leads WHERE whatsapp_number = ? LIMIT 1')
      .bind(phone10)
      .first();
    return Boolean(row && Number(row.promo_consent) === 1);
  } catch {
    return false;
  }
}

async function countWhatsappSentToday(db: any): Promise<number> {
  try {
    const row: any = await db
      .prepare(
        `SELECT COUNT(*) AS cnt FROM agent_outreach_logs
         WHERE channel = 'whatsapp' AND status = 'SENT' AND datetime(created_at) >= datetime('now', '-24 hours')`
      )
      .first();
    return Number(row?.cnt) || 0;
  } catch {
    return 0;
  }
}

async function hasOrderSince(db: any, email: string, phone10: string, sinceIso: string): Promise<string | null> {
  if (!email && !phone10) return null;
  try {
    const row: any = await db
      .prepare(
        `SELECT order_number FROM orders
         WHERE datetime(created_at) >= datetime(?)
           AND (
             (? <> '' AND LOWER(email) = ?)
             OR (length(?) = 10 AND substr(replace(replace(replace(phone, ' ', ''), '-', ''), '+91', ''), -10) = ?)
           )
         LIMIT 1`
      )
      .bind(sinceIso, email.toLowerCase(), email.toLowerCase(), phone10, phone10)
      .first();
    return row?.order_number ? String(row.order_number) : null;
  } catch {
    return null;
  }
}

function buildRecoveryEmailHtml(opts: {
  name: string;
  headline: string;
  intro: string;
  items: Array<{ name: string; pricePaise: number; quantity: number }>;
  subtotalPaise: number;
  couponCode?: string | null;
  ctaLabel: string;
}): string {
  const itemList = opts.items
    .slice(0, 5)
    .map(
      (i) =>
        `<tr><td style="padding:8px 10px;border-bottom:1px solid #eee8df;font-size:12.5px;color:#14110f;">${i.name} × ${i.quantity || 1}</td><td style="padding:8px 10px;border-bottom:1px solid #eee8df;text-align:right;font-size:12.5px;font-weight:600;color:#14110f;">${formatRupees((i.pricePaise || 0) * (i.quantity || 1))}</td></tr>`
    )
    .join('');

  const couponBlock = opts.couponCode
    ? `<div style="margin:16px 0;padding:14px 16px;background:#f4efe7;border:1px solid #c5a059;">
         <p style="margin:0;font-size:10px;letter-spacing:1.6px;text-transform:uppercase;color:#8d3f3d;">Exclusive Privilege Code</p>
         <p style="margin:4px 0 0;font-size:18px;font-family:monospace;font-weight:700;letter-spacing:2px;color:#14110f;">${opts.couponCode}</p>
       </div>`
    : '';

  return `
    <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;background:#fbf9f5;border:1px solid #e5ded3;color:#14110f;">
      <div style="background:#14110f;padding:22px;color:#f6f1e8;">
        <p style="margin:0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#e3c98d;">Satvastones Jewellery · Vapi Atelier</p>
        <h2 style="margin:8px 0 0;font-size:22px;font-weight:400;">${opts.headline}</h2>
      </div>
      <div style="padding:22px;">
        <p style="margin:0 0 14px;font-size:13px;line-height:1.6;color:#4a443f;">Hi ${opts.name || 'there'},<br/><br/>${opts.intro}</p>
        ${itemList ? `<table style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e5ded3;">${itemList}</table>` : ''}
        ${couponBlock}
        <p style="margin:20px 0 0;">
          <a href="${SITE_URL}/checkout" style="display:inline-block;background:#14110f;color:#f6f1e8;text-decoration:none;padding:12px 22px;font-size:11px;letter-spacing:1.6px;text-transform:uppercase;">${opts.ctaLabel} →</a>
        </p>
        <p style="margin:18px 0 0;font-size:11px;color:#8a8279;">18K Gold PVD · 316L Waterproof Steel · Free Shipping > ₹499 · Cash on Delivery Available</p>
      </div>
    </div>
  `;
}

/** Build live analytics snapshot for both the Admin Dashboard and Nightly Owner Digest */
export async function buildAnalyticsSnapshot(db: any, days = 7) {
  await ensureGrowthTables(db);
  const lookback = `-${Math.max(1, Math.min(90, days))} days`;

  const eventCountsRes = await db
    .prepare(
      `SELECT event_type, COUNT(*) AS total, COUNT(DISTINCT session_id) AS unique_sessions
       FROM funnel_events
       WHERE datetime(created_at) >= datetime('now', ?)
       GROUP BY event_type`
    )
    .bind(lookback)
    .all();

  const funnelMap: Record<string, { total: number; uniqueSessions: number }> = {};
  for (const r of eventCountsRes?.results || []) {
    funnelMap[String(r.event_type)] = {
      total: Number(r.total) || 0,
      uniqueSessions: Number(r.unique_sessions) || 0
    };
  }

  const ordersRes: any = await db
    .prepare(
      `SELECT COUNT(*) AS count, COALESCE(SUM(total_paise), 0) AS revenue_paise
       FROM orders
       WHERE datetime(created_at) >= datetime('now', ?)`
    )
    .bind(lookback)
    .first();

  const recoveredRes: any = await db
    .prepare(
      `SELECT COUNT(*) AS count, COALESCE(SUM(subtotal_paise), 0) AS value_paise
       FROM abandoned_carts
       WHERE stage = 'CONVERTED' AND recovery_step > 0 AND datetime(updated_at) >= datetime('now', ?)`
    )
    .bind(lookback)
    .first();

  const productIntentRes = await db
    .prepare(
      `SELECT
        product_slug,
        MAX(product_name) AS product_name,
        SUM(CASE WHEN event_type = 'product_view' THEN 1 ELSE 0 END) AS views,
        SUM(CASE WHEN event_type = 'add_to_cart' THEN 1 ELSE 0 END) AS adds,
        MAX(value_paise) AS price_paise
       FROM funnel_events
       WHERE product_slug IS NOT NULL AND product_slug <> ''
         AND datetime(created_at) >= datetime('now', ?)
       GROUP BY product_slug
       ORDER BY views DESC, adds DESC
       LIMIT 15`
    )
    .bind(lookback)
    .all();

  const productIntent = (productIntentRes?.results || []).map((r: any) => {
    const views = Number(r.views) || 0;
    const adds = Number(r.adds) || 0;
    const addRate = views > 0 ? Math.round((adds / views) * 100) : 0;
    return {
      slug: String(r.product_slug),
      name: String(r.product_name || r.product_slug),
      views,
      adds,
      addRate,
      pricePaise: Number(r.price_paise) || 0,
      leakAlert: views >= 8 && addRate < 5
    };
  });

  const abandonedRes = await db
    .prepare(
      `SELECT * FROM abandoned_carts
       WHERE stage IN ('CART_ACTIVE', 'CHECKOUT_STARTED', 'CHECKOUT_ABANDONED')
         AND subtotal_paise > 0
       ORDER BY datetime(updated_at) DESC
       LIMIT 40`
    )
    .all();

  const abandonedCarts = (abandonedRes?.results || []).map((r: any) => {
    let items: any[] = [];
    try {
      items = JSON.parse(r.items_json || '[]');
    } catch {}
    return {
      id: String(r.id),
      sessionId: String(r.session_id),
      fullName: String(r.full_name || ''),
      email: String(r.email || ''),
      whatsappNumber: String(r.whatsapp_number || ''),
      items,
      subtotalPaise: Number(r.subtotal_paise) || 0,
      stage: String(r.stage),
      exitOfferShown: Number(r.exit_offer_shown) === 1,
      exitOfferAccepted: Number(r.exit_offer_accepted) === 1,
      recoveryStep: Number(r.recovery_step) || 0,
      lastRemindedAt: r.last_reminded_at || null,
      updatedAt: String(r.updated_at || r.created_at || '')
    };
  });

  const recentEventsRes = await db
    .prepare(
      `SELECT id, session_id, email, whatsapp_number, event_type, page_path, product_name, value_paise, created_at
       FROM funnel_events
       ORDER BY datetime(created_at) DESC
       LIMIT 35`
    )
    .all();

  const outreachRes = await db
    .prepare(
      `SELECT * FROM agent_outreach_logs
       ORDER BY datetime(created_at) DESC
       LIMIT 50`
    )
    .all();

  const outreachSummaryRes = await db
    .prepare(
      `SELECT status, COUNT(*) AS cnt
       FROM agent_outreach_logs
       WHERE datetime(created_at) >= datetime('now', ?)
       GROUP BY status`
    )
    .bind(lookback)
    .all();

  const outreachStats: Record<string, number> = {};
  for (const r of outreachSummaryRes?.results || []) {
    outreachStats[String(r.status)] = Number(r.cnt) || 0;
  }

  // Manager Actionable Alerts
  const managerInsights: string[] = [];
  const leakProducts = productIntent.filter((p) => p.leakAlert);
  if (leakProducts.length > 0) {
    managerInsights.push(
      `${leakProducts.length} product(s) have high views but <5% add-to-cart rate (top: "${leakProducts[0].name}" with ${leakProducts[0].views} views, ${leakProducts[0].adds} cart adds) — review photos, pricing, or description.`
    );
  }
  const openCheckoutAbandons = abandonedCarts.filter(
    (c) => c.stage === 'CHECKOUT_STARTED' || c.stage === 'CHECKOUT_ABANDONED'
  );
  if (openCheckoutAbandons.length > 0) {
    const atRisk = openCheckoutAbandons.reduce((s, c) => s + c.subtotalPaise, 0);
    managerInsights.push(
      `${openCheckoutAbandons.length} abandoned checkout(s) worth ${formatRupees(atRisk)} are active in recovery.`
    );
  }
  const checkoutStarts = funnelMap.checkout_started?.uniqueSessions || 0;
  const paidOrders = Number(ordersRes?.count) || 0;
  if (checkoutStarts >= 5 && paidOrders / checkoutStarts < 0.35) {
    managerInsights.push(
      `Checkout completion is ${Math.round((paidOrders / checkoutStarts) * 100)}% (${paidOrders}/${checkoutStarts}) — ensure Razorpay & COD options load smoothly.`
    );
  }
  if (managerInsights.length === 0) {
    managerInsights.push('Funnel health looks steady. Keep driving traffic and reviewing WhatsApp consents in Admin.');
  }

  return {
    days,
    funnel: {
      pageViews: funnelMap.page_view?.uniqueSessions || 0,
      productViews: funnelMap.product_view?.uniqueSessions || 0,
      addToCarts: funnelMap.add_to_cart?.uniqueSessions || 0,
      checkoutStarts,
      exitOffersShown: funnelMap.exit_offer_shown?.total || 0,
      exitOffersAccepted: funnelMap.exit_offer_accepted?.total || 0,
      ordersCompleted: paidOrders,
      revenuePaise: Number(ordersRes?.revenue_paise) || 0,
      recoveredCount: Number(recoveredRes?.count) || 0,
      recoveredValuePaise: Number(recoveredRes?.value_paise) || 0
    },
    productIntent,
    abandonedCarts,
    recentEvents: (recentEventsRes?.results || []).map((e: any) => ({
      id: String(e.id),
      sessionId: String(e.session_id).slice(0, 10),
      contact: e.email || e.whatsapp_number || 'Guest visitor',
      eventType: String(e.event_type),
      pagePath: String(e.page_path || ''),
      productName: String(e.product_name || ''),
      valuePaise: Number(e.value_paise) || 0,
      createdAt: String(e.created_at || '')
    })),
    outreachLogs: (outreachRes?.results || []).map((o: any) => ({
      id: String(o.id),
      channel: String(o.channel),
      provider: String(o.provider),
      triggerType: String(o.trigger_type),
      recipientName: String(o.recipient_name || ''),
      recipientContact: String(o.recipient_contact || ''),
      couponCode: o.coupon_code ? String(o.coupon_code) : null,
      subject: o.subject ? String(o.subject) : null,
      messageBody: String(o.message_body || ''),
      status: String(o.status),
      errorMessage: o.error_message ? String(o.error_message) : null,
      createdAt: String(o.created_at || '')
    })),
    outreachStats,
    managerInsights
  };
}

/** Generate and send the Nightly Owner Daily Report email */
export async function sendNightlyOwnerReport(
  db: any,
  env: Record<string, any> | undefined,
  force = false
): Promise<{ sent: boolean; status: string; subject: string; previewText: string }> {
  await ensureGrowthTables(db);
  const config = await loadGrowthConfig(db, env);
  const ist = getIstNow();

  if (!force) {
    if (!config.dailyReportEnabled) {
      return { sent: false, status: 'DISABLED', subject: '', previewText: '' };
    }
    if (ist.hour < config.dailyReportHourIst) {
      return { sent: false, status: 'BEFORE_SCHEDULED_HOUR', subject: '', previewText: '' };
    }
    if (config.lastDailyReportDateIst === ist.dateStr) {
      return { sent: false, status: 'ALREADY_SENT_TODAY', subject: '', previewText: '' };
    }
  }

  const snap = await buildAnalyticsSnapshot(db, 1);
  const f = snap.funnel;

  // Count new WhatsApp leads today
  let newWaToday = 0;
  let newWaConsentedToday = 0;
  try {
    const waRow: any = await db
      .prepare(
        `SELECT COUNT(*) AS total, SUM(CASE WHEN promo_consent = 1 THEN 1 ELSE 0 END) AS consented
         FROM whatsapp_leads WHERE datetime(created_at) >= datetime('now', '-24 hours')`
      )
      .first();
    newWaToday = Number(waRow?.total) || 0;
    newWaConsentedToday = Number(waRow?.consented) || 0;
  } catch {}

  const subject = `Satvastones Nightly Report (${ist.dateStr}): ${f.ordersCompleted} Orders · ${formatRupees(f.revenuePaise)} · ${snap.abandonedCarts.length} Active Carts`;

  const topIntentHtml = snap.productIntent.length
    ? snap.productIntent
        .slice(0, 6)
        .map(
          (p) =>
            `<tr><td style="padding:6px 10px;border-bottom:1px solid #eee8df;font-size:12px;">${p.name}</td><td style="padding:6px 10px;border-bottom:1px solid #eee8df;text-align:center;font-size:12px;">${p.views}</td><td style="padding:6px 10px;border-bottom:1px solid #eee8df;text-align:center;font-size:12px;">${p.adds} (${p.addRate}%)</td></tr>`
        )
        .join('')
    : `<tr><td colspan="3" style="padding:10px;text-align:center;font-size:12px;color:#8a8279;">No product interactions logged in the last 24h.</td></tr>`;

  const insightsHtml = snap.managerInsights.map((tip) => `<li style="margin:6px 0;">${tip}</li>`).join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#fbf9f5;border:1px solid #e5ded3;color:#14110f;">
      <div style="background:#14110f;padding:22px;color:#f6f1e8;">
        <p style="margin:0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#e3c98d;">Satvastones AI Store Manager · Daily Nightly Brief</p>
        <h2 style="margin:8px 0 0;font-size:22px;font-weight:400;">Daily Performance Report — ${ist.dateStr}</h2>
      </div>
      <div style="padding:22px;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;">
          <tr>
            <td style="padding:12px;border:1px solid #e5ded3;background:#ffffff;width:25%;">
              <div style="font-size:10px;text-transform:uppercase;color:#8a8279;">Revenue (24h)</div>
              <div style="font-size:18px;font-weight:700;margin-top:4px;">${formatRupees(f.revenuePaise)}</div>
            </td>
            <td style="padding:12px;border:1px solid #e5ded3;background:#ffffff;width:25%;">
              <div style="font-size:10px;text-transform:uppercase;color:#8a8279;">Orders</div>
              <div style="font-size:18px;font-weight:700;margin-top:4px;">${f.ordersCompleted}</div>
            </td>
            <td style="padding:12px;border:1px solid #e5ded3;background:#ffffff;width:25%;">
              <div style="font-size:10px;text-transform:uppercase;color:#8a8279;">Checkout Starts</div>
              <div style="font-size:18px;font-weight:700;margin-top:4px;">${f.checkoutStarts}</div>
            </td>
            <td style="padding:12px;border:1px solid #e5ded3;background:#ffffff;width:25%;">
              <div style="font-size:10px;text-transform:uppercase;color:#8a8279;">WA Consents</div>
              <div style="font-size:18px;font-weight:700;margin-top:4px;color:#2f7d5a;">${newWaConsentedToday}/${newWaToday}</div>
            </td>
          </tr>
        </table>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1.4px;color:#8d3f3d;margin:16px 0 8px;">Conversion Funnel (Last 24h)</h3>
        <p style="font-size:12.5px;line-height:1.7;color:#4a443f;margin:0 0 14px;">
          Site Visits: <strong>${f.pageViews}</strong> → Product Views: <strong>${f.productViews}</strong> → Add to Cart: <strong>${f.addToCarts}</strong> → Checkout Started: <strong>${f.checkoutStarts}</strong> → Exit Offers Accepted: <strong>${f.exitOffersAccepted}/${f.exitOffersShown}</strong> → Paid Orders: <strong>${f.ordersCompleted}</strong>
        </p>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1.4px;color:#8d3f3d;margin:16px 0 8px;">What the Agent Did Today</h3>
        <p style="font-size:12.5px;line-height:1.7;color:#4a443f;margin:0 0 14px;">
          Messages Sent: <strong>${snap.outreachStats.SENT || 0}</strong> · Co-Pilot Drafts Queued: <strong>${snap.outreachStats.COPILOT_DRAFT || 0}</strong> · Recovered Carts: <strong>${f.recoveredCount} (${formatRupees(f.recoveredValuePaise)})</strong>
        </p>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1.4px;color:#8d3f3d;margin:16px 0 8px;">Top Shopper Product Intent</h3>
        <table style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e5ded3;margin-bottom:16px;">
          <tr style="background:#f4efe7;"><th style="padding:6px 10px;text-align:left;font-size:11px;">Product</th><th style="padding:6px 10px;font-size:11px;">Views</th><th style="padding:6px 10px;font-size:11px;">Cart Adds</th></tr>
          ${topIntentHtml}
        </table>

        <h3 style="font-size:13px;text-transform:uppercase;letter-spacing:1.4px;color:#8d3f3d;margin:16px 0 8px;">Manager Recommendations</h3>
        <ul style="padding-left:18px;font-size:12.5px;line-height:1.6;color:#4a443f;">${insightsHtml}</ul>

        <p style="margin:20px 0 0;">
          <a href="${SITE_URL}/admin" style="display:inline-block;background:#14110f;color:#f6f1e8;text-decoration:none;padding:11px 20px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Open Full Analytics Dashboard →</a>
        </p>
      </div>
    </div>
  `;

  const text =
    `Satvastones Nightly Report (${ist.dateStr})\n` +
    `Revenue (24h): ${formatRupees(f.revenuePaise)} | Orders: ${f.ordersCompleted}\n` +
    `Funnel: Visits ${f.pageViews} -> Product Views ${f.productViews} -> Add to Cart ${f.addToCarts} -> Checkout ${f.checkoutStarts} -> Exit Saved ${f.exitOffersAccepted}/${f.exitOffersShown} -> Orders ${f.ordersCompleted}\n` +
    `Agent Activity: Sent ${snap.outreachStats.SENT || 0}, Drafts ${snap.outreachStats.COPILOT_DRAFT || 0}, WA Consents ${newWaConsentedToday}/${newWaToday}\n` +
    `Insights:\n${snap.managerInsights.map((t) => `- ${t}`).join('\n')}\n\nDashboard: ${SITE_URL}/admin`;

  const res = await dispatchEmail(db, config, {
    to: config.ownerEmail,
    recipientName: 'Anirudh (Satvastones Owner)',
    subject,
    html,
    text,
    channel: 'daily_report',
    triggerType: 'owner_daily_digest'
  });

  await saveGrowthConfig(db, { lastDailyReportDateIst: ist.dateStr });
  return { sent: res.ok, status: res.status, subject, previewText: text };
}

/** Main Autonomous Growth Manager Cycle (invoked every 10 mins by Cloudflare Cron or manually from /admin) */
export async function runAutonomousGrowthCycle(
  db: any,
  env: Record<string, any> | undefined,
  options: { manual?: boolean; bypassQuietHours?: boolean } = {}
) {
  await ensureGrowthTables(db);
  const config = await loadGrowthConfig(db, env);
  const summary = {
    ranAtUtc: new Date().toISOString(),
    quietHoursActive: config.quietHoursEnabled && isIstQuietHours() && !options.bypassQuietHours,
    cartsChecked: 0,
    cartsConverted: 0,
    whatsappSentOrDrafted: 0,
    emailsSentOrDrafted: 0,
    urgentOwnerAlerts: 0,
    browseNudges: 0,
    welcomeReminders: 0,
    nightlyReportStatus: 'NOT_DUE'
  };

  if (!config.enabled && !options.manual) {
    return { ...summary, skipped: 'Agent paused in settings.' };
  }

  let waSentToday = await countWhatsappSentToday(db);
  const canSendCustomerNow = !summary.quietHoursActive;

  // 1. Scan active & abandoned carts / checkouts
  const cartRows = await db
    .prepare(
      `SELECT * FROM abandoned_carts
       WHERE stage IN ('CART_ACTIVE', 'CHECKOUT_STARTED', 'CHECKOUT_ABANDONED')
         AND subtotal_paise > 0
         AND datetime(updated_at) >= datetime('now', '-48 hours')
       ORDER BY datetime(updated_at) DESC
       LIMIT 40`
    )
    .all();

  for (const cart of cartRows?.results || []) {
    summary.cartsChecked++;
    const email = String(cart.email || '').trim().toLowerCase();
    const phone10 = normalizePhone10(cart.whatsapp_number);
    const name = String(cart.full_name || '').trim() || 'there';
    const subtotalPaise = Number(cart.subtotal_paise) || 0;
    const step = Number(cart.recovery_step) || 0;
    const stage = String(cart.stage);

    // Cancel recovery immediately if customer already completed an order
    const matchedOrder = await hasOrderSince(db, email, phone10, String(cart.created_at));
    if (matchedOrder) {
      await db
        .prepare(
          `UPDATE abandoned_carts SET stage = 'CONVERTED', recovered_order_id = ?, updated_at = datetime('now', 'utc') WHERE id = ?`
        )
        .bind(matchedOrder, cart.id)
        .run();
      summary.cartsConverted++;
      continue;
    }

    if (!email && !phone10) continue;

    const updatedMs = Date.parse(String(cart.updated_at).replace(' ', 'T') + (String(cart.updated_at).endsWith('Z') ? '' : 'Z'));
    const ageMins = Number.isNaN(updatedMs) ? 0 : (Date.now() - updatedMs) / 60000;
    const lastRemMs = cart.last_reminded_at
      ? Date.parse(String(cart.last_reminded_at).replace(' ', 'T') + (String(cart.last_reminded_at).endsWith('Z') ? '' : 'Z'))
      : 0;
    const minsSinceReminder = lastRemMs ? (Date.now() - lastRemMs) / 60000 : Infinity;

    let items: Array<{ name: string; pricePaise: number; quantity: number }> = [];
    try {
      items = JSON.parse(cart.items_json || '[]');
    } catch {}
    const leadItemName = items[0]?.name || 'your handcrafted Satvastones piece';
    const extraCount = items.length > 1 ? ` + ${items.length - 1} more` : '';

    const isCheckout = stage === 'CHECKOUT_STARTED' || stage === 'CHECKOUT_ABANDONED';
    const delayStep1 = isCheckout ? Math.min(config.checkoutAbandonDelayMins, 15) : Math.max(config.checkoutAbandonDelayMins, 15);

    // Urgent owner alert for high-value abandoned checkout (>= threshold)
    if (
      isCheckout &&
      ageMins >= delayStep1 &&
      subtotalPaise >= config.urgentCartThresholdPaise &&
      Number(cart.urgent_alert_sent) === 0
    ) {
      await notifyOwnerUrgent(db, env, {
        triggerType: 'high_value_checkout_abandoned',
        title: `High-Value Checkout Abandoned (${formatRupees(subtotalPaise)})`,
        summary: `${name} started checkout for ${leadItemName}${extraCount} and stepped away ${Math.round(ageMins)} mins ago. The agent is initiating recovery.`,
        priority: 'HIGH',
        details: {
          Customer: name,
          Email: email || 'Not entered',
          WhatsApp: phone10 ? `+91 ${phone10}` : 'Not entered',
          CartValue: formatRupees(subtotalPaise),
          Items: `${leadItemName}${extraCount}`,
          ExitOfferAccepted: Number(cart.exit_offer_accepted) === 1 ? 'Yes (STAY10)' : 'No'
        }
      });
      await db.prepare('UPDATE abandoned_carts SET urgent_alert_sent = 1 WHERE id = ?').bind(cart.id).run();
      summary.urgentOwnerAlerts++;
    }

    if (!canSendCustomerNow) continue;

    // Determine which recovery step is due (Step 1: 10–15m, Step 2: 6h, Step 3: 24h)
    let nextStep = 0;
    let triggerType = '';
    let couponCode: string | null = null;
    let waText = '';
    let emailSubject = '';
    let emailHeadline = '';
    let emailIntro = '';

    if (step === 0 && ageMins >= delayStep1) {
      nextStep = 1;
      triggerType = isCheckout ? 'checkout_abandon_10m' : 'cart_abandon_15m';
      couponCode = config.exitOfferCouponCode || 'STAY10';
      waText = isCheckout
        ? `Hi ${name} ✨ You left *${leadItemName}${extraCount}* (${formatRupees(subtotalPaise)}) in your Satvastones checkout! Use code *${couponCode}* for an instant *10% OFF* and finish in 30 seconds: ${SITE_URL}/checkout`
        : `Hi ${name} ✨ Your Satvastones bag (*${leadItemName}${extraCount}*, ${formatRupees(subtotalPaise)}) is saved! Use *${couponCode}* for *10% OFF* waterproof 18K gold PVD jewellery: ${SITE_URL}/checkout`;
      emailSubject = `Still thinking about ${leadItemName}? Take 10% OFF (${couponCode})`;
      emailHeadline = 'Your pieces are still reserved.';
      emailIntro = `We noticed you left <strong>${leadItemName}${extraCount}</strong> in your bag. Complete your order now with code <strong>${couponCode}</strong> for an instant 10% privilege discount.`;
    } else if (step === 1 && ageMins >= 360 && minsSinceReminder >= 300) {
      nextStep = 2;
      triggerType = 'cart_abandon_6h';
      couponCode = config.exitOfferCouponCode || 'STAY10';
      waText = `Hi ${name}, quick reminder from Satvastones Vapi Atelier 💛 Your *${leadItemName}${extraCount}* is waterproof, nickel-free 316L steel & dispatches in 24–48h. Code *${couponCode}* (10% OFF) is still active: ${SITE_URL}/checkout`;
      emailSubject = `10% OFF on your Satvastones bag (${couponCode}) — 24–48h dispatch`;
      emailHeadline = 'Hand-inspected & ready to ship.';
      emailIntro = `Every piece in your bag is crafted in waterproof 18K gold PVD over nickel-free 316L surgical steel. Apply <strong>${couponCode}</strong> at checkout for 10% off — COD & free shipping above ₹499 available.`;
    } else if (step === 2 && ageMins >= 1440 && minsSinceReminder >= 720) {
      nextStep = 3;
      triggerType = 'cart_abandon_24h';
      couponCode = config.exitOfferCouponCode || 'STAY10';
      waText = `Last gentle reminder, ${name} ✨ We’ll release your reserved bag (*${leadItemName}${extraCount}*) soon. Grab *10% OFF* with *${couponCode}* before it goes: ${SITE_URL}/checkout`;
      emailSubject = `Final reminder: 10% OFF (${couponCode}) on ${leadItemName}`;
      emailHeadline = 'Last call for your saved bag.';
      emailIntro = `Before we release your saved items, here is one final reminder that code <strong>${couponCode}</strong> takes 10% off your order today.`;
    }

    if (nextStep === 0) continue;

    // 1. WhatsApp outreach (STRICT DPDP consent check + daily anti-ban cap!)
    if (phone10) {
      const consented = await hasWhatsappPromoConsent(db, phone10);
      if (!consented) {
        await logOutreach(db, {
          channel: 'whatsapp',
          provider: config.whatsappProvider,
          triggerType,
          recipientName: name,
          recipientContact: phone10,
          couponCode,
          messageBody: waText,
          status: 'SKIPPED_NO_CONSENT'
        });
      } else if (waSentToday < config.maxDailyWhatsapp) {
        const waRes = await dispatchWhatsapp(db, config, {
          phone10,
          recipientName: name,
          message: waText,
          triggerType,
          couponCode,
          metadata: { items, subtotalPaise }
        });
        if (waRes.status === 'SENT') waSentToday++;
        summary.whatsappSentOrDrafted++;
      }
    }

    // 2. Email outreach
    if (email) {
      const emailHtml = buildRecoveryEmailHtml({
        name,
        headline: emailHeadline,
        intro: emailIntro,
        items,
        subtotalPaise,
        couponCode,
        ctaLabel: 'Resume Checkout'
      });
      await dispatchEmail(db, config, {
        to: email,
        recipientName: name,
        subject: emailSubject,
        html: emailHtml,
        text: `${emailHeadline}\n\n${waText}`,
        channel: 'email',
        triggerType,
        couponCode
      });
      summary.emailsSentOrDrafted++;
    }

    await db
      .prepare(
        `UPDATE abandoned_carts
         SET recovery_step = ?, stage = CASE WHEN stage = 'CHECKOUT_STARTED' THEN 'CHECKOUT_ABANDONED' ELSE stage END,
             last_reminded_at = datetime('now', 'utc'), updated_at = datetime('now', 'utc')
         WHERE id = ?`
      )
      .bind(nextStep, cart.id)
      .run();
  }

  // 2. High-Intent Browse Abandonment (viewed same product 2+ times in last 24h without adding to cart)
  if (canSendCustomerNow) {
    try {
      const browseRows = await db
        .prepare(
          `SELECT email, whatsapp_number, product_slug, MAX(product_name) AS product_name, MAX(value_paise) AS price_paise, COUNT(*) AS views
           FROM funnel_events
           WHERE event_type = 'product_view'
             AND (email IS NOT NULL AND email <> '' OR whatsapp_number IS NOT NULL AND whatsapp_number <> '')
             AND product_slug IS NOT NULL AND product_slug <> ''
             AND datetime(created_at) >= datetime('now', '-24 hours')
           GROUP BY email, whatsapp_number, product_slug
           HAVING COUNT(*) >= 2
           LIMIT 10`
        )
        .all();

      for (const b of browseRows?.results || []) {
        const bEmail = String(b.email || '').trim().toLowerCase();
        const bPhone = normalizePhone10(b.whatsapp_number);
        const alreadySent = await db
          .prepare(
            `SELECT id FROM agent_outreach_logs
             WHERE trigger_type = 'browse_intent'
               AND recipient_contact IN (?, ?)
               AND datetime(created_at) >= datetime('now', '-7 days')
             LIMIT 1`
          )
          .bind(bEmail || '__none__', bPhone || '__none__')
          .first();
        if (alreadySent) continue;

        const hasCartOrOrder = await db
          .prepare(
            `SELECT id FROM abandoned_carts
             WHERE (email = ? AND ? <> '') OR (whatsapp_number = ? AND ? <> '')
             LIMIT 1`
          )
          .bind(bEmail, bEmail, bPhone, bPhone)
          .first();
        if (hasCartOrOrder) continue;

        const prodName = String(b.product_name || b.product_slug);
        const prodUrl = `${SITE_URL}/products/${encodeURIComponent(String(b.product_slug))}`;
        const msg = `Noticed you eyeing *${prodName}* at Satvastones ✨ Pair it with any second piece in Stack Studio for an automatic *15% OFF* + waterproof 18K gold PVD shine: ${prodUrl}`;

        if (bPhone && waSentToday < config.maxDailyWhatsapp && (await hasWhatsappPromoConsent(db, bPhone))) {
          const waRes = await dispatchWhatsapp(db, config, {
            phone10: bPhone,
            message: msg,
            triggerType: 'browse_intent',
            couponCode: 'SATVA10',
            metadata: { productSlug: b.product_slug, productUrl: prodUrl }
          });
          if (waRes.status === 'SENT') waSentToday++;
          summary.browseNudges++;
        } else if (bEmail) {
          await dispatchEmail(db, config, {
            to: bEmail,
            subject: `Still eyeing ${prodName}? Pair & save 15%`,
            html: buildRecoveryEmailHtml({
              name: 'there',
              headline: `${prodName} caught your eye.`,
              intro: `Crafted in waterproof 18K gold PVD over nickel-free 316L surgical steel. Use code <strong>SATVA10</strong> for 10% off or bundle 2+ pieces in Stack Studio for 15% off automatically.`,
              items: [{ name: prodName, pricePaise: Number(b.price_paise) || 0, quantity: 1 }],
              subtotalPaise: Number(b.price_paise) || 0,
              couponCode: 'SATVA10',
              ctaLabel: 'View Piece'
            }),
            text: msg,
            channel: 'email',
            triggerType: 'browse_intent',
            couponCode: 'SATVA10'
          });
          summary.browseNudges++;
        }
      }
    } catch {
      /* non-fatal */
    }
  }

  // 3. Unused Welcome Offer (WELCOME15FREE) 48h reminder for consented leads
  if (canSendCustomerNow) {
    try {
      const welcomeRows = await db
        .prepare(
          `SELECT * FROM whatsapp_leads
           WHERE promo_consent = 1 AND first_order_used = 0 AND coupon_code = 'WELCOME15FREE'
             AND datetime(created_at) <= datetime('now', '-48 hours')
             AND datetime(created_at) >= datetime('now', '-14 days')
           LIMIT 10`
        )
        .all();

      for (const lead of welcomeRows?.results || []) {
        const phone10 = normalizePhone10(lead.whatsapp_number);
        const alreadySent = await db
          .prepare(
            `SELECT id FROM agent_outreach_logs
             WHERE trigger_type = 'welcome_unused' AND recipient_contact = ? LIMIT 1`
          )
          .bind(phone10)
          .first();
        if (alreadySent) continue;

        const name = String(lead.full_name || 'there');
        const msg = `Hi ${name} 💛 Your Satvastones first-order code *WELCOME15FREE* (*15% OFF + Free Express Delivery*) is still waiting for you! Shop waterproof 18K gold jewellery from ₹149: ${SITE_URL}/collections/bestsellers`;
        if (waSentToday < config.maxDailyWhatsapp) {
          const waRes = await dispatchWhatsapp(db, config, {
            phone10,
            recipientName: name,
            message: msg,
            triggerType: 'welcome_unused',
            couponCode: 'WELCOME15FREE'
          });
          if (waRes.status === 'SENT') waSentToday++;
          summary.welcomeReminders++;
        }
      }
    } catch {
      /* whatsapp_leads may not exist yet */
    }
  }

  // 4. Nightly Owner Daily Report (automatically triggers once per night at configured IST hour)
  const reportRes = await sendNightlyOwnerReport(db, env, false);
  summary.nightlyReportStatus = reportRes.status;

  return summary;
}
