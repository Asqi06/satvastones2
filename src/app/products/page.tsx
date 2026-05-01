import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProductsPageClient from "./ProductsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop Jewellery",
  description: "Browse our collection of luxury Korean and Western jewellery.",
};

export default async function ProductsPage() {
  let categories: any[] = [];
  let products: any[] = [];
  try {
    categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: "asc" },
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
    console.log("DB not ready");
  }

  const itemListJsonLd = {
    "@context": "https://schema.org/",
    "@type": "ItemList",
    "name": "Jewellery Collection",
    "itemListElement": products
      .filter((p, i) => i < 20)
      .map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "url": `https://satvastones.in/products/${product.slug}`,
          "offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": String(product.price),
            "availability": product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock"
          },
          ...(product._count?.reviews > 0 ? {
            "aggregateRating": {
              "@type": "AggregateRating",
              "reviewCount": String(product._count.reviews),
              "bestRating": "5",
              "worstRating": "1"
            }
          } : {})
        }
      }))
  };

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f0f0f]"></div>}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <ProductsPageClient categories={categories} />
    </Suspense>
  );
}
