import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import SocialProof from "@/components/home/SocialProof";
import Newsletter from "@/components/home/Newsletter";

export const metadata: Metadata = {
  title: "Korean & Anti-Tarnish Jewellery Online in India | Earrings, Rings, Necklaces – SatvaStones",
  description: "Shop Korean & aesthetic jewellery online in India. Anti-tarnish, waterproof earrings, rings, necklaces & gifts for her starting under ₹500. Free shipping over ₹399, COD available.",
  keywords: [
    "jewellery online india",
    "korean jewellery india",
    "anti tarnish jewellery",
    "waterproof jewellery",
    "artificial jewellery for women",
    "earrings for women",
    "necklaces for women",
    "rings for women",
    "bracelets for women",
    "gifts for her",
  ],
  alternates: { canonical: "https://satvastones.in" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "SatvaStones",
    url: "https://satvastones.in",
    title: "Korean & Anti-Tarnish Jewellery Online in India – SatvaStones",
    description: "Anti-tarnish, waterproof Korean earrings, rings, necklaces & gifts for her. Free shipping over ₹399, COD across India.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const MOCK_PRODUCTS = [
  {
    id: "mock1",
    name: "Korean Minimalist Gold Ring",
    slug: "korean-minimalist-gold-ring",
    price: 599,
    comparePrice: 899,
    images: ["/gold_ring_minimalist_1774634383905.png"],
    material: "Gold Plated",
    isNewCollection: true,
  },
  {
    id: "mock2",
    name: "Seoul Twist Hoop Earrings",
    slug: "abstract-seoul-earrings",
    price: 499,
    comparePrice: null,
    images: ["/korean_earrings_premium_1774634324348.png"],
    material: "Silver Plated",
    isNewCollection: true,
  },
  {
    id: "mock3",
    name: "Layered Gold Chain Necklace",
    slug: "elite-western-necklace",
    price: 799,
    comparePrice: 1199,
    images: ["/western_necklace_premium_1774634354735.png"],
    material: "Gold Plated",
    isNewCollection: true,
  },
  {
    id: "mock4",
    name: "Rose Gold Cuff Bracelet",
    slug: "emerald-horizon-bracelet",
    price: 699,
    comparePrice: 999,
    images: ["/emerald_bracelet_hero_1774677499386.png"],
    material: "Rose Gold Plated",
    isNewCollection: true,
  },
  {
    id: "mock5",
    name: "Korean Pearl Drop Earrings",
    slug: "korean-pearl-drop-earrings",
    price: 1299,
    comparePrice: 1999,
    images: ["/korean_earrings_premium_1774634324348.png"],
    material: "Gold Plated",
    isNewCollection: false,
  },
  {
    id: "mock6",
    name: "The Sunday Hoops",
    slug: "the-sunday-hoops",
    price: 899,
    comparePrice: 1299,
    images: ["/gold_jewellery_hero.png"],
    material: "18K Gold Plated",
    isNewCollection: true,
  },
  {
    id: "mock7",
    name: "The Golden Stack Ring",
    slug: "the-golden-stack-ring",
    price: 649,
    comparePrice: 949,
    images: ["/gold_ring_minimalist_1774634383905.png"],
    material: "Stainless Steel PVD",
    isNewCollection: false,
  },
  {
    id: "mock8",
    name: "The Stay Linked Chain",
    slug: "the-stay-linked-chain",
    price: 1499,
    comparePrice: 2199,
    images: ["/western_necklace_premium_1774634354735.png"],
    material: "Gold Plated",
    isNewCollection: true,
  }
];

export default async function HomePage() {
  let allProducts: any[] = [];
  let bestSellers: any[] = [];
  let categories: { id: string; name: string; slug: string; description?: string | null; image?: string | null }[] = [];
  let trends: { id: string; title: string; image: string }[] = [];

  try {
    categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true, description: true, image: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch (e) {
    console.log("DB not ready for categories", e);
  }

  try {
    trends = await prisma.trend.findMany({
      where: { isActive: true },
      select: { id: true, title: true, image: true },
      orderBy: { sortOrder: "asc" },
      take: 4,
    });
  } catch (e) {
    console.log("DB not ready for trends", e);
  }

  try {
    allProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        material: true,
        style: true,
        isNewCollection: true,
      },
    });

    bestSellers = await prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        material: true,
        style: true,
        isNewCollection: true,
      },
    });
  } catch (e) {
    console.log("DB not ready yet, using mock fallback");
  }

  const displayProducts = allProducts.length > 0 ? allProducts : MOCK_PRODUCTS;
  const bestSellersDisplay =
    bestSellers.length > 0 ? bestSellers : displayProducts.slice(0, 8);

  const FALLBACK_TRENDS = [
    { id: "korean-minimal", title: "Korean Minimal", tag: "Dainty everyday jewellery", image: "" },
    { id: "oxidised-ethnic", title: "Oxidised Ethnic", tag: "Boho fusion silver", image: "" },
    { id: "gold-luxe", title: "Gold Luxe", tag: "Bold shine, daily wear", image: "" },
    { id: "party-wear", title: "Party Wear", tag: "Crystal & statement", image: "" },
  ];

  const trendTiles =
    trends.length > 0
      ? trends.map((t) => ({
          id: t.id,
          title: t.title,
          tag: "Curated for you",
          image: t.image || "",
        }))
      : FALLBACK_TRENDS;

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": "https://satvastones.in/#webpage",
    url: "https://satvastones.in/",
    name: "Korean & Anti-Tarnish Jewellery Online in India – SatvaStones",
    description:
      "Shop Korean & aesthetic jewellery online in India. Anti-tarnish, waterproof earrings, rings, necklaces, bracelets & gifts for her.",
    isPartOf: { "@id": "https://satvastones.in/#website" },
    about: { "@id": "https://satvastones.in/#organization" },
    breadcrumb: { "@id": "https://satvastones.in/#breadcrumb-home" },
  };

  const homeBreadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": "https://satvastones.in/#breadcrumb-home",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://satvastones.in/",
      },
    ],
  };

  const homeItemListJsonLd = {
    "@context": "https://schema.org/",
    "@type": "ItemList",
    "@id": "https://satvastones.in/#bestsellers",
    name: "SatvaStones Bestselling Jewellery",
    itemListElement: displayProducts.slice(0, 8).map((p: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: p.name,
        url: `https://satvastones.in/product/${p.slug}`,
        image: Array.isArray(p.images) && p.images[0]
          ? p.images[0].startsWith("http")
            ? p.images[0]
            : `https://satvastones.in${p.images[0]}`
          : undefined,
        offers: {
          "@type": "Offer",
          priceCurrency: "INR",
          price: String(p.price),
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  const homeFaqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://satvastones.in/#faq",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is SatvaStones jewellery made of?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our everyday edit features stainless-steel and brass imitation jewellery with a gold-toned PVD anti-tarnish finish. These are gold-coloured pieces, not solid gold. Faux pearls and other decorative elements are noted on individual pieces.",
        },
      },
      {
        "@type": "Question",
        name: "Can I wear it around water?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our metal pieces are made for everyday splashes. To keep the finish looking its best, dry after contact with water and avoid swimming pools, seawater, perfumes and harsh cleaning products. Pearl details appreciate a little extra care.",
        },
      },
      {
        "@type": "Question",
        name: "How should I store my jewellery?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Wipe gently with a soft, dry cloth after wearing. Store each piece separately in its pouch, away from moisture and direct sunlight. Put your jewellery on after your perfume and skincare have dried.",
        },
      },
      {
        "@type": "Question",
        name: "What about shipping and gifting?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Every piece comes in gift-ready packaging. Standard shipping is complimentary on orders of ₹399 or more, with Cash on Delivery (COD) available across India.",
        },
      },
    ],
  };

  return (
    <main className="bg-[var(--paper)] text-[var(--ink)] relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeBreadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeItemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqJsonLd) }}
      />

      {/* SVG Symbols */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-sparkle" viewBox="0 0 24 24"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 3S5 10.5 5 15a7 7 0 0 0 14 0c0-4.5-7-12-7-12Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 15a4 4 0 0 0 4 4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-gift" viewBox="0 0 24 24"><path d="M3 8h18v5H3zM5 13v8h14v-8M12 8v13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 8H7a3 3 0 1 1 3-3l2 3Zm0 0h5a3 3 0 1 0-3-3l-2 3Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-truck" viewBox="0 0 24 24"><path d="M1 5h13v12H1zM14 9h5l4 4v4h-9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><circle cx="5" cy="18" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" /><circle cx="19" cy="18" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" /></symbol>
      </svg>

      {/* 1. HERO SECTION */}
      <section className="hero-editorial editorial-container">
        <div className="hero-copy">
          <div className="hero-kicker eyebrow">
            <span className="tiny-star">✳</span> Not-so-precious. Still very special.
          </div>
          <h1 className="hero-title">
            A little gold.<br /> A little<br /><em>every day.</em>
          </h1>
          <p className="hero-description">
            For the coffee runs, the big plans, and everything in between. Anti-tarnish, waterproof jewellery that lives a little, just like you.
          </p>
          <a href="#shop" className="button">
            Find your everyday <svg className="w-[19px] h-[19px]"><use href="#i-arrow" /></svg>
          </a>
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <span className="text-[9px] tracking-wider uppercase text-[var(--muted)] font-semibold mr-1">Quick edit:</span>
            {[
              { label: "Earrings", href: "/shop/earrings" },
              { label: "Necklaces", href: "/shop/necklaces" },
              { label: "Rings", href: "/shop/rings" },
              { label: "Bracelets", href: "/shop/bracelets" },
            ].map((chip) => (
              <Link
                key={chip.label}
                href={chip.href}
                className="text-[11px] py-1 px-3 border border-[var(--line)] bg-[var(--white)] text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
              >
                {chip.label}
              </Link>
            ))}
          </div>
          <div className="hero-footnote mt-4">
            <svg className="w-[15px] h-[15px] text-[var(--olive)]"><use href="#i-sparkle" /></svg> Anti-tarnish. Waterproof. No occasion needed.
          </div>
        </div>

        <div className="hero-visual">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/gold_jewellery_hero.png"
            alt="Sculptural gold-toned jewellery in warm, natural light"
            fetchPriority="high"
          />
          <div className="image-note">The everyday edit / No. 01</div>
          <div className="hero-stamp" aria-label="Everyday kind of gold">
            <span>Everyday</span>
            <strong>kind of</strong>
            <span>shine</span>
          </div>
          <a href="#shop" className="hero-product-note">
            <div>
              <span className="text-[9px] text-[var(--muted)] uppercase tracking-wider block mb-1">
                MEET YOUR NEW PLUS-ONE
              </span>
              <strong className="font-serif text-[23px] font-normal text-[var(--ink)]">
                Small details. Big feeling.
              </strong>
            </div>
            <div className="round-arrow">
              <svg className="w-[18px] h-[18px]"><use href="#i-arrow" /></svg>
            </div>
          </a>
        </div>
      </section>

      {/* 2. BENEFITS SECTION */}
      <section className="benefits" aria-label="The SatvaStones details">
        <div className="benefits-inner editorial-container">
          <div className="benefit">
            <svg><use href="#i-sparkle" /></svg> Anti-tarnish finish
          </div>
          <div className="benefit">
            <svg><use href="#i-drop" /></svg> Water-friendly pieces
          </div>
          <div className="benefit">
            <svg><use href="#i-gift" /></svg> Arrives gift-ready
          </div>
          <div className="benefit">
            <svg><use href="#i-truck" /></svg> Shipped across India · COD
          </div>
        </div>
      </section>

      {/* 3. CATEGORIES — SatvaStones sections in Dori editorial style */}
      <CategoryShowcase categories={categories} />

      {/* 4. SHOP SECTION (TABS + INTERACTIVE PRODUCTS) */}
      <FeaturedProducts products={displayProducts} />

      {/* 5. SHOP BY TREND — SatvaStones trends in Dori editorial style */}
      <section className="shop-section editorial-container trend-section" aria-labelledby="trend-heading">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Shop by trend</div>
            <h2 id="trend-heading">
              Wear your <em>mood.</em>
            </h2>
          </div>
          <Link href="/shop" className="text-link">
            Explore all trends{" "}
            <svg className="w-4 h-4"><use href="#i-arrow" /></svg>
          </Link>
        </div>
        <div className="trend-grid">
          {trendTiles.map((t) => (
            <Link
              key={t.id}
              href={`/shop?search=${encodeURIComponent(t.title)}`}
              className="trend-tile group"
            >
              <div className="trend-tile-media">
                {t.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.image} alt={`${t.title} jewellery`} loading="lazy" className="trend-tile-img" />
                ) : (
                  <div className="trend-tile-fallback" aria-hidden="true">
                    <span>{t.title.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="trend-tile-meta">
                <h3 className="product-name">{t.title}</h3>
                <p className="product-subtitle">{t.tag} · Jewellery</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. STORY SECTION */}
      <section className="story" id="story">
        <div className="story-image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/thalassa_hero.png"
            alt="An intimate look at gold-toned jewellery and its delicate details"
            loading="lazy"
          />
          <div className="story-image-caption">Less saving it. More wearing it.</div>
        </div>
        <div className="story-copy">
          <div className="eyebrow">A note from SatvaStones</div>
          <h2>
            Life happens.<br /><em>Keep the gold on.</em>
          </h2>
          <p>
            Somewhere along the way, jewellery became something we saved for “a special day”. We’re here for the other days.
          </p>
          <p>
            The auto rides. The desk-to-dinner plans. The just-because moments. Thoughtfully chosen Korean and Western imitation jewellery, with an anti-tarnish finish and a little more personality.
          </p>
          <Link href="/shop" className="text-link">
            Meet your kind of gold <svg className="w-4 h-4"><use href="#i-arrow" /></svg>
          </Link>
          <div className="story-details">
            <div>
              <strong>Everyday</strong>Not locked-away jewellery
            </div>
            <div>
              <strong>Considered</strong>Details that make a difference
            </div>
          </div>
        </div>
      </section>

      {/* 7. BEST SELLERS — direct crawl paths for SEO (FIXES.MD: must remain) */}
      <section className="shop-section editorial-container bestsellers-section" aria-labelledby="bestsellers-heading">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Our most loved pieces, handpicked for you</div>
            <h2 id="bestsellers-heading">
              Best <em>sellers.</em>
            </h2>
          </div>
          <Link href="/shop?sort=best-selling" className="text-link">
            View all{" "}
            <svg className="w-4 h-4"><use href="#i-arrow" /></svg>
          </Link>
        </div>
        <div className="product-grid">
          {bestSellersDisplay.slice(0, 8).map((p: any, idx: number) => (
            <article key={p.id} className="product-card">
              <div className="product-image">
                <Link href={`/product/${p.slug}`} className="block w-full h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={p.images?.[0] || "/gold_ring_minimalist_1774634383905.png"}
                    alt={`${p.name}, anti-tarnish bestseller`}
                    loading={idx < 4 ? "eager" : "lazy"}
                    fetchPriority={idx === 0 ? "high" : "auto"}
                    className="w-full h-full object-cover"
                  />
                </Link>
                {idx === 0 && <span className="product-label">Most loved</span>}
              </div>
              <div className="product-meta">
                <div className="product-topline">
                  <Link href={`/product/${p.slug}`}>
                    <h3 className="product-name">{p.name}</h3>
                  </Link>
                  <span className="price">₹{Number(p.price).toLocaleString("en-IN")}</span>
                </div>
                <p className="product-subtitle">{p.material ? `${p.material} · Anti-tarnish` : "Bestseller · Anti-tarnish"}</p>
                <div className="product-bottom">
                  <span className="gold-dot" role="img" aria-label="Gold finish" />
                  <span>Waterproof · COD available</span>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="collection-footer">
          <p>Good on their own. Even better together.</p>
        </div>
      </section>

      {/* 8. DAILY NOTE BANNER */}
      <section className="daily-note">
        <span className="tiny-star" aria-hidden="true">✳</span>
        <h2>
          “The best things in your jewellery box<br />aren’t waiting for an occasion.”
        </h2>
        <p>The SatvaStones way of looking at things</p>
      </section>

      {/* 9. REVIEWS — SatvaStones customer reviews in Dori editorial style */}
      <SocialProof />

      {/* 10. CARE & FAQ GUIDE */}
      <section className="care-section editorial-container" id="care">
        <div className="care-intro">
          <div className="eyebrow">A little love goes a long way</div>
          <h2>Good things, kept well.</h2>
          <p>A few answers before you find your favourite. Because the little details matter.</p>
        </div>
        <div>
          <details className="dori-faq" open>
            <summary>What is SatvaStones jewellery made of?</summary>
            <p>
              Our everyday edit features stainless-steel and brass imitation jewellery with a gold-toned PVD anti-tarnish finish. These are gold-coloured pieces, not solid gold. Faux pearls and other decorative elements are noted on individual pieces.
            </p>
          </details>
          <details className="dori-faq">
            <summary>Can I wear it around water?</summary>
            <p>
              Our metal pieces are made for everyday splashes. To keep the finish looking its best, dry after contact with water and avoid swimming pools, seawater, perfumes and harsh cleaning products. Pearl details appreciate a little extra care.
            </p>
          </details>
          <details className="dori-faq">
            <summary>How should I store my jewellery?</summary>
            <p>
              Wipe gently with a soft, dry cloth after wearing. Store each piece separately in its pouch, away from moisture and direct sunlight. Put your jewellery on after your perfume and skincare have dried.
            </p>
          </details>
          <details className="dori-faq">
            <summary>What about shipping and gifting?</summary>
            <p>
              Every piece comes in gift-ready packaging. Standard shipping is complimentary on orders of ₹399 or more, with Cash on Delivery (COD) available across India.
            </p>
          </details>
        </div>
      </section>

      {/* 11. NEWSLETTER SECTION */}
      <Newsletter />
    </main>
  );
}
