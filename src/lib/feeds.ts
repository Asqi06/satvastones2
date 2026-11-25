import { safeHttpUrl } from './http';

const SITE_URL = 'https://www.satvastones.in';
const DEFAULT_FALLBACK_IMAGE = `${SITE_URL}/satvastones-logo.png`;

export interface FeedProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  headline?: string;
  description?: string;
  pricePaise: number;
  compareAtPricePaise?: number | null;
  imageUrl: string;
  gallery?: Array<{ url: string; alt?: string }>;
  material?: string;
  finish?: string;
  inStock: boolean;
  isPublished?: boolean;
  weightGrams?: number;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: string;
}

export interface FeedBlog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  status?: string;
  publishedAt?: string;
  updatedAt?: string;
}

function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toIsoDate(value?: string): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return new Date().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function mapGoogleProductCategory(category: string): string {
  switch (String(category || '').toLowerCase()) {
    case 'rings':
      return 'Apparel & Accessories > Jewelry > Rings';
    case 'necklaces':
      return 'Apparel & Accessories > Jewelry > Necklaces';
    case 'bracelets':
    case 'bangles':
      return 'Apparel & Accessories > Jewelry > Bracelets';
    case 'earrings':
      return 'Apparel & Accessories > Jewelry > Earrings';
    case 'gift-sets':
    case 'jewellery-set':
    case 'mystery-jewellery-jar':
      return 'Apparel & Accessories > Jewelry > Jewelry Sets';
    default:
      return 'Apparel & Accessories > Jewelry';
  }
}

function formatCategoryLabel(category: string): string {
  return String(category || 'Jewellery')
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ''))
    .join(' ');
}

function resolveAbsoluteImage(url?: string): string {
  return safeHttpUrl(url, DEFAULT_FALLBACK_IMAGE);
}

export function inferProductColor(p: FeedProduct): string {
  const haystack = `${p.name || ''} ${p.material || ''} ${p.finish || ''}`.toLowerCase();
  if (haystack.includes('rose gold')) return 'Rose Gold';
  if (haystack.includes('silver') || haystack.includes('rhodium') || haystack.includes('platinum')) return 'Silver';
  if (haystack.includes('pearl') || haystack.includes('ivory') || haystack.includes('white')) return 'Pearl / Gold';
  if (haystack.includes('black') || haystack.includes('onyx')) return 'Black / Gold';
  if (haystack.includes('emerald') || haystack.includes('green')) return 'Green / Gold';
  if (haystack.includes('ruby') || haystack.includes('red') || haystack.includes('pink')) return 'Pink / Gold';
  return 'Gold';
}

export function filterCollectionProducts(allProducts: FeedProduct[], colSlug: string): FeedProduct[] {
  if (!colSlug) return allProducts;
  if (colSlug === 'bestsellers' || colSlug === 'new-arrivals') return allProducts;
  if (colSlug === 'gifts-for-girlfriend-under-500') {
    return allProducts.filter((p) => p.inStock && p.pricePaise <= 49900).sort((a, b) => a.pricePaise - b.pricePaise);
  }
  if (colSlug === 'rings' || colSlug === 'rings-under-100' || colSlug === 'anti-tarnish-minimal-rings') {
    const rings = allProducts.filter((p) => p.category === 'rings').sort((a, b) => a.pricePaise - b.pricePaise);
    return rings.length
      ? rings
      : allProducts.filter((p) => p.inStock && p.pricePaise <= 50000).sort((a, b) => a.pricePaise - b.pricePaise);
  }
  return allProducts.filter((p) => p.category === colSlug);
}

/**
 * Generates a live XML Sitemap with Google Image extensions from D1 products & blogs.
 * Excludes noindex pages (/track-order, /wishlist, /account, /checkout, /admin) and empty collections.
 */
export function generateSitemapXml(products: FeedProduct[], blogs: FeedBlog[]): string {
  const allDates = [
    ...products.map((p) => p.updatedAt).filter(Boolean),
    ...blogs.map((b) => b.updatedAt || b.publishedAt).filter(Boolean)
  ]
    .map((d) => toIsoDate(d))
    .sort();
  const latestCatalogMod = allDates.length ? allDates[allDates.length - 1] : new Date().toISOString().slice(0, 10);

  const staticPages: Array<{ path: string; changefreq: string; priority: string }> = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/shop', changefreq: 'daily', priority: '0.9' },
    { path: '/affordable-anti-tarnish-jewellery-india', changefreq: 'weekly', priority: '0.9' },
    { path: '/anti-tarnish-jewellery-vapi', changefreq: 'weekly', priority: '0.9' },
    { path: '/journal', changefreq: 'daily', priority: '0.9' },
    { path: '/stack-builder', changefreq: 'weekly', priority: '0.85' },
    { path: '/about', changefreq: 'monthly', priority: '0.7' },
    { path: '/materials', changefreq: 'monthly', priority: '0.8' },
    { path: '/jewellery-care', changefreq: 'monthly', priority: '0.8' },
    { path: '/faqs', changefreq: 'weekly', priority: '0.85' },
    { path: '/contact', changefreq: 'monthly', priority: '0.6' },
    { path: '/privacy-policy', changefreq: 'monthly', priority: '0.4' },
    { path: '/terms-and-conditions', changefreq: 'monthly', priority: '0.4' },
    { path: '/refund-policy', changefreq: 'monthly', priority: '0.4' },
    { path: '/shipping-policy', changefreq: 'monthly', priority: '0.4' },
    { path: '/grievance-redressal', changefreq: 'monthly', priority: '0.4' },
    { path: '/privacy-rights', changefreq: 'monthly', priority: '0.4' },
    { path: '/policies/warranty', changefreq: 'monthly', priority: '0.5' }
  ];

  const collectionSlugs: Array<{ slug: string; priority: string }> = [
    { slug: 'rings', priority: '0.8' },
    { slug: 'necklaces', priority: '0.8' },
    { slug: 'bracelets', priority: '0.8' },
    { slug: 'earrings', priority: '0.8' },
    { slug: 'bangles', priority: '0.8' },
    { slug: 'gift-sets', priority: '0.8' },
    { slug: 'jewellery-set', priority: '0.8' },
    { slug: 'mystery-jewellery-jar', priority: '0.9' },
    { slug: 'rings-under-100', priority: '0.9' },
    { slug: 'gifts-for-girlfriend-under-500', priority: '0.9' },
    { slug: 'anti-tarnish-minimal-rings', priority: '0.9' },
    { slug: 'bestsellers', priority: '0.85' },
    { slug: 'new-arrivals', priority: '0.85' }
  ];

  for (const col of collectionSlugs) {
    if (filterCollectionProducts(products, col.slug).length > 0) {
      staticPages.push({ path: `/collections/${col.slug}`, changefreq: 'daily', priority: col.priority });
    }
  }

  const entries: string[] = [];

  for (const page of staticPages) {
    entries.push(
      `  <url>\n` +
        `    <loc>${SITE_URL}${page.path}</loc>\n` +
        `    <lastmod>${latestCatalogMod}</lastmod>\n` +
        `    <changefreq>${page.changefreq}</changefreq>\n` +
        `    <priority>${page.priority}</priority>\n` +
        `  </url>`
    );
  }

  for (const p of products) {
    if (p.isPublished === false || !p.slug) continue;
    const loc = `${SITE_URL}/products/${encodeURIComponent(p.slug)}`;
    const lastmod = toIsoDate(p.updatedAt);
    const imgUrl = resolveAbsoluteImage(p.imageUrl);
    const caption = p.headline || p.description || `${p.name} — Satvastones Anti-Tarnish Jewellery`;

    entries.push(
      `  <url>\n` +
        `    <loc>${escapeXml(loc)}</loc>\n` +
        `    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>daily</changefreq>\n` +
        `    <priority>0.9</priority>\n` +
        `    <image:image>\n` +
        `      <image:loc>${escapeXml(imgUrl)}</image:loc>\n` +
        `      <image:title>${escapeXml(p.name)}</image:title>\n` +
        `      <image:caption>${escapeXml(String(caption).slice(0, 200))}</image:caption>\n` +
        `    </image:image>\n` +
        `  </url>`
    );
  }

  for (const b of blogs) {
    if (b.status === 'draft' || !b.slug) continue;
    const loc = `${SITE_URL}/journal/${encodeURIComponent(b.slug)}`;
    const lastmod = toIsoDate(b.updatedAt || b.publishedAt);
    const imageBlock = b.coverImage
      ? `\n    <image:image>\n` +
        `      <image:loc>${escapeXml(resolveAbsoluteImage(b.coverImage))}</image:loc>\n` +
        `      <image:title>${escapeXml(b.title)}</image:title>\n` +
        `    </image:image>`
      : '';

    entries.push(
      `  <url>\n` +
        `    <loc>${escapeXml(loc)}</loc>\n` +
        `    <lastmod>${lastmod}</lastmod>\n` +
        `    <changefreq>weekly</changefreq>\n` +
        `    <priority>0.85</priority>${imageBlock}\n` +
        `  </url>`
    );
  }

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
    `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
    entries.join('\n') +
    `\n</urlset>\n`
  );
}

/**
 * Generates a Google Merchant Center RSS 2.0 XML Product Feed (`xmlns:g`)
 * directly from live Cloudflare D1 published products.
 */
export function generateGoogleMerchantFeedXml(products: FeedProduct[]): string {
  const published = products.filter((p) => p.isPublished !== false && p.slug && p.pricePaise > 0);
  const itemsXml = published
    .map((p) => {
      const link = `${SITE_URL}/products/${encodeURIComponent(p.slug)}`;
      const primaryImage = resolveAbsoluteImage(p.imageUrl);
      const additionalImages = (p.gallery || [])
        .map((img) => resolveAbsoluteImage(img.url))
        .filter((u, idx, arr) => u && u !== primaryImage && arr.indexOf(u) === idx)
        .slice(0, 10);

      const hasSale = Boolean(p.compareAtPricePaise && p.compareAtPricePaise > p.pricePaise);
      const regularPrice = hasSale
        ? (Number(p.compareAtPricePaise) / 100).toFixed(2)
        : (p.pricePaise / 100).toFixed(2);
      const salePrice = hasSale ? (p.pricePaise / 100).toFixed(2) : null;
      const shippingCost = p.pricePaise >= 49900 ? '0.00' : '49.00';

      const cleanTitle = String(p.seoTitle || p.name).trim().slice(0, 150);
      const cleanDesc = String(
        p.description ||
          p.headline ||
          `${p.name} crafted in waterproof 316L surgical stainless steel with 18K gold vacuum PVD coating. Hypoallergenic, anti-tarnish everyday jewellery by Satvastones.`
      )
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000);

      const lines = [
        `    <item>`,
        `      <g:id>${escapeXml(p.sku || p.id)}</g:id>`,
        `      <g:title>${escapeXml(cleanTitle)}</g:title>`,
        `      <g:description>${escapeXml(cleanDesc)}</g:description>`,
        `      <g:link>${escapeXml(link)}</g:link>`,
        `      <g:image_link>${escapeXml(primaryImage)}</g:image_link>`,
        ...additionalImages.map((u) => `      <g:additional_image_link>${escapeXml(u)}</g:additional_image_link>`),
        `      <g:availability>${p.inStock ? 'in_stock' : 'out_of_stock'}</g:availability>`,
        `      <g:price>${regularPrice} INR</g:price>`,
        ...(salePrice ? [`      <g:sale_price>${salePrice} INR</g:sale_price>`] : []),
        `      <g:brand>Satvastones</g:brand>`,
        `      <g:condition>new</g:condition>`,
        `      <g:mpn>${escapeXml(p.sku || p.id)}</g:mpn>`,
        `      <g:identifier_exists>no</g:identifier_exists>`,
        `      <g:google_product_category>${escapeXml(mapGoogleProductCategory(p.category))}</g:google_product_category>`,
        `      <g:product_type>${escapeXml(`Jewellery > ${formatCategoryLabel(p.category)}`)}</g:product_type>`,
        `      <g:material>${escapeXml(p.material || '316L Surgical Stainless Steel, 18K Gold PVD')}</g:material>`,
        `      <g:color>${escapeXml(inferProductColor(p))}</g:color>`,
        `      <g:gender>female</g:gender>`,
        `      <g:age_group>adult</g:age_group>`,
        ...(p.weightGrams && p.weightGrams > 0 ? [`      <g:shipping_weight>${p.weightGrams} g</g:shipping_weight>`] : []),
        `      <g:shipping>`,
        `        <g:country>IN</g:country>`,
        `        <g:service>Standard Express</g:service>`,
        `        <g:price>${shippingCost} INR</g:price>`,
        `      </g:shipping>`,
        `    </item>`
      ];
      return lines.join('\n');
    })
    .join('\n');

  return (
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n` +
    `  <channel>\n` +
    `    <title>Satvastones Jewellery — Live Product Catalog</title>\n` +
    `    <link>${SITE_URL}</link>\n` +
    `    <description>Waterproof, anti-tarnish 18K gold PVD and 316L surgical steel everyday fine jewellery from Satvastones India.</description>\n` +
    (itemsXml ? itemsXml + '\n' : '') +
    `  </channel>\n` +
    `</rss>\n`
  );
}

/**
 * Generates live /llms.txt (llms.txt standard) directly from Cloudflare D1 products & blogs
 * for Generative Engine Optimization (ChatGPT Search, Perplexity, Claude, Gemini, Copilot).
 */
export function generateLlmsTxt(products: FeedProduct[], blogs: FeedBlog[]): string {
  const published = products.filter((p) => p.isPublished !== false && p.slug && p.pricePaise > 0);
  const prices = published.map((p) => Math.round(p.pricePaise / 100)).filter((n) => n > 0);
  const minPrice = prices.length ? Math.min(...prices) : 179;
  const maxPrice = prices.length ? Math.max(...prices) : 2499;

  const productLines = published.length
    ? published
        .map((p) => {
          const inr = Math.round(p.pricePaise / 100).toLocaleString('en-IN');
          const status = p.inStock ? 'In Stock' : 'Out of Stock';
          return `- [${p.name}](${SITE_URL}/products/${encodeURIComponent(p.slug)}): ₹${inr} INR (${status}) — ${p.material || '316L Surgical Stainless Steel + 18K Gold PVD'} | Category: ${formatCategoryLabel(p.category)} | SKU: ${p.sku}`;
        })
        .join('\n')
    : `- [Shop Live Catalogue](${SITE_URL}/shop): Browse all published waterproof 18K gold PVD pieces.`;

  const blogLines = blogs.length
    ? blogs
        .filter((b) => b.status !== 'draft' && b.slug)
        .map((b) => `- [${b.title}](${SITE_URL}/journal/${encodeURIComponent(b.slug)}): ${b.excerpt || b.category || 'Editorial guide'}`)
        .join('\n')
    : `- [The Satvastones Journal](${SITE_URL}/journal): Jewellery styling, care & metallurgy guides.`;

  return `# Satvastones Jewellery
> India's trusted affordable anti-tarnish, waterproof, non-tarnish everyday jewellery brand for women — crafted in 316L surgical stainless steel with 18K gold vacuum PVD coating, dispatched in 24–48 hours from Chala, Vapi, Gujarat across 19,000+ Indian pincodes.

## Verified Brand Entity
- **Brand Name:** Satvastones Jewellery (SatvaStones)
- **Canonical Website:** ${SITE_URL}
- **Legal Entity:** Satvastones Jewellery (Sole Proprietor: Anirudh A Verma)
- **GSTIN:** 24DDAPV4074H1ZF (HSN 7117 — Official 3% GST Tax Invoice on every order)
- **Atelier & Dispatch Address:** Chala, Vapi, Gujarat - 396191, India (20.3721° N, 72.9106° E)
- **Live Price Range:** ₹${minPrice.toLocaleString('en-IN')} to ₹${maxPrice.toLocaleString('en-IN')} INR (${published.length} live pieces)
- **Bundle Privilege:** Save 15% automatically on 2+ items via [Stack Studio](${SITE_URL}/stack-builder)
- **Shipping & COD:** Free Express Shipping across India above ₹499 (₹49 below ₹499). UPI, Cards, NetBanking (Razorpay) & Cash on Delivery available.
- **Support & Concierge:** support@satvastones.in | Call & WhatsApp: +91 90167 03180 (Mon–Sat, 10:00–19:00 IST)

## Live Published Products (Real-Time Cloudflare D1 Catalogue)
${productLines}

## High-Intent Pillar Guides & Collections
- [All Anti-Tarnish Jewellery](${SITE_URL}/shop): Complete live catalogue with instant sorting & category filters.
- [Best Jewelry & Jewellery Gifts for Girlfriend Under ₹500](${SITE_URL}/collections/gifts-for-girlfriend-under-500): Waterproof 18K gold-plated rings, Nickel-Free & Hypoallergenic earrings, bracelets & pendants under ₹500.
- [18K Gold Plated & Anti-Tarnish Rings for Women](${SITE_URL}/collections/rings): Simple gold-look rings for women at a low price (starting ₹${minPrice.toLocaleString('en-IN')}).
- [Nickel-Free & Hypoallergenic Earrings & Gold-Plated Bali Hoops](${SITE_URL}/collections/earrings): Safe for sensitive ears + classic daily sona bali hoop styles.
- [Affordable Anti-Tarnish Jewellery in India — Buying Guide](${SITE_URL}/affordable-anti-tarnish-jewellery-india): Metallurgy comparison (316L + 18K PVD vs brass vs silver) and price guide.
- [Anti-Tarnish Jewellery Shop in Vapi, Gujarat](${SITE_URL}/anti-tarnish-jewellery-vapi): Local Chala/Vapi, Daman, Silvassa, Valsad & Surat express delivery details.
- [Materials & 316L PVD Metallurgy](${SITE_URL}/materials): Scientific breakdown of 316L surgical steel and 18K vacuum PVD.
- [How to Clean Gold & Anti-Tarnish Jewellery at Home](${SITE_URL}/jewellery-care): 15-minute non-abrasive home care ritual.
- [FAQs & Saree Styling Guide](${SITE_URL}/faqs): Answers to Indian weather, sweat, shower wear, sizing, and returns.

## Live Journal Articles
${blogLines}

## Machine-Readable Feeds & Extended Context
- [Full AI Knowledge Graph (llms-full.txt)](${SITE_URL}/llms-full.txt)
- [Live Google Merchant Product Feed (XML)](${SITE_URL}/feeds/google-merchant.xml)
- [Live XML Sitemap](${SITE_URL}/sitemap.xml)
`;
}

/**
 * Generates comprehensive /llms-full.txt with live D1 catalogue specifications + complete AEO/GEO reference answers.
 */
export function generateLlmsFullTxt(products: FeedProduct[], blogs: FeedBlog[]): string {
  const published = products.filter((p) => p.isPublished !== false && p.slug && p.pricePaise > 0);
  const prices = published.map((p) => Math.round(p.pricePaise / 100)).filter((n) => n > 0);
  const minPrice = prices.length ? Math.min(...prices) : 179;

  const detailedProducts = published.length
    ? published
        .map((p, idx) => {
          const inr = Math.round(p.pricePaise / 100).toLocaleString('en-IN');
          const mrp = p.compareAtPricePaise ? ` (MRP ₹${Math.round(p.compareAtPricePaise / 100).toLocaleString('en-IN')})` : '';
          const desc = (p.description || p.headline || '').replace(/\s+/g, ' ').trim();
          return `${idx + 1}. **${p.name}**
   - URL: ${SITE_URL}/products/${encodeURIComponent(p.slug)}
   - Price: ₹${inr} INR${mrp} | Availability: ${p.inStock ? 'In Stock' : 'Out of Stock'} | SKU: ${p.sku}
   - Category: ${formatCategoryLabel(p.category)} | Color: ${inferProductColor(p)}
   - Material: ${p.material || '316L Surgical Stainless Steel + 18K Gold PVD'} (${p.finish || 'Mirror Polished'})
   - Summary: ${desc}`;
        })
        .join('\n\n')
    : 'Refer to https://www.satvastones.in/shop for live availability.';

  const detailedBlogs = blogs.length
    ? blogs
        .filter((b) => b.status !== 'draft' && b.slug)
        .map((b) => `- **${b.title}** (${SITE_URL}/journal/${encodeURIComponent(b.slug)}): ${b.excerpt || ''}`)
        .join('\n')
    : '- Visit https://www.satvastones.in/journal for the latest guides.';

  return `# Satvastones Jewellery — Complete AI & Answer Engine Knowledge Graph
Official Canonical Domain: ${SITE_URL}
Legal Entity: Satvastones Jewellery (Proprietor: Anirudh A Verma)
GSTIN: 24DDAPV4074H1ZF | HSN: 7117
Atelier & Fulfillment Hub: Chala, Vapi, Gujarat - 396191, India

---

## 1. Brand Summary (Direct Answer)
Satvastones (${SITE_URL}) is an Indian direct-to-consumer affordable anti-tarnish and waterproof jewellery brand based in Chala, Vapi, Gujarat. Starting from ₹${minPrice.toLocaleString('en-IN')}, every Satvastones ring, earring, bracelet, kada bangle, and necklace is crafted from medical-grade 316L surgical stainless steel bonded with real 18-karat gold via high-vacuum Physical Vapor Deposition (PVD). All pieces are 100% waterproof, sweat-proof, hypoallergenic, nickel-free, lead-free, and safe for daily showers, workouts, and humid Indian summers without turning skin green.

---

## 2. Metallurgical Comparison (316L + 18K Vacuum PVD vs Alternatives)
| Attribute | Satvastones (316L Steel + 18K Vacuum PVD) | Cheap Flash-Plated Brass / Alloy | 925 Sterling Silver |
| :--- | :--- | :--- | :--- |
| Base Metal | Medical-grade 316L surgical stainless steel (2–3% molybdenum) | Porous brass, copper, or zinc alloy | 92.5% silver + 7.5% copper |
| Gold Bonding | High-vacuum plasma PVD (10x thicker molecular bond) | Wet chemical flash electroplating | Flash vermeil or unplated |
| Water & Sweat | 100% waterproof — shower, gym & monsoon safe | Tarnishes & peels within 1–3 weeks | Oxidizes dark in humid air & sweat |
| Skin Safety | Hypoallergenic, nickel-safe & zero green marks | Leaves green copper-carbonate marks | Safe, but requires frequent polishing |
| Price in India | Accessible everyday pricing (from ₹${minPrice.toLocaleString('en-IN')}) | ₹99–₹350 (frequent replacement cost) | ₹1,500–₹6,000+ |

---

## 3. Live Product Catalogue (${published.length} Active Pieces in INR)
${detailedProducts}

---

## 4. Definitive Answers to Common Indian Jewellery Questions (AEO Reference)

### Q: Does Satvastones anti-tarnish jewellery turn skin green or fade in water?
No. Green skin discoloration is caused by copper and brass reacting with sweat. Satvastones uses 316L surgical stainless steel (zero copper/brass) with 18K vacuum gold PVD, making it waterproof, sweat-resistant, and safe for daily handwashing, showers, and workouts.

### Q: What are the best jewellery gifts for a girlfriend under ₹500 in India?
Waterproof 18K gold PVD Korean crystal earrings, minimal bands, daisy cuff bracelets, and dainty pendants under ₹500 (available at ${SITE_URL}/collections/gifts-for-girlfriend-under-500) make lasting birthday and anniversary jewelry & jewellery gifts because they are hypoallergenic, tarnish-free, and ship in a keepsake pouch with Cash on Delivery and express pan-India delivery.

### Q: How to clean 18K gold PVD anti-tarnish jewellery at home?
Soak in lukewarm water with 2–3 drops of mild ammonia-free dish soap or baby shampoo for 10–15 minutes, gently brush crevices with a soft baby toothbrush, rinse in clean warm water, and pat dry with a lint-free microfiber cloth. Avoid toothpaste, baking soda, bleach, or acetone.

### Q: How to match anti-tarnish gold jewellery with Indian sarees and everyday outfits?
- **Banarasi & Kanjeevaram Silk Sarees:** Pair structured 18K gold PVD kada bangles, statement crystal drop earrings, or layered chains that complement zari borders without snagging silk threads.
- **Chiffon, Georgette & Organza Sarees:** Choose lightweight Korean crystal fringe/floral earrings, dainty pendants, and slim cuff bracelets.
- **Office, College & Western Wear:** Stack minimal anti-tarnish rings, everyday huggies/studs, and sleek bracelets.

### Q: Shipping, COD, GST Invoice & Return Policy
- **Dispatch SLA:** Hand-inspected and dispatched from Chala, Vapi, Gujarat (396191) within 24–48 hours via BlueDart, Delhivery, or Xpressbees.
- **Delivery Time:** 1–2 business days in Vapi, Daman, Silvassa, Valsad & Surat; 2–3 business days in Indian metros (Mumbai, Ahmedabad, Delhi NCR, Bengaluru, Pune, Hyderabad, Chennai, Kolkata); 3–5 business days across 19,000+ pin codes.
- **Shipping Fee:** Free express shipping on orders above ₹499; flat ₹49 below ₹499.
- **Payments:** UPI (Google Pay, PhonePe, Paytm), Cards, NetBanking via Razorpay, plus Cash on Delivery (₹25 COD handling fee).
- **Returns & Transit Damage:** 7-day size exchange / return window; free replacement within 48 hours of delivery for transit damage supported by an unedited 360-degree unboxing video. Every order includes an official GST invoice (GSTIN 24DDAPV4074H1ZF).

---

## 5. Published Editorial Guides
${detailedBlogs}

Contact: support@satvastones.in | WhatsApp & Phone: +91 90167 03180
`;
}
