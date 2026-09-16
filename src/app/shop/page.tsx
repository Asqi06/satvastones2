import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProductsPageClient from "./ProductsClient";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { PRODUCT_STYLES, MATERIALS } from "@/lib/constants";

const PAGE_SIZE = 24;

type SearchParams = Record<string, string | string[] | undefined>;

const FACET_PARAMS = [
  "category",
  "style",
  "material",
  "minPrice",
  "maxPrice",
  "search",
  "sort",
  "sub",
] as const;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const hasFacets = FACET_PARAMS.some((key) => Boolean(firstValue(params[key])));
  const pageNumber = parseFiniteNumber(firstValue(params.page)) ?? 1;
  const isPaginated = pageNumber > 1;

  return {
    title: "Shop Korean & Anti-Tarnish Jewellery Online India | Earrings, Rings, Necklaces – SatvaStones",
    description:
      "Buy Korean & aesthetic jewellery online in India. Anti-tarnish, waterproof earrings, necklaces, rings & bracelets starting under ₹500. Gifts for her, COD & free shipping over ₹399.",
    keywords: [
      "jewellery online india",
      "buy jewellery online",
      "korean jewellery india",
      "anti tarnish jewellery",
      "artificial jewellery for women",
      "earrings necklaces rings bracelets",
    ],
    alternates: { canonical: "https://satvastones.in/shop" },
    openGraph: {
      title: "Shop Korean & Anti-Tarnish Jewellery Online – SatvaStones",
      description:
        "Anti-tarnish, waterproof earrings, necklaces, rings & bracelets. Gifts for her, COD & free shipping over ₹399.",
      url: "https://satvastones.in/shop",
      type: "website",
    },
    robots:
      hasFacets || isPaginated
        ? { index: false, follow: true }
        : {
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

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseFiniteNumber(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildOrderBy(sort: string | undefined): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "best-selling":
      return { orderItems: { _count: "desc" } };
    default:
      return { createdAt: "desc" };
  }
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const category = firstValue(params.category);
  const style = firstValue(params.style);
  const material = firstValue(params.material);
  const search = firstValue(params.search);
  const sort = firstValue(params.sort) || "newest";
  const minPrice = parseFiniteNumber(firstValue(params.minPrice));
  const maxPrice = parseFiniteNumber(firstValue(params.maxPrice));
  const page = Math.max(1, parseFiniteNumber(firstValue(params.page)) ?? 1);

  const where: Prisma.ProductWhereInput = { isActive: true };

  const validStyle = PRODUCT_STYLES.some((s) => s.value === style) ? style : undefined;
  const validMaterial = (MATERIALS as readonly string[]).includes(material ?? "")
    ? material
    : undefined;

  if (category) where.category = { slug: category };
  if (validStyle) where.style = validStyle as Prisma.ProductWhereInput["style"];
  if (validMaterial) where.material = validMaterial;

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined ? { gte: minPrice } : {}),
      ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
    };
  }

  if (search) {
    // NOTE: `mode: "insensitive"` is not supported on MongoDB — contains is case-sensitive.
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { material: { contains: search } },
    ];
  }

  let categories: { id: string; name: string; slug: string }[] = [];
  let products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    comparePrice: number | null;
    images: string[];
    material: string | null;
    style: string;
    stock: number;
    category: { name: string; slug: string } | null;
    _count: { reviews: number };
  }[] = [];
  let total = 0;

  try {
    const [categoryRows, productRows, count] = await Promise.all([
      prisma.category.findMany({
        select: { id: true, name: true, slug: true },
        orderBy: { name: "asc" },
      }),
      prisma.product.findMany({
        where,
        orderBy: buildOrderBy(sort),
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
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
          category: { select: { name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    categories = categoryRows;
    products = productRows;
    total = count;
  } catch (e) {
    console.error("MongoDB Atlas unavailable during product compilation", e);
  }

  const ratingMap = new Map<string, { avg: number; count: number }>();
  if (products.length > 0) {
    try {
      const ratingRows = await prisma.review.groupBy({
        by: ["productId"],
        where: { productId: { in: products.map((p) => p.id) } },
        _avg: { rating: true },
        _count: { rating: true },
      });
      for (const row of ratingRows) {
        ratingMap.set(row.productId, {
          avg: row._avg.rating ?? 0,
          count: row._count.rating,
        });
      }
    } catch (e) {
      console.error("Rating aggregation unavailable", e);
    }
  }

  const pagination = {
    page,
    pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    total,
  };

  const itemListJsonLd = {
    "@context": "https://schema.org/",
    "@type": "ItemList",
    "@id": "https://satvastones.in/shop#itemlist",
    "name": "SatvaStones Curated Jewellery Collection",
    "itemListElement": products.slice(0, 20).map((product, index) => {
      const itemSchema: Record<string, unknown> = {
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "url": `https://satvastones.in/product/${product.slug}`,
          "image": product.images?.[0] ? `https://satvastones.in${product.images[0]}` : "",
          "offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": String(product.price),
            "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            "availability": product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock"
          }
        }
      };

      const rating = ratingMap.get(product.id);
      if (rating && rating.count > 0) {
        (itemSchema.item as Record<string, unknown>).aggregateRating = {
          "@type": "AggregateRating",
          "reviewCount": String(rating.count),
          "ratingValue": String(Math.round(rating.avg * 10) / 10),
          "bestRating": "5",
          "worstRating": "1"
        };
      }

      return itemSchema;
    })
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-[var(--paper)] animate-pulse"></div>}>
        <ProductsPageClient
          categories={categories}
          products={products}
          pagination={pagination}
          searchQuery={search ?? null}
        />
      </Suspense>
    </>
  );
}
