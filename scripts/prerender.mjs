import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';

const dist = resolve('dist');

const routes = [
  { path: '/',            title: 'SatvaStones | Minimalist & Premium Aesthetic Jewelry',
    desc: 'Premium Korean & Western aesthetic jewelry. Anti-tarnish, waterproof, trend-forward designs. Free shipping over ₹399.' },
  { path: '/shop',        title: 'Shop Aesthetic Jewelry Online | Satvastones',
    desc: 'Shop 100+ aesthetic Korean & Western jewelry pieces. Anti-tarnish, waterproof, affordable. Free shipping available.' },
  { path: '/shop/99-sale', title: 'Shop ₹99 Sale | Satvastones',
    desc: 'Shop trendy aesthetic jewelry at just ₹99 each — Korean studs, Western hoops, stacking rings, and delicate chain necklaces. Anti-tarnish, waterproof. Free shipping over ₹399.' },
  { path: '/shop/earrings', title: 'Shop Earrings | Satvastones',
    desc: 'Explore 100+ aesthetic earrings for women — Korean minimalist studs, Western hoop earrings, drop earrings, and statement chandbalis. Anti-tarnish, hypoallergenic, waterproof.' },
  { path: '/shop/necklaces', title: 'Shop Necklaces | Satvastones',
    desc: 'Discover aesthetic necklaces for women — anti-tarnish gold-plated chains, Korean chokers, pendant necklaces, and layered styles. Waterproof, hypoallergenic. Free shipping over ₹399.' },
  { path: '/shop/rings',   title: 'Shop Rings | Satvastones',
    desc: 'Browse aesthetic rings for women — Korean stacking rings, gold-plated bands, statement cocktail rings, and minimalist designs. Waterproof, anti-tarnish, adjustable sizes.' },
  { path: '/shop/bracelets', title: 'Shop Bracelets | Satvastones',
    desc: 'Shop aesthetic bracelets and bangles — gold-plated chains, Korean beaded bracelets, tennis bracelets, and cuffs. Anti-tarnish, waterproof, everyday elegance.' },
  { path: '/shop/gifts',  title: 'Shop Jewelry Gifts | Satvastones',
    desc: 'Find the perfect jewelry gifts for her — curated gift-ready pieces including earrings, necklaces, rings, and personalized name necklaces. Beautifully packaged, shipped across India.' },
  { path: '/shop/name-necklace', title: 'Shop Name Necklaces | Satvastones',
    desc: 'Shop personalized name necklaces in gold and silver finishes — custom engraved, anti-tarnish, and waterproof. The perfect gift for her, crafted in Mumbai.' },
  { path: '/shop/accessories', title: 'Shop Jewelry Accessories | Satvastones',
    desc: 'Discover premium jewelry accessories — anklets, hair accessories, brooches, and jewelry organizers. Complete your aesthetic look with Satvastones.' },
  { path: '/shop/pendant', title: 'Shop Pendants | Satvastones',
    desc: 'Shop aesthetic pendants for women — gold-plated, anti-tarnish pendants in Korean and Western styles. Perfect for layering or gifting. Free shipping over ₹399.' },
  { path: '/shop/hampers', title: 'Shop Gift Hampers | Satvastones',
    desc: 'Shop luxury jewelry gift hampers — curated sets of Korean and Western aesthetic jewelry in elegant packaging. Perfect for birthdays, anniversaries, and festivals.' },
  { path: '/shop/mothers-day', title: "Shop Mother's Day Jewelry | Satvastones",
    desc: "Shop Mother's Day jewelry gifts — elegant earrings, personalized name necklaces, and curated gift sets mom will love. Anti-tarnish, waterproof, beautifully packaged." },
  { path: '/about',       title: 'About SatvaStones | Korean & Western Aesthetic Jewelry Studio',
    desc: 'Discover the SatvaStones story — an Indian jewelry brand curating premium Korean aesthetic earrings, anti-tarnish gold necklaces, and Western minimalist accessories.' },
  { path: '/contact',     title: 'Contact Satvastones | Customer Support',
    desc: 'Have a question? Reach out to Satvastones customer support. We respond within 24 hours. Email: hello@satvastones.com' },
  { path: '/blogs',       title: 'The Journal | Satvastones Blog',
    desc: 'Explore style guides, jewelry care tips, and the latest trends in Korean and Western aesthetic jewelry on the Satvastones Journal.' },
  { path: '/privacy',     title: 'Privacy Policy | Satvastones',
    desc: 'Satvastones privacy policy — how we collect, use, and protect your personal data. Compliant with Indian IT Act 2000 and international standards.' },
  { path: '/terms',       title: 'Terms & Conditions | Satvastones',
    desc: 'Satvastones terms and conditions — order policies, payment terms, shipping, returns, and dispute resolution. Last updated 2025.' },
  { path: '/returns',     title: 'Returns & Refunds | Satvastones',
    desc: 'Satvastones return and refund policy — due to hygiene and handcrafted nature, all jewelry sales are final. Damaged items can be reported within 48 hours.' },
  { path: '/shipping',    title: 'Shipping Policy | Satvastones',
    desc: 'Satvastones shipping policy — free shipping over ₹399, express delivery 3-7 business days. COD available. International shipping via India Post.' },
  { path: '/cart',        title: 'Shopping Cart | Satvastones',
    desc: 'Review your selected aesthetic jewelry pieces at Satvastones. Secure checkout with UPI, Card & COD available.', noindex: true },
  { path: '/checkout',    title: 'Secure Checkout | Satvastones',
    desc: 'Complete your order securely. We accept UPI, Cards, Net Banking & COD.', noindex: true },
  { path: '/account',     title: 'My Account | Satvastones',
    desc: 'Manage your orders, addresses, and preferences at Satvastones.', noindex: true },
];

function noscriptContent(route) {
  const p = route.path;
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
    const labels = { '99-sale': '₹99 Sale', 'earrings': 'Earrings', 'necklaces': 'Necklaces', 'rings': 'Rings', 'bracelets': 'Bracelets', 'gifts': 'Gifts', 'name-necklace': 'Name Necklaces', 'accessories': 'Accessories', 'pendant': 'Pendants', 'hampers': 'Gift Hampers', 'mothers-day': "Mother's Day Gifts" };
    const label = labels[cat] || cat;
    return `<header><h1>Shop ${label} — SatvaStones</h1>
<nav><a href="/">Home</a> | <a href="/shop">Shop All</a> | <a href="/shop/earrings">Earrings</a> | <a href="/shop/necklaces">Necklaces</a> | <a href="/shop/rings">Rings</a> | <a href="/shop/bracelets">Bracelets</a> | <a href="/shop/99-sale">₹99 Sale</a></nav></header>
<main><section><h2>Browse Our ${label} Collection</h2>
<p>Explore our curated collection of ${label.toLowerCase()} at SatvaStones — premium Korean and Western aesthetic jewelry. Each piece is anti-tarnish, waterproof, and designed for the modern woman. Free shipping over ₹399 with easy returns.</p>
<p>Shop online with secure payments via UPI, Credit/Debit Cards, Net Banking, and COD. All orders are dispatched within 24-48 hours from our studio in Vapi, Gujarat.</p></section></main>
<footer><p>© 2026 SATVASTONES. All rights reserved.</p></footer>`;
  }
  if (p === '/shop') {
    return `<header><h1>Shop All Jewelry — SatvaStones</h1>
<nav><a href="/">Home</a> | <a href="/shop">Shop All</a> | <a href="/shop/earrings">Earrings</a> | <a href="/shop/necklaces">Necklaces</a> | <a href="/shop/rings">Rings</a> | <a href="/shop/bracelets">Bracelets</a> | <a href="/shop/99-sale">₹99 Sale</a></nav></header>
<main><section><h2>Complete Aesthetic Jewelry Collection</h2>
<p>Browse our complete collection of 100+ aesthetic Korean and Western jewelry pieces. From minimalist earrings to statement necklaces, each piece is handcrafted with anti-tarnish, waterproof materials. Free shipping over ₹399.</p>
<p>Discover trending designs including Korean huggies, layered gold chains, stackable rings, and personalized name necklaces.</p></section></main>
<footer><p>© 2026 SATVASTONES. All rights reserved.</p></footer>`;
  }
  if (p === '/about') {
    return `<header><h1>About SatvaStones</h1>
<nav><a href="/">Home</a> | <a href="/shop">Shop</a> | <a href="/about">About</a> | <a href="/contact">Contact</a></nav></header>
<main><section><h2>Our Story</h2>
<p>SatvaStones is an Indian jewelry brand based in Mumbai, curating premium Korean and Western aesthetic jewelry for the modern woman. Every piece is handpicked for quality, designed to be anti-tarnish and waterproof, ensuring lasting beauty.</p>
<p>We believe jewelry is an extension of identity. Our collections blend Seoul minimalism with Parisian elegance, offering pieces that transition effortlessly from desk to dinner.</p></section></main>
<footer><p>© 2026 SATVASTONES. All rights reserved.</p></footer>`;
  }
  if (p === '/contact') {
    return `<header><h1>Contact SatvaStones</h1>
<nav><a href="/">Home</a> | <a href="/shop">Shop</a> | <a href="/about">About</a> | <a href="/contact">Contact</a></nav></header>
<main><section><h2>Get In Touch</h2>
<p>Have a question about our anti-tarnish jewelry, sizing, orders, or returns? Email us at hello@satvastones.com or use our contact form. We respond within 24 hours.</p>
<p>Follow us on Instagram @satvastones for daily style inspiration and new arrivals.</p></section></main>
<footer><p>© 2026 SATVASTONES. All rights reserved.</p></footer>`;
  }
  if (p === '/blogs') {
    return `<header><h1>The Journal — SatvaStones Blog</h1>
<nav><a href="/">Home</a> | <a href="/shop">Shop</a> | <a href="/blogs">Journal</a></nav></header>
<main><section><h2>Style Guides & Jewelry Care</h2>
<p>Explore expert style guides, jewelry care tips, Korean fashion trends, and how to style aesthetic pieces for every occasion. From anti-tarnish care routines to layering inspiration, the SatvaStones Journal is your guide to aesthetic living.</p></section></main>
<footer><p>© 2026 SATVASTONES. All rights reserved.</p></footer>`;
  }
  return `<header><h1>${route.title}</h1>
<nav><a href="/">Home</a> | <a href="/shop">Shop</a></nav></header>
<main><section><h2>${route.title}</h2>
<p>${route.desc}</p></section></main>
<footer><p>© 2026 SATVASTONES. All rights reserved.</p></footer>`;
}

function routeToDir(p) {
  if (p === '/') return dist;
  return resolve(dist, p.slice(1));
}

function generateSitemap() {
  const sitemapRoutes = routes.filter(r => !r.noindex);
  const today = new Date().toISOString().split('T')[0];
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const route of sitemapRoutes) {
    const priority = route.path === '/' ? '1.0' : route.path.startsWith('/shop/') ? '0.8' : route.path === '/shop' ? '0.9' : '0.6';
    const changefreq = route.path === '/' ? 'daily' : route.path.startsWith('/shop/') ? 'weekly' : 'monthly';
    xml += `  <url>\n    <loc>https://satvastones.in${route.path}</loc>\n    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n    <changefreq>${changefreq}</changefreq>\n  </url>\n`;
  }
  xml += '</urlset>';
  writeFileSync(resolve(dist, 'sitemap.xml'), xml);
  console.log(`✓ sitemap.xml written with ${sitemapRoutes.length} URLs (lastmod: ${today})`);
}

function main() {
  const src = readFileSync(resolve(dist, 'index.html'), 'utf-8');

  for (const route of routes) {
    const dir = routeToDir(route.path);
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

    const canonical = route.noindex
      ? ''
      : `<link rel="canonical" href="https://satvastones.in${route.path}" />`;
    const robots = route.noindex
      ? `<meta name="robots" content="noindex, follow" />`
      : `<meta name="robots" content="index, follow" />`;
    const ogUrl = `<meta property="og:url" content="https://satvastones.in${route.path}" />`;
    const noscript = noscriptContent(route);

    let html = src
      .replace(/<title>.*?<\/title>/, `<title>${route.title}</title>`)
      .replace(/<meta name="description"[^>]*\/>/, `<meta name="description" content="${route.desc}" />`)
      .replace(/<meta name="robots"[^>]*\/>/, robots)
      .replace(/<!-- Canonical[^>]*-->/, canonical)
      .replace(/<meta property="og:title"[^>]*\/>/, `<meta property="og:title" content="${route.title}" />`)
      .replace(/<meta property="og:description"[^>]*\/>/, `<meta property="og:description" content="${route.desc}" />`)
      .replace(/<meta property="og:url"[^>]*\/>/, ogUrl)
      .replace(/<meta name="twitter:title"[^>]*\/>/, `<meta name="twitter:title" content="${route.title}" />`)
      .replace(/<meta name="twitter:description"[^>]*\/>/, `<meta name="twitter:description" content="${route.desc}" />`)
      .replace(/<noscript>[\s\S]*?<\/noscript>/, `<noscript>${noscript}</noscript>`);

    const outPath = resolve(dir, 'index.html');
    writeFileSync(outPath, html);
    console.log(`✓ ${route.path} → ${outPath}`);
  }

  generateSitemap();
}

main();
