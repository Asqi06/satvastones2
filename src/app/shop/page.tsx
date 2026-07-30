import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProductsPageClient from "./ProductsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Premium Anti-Tarnish Jewellery Online | SatvaStones",
  description: "Explore India's premier collection of waterproof, anti-tarnish Korean huggies, layered western necklaces, stackable rings, and luxury bracelets.",
  alternates: { canonical: "https://satvastones.in/shop" },
};

export default async function ShopPage() {
  let categories: any[] = [];
  let products: any[] = [];

  try {
    categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });

    products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        stock: true,
        sku: true,
        _count: { select: { reviews: true } },
      },
      take: 50,
    });
  } catch (e) {
    console.error("PostgreSQL database unavailable during product compilation", e);
  }

  const itemListJsonLd = {
    "@context": "https://schema.org/",
    "@type": "ItemList",
    "@id": "https://satvastones.in/shop#itemlist",
    "name": "SatvaStones Curated Jewellery Collection",
    "itemListElement": products.slice(0, 20).map((product, index) => {
      const itemSchema: any = {
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "url": `https://satvastones.in/shop/${product.slug}`,
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

      const totalReviews = product._count?.reviews || 0;
      if (totalReviews > 0) {
        itemSchema.item.aggregateRating = {
          "@type": "AggregateRating",
          "reviewCount": String(totalReviews),
          "ratingValue": "5.0",
          "bestRating": "5",
          "worstRating": "1"
        };
      }

      return itemSchema;
    })
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f] animate-pulse"></div>}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <ProductsPageClient categories={categories} initialProducts={products} />
    </Suspense>
  );
}