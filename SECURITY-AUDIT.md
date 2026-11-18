# Security Audit — Satvastones Storefront & Admin

**Date:** 18 November 2026
**Scope:** Cloudflare Pages deployment (static `dist` + `src/worker.ts` + `functions/api/*` + D1 + R2), admin panel, customer accounts, public write endpoints, storefront rendering of owner-controlled catalogue data, and the local dev API emulator (`dev-api.mjs`).

---

## 1. Summary

The application previously shipped with repository-embedded secrets, unauthenticated write/upload endpoints, client-controlled order totals, wildcard CORS on API responses, and unescaped public input rendered into admin HTML. All of those have been remediated in this change set.

**Posture:** fail closed. If the required secrets are not configured, admin and customer APIs return `503` and refuse to mint or accept sessions. A shared/fallback secret no longer exists.

| Severity | Findings before | Fixed | Accepted as residual |
|---|---:|---:|---:|
| Critical | 5 | 5 | 0 |
| High | 8 | 8 | 0 |
| Medium | 7 | 7 | 0 |
| Low / hardening | 5 | 5 | 0 |
| Documented deployment risk | — | — | 3 |

---

## 2. Findings & remediation

### CRITICAL

**C-1 — Shared, repository-embedded session secrets**
`src/lib/customer-auth.ts` contained a default customer secret and `functions/api/customer.ts` signed customer tokens with `ADMIN_SESSION_SECRET`. Anyone who read the repository (or knew the admin secret) could mint a valid session for either role.
→ Removed the default secret. Customer tokens now require `CUSTOMER_SESSION_SECRET` (≥32 chars) via `isCustomerAuthConfigured()`; admin tokens require `ADMIN_SESSION_SECRET` (≥32 chars) and are rejected unless `role === 'SUPER_ADMIN'`. Customer tokens require `role === 'CUSTOMER'`. All customer routes return `503` when the secret is unset.

**C-2 — Token confusion between admin and customer sessions**
Because both token types shared a signing secret and carried no role claim, a customer could present their session as an admin credential.
→ Both verifiers now check an explicit role claim and verify with different secrets. Verified: a token minted by `/api/customer/register` cannot satisfy `verifyAdminAuth()`.

**C-3 — Client-controlled order money**
`/api/orders` stored `subtotalPaise`, `discountPaise`, `shippingPaise` and `totalPaise` exactly as supplied by the browser. A shopper could submit a ₹1 order for a full cart.
→ The server now recomputes everything: item prices from D1 (`id`, `variantId`, `slug` are persisted on each line item), stack/bundle discount re-applied from admin settings (capped 0–50%), coupon discount recomputed from the saved coupon's terms (or safe launch defaults), shipping from site settings, and a ₹25 COD fee. Client totals are ignored.

**C-4 — Unauthenticated media upload to R2**
`POST /api/upload` accepted arbitrary files from anybody, with attacker-chosen MIME and filename.
→ Requires admin auth; allows only `image/jpeg|png|webp|avif|gif` and `video/mp4|webm`; caps uploads at 8 MB; strips filenames to 80 safe characters; adds `X-Content-Type-Options: nosniff` to object responses. SVG/HTML are intentionally excluded because they can execute script when opened directly.

**C-5 — Admin and customer APIs usable with unconfigured credentials**
Admin login validated against dev passwords baked into the source; customer endpoints worked with a shared fallback secret.
→ `/api/admin-auth` now returns `503` unless `ADMIN_PASSWORD` and a sufficiently long `ADMIN_SESSION_SECRET` exist. Legacy/dev passwords are only accepted when `ALLOW_LEGACY_ADMIN_LOGIN=true` **and** `ENVIRONMENT !== 'production'`.

### HIGH

**H-1 — Stored XSS in the admin panel**
Order fields, coupon descriptions, claims (including the video-proof URL), reviews and Stack Studio rows were interpolated into `innerHTML` values from public/customer input (`${o.customerName}`, `${c.videoProofUrl}`, `${r.content}`, …).
→ Added `escapeAdminHtml()` and `safeAdminUrl()`; every owner/customer-supplied value is escaped, URLs are restricted to http(s), and claim links carry `rel="noopener noreferrer"`.

**H-2 — Stored XSS via product media and SEO fields on dynamic PDPs**
The worker rendered admin-entered copy, image URLs, dimensions, care instructions and JSON-LD into the static PDP template without escaping.
→ Introduced `escapeHtml()`/`safeHttpUrl()` and `updateProductSchema()`. Owner copy is escaped for text/attribute contexts; gallery URLs are validated; `<` is escaped to `\\u003c` in JSON-LD so it cannot terminate the script block. All four JSON-LD blocks remain valid JSON after substitution (harness-verified).

**H-3 — Public order tracking enumerated the customer list**
`GET /api/orders?ref=` matched on email or a partial phone number and returned the full record.
→ Lookup is now exact order number or AWB only. Without a matching email/phone second factor, the response is redacted: no name, email, phone, address, items or line totals. Error messages no longer echo the submitted reference.

**H-4 — Wildcard CORS on all API responses**
Every function replied with `Access-Control-Allow-Origin: *`, so any site could read API responses (including authenticated ones on routes using `credentials: 'include'`).
→ `src/lib/http.ts` now owns CORS. `applyCorsPolicy()` in the worker echoes only same-origin or `https://satvastones.in` / `https://www.satvastones.in`, always sends `Vary: Origin` and `X-Content-Type-Options: nosniff`, and strips `ACAO` for disallowed origins.

**H-5 — Public privacy-ticket list exposed personal data**
`GET /api/privacy-requests` without a ticket returned every DPDP request.
→ The list is now admin-only; public lookup is key-format validated (`DPDP-123456`), throttled (20/10 min per IP) and returns a generic 404.

**H-6 — Public review submissions claimed "Verified buyer"**
The review form sent `verified: true`/`verifiedBuyer: true` and the API stored `verified_buyer = 1` for anonymous posts, then displayed a green verified badge.
→ Public submissions are stored unverified; only authenticated admin imports can set the badge. Storefront copy no longer calls every review "verified"; the badge is conditional. The dev dynamic PDP form was corrected to send `content`/`city` so submissions actually persist.

**H-7 — Image URL injection in storefront cards**
Product cards trust admin-supplied image URLs.
→ `catalogStore.ts` and the client card renderer validate/normalize URLs and escape all interpolated fields.

**H-8 — Unrestricted gallery/claim URL schemes**
Claim video URLs and gallery entries could be `javascript:`/`data:` values.
→ `safeHttpUrl()` enforces http(s) in both the API and worker; claims additionally require a valid URL before insert.

### MEDIUM

**M-1 — Review flooding / storage abuse** — per-IP throttle (5/10 min), 64 KB body cap, field lengths (author 60, city 60, title 120, content 2000), control-character stripping, server-generated ids/timestamps. A visitor can no longer overwrite another review by reusing its id.
**M-2 — Claim abuse** — per-IP throttle (5/10 min), 32 KB body cap, order-number pattern, field caps, server-generated ids, status allowlist (`PENDING_REVIEW`, `REPLACEMENT_APPROVED`, `REJECTED`) and admin-note cap.
**M-3 — CSV formula injection** — `exportProductsCsv()` now prefixes spreadsheet formula triggers (`= + - @ TAB CR`) with `'` for non-numeric cells and quotes delimiters/newlines.
**M-4 — Masked Razorpay secret overwritten on save** — the settings API preserves the stored secret when the admin form posts masked dots/blank. Unauthenticated GETs receive a masked placeholder.
**M-5 — Slug/category injection into static PDP shell** — worker sanitizes slugs to `[a-z0-9-]` and categories against an allowlist before rewriting canonical/OG/JSON-LD URLs.
**M-6 — Unbounded/unvalidated product writes** — `/api/products` validates required fields, enforces slug uniqueness, caps `product_meta`, and offers `DELETE /api/products/demo` for explicit demo cleanup.
**M-7 — Sensitive QA/test data** — all QA products and orders were removed from the dev store; `.data/` and `public/uploads/` are gitignored.

### LOW / hardening

- `X-Content-Type-Options: nosniff` applied centrally to all API responses and uploaded objects.
- Request body size ceilings on reviews, claims, settings and upload paths.
- Error messages no longer leak D1/stack-trace details to clients.
- Auth rate limiting (5 failures → 15-minute lock) retained on admin and customer logins.
- Dev-only `/api/*` emulation is isolated in `dev-api.mjs`; production worker code is untouched.

---

## 3. Required deployment secrets

```bash
wrangler secret put ADMIN_PASSWORD          # admin console password
wrangler secret put ADMIN_SESSION_SECRET    # >= 32 random chars, HMAC signing
wrangler secret put CUSTOMER_SESSION_SECRET # >= 32 random chars, MUST differ from above
```

Optional: `ALLOW_LEGACY_ADMIN_LOGIN=true` **only** in non-production when migrating an old installation. `ADMIN_USERNAME`, `PUBLIC_RAZORPAY_KEY_ID`/`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `GOOGLE_CLIENT_ID` remain supported as environment configuration.

Generate strong secrets with, for example: `openssl rand -base64 48`.

> If `ADMIN_PASSWORD`/`ADMIN_SESSION_SECRET` are missing, admin login returns `503`. If `CUSTOMER_SESSION_SECRET` is missing, every `/api/customer/*` route returns `503`. This is intentional — the alternative is a forgeable session.

---

## 4. Verification performed

- `npm run build` — 45 pages generated successfully.
- Worker PDP harness (bundled with esbuild, fake D1 + ASSETS): status 200, custom SEO title/description, canonical/OG URLs, material/finish/dimensions/weight/warranty/care, 3 gallery thumbnails, no template name/SKU/slug leakage, all 4 JSON-LD blocks valid, Product schema rewritten correctly.
- Playwright: admin login/save, duplicate-slug guard, gallery/dimension/care/weight round-trip, live products on PDP/shop/home/collections/search/cart, CSV rows, demo removal preserving owner products, stack builder options, coupon + COD server totals, order-tracking redaction, no console errors.
- Token role separation checked at the code level (`SUPER_ADMIN` vs `CUSTOMER`).

---

## 5. Residual risks & recommendations

1. **Payment status is still asserted by the checkout client.** The order API stores `paymentStatus` from the payload because this deployment has no Razorpay webhook verification. A malicious request can create a fake "PAID" record. **Recommendation:** add `POST /api/webhooks/razorpay` that verifies `x-razorpay-signature` with `RAZORPAY_KEY_SECRET`, marks `paymentStatus` from the webhook only, and ignore client-supplied payment status. Do this before accepting live payments at scale.
2. **In-memory throttles are per-isolate.** The login, review, claim and privacy-lookup limits reset on cold start and are not shared across Cloudflare locations. They stop casual abuse, not a distributed flood. **Recommendation:** move counters to D1/KV (or Cloudflare Rate Limiting) if traffic warrants it.
3. **Public reviews and claims are published without moderation.** Content is escaped and bounded, and verified badges are no longer self-asserted, but offensive text or bogus claims can still be submitted. **Recommendation:** add an admin approve/queue step and consider CAPTCHA on public forms.
4. **Any deployment of `functions/api/*` outside `src/worker.ts` (e.g. a bare Pages Functions setup) would keep the per-file wildcard CORS headers.** CORS is only normalized centrally in the worker. **Recommendation:** deploy via the included `src/worker.ts` entrypoint, or replace each file's `corsHeaders` with `applyCorsPolicy()`.
5. **Admin panel is a single shared account.** There is no per-user audit trail or granular roles. **Recommendation:** add named admin users and immutable action logs if more than one person operates the store.
