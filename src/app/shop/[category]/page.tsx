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
  const title = `${name} | Shop ${name} Online | SatvaStones`;
  const description =
    cat.description ||
    `Shop premium ${name.toLowerCase()} at SatvaStones. Anti-tarnish, waterproof, handmade designs with free shipping across India.`;

  return {
    title,
    description,
    alternates: { canonical: `https://satvastones.in/shop/${cat.slug}` },
    openGraph: {
      title,
      description,
      images: products?.[0]?.images?.[0] ? [products[0].images[0]] : [],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const data = await getCategory(category);

  if (!data) notFound();

  const { category: cat, products, childCategories } = data;

  const itemListJsonLd = {
    "@context": "https://schema.org/",
    "@type": "ItemList",
    "@id": `https://satvastones.in/shop/${cat.slug}#itemlist`,
    "name": `${cat.name} Collection`,
    "itemListElement": products.slice(0, 20).map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "url": `https://satvastones.in/product/${product.slug}`,
        "image": product.images?.[0]
          ? `https://satvastones.in${product.images[0]}`
          : "",
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "price": String(product.price),
          "availability": product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      },
    })),
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
    <div className="bg-[var(--luxury-cream)] min-h-screen pt-[120px] lg:pt-[140px] pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />

      <div className="container-premium">
        {/* Breadcrumbs */}
        <div className="mb-12">
          <div className="flex items-center gap-3 label-sm text-[var(--luxury-brown)]/50">
            <Link href="/" className="hover:text-[var(--luxury-brown)] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/shop" className="hover:text-[var(--luxury-brown)] transition-colors">
              Curations
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[var(--luxury-brown)] font-bold truncate">
              {cat.name}
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-[var(--luxury-border)] pb-16 mb-20 gap-10">
          <div className="animate-fade-in">
            <p className="label-sm text-[var(--luxury-gold)] mb-4">
              The Archives
            </p>
            <h1 className="heading-section text-[var(--luxury-brown)] leading-tight">
              {cat.name}
            </h1>
            {cat.description && (
              <p className="text-[var(--luxury-brown)]/60 mt-6 max-w-2xl leading-relaxed text-[0.95rem]">
                {cat.description}
              </p>
            )}
          </div>
          <div className="bg-white border border-[var(--luxury-border)] px-8 py-4 animate-fade-in shadow-sm shrink-0">
            <p className="label-sm text-[var(--luxury-brown)]/60">
              {products.length}{" "}
              <span className="text-[var(--luxury-brown)]">Artifacts Catalogued</span>
            </p>
          </div>
        </div>

        {/* Child Categories */}
        {childCategories.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-20">
            {childCategories.map((child) => (
              <Link
                key={child.id}
                href={`/shop/${child.slug}`}
                className="px-6 py-3 bg-white border border-[var(--luxury-border)] label-sm text-[var(--luxury-brown)] hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] transition-colors"
              >
                {child.name}
              </Link>
            ))}
          </div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="py-40 text-center flex flex-col items-center justify-center bg-white border border-[var(--luxury-border)]">
            <h2 className="font-serif text-3xl text-[var(--luxury-brown)] mb-4 italic">
              The archive is vacant
            </h2>
            <p className="label-sm text-[var(--luxury-brown)]/50">
              New pieces are being curated for this collection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
