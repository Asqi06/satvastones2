import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

const dist = resolve('dist');
const API_URL = process.env.VITE_API_URL || 'https://satvastones2.onrender.com/api';

const STATIC_ROUTES = [
  { path: '/',            title: 'SatvaStones | Minimalist & Premium Aesthetic Jewelry',
    desc: 'Premium Korean & Western aesthetic jewelry. Anti-tarnish, waterproof, trend-forward designs. Free shipping over ₹399.' },
  { path: '/shop',        title: 'Shop Aesthetic Jewelry Online | Premium Korean & Western Collection | Satvastones',
    desc: 'Shop 100+ aesthetic Korean & Western jewelry pieces. Anti-tarnish, waterproof, affordable. Free shipping available.' },
  { path: '/shop/99-sale', title: 'Shop ₹99 Sale | Satvastones',
    desc: 'Shop trendy aesthetic jewelry at just ₹99 each — Korean studs, Western hoops, stacking rings, and delicate chain necklaces. Anti-tarnish, waterproof. Free shipping over ₹399.' },
  { path: '/shop/earrings', title: 'Shop Earrings | Minimalist Korean & Western Hoops | Satvastones',
    desc: 'Explore 100+ aesthetic earrings for women — Korean minimalist studs, Western hoop earrings, drop earrings, and statement chandbalis. Anti-tarnish, hypoallergenic, waterproof.' },
  { path: '/shop/necklaces', title: 'Shop Necklaces | Anti-Tarnish Gold Chains & Pendants | Satvastones',
    desc: 'Discover aesthetic necklaces for women — anti-tarnish gold-plated chains, Korean chokers, pendant necklaces, and layered styles. Waterproof, hypoallergenic. Free shipping over ₹399.' },
  { path: '/shop/rings',   title: 'Shop Rings | Stackable & Minimalist Rings for Women | Satvastones',
    desc: 'Browse aesthetic rings for women — Korean stacking rings, gold-plated bands, statement cocktail rings, and minimalist designs. Waterproof, anti-tarnish, adjustable sizes.' },
  { path: '/shop/bracelets', title: 'Shop Bracelets | Gold Chains, Bangles & Cuffs | Satvastones',
    desc: 'Shop aesthetic bracelets and bangles — gold-plated chains, Korean beaded bracelets, tennis bracelets, and cuffs. Anti-tarnish, waterproof, everyday elegance.' },
  { path: '/shop/gifts',  title: 'Shop Jewelry Gifts for Her | Satvastones',
    desc: 'Find the perfect jewelry gifts for her — curated gift-ready pieces including earrings, necklaces, rings, and personalized name necklaces. Beautifully packaged, shipped across India.' },
  { path: '/shop/name-necklace', title: 'Shop Name Necklaces | Personalized Gold & Silver | Satvastones',
    desc: 'Shop personalized name necklaces in gold and silver finishes — custom engraved, anti-tarnish, and waterproof. The perfect gift for her, crafted in Mumbai.' },
  { path: '/shop/accessories', title: 'Shop Jewelry Accessories | Anklets, Brooches & More | Satvastones',
    desc: 'Discover premium jewelry accessories — anklets, hair accessories, brooches, and jewelry organizers. Complete your aesthetic look with Satvastones.' },
  { path: '/shop/pendant', title: 'Shop Pendants | Gold-Plated & Anti-Tarnish | Satvastones',
    desc: 'Shop aesthetic pendants for women — gold-plated, anti-tarnish pendants in Korean and Western styles. Perfect for layering or gifting. Free shipping over ₹399.' },
  { path: '/shop/hampers', title: 'Shop Gift Hampers | Luxury Jewelry Sets | Satvastones',
    desc: 'Shop luxury jewelry gift hampers — curated sets of Korean and Western aesthetic jewelry in elegant packaging. Perfect for birthdays, anniversaries, and festivals.' },
  { path: '/shop/mothers-day', title: "Shop Mother's Day Jewelry Gifts | Satvastones",
    desc: "Shop Mother's Day jewelry gifts — elegant earrings, personalized name necklaces, and curated gift sets mom will love. Anti-tarnish, waterproof, beautifully packaged." },
  { path: '/about',       title: 'About SatvaStones | Korean & Western Aesthetic Jewelry Studio',
    desc: 'Discover the SatvaStones story — an Indian jewelry brand curating premium Korean aesthetic earrings, anti-tarnish gold necklaces, and Western minimalist accessories.' },
  { path: '/contact',     title: 'Contact Satvastones | Customer Support',
    desc: 'Have a question? Reach out to Satvastones customer support. We respond within 24 hours. Email: support@satvastones.in' },
  { path: '/blogs',       title: 'The Journal | Satvastones Blog — Style Guides & Jewelry Care',
    desc: 'Explore style guides, jewelry care tips, and the latest trends in Korean and Western aesthetic jewelry on the Satvastones Journal.' },
  { path: '/privacy',     title: 'Privacy Policy | Satvastones',
    desc: 'Satvastones privacy policy — how we collect, use, and protect your personal data. Compliant with Indian IT Act 2000 and international standards.' },
  { path: '/terms',       title: 'Terms & Conditions | Satvastones',
    desc: 'Satvastones terms and conditions — order policies, payment terms, shipping, returns, and dispute resolution.' },
  { path: '/returns',     title: 'Returns & Refunds | Satvastones',
    desc: 'Satvastones return and refund policy — due to hygiene and handcrafted nature, all jewelry sales are final. Damaged items can be reported within 48 hours.' },
  { path: '/shipping',    title: 'Shipping Policy | Satvastones — Free Shipping Over ₹399',
    desc: 'Satvastones shipping policy — free shipping over ₹399, express delivery 3-7 business days. COD available. International shipping via India Post.' },
  { path: '/refund',      title: 'Refund Policy | Satvastones',
    desc: 'Satvastones refund policy — details on order cancellation, refunds, and store credit.' },
  { path: '/aniadmin',    title: 'Admin Portal | Satvastones',
    desc: 'Satvastones admin panel — manage products, orders, CMS settings, and site configuration.', noindex: true },
  { path: '/hot-deals',   title: 'Hot Deals & Sales | ₹99 Flash Sale | Satvastones',
    desc: 'Grab the best deals on aesthetic jewelry. ₹99 Flash Sale, discounted earrings, necklaces, rings & more. Limited time offers with free shipping.' },
];

const NOINDEX_ROUTES = ['/cart', '/checkout', '/account', '/wishlist'];

const CATEGORY_LABELS = {
  '99-sale': '₹99 Sale', 'earrings': 'Earrings', 'necklaces': 'Necklaces',
  'rings': 'Rings', 'bracelets': 'Bracelets', 'gifts': 'Gifts',
  'name-necklace': 'Name Necklaces', 'accessories': 'Accessories',
  'pendant': 'Pendants', 'hampers': 'Gift Hampers', 'mothers-day': "Mother's Day Gifts",
  'korean': 'Korean Jewelry', 'western': 'Western Jewelry', 'traditional': 'Traditional Jewelry',
  'fusion': 'Fusion Jewelry'
};

function noscriptContent(route, title, desc) {
  const p = route;
  if (p === '/') {
    return `<header><h1>SatvaStones — Premium Aesthetic Korean & Western Jewelry Online</h1>
<nav><a href="/">Home</a> | <a href="/shop">Shop All</a> | <a href="/shop/earrings">Earrings</a> | <a href="/shop/necklaces">Necklaces</a> | <a href="/shop/rings">Rings</a> | <a href="/shop/bracelets">Bracelets</a> | <a href="/shop/99-sale">₹99 Sale</a> | <a href="/about">About</a> | <a href="/contact">Contact</a></nav></header>
<main><section><h2>Curated Korean & Western Aesthetic Jewelry</h2>
<p>Welcome to SatvaStones — India's premier destination for aesthetic Korean and Western jewelry. We curate handcrafted, anti-tarnish, and waterproof pieces that blend Seoul minimalism with Parisian elegance.</p>
<p>Our collection includes minimalist gold earrings, layered necklaces, stackable rings, charm bracelets, and statement pendants. Each piece is crafted using premium 18K gold plating and hypoallergenic metals.</p>
<p>All jewelry is 100% anti-tarnish and waterproof. Free shipping over ₹399.</p></section>
<section><h2>Shop by Category</h2>
<ul><li><a href="/shop/earrings">Aesthetic Earrings</a> — Korean huggies, studs, hoops, drops</li>
<li><a href="/shop/necklaces">Designer Necklaces</a> — Layered chains, pendants, chokers</li>
<li><a href="/shop/rings">Minimalist Rings</a> — Stackable bands, cocktail rings</li>
<li><a href="/shop/bracelets">Chic Bracelets</a> — Tennis bracelets, bangles, cuffs</li>
<li><a href="/shop/99-sale">₹99 Flash Sale</a> — Premium jewelry at just ₹99</li></ul></section>
<section><h2>Why Choose SatvaStones</h2>
<ul><li>Anti-Tarnish Guarantee — no discoloration</li>
<li>100% Waterproof — wear in rain, gym, daily</li>
<li>Free Shipping over ₹399 — COD available</li>
<li>Secure Payments via Razorpay, UPI, Cards</li></ul></section></main>
<footer><p>© 2026 SATVASTONES. All rights reserved.</p></footer>`;
  }
  if (p.startsWith('/shop/')) {
    const cat = p.replace('/shop/', '');
    const label = CATEGORY_LABELS[cat] || cat.replace(/-/g, ' ');
    
    // Category-specific rich content for better indexing
    const categoryContent = {
      'earrings': { 
        h2: 'Explore 100+ Aesthetic Earrings for Women', 
        p: 'Discover our curated collection of anti-tarnish, waterproof earrings — from Korean minimalist studs and huggie hoops to oxidised silver jhumkas and Western drop earrings. Each pair is crafted with hypoallergenic 18K gold plating and designed for daily wear without tarnishing. Whether you prefer dainty crystal studs for office wear or statement chandbalis for festive occasions, our earring collection blends Korean minimalism with Western elegance at prices starting ₹79.' 
      },
      'necklaces': { 
        h2: 'Discover Anti-Tarnish Gold Plated Necklaces & Pendants', 
        p: 'Elevate your everyday look with our anti-tarnish necklace collection — featuring Korean aesthetic chokers, layered gold chains, personalized name necklaces, and delicate pendant necklaces in 18K gold plating. Each piece is waterproof, hypoallergenic, and built to survive daily wear without fading. From minimalist heart pendants to custom engraved name necklaces, find the perfect chain length and style for layering or solo wear.' 
      },
      'rings': { 
        h2: 'Stackable & Minimalist Rings for Daily Wear', 
        p: 'Build your perfect ring stack with our anti-tarnish, waterproof ring collection — featuring Korean stacking rings, adjustable gold bands, crystal cocktail rings, and minimalist chhalla bands. Every ring is crafted with 18K gold plating on hypoallergenic brass, ensuring your finish stays brilliant through sweat, water, and daily wear. Mix and match gold, silver, and rose gold tones for a personalized stack that transitions from desk to dinner.' 
      },
      'bracelets': { 
        h2: 'Gold Chains, Bangles & Cuffs for Everyday Elegance', 
        p: 'Complete your look with anti-tarnish bracelets and bangles — from gold-plated paperclip chains and beaded heart bracelets to Kashmiri bangle sets and crystal kada bangles. Each piece features 18K gold plating on waterproof, hypoallergenic metals that withstand daily wear, showers, and workouts. Stack multiple chains or wear a single statement cuff — versatile designs made for the modern Indian woman.' 
      },
      'gifts': { 
        h2: 'Curated Jewellery Gifts for Her — Beautifully Packaged', 
        p: 'Find the perfect jewellery gift for her — curated gift hampers, personalized name necklaces, and ready-to-gift sets for birthdays, anniversaries, and Mother\'s Day. Each gift combines anti-tarnish, waterproof jewellery with aesthetic packaging, eliminating the last-minute scramble. From ₹99 stud earrings to luxury gold-plated hamper sets, every gift is beautifully boxed and ships free over ₹399 with COD available across India.' 
      },
      'pendant': { 
        h2: 'Gold-Plated Pendants for Layering & Gifting', 
        p: 'Shop aesthetic pendants in 18K gold plating — from minimalist heart and star pendants to resin flower and crystal drop designs. Each pendant is anti-tarnish, waterproof, and comes with an adjustable chain for versatile layering. Perfect for gifting or building your own layered necklace look with Korean and Western aesthetic styles.' 
      },
      'hampers': { 
        h2: 'Luxury Jewellery Gift Hampers — Curated Sets', 
        p: 'Elevate your gifting with luxury jewellery hampers — curated sets of Korean and Western aesthetic earrings, necklaces, rings, and bracelets in elegant magnetic-close boxes. Each hamper combines complementary pieces for a complete look, beautifully packaged with tissue paper and a handwritten note card option. Ideal for birthdays, anniversaries, festivals, and corporate gifting with free shipping and COD across India.' 
      },
      'mothers-day': { 
        h2: 'Mother\'s Day Jewellery Gifts She\'ll Love', 
        p: 'Celebrate Mom with anti-tarnish, waterproof jewellery gifts — elegant earrings, personalized name necklaces, and curated gift hampers designed for the woman who does it all. Each piece is crafted with 18K gold plating on hypoallergenic metals, ensuring her gift stays brilliant through daily wear. Beautifully packaged with free shipping over ₹399 and COD available across India.' 
      },
      '99-sale': { 
        h2: 'Premium Jewellery at Just ₹99 Each', 
        p: 'Flash sale alert — grab aesthetic Korean and Western jewellery at just ₹99 per piece! Our ₹99 sale includes hypoallergenic stud earrings, stackable rings, delicate chain necklaces, and charm bracelets — all anti-tarnish, waterproof, and crafted with 18K gold plating on hypoallergenic metals. Limited stock, free shipping over ₹399, COD available. New drops every week.' 
      },
      'name-necklace': { 
        h2: 'Personalized Name Necklaces in Gold & Silver', 
        p: 'Create a one-of-a-kind gift with our custom engraved name necklaces — available in 18K gold plating, rose gold, and sterling silver finishes. Each necklace is anti-tarnish, waterproof, and handcrafted in our Mumbai studio with precise laser engraving. Choose your chain length, font style, and finish for a truly personal gift she\'ll wear every day. Free shipping over ₹399, COD available across India.' 
      },
      'accessories': { 
        h2: 'Jewellery Accessories — Anklets, Brooches & Organizers', 
        p: 'Complete your aesthetic with premium jewellery accessories — gold-plated anklets for summer styling, vintage-inspired brooches for jacket lapels, and velvet jewellery organizers for tangle-free storage. Each accessory features anti-tarnish 18K gold plating and waterproof construction, designed to complement your Satvastones collection.' 
      }
    };
    
    const catContent = categoryContent[cat] || { 
      h2: `Browse Our ${label} Collection`, 
      p: `Explore our curated collection of ${label.toLowerCase()} at SatvaStones — premium Korean and Western aesthetic jewelry. Each piece is anti-tarnish, waterproof, and designed for the modern woman. Free shipping over ₹399 with easy returns.` 
    };
    
    return `<header><h1>Shop ${label} — SatvaStones</h1>
<nav><a href="/">Home</a> | <a href="/shop">Shop All</a> | <a href="/shop/earrings">Earrings</a> | <a href="/shop/necklaces">Necklaces</a> | <a href="/shop/rings">Rings</a> | <a href="/shop/bracelets">Bracelets</a> | <a href="/shop/99-sale">₹99 Sale</a></nav></header>
<main><section><h2>${catContent.h2}</h2>
<p>${catContent.p}</p>
<p>All pieces feature <strong>anti-tarnish 18K gold plating</strong> on hypoallergenic metals, are <strong>100% waterproof</strong>, and ship free over ₹399 with COD available across India.</p></section></main>
<footer><p>© 2026 SATVASTONES. All rights reserved.</p></footer>`;
  }
  if (p.startsWith('/product/')) {
    return `<header><h1>${title} — SatvaStones</h1>
<nav><a href="/">Home</a> | <a href="/shop">Shop</a></nav></header>
<main><section><h2>${title}</h2>
<p>${desc}</p>
<p>Shop ${title} at SatvaStones — premium anti-tarnish, waterproof aesthetic jewelry. Free shipping over ₹399.</p></section></main>
<footer><p>© 2026 SATVASTONES. All rights reserved.</p></footer>`;
  }
  return `<header><h1>${title}</h1>
<nav><a href="/">Home</a> | <a href="/shop">Shop</a></nav></header>
<main><section><h2>${title}</h2>
<p>${desc}</p></section></main>
<footer><p>© 2026 SATVASTONES. All rights reserved.</p></footer>`;
}

function routeToDir(p) {
  if (p === '/') return dist;
  return resolve(dist, p.slice(1));
}

async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

async function generateSitemap(allRoutes) {
  const today = new Date().toISOString().split('T')[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  for (const route of allRoutes) {
    if (route.noindex) continue;
    xml += `  <url>\n    <loc>https://satvastones.in${route.path}</loc>\n    <lastmod>${route.lastmod || today}</lastmod>\n`;
    if (route.image) {
      xml += `    <image:image>\n      <image:loc>${route.image}</image:loc>\n    </image:image>\n`;
    }
    xml += '  </url>\n';
  }

  xml += '</urlset>';
  writeFileSync(resolve(dist, 'sitemap.xml'), xml);
  writeFileSync(resolve('public/sitemap.xml'), xml);
  console.log(`✓ sitemap.xml written with ${allRoutes.length} URLs (lastmod: ${today})`);
}

async function generatePrerenderedPages(allRoutes) {
  const src = readFileSync(resolve(dist, 'index.html'), 'utf-8');
  let count = 0;

  for (const route of allRoutes) {
    const dir = routeToDir(route.path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const isNoindex = route.noindex || NOINDEX_ROUTES.some(ni => route.path.startsWith(ni));
    const canonical = isNoindex ? '' : `<link rel="canonical" href="https://satvastones.in${route.path}" />`;
    const robots = isNoindex
      ? `<meta name="robots" content="noindex, follow" />`
      : `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />`;
    const ogUrl = `<meta property="og:url" content="https://satvastones.in${route.path}" />`;

    // Determine og:type based on route path
    let ogType = 'website';
    if (route.path.startsWith('/product/')) ogType = 'product';
    else if (route.path.startsWith('/blog/')) ogType = 'article';
    const ogTypeTag = `<meta property="og:type" content="${ogType}" />`;

    // Per-page og:image and twitter:image
    const ogImageTag = route.image
      ? `<meta property="og:image" content="${route.image.startsWith('http') ? route.image : 'https://satvastones.in' + route.image}" />`
      : '<meta property="og:image" content="https://satvastones.in/og-image.jpg" />';
    const twitterImageTag = route.image
      ? `<meta name="twitter:image" content="${route.image.startsWith('http') ? route.image : 'https://satvastones.in' + route.image}" />`
      : '<meta name="twitter:image" content="https://satvastones.in/og-image.jpg" />';

    const noscript = noscriptContent(route.path, route.title, route.desc);

    let html = src
      .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
      .replace(/<meta name="description"[^>]*\/>/, `<meta name="description" content="${route.desc}" />`)
      .replace(/<meta name="robots"[^>]*\/>/, robots)
      .replace(/<!-- Canonical[^>]*-->/, canonical)
      .replace(/<meta property="og:title"[^>]*\/>/, `<meta property="og:title" content="${route.title}" />`)
      .replace(/<meta property="og:description"[^>]*\/>/, `<meta property="og:description" content="${route.desc}" />`)
      .replace(/<meta property="og:url"[^>]*\/>/, ogUrl)
      .replace(/<meta property="og:type"[^>]*\/>/, ogTypeTag)
      .replace(/<meta property="og:image"[^>]*\/>/, ogImageTag)
      .replace(/<meta name="twitter:title"[^>]*\/>/, `<meta name="twitter:title" content="${route.title}" />`)
      .replace(/<meta name="twitter:description"[^>]*\/>/, `<meta name="twitter:description" content="${route.desc}" />`)
      .replace(/<meta name="twitter:image"[^>]*\/>/, twitterImageTag)
      .replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript>${noscript}</noscript>`);

    const outPath = resolve(dir, 'index.html');
    writeFileSync(outPath, html);
    count++;
  }

  console.log(`✓ ${count} prerendered pages generated`);
}

async function main() {
  const allRoutes = [];

  // 1. Add static routes
  for (const r of STATIC_ROUTES) {
    allRoutes.push({ ...r, lastmod: new Date().toISOString().split('T')[0] });
  }

  // 2. Fetch products from API and generate product pages + sitemap entries
  let productCount = 0;
  try {
    const res = await fetchWithTimeout(`${API_URL}/products`);
    if (res.ok) {
      const products = await res.json();
      productCount = products.length;
      for (const product of products) {
        if (!product.slug) continue;
        const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const price = product.price || 0;
        const title = product.metaTitle || `${product.title} | Satvastones`;
        const material = product.material || 'Premium';
        const category = product.category?.toLowerCase() || 'jewelry';
        const desc = product.metaDescription || `Buy ${product.title} at ₹${price}. ${product.isAntiTarnish ? 'Anti-tarnish, ' : ''}waterproof ${category}. Free shipping & COD. Shop authentic ${category} at Satvastones.`;

        allRoutes.push({
          path: `/product/${product.slug}`,
          title,
          desc,
          image: product.image || null,
          lastmod: lastMod,
        });
      }
      console.log(`✓ ${productCount} product routes generated from API`);
    }
  } catch (err) {
    console.log('⚠ Could not fetch products from API:', err.message);
  }

  // 3. Fetch blogs from API and generate blog pages + sitemap entries
  let blogCount = 0;
  try {
    const res = await fetchWithTimeout(`${API_URL}/blogs/published`);
    if (res.ok) {
      const blogs = await res.json();
      blogCount = blogs.length;
      for (const blog of blogs) {
        const lastMod = blog.updatedAt ? new Date(blog.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const title = blog.metaTitle || `${blog.title} | Satvastones Journal`;
        const desc = blog.metaDescription || blog.excerpt || `Read ${blog.title} on Satvastones Journal. Style guides, jewelry care tips, and aesthetic trends.`;

        allRoutes.push({
          path: `/blog/${blog.slug}`,
          title,
          desc,
          image: blog.image || null,
          lastmod: lastMod,
        });
      }
      console.log(`✓ ${blogCount} blog routes generated from API`);
    }
  } catch (err) {
    console.log('⚠ Could not fetch blogs from API:', err.message);
  }

  // 4. Generate all prerendered pages
  await generatePrerenderedPages(allRoutes);

  // 5. Generate dynamic sitemap
  await generateSitemap(allRoutes);

  console.log(`\n✅ Complete! ${allRoutes.length} total URLs generated (${STATIC_ROUTES.length} static + ${productCount} products + ${blogCount} blogs)`);
}

main();
