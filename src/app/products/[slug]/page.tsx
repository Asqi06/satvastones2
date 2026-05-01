import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

const MOCK_PRODUCTS = [
  {
    id: "mock1",
    name: "Korean Minimalist Gold Ring",
    slug: "korean-minimalist-gold-ring",
    price: 4999,
    comparePrice: 6999,
    images: ["/gold_ring_minimalist_1774634383905.png"],
    material: "18K Gold",
    style: "KOREAN",
    description: "A minimalist gold ring that captures the essence of modern Seoul street style. Perfect for stacking or wearing strictly solo.",
    stock: 10,
    reviews: []
  },
  {
    id: "mock2",
    name: "Abstract Seoul Earrings",
    slug: "abstract-seoul-earrings",
    price: 3499,
    comparePrice: null,
    images: ["/korean_earrings_premium_1774634324348.png"],
    material: "Silver",
    style: "KOREAN",
    description: "Architectural lines meet classic elegance with these abstract earrings. Handcrafted for the sophisticated woman.",
    stock: 15,
    reviews: []
  },
  {
    id: "mock3",
    name: "Elite Western Necklace",
    slug: "elite-western-necklace",
    price: 12999,
    comparePrice: 15999,
    images: ["/western_necklace_premium_1774634354735.png"],
    material: "Gold",
    style: "WESTERN",
    description: "An elite statement piece featuring traditional western motifs seamlessly blended into a modern silhouette.",
    stock: 5,
    reviews: []
  },
  {
    id: "mock4",
    name: "Emerald Horizon Bracelet",
    slug: "emerald-horizon-bracelet",
    price: 8999,
    comparePrice: 10999,
    images: ["/emerald_bracelet_hero_1774677499386.png"],
    material: "Emerald",
    style: "WESTERN",
    description: "Breathtaking emerald stones set in a delicate horizon arrangement. The ultimate luxury artifact.",
    stock: 2,
    reviews: []
  }
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let product: any = null;
  
  try {
    product = await prisma.product.findUnique({
      where: { slug },
      select: { name: true, description: true, images: true },
    });
  } catch (e) {
    product = MOCK_PRODUCTS.find(p => p.slug === slug);
  }

  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.description.substring(0, 160),
    openGraph: {
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });

    if (product) {
        relatedProducts = await prisma.product.findMany({
        where: {
            categoryId: product.categoryId,
            id: { not: product.id },
            isActive: true,
        },
        take: 4,
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
        },
        });
    }

  } catch (e) {
    console.log("DB not ready, fetching mock");
  }

  // Fallback to MOCK
  if (!product) {
      product = MOCK_PRODUCTS.find((p) => p.slug === slug);
      relatedProducts = MOCK_PRODUCTS.filter(p => p.slug !== slug).slice(0, 4);
  }

  if (!product) notFound();

  const avgRating = product.reviews?.length > 0
      ? product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const reviewCount = product.reviews?.length || 0;

  // Build JSON-LD structured data for Product schema
  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images?.[0]
      ? `https://satvastones.in${product.images[0]}`
      : undefined,
    "sku": product.sku || product.slug,
    "brand": {
      "@type": "Brand",
      "name": "Satva Stones"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://satvastones.in/products/${product.slug}`,
      "priceCurrency": "INR",
      "price": String(product.price),
      "availability": product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "INR"
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 3,
            "maxValue": 7,
            "unitCode": "DAY"
          }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted",
        "merchantReturnDays": 0,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/ReturnFeesCustomerResponsibility",
        "returnPolicySeasonalOverride": {
          "@type": "MerchantReturnPolicySeasonalOverride",
          "startDate": "2025-01-01",
          "endDate": "2025-12-31",
          "returnWindow": {
            "@type": "QuantitativeValue",
            "value": 0,
            "unitCode": "DAY"
          }
        }
      }
    },
    ...(reviewCount > 0 && avgRating > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": String(Math.round(avgRating * 10) / 10),
        "reviewCount": String(reviewCount),
        "bestRating": "5",
        "worstRating": "1"
      }
    } : {}),
    ...(product.reviews && product.reviews.length > 0 ? {
      "review": product.reviews.slice(0, 5).map((r: any) => ({
        "@type": "Review",
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": String(r.rating),
          "bestRating": "5"
        },
        "author": {
          "@type": "Person",
          "name": r.user?.name || "Verified Customer"
        },
        ...(r.title ? { "name": r.title } : {}),
        ...(r.comment ? { "reviewBody": r.comment } : {})
      }))
    } : {})
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <ProductDetailClient
        product={product}
        relatedProducts={relatedProducts}
        avgRating={avgRating}
      />
    </>
  );
}
