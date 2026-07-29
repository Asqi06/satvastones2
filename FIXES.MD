# FIXES — Satvastones Project

> **IMPORTANT**: Before making ANY changes, read this file first to avoid re-breaking previously fixed issues.
> After any fix, append a new entry at the bottom of this file.

---

## Commit `65c8def` — `seoContent` not rendering on product page

- **Problem**: `seoContent` was editable in admin and saved to DB but never rendered on the frontend product page.
- **Root cause**: ProductPage.tsx description accordion always showed hardcoded boilerplate text, ignoring `product.seoContent`.
- **Fix**: Added conditional rendering — if `product.seoContent` exists, render it via `dangerouslySetInnerHTML`; otherwise fall back to boilerplate.
- **Files changed**: `src/components/ProductPage.tsx` (Description accordion)
- **Key code**: `{product.seoContent ? (<div dangerouslySetInnerHTML={{ __html: product.seoContent }} />) : (<div className="space-y-2">...</div>)}`
- **Do NOT revert**: The description accordion must check `product.seoContent` first.

---

## Commit `8188375` — ShareButton component removed `</div>` closing tag (build error)

- **Problem**: Build failed with JSX parsing error — missing closing tag.
- **Root cause**: The ShareButton commit (a440eeb/8188375) removed a `</div>` that closed the reviews container div, breaking the JSX tree.
- **Fix**: Restored the missing `</div>` by putting it back after the review form.
- **Files changed**: `src/components/ProductPage.tsx`
- **Key code**: The `</div>` after the review form `</form>` must remain present. It closes the reviews container div.
- **Do NOT revert**: The closing `</div>` after the review form section. Indentation: `{showReviewForm && (<form>...</form>)}` then `</div>`.

---

## Commit `dfdcf42` — PageSpeed performance & accessibility fixes

### Image optimization
- **Problem**: SaleSection images passed raw Cloudinary URLs without `optimizeImage()`, missing responsive srcset/sizes.
- **Fix**: Apply `optimizeImage()` to all product images in SaleSection.tsx, ProductSection.tsx, ShopPage.tsx.
- **Files changed**: `src/components/home/SaleSection.tsx`, `src/components/home/ProductSection.tsx`, `src/components/ShopPage.tsx`
- **Do NOT revert**: Always use `optimizeImage(url, width)` and `getSrcSet()` for product images.

### LCP — Hero banner fetchPriority
- **Problem**: Hero banner image lacked `fetchpriority="high"`, delaying LCP.
- **Fix**: Added `fetchPriority="high"` to the hero banner image in NewHeroBanner.tsx.
- **Files changed**: `src/components/home/NewHeroBanner.tsx`
- **Key code**: Image element must have `fetchPriority="high"`.

### Color contrast (a11y)
- **Problem**: Announcement bar used `bg-[#d4535f]` (too light) and cart badge used `bg-[#D44638]` — insufficient contrast against text.
- **Fix**: Changed announcement bar to `bg-[#b03a4a]`, HOT SELLING badge to `bg-[#b32d2d]`, price text to `text-[#c43a4a]`, cart badge to `bg-[#b32d2d]`.
- **Files changed**: `src/App.tsx`, `src/index.css`, `src/components/home/SaleSection.tsx`
- **Do NOT revert**: Keep these darker shades for WCAG AA contrast compliance.

### Social links aria-labels
- **Problem**: Social media links (Instagram, Facebook, Twitter) in footer had no `aria-label`.
- **Fix**: Added `aria-label="Follow us on [Platform]"` to each social link.
- **Files changed**: `src/components/home/NewFooter.tsx`
- **Do NOT revert**: Social links must have descriptive `aria-label`.

### Heading order
- **Problem**: Footer used `<h4>` for section titles (should be `<h2>`) and ConnectWithUs used `<h4>` (should be `<h3>`).
- **Fix**: Changed footer `<h4>` to `<h2>`, ConnectWithUs `<h4>` to `<h3>`.
- **Files changed**: `src/components/home/NewFooter.tsx`, `src/components/home/ConnectWithUs.tsx`
- **Do NOT revert**: Heading hierarchy must be h1 → h2 → h3 (no skipping levels).

### Lazy load AdminPanel
- **Problem**: AdminPanel was eagerly imported, adding ~200KB to initial bundle.
- **Fix**: Changed to dynamic `React.lazy()` import with `<Suspense>` fallback.
- **Files changed**: `src/App.tsx` (import + render)
- **Key code**: `const AdminPanel = lazy(() => import('./components/AdminPanel'))` + `<Suspense fallback={...}><AdminPanel ... /></Suspense>`
- **Do NOT revert**: Admin panel must be lazy-loaded.

---

## Commit `b6b4f32` / `7e66b0f` — Missing `clsx` and `tailwind-merge` dependencies

- **Problem**: Render deployment crashed on startup. `server.js` line 10 imports from `src/lib/utils.ts` which uses `clsx` and `tailwind-merge`.
- **Root cause**: `clsx` and `tailwind-merge` were used in source code but never listed in `package.json` dependencies.
- **Fix**: Installed both packages via npm.
- **Files changed**: `package.json`, `package-lock.json`
- **Do NOT revert**: Both `clsx` and `tailwind-merge` must remain in dependencies.

---

## Commit `65c46cd` — Cloudinary Upload Widget not loading

- **Problem**: Clicking upload buttons in admin did nothing. No Cloudinary upload dialog appeared.
- **Root cause**: The Cloudinary Upload Widget script (`https://upload-widget.cloudinary.com/global/all.js`) was never loaded in `index.html` or dynamically.
- **Fix**: `openUploadWidget()` in `src/utils/cloudinary.ts` now dynamically creates a `<script>` tag and appends it to `<body>` on first call, then waits for `window.cloudinary` to be defined before opening the widget.
- **Files changed**: `src/utils/cloudinary.ts`
- **Key code**: `if (!window.cloudinary) { const script = document.createElement('script'); script.src = 'https://upload-widget.cloudinary.com/global/all.js'; script.onload = () => { cloudinary.openUploadWidget(...) }; ... }`
- **Do NOT revert**: Upload widget must use dynamic script loading (don't add it to index.html — it's only needed in admin).

---

## Commit `742a446` / `8ce26d1` — Hero banner height & navigation

### Height reduction
- **Problem**: Hero banner was too tall (no max-height), causing excessive scrolling on desktop.
- **Fix**: Added `lg:max-h-[300px]` and changed aspect-ratio padding from `min(90vw, 45%)` to `min(80vw, 38%)`.
- **Files changed**: `src/components/home/NewHeroBanner.tsx`
- **Do NOT revert**: Desktop banner max-height 300px, mobile padding 38%.

### Banner click navigation
- **Problem**: Banner `onClick` only handled category strings via `navigateTo('shop', { category })`. Full URLs, internal paths, and product slugs were not supported.
- **Fix**: Updated click handler to detect URL type: external URLs open in new tab, `/` paths use `navigate()`, known categories use `navigateTo('shop', ...)`, everything else navigates to `/product/{slug}`.
- **Files changed**: `src/App.tsx` (banner click handler in HomeRoute)
- **Key code**: `if (url.startsWith('http')) { window.open(url, '_blank') } else if (url.startsWith('/')) { navigate(url) } else if ([...knownCategories].includes(url)) { navigateTo('shop', { category: url }) } else { navigate('/product/' + url) }`
- **Do NOT revert**: Banner must support all four URL types.

---

## Commit `e0b033f` — Trend link destination always `/shop`

- **Problem**: All trend cards in ShopByTrend section linked to hardcoded `/shop` regardless of what the trend represented.
- **Root cause**: `ShopByTrend.tsx` used `<Link to="/shop">` — no way to set per-trend destination.
- **Fix**: Added optional `link` field to Trend mongoose schema (`server.js`), admin form (`AdminPanel.tsx`), and component (`ShopByTrend.tsx` reads `trend.link` and falls back to `/shop`).
- **Files changed**: `server.js`, `src/components/AdminPanel.tsx`, `src/components/home/ShopByTrend.tsx`
- **Key code**: `<Link to={trend.link || '/shop'}>`
- **Do NOT revert**: Trend link must come from `trend.link` field, not hardcoded. Admin form must have link input after image, before sort order.

---

## Commit `59e2bc8` — Hot Deals ignores deleted Sale Sections

- **Problem**: Deleting a Sale Section from admin → products still appeared on Hot Deals page.
- **Root cause**: HotDealsPage filtered products by DB-level flags (`isNinetyNine`, `oldPrice > price`) which never change when a Sale Section is deleted. It never checked which sale sections are active.
- **Fix**: Passed `homepageData?.sales` (only active Sale Sections with populated products) to HotDealsPage. It builds a `Set` of product IDs from all active sales and filters to only those products. If no active sales exist, nothing shows.
- **Files changed**: `src/App.tsx` (pass `sales` prop), `src/components/HotDealsPage.tsx` (accept `sales` prop, filter logic)
- **Key code**: `const activeProductIds = new Set(...)` then `isInActiveSale = (p) => activeProductIds.size === 0 || activeProductIds.has(p._id)` then filter products to `isInActiveSale(p)`.
- **Do NOT revert**: Hot Deals must check active Sale Sections. Remove the fallback `activeProductIds.size === 0` only after ensuring sales always exist.

---

## Commit `7749158` — SEO: Low Google indexing (7/61 pages)

### robots.txt cleanup
- **Problem**: robots.txt included `Sitemap: https://satvastones2.onrender.com/api/sitemap.xml` (Render backend URL — not the actual sitemap) and `Host:` directive (unsupported by Google).
- **Fix**: Removed both lines.
- **Files changed**: `public/robots.txt`
- **Do NOT revert**: Only keep Sitemap pointing to `https://satvastones.in/sitemap.xml`.

### Param URLs indexed instead of clean URLs
- **Problem**: Google indexed `https://www.satvastones.in/shop?category=Necklace` instead of the clean canonical `https://satvastones.in/shop/necklaces`. The `hasFacetParams` check did not include `'category'` or `'sub'` params, so these URLs were not marked `noindex`.
- **Fix**: Added `'category'` and `'sub'` to the `hasFacetParams` array in ShopRoute.
- **Files changed**: `src/App.tsx` (line 493)
- **Key code**: `const hasFacetParams = ['style', 'material', 'maxPrice', 'minPrice', 'sort', 'color', 'category', 'sub'].some(...)`
- **Do NOT revert**: `'category'` and `'sub'` must always be in this array.

### Product pages lack visible text content
- **Problem**: Product pages had no visible specifications — no material, weight, dimensions, SKU visible to users or Googlebot. Google sees thin pages.
- **Fix**: Added a Specifications accordion section after Description showing SKU, Material, Weight, Dimensions, Anti-tarnish badge, Gift packaging info, and `product.specifications[]` key/value pairs.
- **Files changed**: `src/components/ProductPage.tsx`
- **Key code**: `{(product.specifications?.length > 0 || product.material || ...) && (<AccordionItem title="Specifications"><table>...</table></AccordionItem>)}`
- **Do NOT revert**: Specifications table must always render when product has spec data. Must be visible HTML, not just JSON-LD.

### No direct links to products from homepage
- **Problem**: Products were 3+ clicks from homepage (home → shop → category → product). Google's limited crawl budget for new sites meant most products were never discovered.
- **Fix**: Added "Best Sellers" section on homepage showing up to 8 featured products with direct `<Link to="/product/{slug}">`.
- **Files changed**: `src/App.tsx` (HomeRoute, after Sale Sections, before Customer Reviews)
- **Key code**: `{(cmsData?.products || []).filter((p: any) => p.isFeatured).slice(0, 8).map(...)}`
- **Do NOT revert**: Featured products section must remain on homepage. To add products, mark `isFeatured: true` in admin product form.

### Footer lacks category links
- **Problem**: Footer only had 3 generic links (Shop All, About Us, Contact). No category links meant Google had limited crawl paths to category pages.
- **Fix**: Added 8 category links (Earrings, Necklaces, Rings, Bracelets, Accessories, ₹99 Sale, Gifts, Hampers) + Hot Deals + Blog links to footer. Changed grid from 4 to 5 columns to accommodate.
- **Files changed**: `src/components/home/NewFooter.tsx`
- **Do NOT revert**: All category links must remain in footer. Grid must be `lg:grid-cols-5`.

---

## Commit `2a95e88` — Added WhatsApp automation via WAHA + n8n

- **Problem**: No automated WhatsApp notifications for orders. Only email was sent. Customer had no real-time order confirmation on WhatsApp.
- **Root cause**: No webhook integration — server never notified any external service after order creation.
- **Fix**: 
  1. Added `sendOrderWebhook(order)` helper function in `server.js` that POSTs order data to an n8n webhook URL
  2. Called it after both COD and prepaid order creation
  3. Created `n8n-workflow-order-whatsapp.json` — n8n workflow template that receives webhook and sends WhatsApp via WAHA API to both customer and admin
  4. Created `WHATSAPP-AUTOMATION.md` — setup guide for WAHA (Docker) and n8n
  5. Added env vars: `N8N_WEBHOOK_URL`, `WAHA_API_URL`, `WAHA_API_KEY`, `WHATSAPP_ADMIN_NUMBER`
- **Files changed**: `server.js`, `.env.example`, `n8n-workflow-order-whatsapp.json` (new), `WHATSAPP-AUTOMATION.md` (new)
- **Key code**: `async function sendOrderWebhook(order) { ... await fetch(webhookUrl, { method: 'POST', ... }); }`
- **Do NOT revert**: 
  - The `sendOrderWebhook(order)` call must remain after both COD and prepaid order saves in `/api/verify-payment`
  - The webhook function must not throw — errors are caught silently so order processing isn't blocked
  - The webhook payload includes: `event`, `orderNumber`, `customer`, `amount`, `paymentMethod`, `items`, `phone`, `createdAt`
  - The n8n workflow file must be kept in project root for reference

---

## Commit `d3acc88` — Welcome popup: 20% discount on login (on arrival)

- **Problem**: The old ExitIntentPopup only showed on mouse leave (exit intent), offered only 10% with a generic coupon code (WELCOME10), and appeared even for logged-in users. The user wanted a popup on **arrival** offering **20% off on login**.
- **Root cause**: Component used `mouseleave` + `beforeunload` events. Discount was a static coupon, not tied to login.
- **Fix**: Rewrote `ExitIntentPopup.tsx`:
  - Shows **5 seconds after page load** (not on exit intent)
  - **Does not show** if user is already logged in (`currentUser` prop checked)
  - Offers **20% OFF** with login CTA
  - "Login & Claim 20% OFF" button navigates to `/account` (AuthPage)
  - "Maybe later" dismiss button
  - Dismissal stored in `localStorage` key `welcome_popup_shown` (different key from old exit popup)
  - Passes `currentUser` from App.tsx as prop
- **Files changed**: `src/components/ExitIntentPopup.tsx` (full rewrite), `src/App.tsx` (pass `currentUser` prop)
- **Key code**: `<ExitIntentPopup currentUser={currentUser} />`
- **Do NOT revert**: 
  - Popup must check `currentUser` — if truthy, return null immediately
  - Timer must be 5000ms (5 seconds)
  - Navigate to `/account` on login button click
  - localStorage key `welcome_popup_shown` must be respected
  - Old `exit_popup_shown` key is now unused

---

## Commit `2152401` — Welcome bonus celebration, THANK10 auto-apply, fixed BUY NOW button

### BUY NOW button always visible (cart page)
- **Problem**: The BUY NOW / checkout button at the bottom of the cart page required scrolling down to see it, degrading mobile UX.
- **Root cause**: The bottom bar used `sticky bottom-0` which didn't stay pinned in all scroll scenarios inside the flex layout.
- **Fix**: Changed to `fixed bottom-0 left-0 right-0` so it always stays at the bottom of the viewport. Added `pb-28` padding to the scrollable content area so items don't get hidden behind the fixed bar.
- **Files changed**: `src/components/CartPage.tsx`
- **Key code**: `<div className="fixed bottom-0 left-0 right-0 bg-white border-t ...">`
- **Do NOT revert**: The bottom bar must be `fixed`, not `sticky`. Content padding must be at least `pb-28`.

### Welcome bonus celebration popup (after login)
- **Problem**: After a non-logged-in user signs up/logs in (from the welcome popup or otherwise), there was no celebration or confirmation showing their welcome discount code.
- **Fix**: Created `WelcomeBonusPopup.tsx`:
  - Shows after successful login/signup if `localStorage.getItem('welcome_bonus_acknowledged')` is not set
  - Celebration design with confetti dots, gradient header, PartyPopper icon
  - Displays **THANK10** coupon code with copy-to-clipboard button
  - "Start Shopping" button navigates to `/shop`
  - Dismissal sets `welcome_bonus_acknowledged` flag so it only shows once
- **Files changed**: `src/components/WelcomeBonusPopup.tsx` (new), `src/App.tsx` (state + render)
- **Key code**: `{showWelcomeBonus && <WelcomeBonusPopup onClose={() => { setShowWelcomeBonus(false); localStorage.setItem('welcome_bonus_acknowledged', 'true'); }} />}`
- **Do NOT revert**: 
  - Must not show if `welcome_bonus_acknowledged` is in localStorage
  - Must always show THANK10 code prominently with copy button
  - Must have a CTA button to shop

### THANK10 auto-apply in checkout
- **Problem**: The user had to manually enter "THANK10" at checkout — no auto-apply for logged-in users.
- **Root cause**: CheckoutPage only applied coupons when the user manually entered and clicked "Apply".
- **Fix**: Added a `useEffect` in CheckoutPage that runs on mount — if `currentUser` exists and `welcome_bonus_used` flag is not set, auto-finds the THANK10 coupon in CMS data and applies it. Sets `welcome_bonus_used` flag so it only auto-applies once.
- **Files changed**: `src/components/CheckoutPage.tsx`
- **Key code**: `useEffect(() => { if (currentUser && !localStorage.getItem('welcome_bonus_used')) { const thank10 = coupons.find(c => c.code === 'THANK10' && c.isActive); if (thank10) { setActiveCoupon(thank10); setCouponCode('THANK10'); localStorage.setItem('welcome_bonus_used', 'true'); } } }, [currentUser, cmsData]);`
- **Do NOT revert**: 
  - The `welcome_bonus_used` localStorage check must run before auto-applying
  - Must only auto-apply if `currentUser` is truthy
  - The auto-apply must find the coupon by code `THANK10` and `isActive: true`

---

## Commit `3dc88c5` — Coupon codes are per-user, one use only

- **Problem**: A logged-in user could reuse the same coupon code on multiple orders. No per-user enforcement existed.
- **Root cause**: `applyCoupon()` only checked if the coupon existed in CMS and was active — no query against existing orders to see if this email already used it. The server also had no duplicate check.
- **Fix**:
  1. **New API endpoint** `POST /api/coupons/validate` (`server.js`): accepts `{ code, email }`, checks coupon exists + is active, then queries `Order.findOne({ 'customer.email': email, couponCode: code })` — if found, returns `{ valid: false, error: 'You have already used this coupon code' }`
  2. **Server-side enforcement** in `/api/verify-payment` (`server.js`): before saving any order (COD or prepaid), checks if same customer email already has an order with the same coupon code — rejects with `400` if duplicate
  3. **Client-side validation** in `CheckoutPage.tsx` `applyCoupon()`: now calls the validate endpoint instead of doing a local CMS lookup. Also requires user to be logged in.
  4. **THANK10 auto-apply** also calls the validate endpoint now (was doing local CMS lookup)
- **Files changed**: `server.js`, `src/components/CheckoutPage.tsx`
- **Key code** (server): `const existingOrder = await Order.findOne({ 'customer.email': email, couponCode: code.toUpperCase() });`
- **Do NOT revert**:
  - The `POST /api/coupons/validate` endpoint must exist and query `Order` for duplicate `customer.email + couponCode`
  - The duplicate check in `/api/verify-payment` must run BEFORE saving any order (both COD and prepaid paths)
  - `applyCoupon()` must call the API, not do local-only validation
  - Both the auto-apply and manual apply must validate via API

---

## Current commit — Shop page product videos not playing

- **Problem**: Product videos on the `/shop` page (uploaded via admin) were not playing on hover (desktop) or tap (mobile).
- **Root cause**: The `76a00b5` redesign commit rewrote `ShopPage.tsx` and removed the video playback code (state, refs, hover handlers, conditional `<video>` rendering, mobile play/pause overlays).
- **Fix**: Restored video support in `ShopPage.tsx`:
  1. Added `Play`/`Pause` icon imports from `lucide-react`
  2. Added `activeVideoId` state, `videoRefs` ref, and `isTouch` detection
  3. Added `onMouseEnter`/`onMouseLeave` handlers on the image container to play video on hover, pause on leave (desktop only)
  4. Conditional rendering: when `product.video && activeVideoId === pid`, show `<video muted loop playsInline>`; primary and secondary images fade to `opacity-0`
  5. Mobile overlay: play button (centered, white circle) on tap to start video; pause button (top-right, dark circle) to stop
  6. Mobile buttons use `e.stopPropagation()` to prevent navigating on tap
- **Files changed**: `src/components/ShopPage.tsx`
- **Do NOT revert**: The video state, refs, handlers, and rendering must remain in ShopPage. Do not remove the conditional video/image rendering or the mobile play/pause overlay buttons.

---

## Current commit — Admin panel redesign & unused component cleanup

- **Problem**: AdminPanel.tsx was a monolithic 2618-line file with inconsistent styling, repetitive patterns, and an outdated visual design. Several components across the codebase were orphaned/unused.
- **Changes**:

### Admin panel redesign (`src/components/AdminPanel.tsx`)
- Complete visual overhaul with modern design: rounded corners, card-based layouts, cleaner typography, better spacing
- Reduced from 2618 lines to ~1450 lines by extracting repetitive CRUD patterns into reusable helpers (`Input`, `Select`, `Textarea`, `Toggle`, `Card`, `PageHeader`, `crudApi`, `renderCrudTab`)
- Consistent form styling with `rounded-lg`, focus rings, and proper label hierarchy
- Sidebar with smooth mobile overlay + desktop sticky positioning
- Dashboard stat cards with icon backgrounds and badges
- Product editor, order detail, and SKU label modals with better layouts
- All existing functionality preserved (same API interface, callbacks, CRUD operations)
- Critical FIXES.MD constraints maintained: lazy-loaded, Cloudinary dynamic script loading, trend link field, coupon management, etc.

### Removed unused components
- `src/components/home/Testimonials.tsx` — zero imports
- `src/components/home/Newsletter.tsx` — zero imports
- `src/components/home/NewHomePage.tsx` — only imported by `index.ts` (itself unused) and `sections/` subtree
- `src/components/home/HomePage.tsx` — zero imports
- `src/components/home/index.ts` — zero imports
- Entire `src/components/home/sections/` directory — orphaned subtree (SectionRenderer → NewHomePage → none rendered in app)

- **Files changed**: `src/components/AdminPanel.tsx` (rewrite), removed 5+ component files + entire `sections/` directory
- **Do NOT revert**:
  - The admin panel must remain as a single lazy-loaded component (App.tsx uses `React.lazy(() => import(...))`)
  - Cloudinary upload must use dynamic script loading (not added to index.html)
  - Trend `link` field must have its input in the form
  - Removed components were confirmed unused via grep — do not restore unless explicitly needed

---

## Admin Panel — Position & spacing fixes

- **Problem**: Mobile layout had sticky header outside flex flow causing main content to be hidden behind it. Sidebar z-index was too low. Card padding was inconsistent throughout.
- **Root cause**: The `<header>` was placed before the flex container on mobile, and `<main>` had no `pt-*` offset. Sidebar used `z-50` while overlay used `z-40`, but sidebar needed higher z. Cards used mixed `p-6`, `p-8`, `p-5` inconsistently.
- **Changes made**:
  - Parent container: changed from `flex` to `lg:flex` so mobile layout stacks vertically
  - Main: added `pt-[60px] lg:pt-0` to offset sticky mobile header; changed `p-6 lg:p-10` → `p-4 sm:p-6 lg:p-10`; reduced `space-y-6` → `space-y-4 lg:space-y-6`
  - Sidebar: changed from `fixed` + `lg:relative` to `sticky lg:top-0 lg:h-screen lg:shrink-0`; z-index increased to `z-[70]`; tighter paddings
  - Mobile header: reduced padding, increased z-index to `z-50`, added shadow
  - Overlay: z-index increased from `z-40` to `z-[60]`
  - PageHeader: `mb-8` → `mb-5 lg:mb-8`, title `text-2xl` → `text-xl lg:text-2xl`
  - Product editor modal: header `px-8 py-5` → `px-6 py-4`, body `p-8` → `p-6`, footer `px-8 py-5` → `px-6 py-4`
  - Order detail modal: same tightening as product editor
  - Blog form modal: `p-8` → `p-6`, `mb-8` → `mb-5`
  - All content/settings/form cards: `p-6` → `p-5 sm:p-6`, `space-y-6` → `space-y-5` on mobile
  - Content tab: `space-y-10` → `space-y-6`, category tile grid `gap-5` → `gap-4`, `grid-cols-1` → `grid-cols-2` on small screens
  - Dashboard stat cards grid: `gap-4` kept (tight enough)
  - Settings: `space-y-8` → `space-y-6`
- **Files changed**: `src/components/AdminPanel.tsx`
- **Do NOT revert**: The `pt-[60px] lg:pt-0` on main, the sidebar must stay `sticky`, z-index hierarchy must be: header(z-50) < overlay(z-[60]) < sidebar(z-[70])

---

## Fix — Google Search Console: Missing aggregateRating and review in Product schema (CORRECTED)

### Problem
Google Search Console reported 4 Product items missing `aggregateRating` and `review` fields. These were conditionally included only when reviews.existed, meaning products with zero reviews had no structured data for these fields.

### Root Cause
In `src/components/JsonLd.tsx`, `getProductSchema()` wrapped both `aggregateRating` and `review` inside a conditional `...(product.reviews?.length > 0 ? {...} : {})` spread — meaning products with zero reviews had neither field at all in their JSON-LD. The same pattern existed in `src/app/products/[slug]/page.tsx` (Next.js product page) and `src/app/products/page.tsx` (shop listing ItemList), plus `getProductGroupSchema()` lacked them entirely.

### Fix
Changed all Product schema generation to conditionally include `aggregateRating` and `review` ONLY when reviews exist. Google strictly rejects `aggregateRating` with `ratingValue: 0` and `reviewCount: 0` — this would be worse than omitting the field entirely.

#### Files changed:
1. **`src/components/JsonLd.tsx`** — `getProductSchema()`: `aggregateRating` and `review` are now conditional on `product.reviews?.length > 0`
2. **`src/app/products/[slug]/page.tsx`** — `productJsonLd`: Same conditional pattern; `aggregateRating` and `review` only added when `reviewCount > 0`; breadcrumb category URL fixed from `/products/` to `/shop/`
3. **`src/app/products/page.tsx`** — `itemListJsonLd`: `aggregateRating` made conditional on `product._count?.reviews > 0`
4. **`src/components/JsonLd.tsx`** — `getProductGroupSchema()`: Added conditional `aggregateRating` field

### Do NOT revert
- The `aggregateRating` and `review` fields must ONLY be present when the product actually has reviews
- `aggregateRating` with `ratingValue: 0` and `reviewCount: 0` will be REJECTED by Google — always omit when no reviews exist
- `review` array should be omitted entirely when there are no reviews

---

## Fix — Optimized sitemap.ts for modern SEO standards

### Problem
The sitemap.ts used deprecated `priority` and `changeFrequency` tags (which Google officially ignores) and passed raw `Date` objects from MongoDB without proper W3C datetime formatting.

### Fix
1. Removed all `priority` and `changeFrequency` properties from sitemap entries (Google ignores these)
2. Wrapped all `lastModified` values in `new Date()` for proper W3C datetime format (YYYY-MM-DDTHH:mm:ss.sssZ)
3. Updated category URLs from `/products/${cat.slug}` to `/shop/${cat.slug}` to match actual live site routing
4. Updated product URLs from `/products/${p.slug}` to `/product/${p.slug}` to match actual live site routing
5. Added `image` field to product select query and included `images` array in sitemap entries for Google Images indexing
6. Removed unused `category` select from products query (was fetched but never used in sitemap)
7. Added `hot-deals` and `refund` routes to static pages (matching existing sitemap.xml)

### Files changed
- `src/app/sitemap.ts` — optimized sitemap generation
- `sitemap-optimized.xml` — sample output showing optimized XML format

### Do NOT revert
- `priority` and `changeFrequency` must remain removed (Google ignores them)
- All `lastModified` values must be wrapped in `new Date()` for proper W3C format
- Category URLs must use `/shop/${slug}` (not `/products/${slug}`)
- Product URLs must use `/products/${slug}` (Next.js route, not `/product/`)

---

## Commit `fe0d1ff` — CRITICAL: Next.js product page JSON-LD schema fixes

### Problem
The Next.js product page at `src/app/products/[slug]/page.tsx` had three critical Google schema violations:
1. `aggregateRating` with 0 reviews would be rejected by Google (must be completely omitted)
2. `review` structure was incomplete (missing `datePublished` and `reviewRating.worstRating`)
3. Breadcrumb category URL pointed to `/products/` instead of `/shop/` (Vite SPA route)

### Root Cause
The JSON-LD was always including `aggregateRating` and `review` even when no reviews existed, and the breadcrumb used the wrong URL path.

### Fix
1. Made `aggregateRating` and `review` completely conditional on `reviewCount > 0` — omitted entirely when no reviews exist
2. Added `datePublished` to each review item using ISO date format
3. Added `reviewRating.worstRating: "1"` to each review item
4. Fixed breadcrumb category URL from `/products/${slug}` to `/shop/${slug}`
5. Typed `productJsonLd` as `any` to allow conditional property addition

### Files changed
- `src/app/products/[slug]/page.tsx`

### Do NOT revert
- `aggregateRating` and `review` must be completely omitted (not zeroed) when no reviews exist
- Breadcrumb category URL must use `/shop/` not `/products/`

---

## Commit `be4338f` — Optimize next.config.ts and cloudinary-loader.ts for production

### Problem
1. `next.config.ts` had `loader: "custom"` alongside `loaderFile` — Next.js 15+ treats these as conflicting and can cause build validation errors
2. `cloudinary-loader.ts` was using the Vite SPA style `buildUrl()` function instead of Next.js-compatible inline transformation injection
3. Missing production optimizations: `powerByHeader: false` (prevents server sniffing), `reactStrictMode: true`, `unoptimized: false` (force compression globally)

### Fix
1. **next.config.ts**: Removed `loader: "custom"`, removed unused `path` import, added `powerByHeader: false`, `reactStrictMode: true`, `unoptimized: false`
2. **cloudinary-loader.ts**: Complete rewrite with proper Cloudinary URL transformation format — injects `f_auto,q_auto,w_${width},c_limit` directly into the `/upload/` path segment

### Do NOT revert
- `loader` property must NOT coexist with `loaderFile` �?" keep only `loaderFile`
- Cloudinary loader must inject transforms into the URL path, not use external URL building
- `f_auto` ensures WebP/AVIF delivery based on browser capability

---

## Route cutover: Vite SPA `/shop/*` to Next.js for Google SSR crawlability

### Problem
Googlebot was seeing the Vite SPA serving `/shop/*` category and `/products/*` product pages client-side. The browser address bar showed `satvastones.in/shop/pendant` but the Vite SPA processes all routing at `/shop/*` client-side, meaning Googlebot cannot read the clean SSR HTML or execute the optimized schema metadata written for Next.js. No traffic was reaching the Next.js app.

### Root cause
The Express server.js does not route public SEO paths to Next.js. The Vite SPA takes all frontend traffic and serves the static `dist/index.html` with client-side routing, bypassing Next.js entirely for all page views.

### Fix
1. **Moved Next.js routes**: Relocated all Next.js product-related routes from `src/app/products/` to `src/app/shop/` to match the Vite SPA URL structure:
   - `src/app/products/page.tsx` → `src/app/shop/page.tsx`
   - `src/app/products/[slug]/page.tsx` → `src/app/shop/[slug]/page.tsx`
   - `src/app/products/ProductsClient.tsx` → `src/app/shop/ProductsClient.tsx`
   - `src/app/products/[slug]/ProductDetailClient.tsx` → `src/app/shop/[slug]/ProductDetailClient.tsx`

2. **Updated all public URL references** from `/products/` to `/shop/` across:
   - `src/components/product/ProductCard.tsx` — product detail links
   - `src/components/home/FeaturedProducts.tsx` — product links
   - `src/components/home/CollectionGallery.tsx` — product links
   - `src/app/wishlist/page.tsx` — product links in cart
   - `src/app/cart/page.tsx` — product links in cart
   - `src/app/sitemap.ts` — category and product sitemap URLs
   - `src/app/shop/page.tsx` — canonical URL and ItemList schema URLs
   - `src/app/shop/[slug]/page.tsx` — canonical URL, OG image URL, and breadcrumb/product schema URLs

3. **Added `http-proxy-middleware`** to `package.json` dependencies (`^3.0.3`).

4. **Added Express reverse proxy to server.js**:
   - Added imports for `http-proxy-middleware`, `path`, and `fileURLToPath`
   - Added `nextjsManagedPaths` array covering `/`, `/shop`, `/shop/*`, `/products/*`, `/blog`, `/blog/*`, `/about`, `/contact`
   - Added `createProxyMiddleware` for each path targeting `process.env.NEXTJS_APP_PRODUCTION_URL`
   - Added `express.static` for the Vite SPA `dist/` folder as fallback layer
   - Added `app.get('*')` SPA fallback to serve `dist/index.html`

5. **Deleted old `src/app/products/` directory** (all files moved to `shop/`)

### Do NOT revert
- The proxy paths must match both `/shop/*` (Vite SPA category URLs) and `/products/*` (product detail URLs)
- `NEXTJS_APP_PRODUCTION_URL` environment variable must be set on Render for the proxy target
- The `app.get('*')` SPA fallback must come AFTER the proxy middleware so proxied requests are intercepted first
- The static file serving for `dist/` must remain as the fallback layer after proxy middleware