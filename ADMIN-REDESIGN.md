# Admin Panel — Gap Analysis & Redesign

**Date:** 18 November 2026
**Companion document:** `SECURITY-AUDIT.md`

---

## 1. The original problem

> "The mock products are still visible on all pages and not the new products I add in the admin panel."

Root cause: **the browser never talked to a server while developing.** `astro dev` does not execute Cloudflare `functions/api/*`, so every admin save went to `localStorage` in one browser profile only. At the same time, the homepage bestsellers, shop grids, collection pages, PDP "complete the stack" rails, search, cart upsells and the Stack Studio builder all rendered the build-time `PRODUCTS` array. Even in production, a newly created product's PDP had no route in the static build.

This was not one bug — it was a missing data layer.

---

## 2. What was missing

| Area | Before | Gap |
|---|---|---|
| Catalogue source of truth | Build-time `PRODUCTS` + per-browser `localStorage` | No server API in dev; no live storefront updates |
| Product fields | Name, price, one image, basic badges | No gallery, dimensions, weight, care, warranty, SKU/slug control, HSN/GST, cost, stock thresholds, SEO, rating, tags, variants |
| PDP rendering | Static template only | Admin-created slugs had no PDP; SEO/schema/care/specs stayed demo copy |
| Coupons | Local list | No server-side discount enforcement; no defaults on a fresh database |
| Orders | Client totals stored verbatim | Prices/discounts/shipping/COD could be tampered with; tracking exposed customer data |
| Merchandising | Hard-coded product arrays | Stack Studio selections and bestsellers ignored admin edits |
| UX | Dense generic forms, no feedback | No search, no CSV export, no demo cleanup, no sync status/retry, no visual product cards |
| Security | Dev passwords in source, open uploads, wildcard CORS | See `SECURITY-AUDIT.md` |

---

## 3. Redesigned architecture

```
Admin UI (admin/index.astro)
        │  add / update / delete / toggle / export
        ▼
adminStore.ts  ── localStorage cache (instant UI, offline tolerant)
        │  POST/PUT/DELETE   +   GET reconciliation
        ▼
/dev/api/*  (dev-api.mjs + .data/dev-store.json)   │   /api/* in production
                                                    ▼
                                    Cloudflare worker → functions/api/* → D1 / R2
        ▲
catalogStore.ts ── authoritative adapter: maps API rows to storefront Product shape
        │
        ▼
Product cards / grids: homepage, /shop, collections, PDP related,
SearchModal, CartDrawer upsells, stack-builder, dev 404 PDP
```

Key decisions:

- **The catalogue API is the single source of truth.** `PRODUCTS` remains only as a server-render/offline fallback.
- **Dev and production behave the same.** `dev-api.mjs` is a Vite plugin loaded at startup that emulates every `/api/*` route against a JSON file; production uses the real worker and D1. No production code was changed for dev convenience.
- **Demo data is explicit.** The 10 original products are seeded with `isDemo: true` and a one-click **Remove demo products** button deletes only those. Custom products are never silently removed.
- **New slugs resolve without a rebuild.** In dev, `404.astro` renders dynamic PDPs. In production, `src/worker.ts` looks up the slug in D1 and substitutes owner data into the static PDP shell — including SEO tags, canonical/OG URLs, gallery thumbnails, specs, care and all Product JSON-LD.
- **Money is computed server-side** from D1 prices, coupon terms, site settings and the configured stack discount. The browser's totals are advisory only.

---

## 4. Product form — full field inventory

The product modal (`#product-form`) now supports:

**Identity & merchandising** — name, auto-filled slug (with live duplicate guard), SKU, category, collection, headline, description, sort order, tags.

**Pricing** — price (INR), compare-at price, cost price, GST rate, HSN code.

**Media** — hero `image` (the card/PDP hero) and a separate newline-separated `gallery` of detail shots. The storefront composes `images = [image, ...gallery]` with deduplication; the worker renders the gallery as clickable thumbnails with a correct image counter.

**Specs & trust** — material, finish, dimensions, weight (grams), warranty, care instructions, stock quantity, low-stock threshold, in-stock / published / bestseller / new-arrival flags.

**Search** — SEO title and meta description (max 70/165 chars), rating and review count feeding Product JSON-LD.

**Feedback** — inline `#prod-form-error`, live image preview, save/delete confirmations, and a sync refresh so the grid reflects the API immediately after save.

All values round-trip: edit → save → reload → edit again preserves gallery, dimensions, care, weight, SEO and flags.

---

## 5. Admin shell & UX

- Editorial ivory / ink / gold visual system, responsive tabbed layout.
- KPI cards (products, live orders, coupons, claims/reviews) with live counts.
- Catalogue toolbar: **search**, **Export CSV** (formula-injection neutralised), **Remove demo products**, **Add product**, sync-status banner with retry.
- Product cards show image, category, SKU, price, compare-at price, stock and badges; inline stock toggle, edit and delete.
- Orders: status workflow (Verified → Packing → Dispatched → Out for delivery), AWB/courier assignment, GST invoice, delete.
- Coupons: percent / flat discount, minimum order, active toggle, duplicate-code validation; FIRSTBUY / SATVA10 / FESTIVE15 exist as safe defaults on an empty database.
- Categories: editable imagery and copy per collection.
- Stack Studio: per-slot product curation now stores **slugs**, so generated ids never go stale; stale curation falls back to curated defaults instead of blanking the builder.
- Settings: store identity, hero banner, shipping thresholds, stack discount, payment keys (secret masked), social links.
- Reviews & 360° unboxing claims: moderation, delete/approve/reject, safe rendering of every submitted field.

---

## 6. End-to-end verification

- `npm run build` — 45 pages.
- Worker PDP harness — custom SEO, real slug in canonical/OG/JSON-LD, material/finish/dimensions/weight/warranty/care, three gallery thumbnails, 4 valid JSON-LD blocks.
- Playwright — admin login/save, duplicate-slug guard, field round-trip, live products on PDP / shop / home / collections / search / cart upsells, CSV rows, demo removal preserving owner products, Stack Studio options, coupon + COD server totals, tracking redaction, zero console errors.
- QA artefacts and orders removed; dev store left at 10 demo products, 0 orders, 3 coupons.

---

## 7. Operating the store

1. Set the three required secrets (see `SECURITY-AUDIT.md §3`) before deploying.
2. Sign in at `/admin`.
3. Add products with unique slugs; upload imagery to R2 via the media field (8 MB max, JPEG/PNG/WebP/AVIF/GIF/MP4/WebM).
4. Remove demo products once live catalogue data is in place.
5. Curate Stack Studio slots and set shipping/stack-discount rules in Settings.
6. Confirm new product URLs resolve and that PDP SEO/schema reflect the saved data.

**Known follow-ups** (tracked in `SECURITY-AUDIT.md §5`): Razorpay webhook verification for payment status, distributed rate limits, optional review moderation queue, named admin accounts with audit logs.

---

## 8. Files touched

`dev-api.mjs`, `astro.config.mjs`, `src/worker.ts`, `src/lib/{http,server-auth,customer-auth,cloudflare}.ts`, `functions/api/{admin-auth,products,coupons,orders,customer,reviews,claims,privacy-requests,settings,upload}.ts`, `src/stores/{adminStore,catalogStore,reviewStore}.ts`, `src/scripts/catalog-cards.ts`, `src/pages/admin/index.astro`, `src/pages/products/[slug].astro`, `src/pages/{index,shop,stack-builder,404,checkout,track-order,privacy-rights}.astro`, `src/components/{CartDrawer,SearchModal,ProductReviews}.tsx`, `src/layouts/BaseLayout.astro`, `.gitignore`.
