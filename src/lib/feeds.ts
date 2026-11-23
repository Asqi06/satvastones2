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

/**
 * Generates a live XML Sitemap with Google Image extensions from D1 products & blogs.
 */
export function generateSitemapXml(products: FeedProduct[], blogs: FeedBlog[]): string {
  const today = new Date().toISOString().slice(0, 10);

  const staticPages: Array<{ path: string; changefreq: string; priority: string }> = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/shop', changefreq: 'daily', priority: '0.9' },
    { path: '/gifts-for-girlfriend-under-500', changefreq: 'weekly', priority: '0.9' },
    { path: '/affordable-anti-tarnish-jewellery-india', changefreq: 'weekly', priority: '0.9' },
    { path: '/anti-tarnish-jewellery-vapi', changefreq: 'weekly', priority: '0.9' },
    { path: '/journal', changefreq: 'daily', priority: '0.9' },
    { path: '/stack-builder', changefreq: 'weekly', priority: '0.85' },
    { path: '/about', changefreq: 'monthly', priority: '0.7' },
    { path: '/materials', changefreq: 'monthly', priority: '0.8' },
    { path: '/jewellery-care', changefreq: 'monthly', priority: '0.8' },
    { path: '/faqs', changefreq: 'weekly', priority: '0.85' },
    { path: '/contact', changefreq: 'monthly', priority: '0.6' },
    { path: '/track-order', changefreq: 'weekly', priority: '0.6' },
    { path: '/privacy-policy', changefreq: 'monthly', priority: '0.4' },
    { path: '/terms-and-conditions', changefreq: 'monthly', priority: '0.4' },
    { path: '/refund-policy', changefreq: 'monthly', priority: '0.4' },
    { path: '/shipping-policy', changefreq: 'monthly', priority: '0.4' },
    { path: '/grievance-redressal', changefreq: 'monthly', priority: '0.4' },
    { path: '/privacy-rights', changefreq: 'monthly', priority: '0.4' },
    { path: '/policies/warranty', changefreq: 'monthly', priority: '0.5' },
    { path: '/collections/rings', changefreq: 'daily', priority: '0.8' },
    { path: '/collections/necklaces', changefreq: 'daily', priority: '0.8' },
    { path: '/collections/bracelets', changefreq: 'daily', priority: '0.8' },
    { path: '/collections/earrings', changefreq: 'daily', priority: '0.8' },
    { path: '/collections/bangles', changefreq: 'daily', priority: '0.8' },
    { path: '/collections/gift-sets', changefreq: 'daily', priority: '0.8' },
    { path: '/collections/jewellery-set', changefreq: 'daily', priority: '0.8' },
    { path: '/collections/mystery-jewellery-jar', changefreq: 'daily', priority: '0.9' },
    { path: '/collections/rings-under-100', changefreq: 'daily', priority: '0.9' },
    { path: '/collections/gifts-for-girlfriend-under-500', changefreq: 'daily', priority: '0.9' },
    { path: '/collections/anti-tarnish-minimal-rings', changefreq: 'daily', priority: '0.9' },
    { path: '/collections/bestsellers', changefreq: 'daily', priority: '0.85' },
    { path: '/collections/new-arrivals', changefreq: 'daily', priority: '0.85' }
  ];

  const entries: string[] = [];

  for (const page of staticPages) {
    entries.push(
      `  <url>\n` +
        `    <loc>${SITE_URL}${page.path}</loc>\n` +
        `    <lastmod>${today}</lastmod>\n` +
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
        `      <g:color>Gold</g:color>`,
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
