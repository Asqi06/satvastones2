import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/product/ProductCard";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ category: string }>;
}

async function getCategory(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!category) return null;

    const products = await prisma.product.findMany({
      where: { categoryId: category.id, isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        material: true,
        style: true,
        stock: true,
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const childCategories = await prisma.category.findMany({
      where: { parentId: category.id },
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    });

    return { category, products, childCategories };
  } catch (e) {
    console.error("Database unavailable for category page", e);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const data = await getCategory(category);
  if (!data) return { title: "Category Not Found" };

  const { category: cat, products } = data;

  const name = cat.name || "Jewellery";
  const title = `${name} for Women Online | Korean Anti-Tarnish ${name} – SatvaStones`;
  const description =
    cat.description ||
    `Buy ${name.toLowerCase()} for women online in India at SatvaStones. Anti-tarnish, waterproof Korean designs starting under ₹500 with COD & free shipping over ₹399.`;

  const ogImage = products?.[0]?.images?.[0]
    ? [products[0].images[0].startsWith("http") ? products[0].images[0] : `https://satvastones.in${products[0].images[0]}`]
    : undefined;

  return {
    title,
    description,
    keywords: [
      `${name.toLowerCase()} for women`,
      `buy ${name.toLowerCase()} online india`,
      `korean ${name.toLowerCase()}`,
      "anti tarnish jewellery",
      "waterproof jewellery",
    ],
    alternates: { canonical: `https://satvastones.in/shop/${cat.slug}` },
    openGraph: {
      title,
      description,
      url: `https://satvastones.in/shop/${cat.slug}`,
      type: "website",
      ...(ogImage ? { images: ogImage } : {}),
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
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const data = await getCategory(category);

  if (!data) notFound();

  const { category: cat, products, childCategories } = data;

  const ratingMap = new Map<string, { avg: number; count: number }>();
  if (products.length > 0) {
    try {
      const ratingRows = await prisma.review.groupBy({
        by: ["productId"],
        where: { productId: { in: products.slice(0, 20).map((p) => p.id) } },
        _avg: { rating: true },
        _count: { rating: true },
      });
      for (const row of ratingRows) {
        ratingMap.set(row.productId, {
          avg: row._avg.rating ?? 0,
          count: row._count.rating,
        });
      }
    } catch {
      // Ratings are enrichment-only; omit when DB aggregation is unavailable.
    }
  }

  const itemListJsonLd = {
    "@context": "https://schema.org/",
    "@type": "ItemList",
    "@id": `https://satvastones.in/shop/${cat.slug}#itemlist`,
    "name": `${cat.name} Collection`,
    "itemListElement": products.slice(0, 20).map((product, index) => {
      const item: Record<string, unknown> = {
        "@type": "Product",
        "name": product.name,
        "url": `https://satvastones.in/product/${product.slug}`,
        "image": product.images?.[0]
          ? product.images[0].startsWith("http")
            ? product.images[0]
            : `https://satvastones.in${product.images[0]}`
          : undefined,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "price": String(product.price),
          "availability": product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      };

      const rating = ratingMap.get(product.id);
      if (rating && rating.count > 0) {
        (item as Record<string, unknown>).aggregateRating = {
          "@type": "AggregateRating",
          reviewCount: String(rating.count),
          ratingValue: String(Math.round(rating.avg * 10) / 10),
          bestRating: "5",
          worstRating: "1",
        };
      }

      return {
        "@type": "ListItem",
        "position": index + 1,
        "item": item,
      };
    }),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://satvastones.in/",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": "https://satvastones.in/shop",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": cat.name,
        "item": `https://satvastones.in/shop/${cat.slug}`,
      },
    ],
  };

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "@id": `https://satvastones.in/shop/${cat.slug}#faq`,
            mainEntity: [
              {
                "@type": "Question",
                name: `Are ${cat.name.toLowerCase()} waterproof?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Yes. SatvaStones ${cat.name.toLowerCase()} are anti-tarnish and waterproof — safe for daily wear, rain and workouts. Rinse and pat dry to keep the shine.`,
                },
              },
              {
                "@type": "Question",
                name: `What is the price range for ${cat.name.toLowerCase()}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Most SatvaStones ${cat.name.toLowerCase()} start under ₹500 with premium picks under ₹2500. Prepaid orders over ₹399 ship free with COD available.`,
                },
              },
              {
                "@type": "Question",
                name: `Are SatvaStones ${cat.name.toLowerCase()} good for gifting?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `Yes. All ${cat.name.toLowerCase()} arrive gift-ready with skin-safe, nickel-free finishes — ideal for birthdays, anniversaries and festive gifting for her.`,
                },
              },
            ],
          }),
        }}
      />

      <div className="editorial-container py-10 lg:py-14">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <div className="flex items-center gap-2.5 text-[11px] text-[var(--muted)]">
            <Link href="/" className="hover:text-[var(--ink)] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-[var(--ink)] transition-colors">
              Shop
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[var(--ink)] font-medium truncate" aria-current="page">
              {cat.name}
            </span>
          </div>
        </nav>

        {/* Header */}
        <div className="section-heading">
          <div>
            <div className="eyebrow">Korean · Anti-tarnish · Waterproof</div>
            <h1 className="font-serif font-normal tracking-[-0.035em] leading-[1.05] text-[clamp(42px,4.3vw,63px)] mt-3">
              {cat.name} <em className="text-[var(--olive)]">for women.</em>
            </h1>
            <p className="text-[var(--muted)] mt-4 max-w-2xl leading-relaxed text-[13px]">
              {cat.description ||
                `Buy ${cat.name.toLowerCase()} for women online in India. Anti-tarnish, waterproof Korean designs — skin-safe, gift-ready, COD available with free shipping over ₹399.`}
            </p>
          </div>
          <span className="product-count" aria-live="polite">
            {products.length} pieces
          </span>
        </div>

        {/* Child Categories */}
        {childCategories.length > 0 && (
          <div className="tabs mb-8" role="group" aria-label="Subcategories">
            {childCategories.map((child) => (
              <Link key={child.id} href={`/shop/${child.slug}`} className="tab">
                {child.name}
              </Link>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="empty-products">
            <h2 className="font-serif text-[32px] font-normal mb-3">Nothing here just yet</h2>
            <p className="text-[11px] text-[var(--muted)]">New pieces are being curated for this collection.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="collection-footer">
          <p>Good on their own. Even better together.</p>
        </div>
      </div>

      {/* Benefits — same editorial strip as homepage */}
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

      {/* Care note — editorial */}
      <section className="daily-note">
        <span className="tiny-star" aria-hidden="true">✳</span>
        <h2>“The best things in your jewellery box<br />aren’t waiting for an occasion.”</h2>
        <p>Less saving it. More wearing it — explore the full edit.</p>
        <div className="mt-6">
          <Link href="/shop" className="button inline-flex">
            Explore the edit <svg className="w-[19px] h-[19px]"><use href="#i-arrow" /></svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
