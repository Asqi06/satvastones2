import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetail from "./ProductDetail";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

const MOCK_PRODUCTS = [
  {
    id: "mock1",
    name: "Korean Minimalist Ring",
    slug: "korean-minimalist-gold-ring",
    price: 599,
    comparePrice: 899,
    images: ["/gold_ring_minimalist_1774634383905.png"],
    material: "Gold Plated",
    style: "KOREAN",
    description: "A minimalist 18K gold-plated ring that captures modern Seoul street style. Anti-tarnish and waterproof — stack it or wear it solo, all day, every day.",
    stock: 10,
    reviews: [],
    sku: "MOCK1",
    metaTitle: null,
    metaDescription: null,
    focusKeywords: [],
    category: null,
    categoryId: "",
  },
  {
    id: "mock2",
    name: "Seoul Twist Hoop Earrings",
    slug: "abstract-seoul-earrings",
    price: 499,
    comparePrice: null,
    images: ["/korean_earrings_premium_1774634324348.png"],
    material: "Silver Plated",
    style: "KOREAN",
    description: "Architectural twisted hoops in a lightweight silver-plated finish. Anti-tarnish, waterproof, and skin-safe for effortless everyday wear.",
    stock: 15,
    reviews: [],
    sku: "MOCK2",
    metaTitle: null,
    metaDescription: null,
    focusKeywords: [],
    category: null,
    categoryId: "",
  },
  {
    id: "mock3",
    name: "Layered Chain Necklace",
    slug: "elite-western-necklace",
    price: 799,
    comparePrice: 1199,
    images: ["/western_necklace_premium_1774634354735.png"],
    material: "Gold Plated",
    style: "WESTERN",
    description: "A delicate 18K gold-plated layered chain that dresses up any outfit. Anti-tarnish and waterproof — keeps its shine through showers and workouts.",
    stock: 5,
    reviews: [],
    sku: "MOCK3",
    metaTitle: null,
    metaDescription: null,
    focusKeywords: [],
    category: null,
    categoryId: "",
  },
  {
    id: "mock4",
    name: "Rose Gold Cuff Bracelet",
    slug: "emerald-horizon-bracelet",
    price: 699,
    comparePrice: 999,
    images: ["/emerald_bracelet_hero_1774677499386.png"],
    material: "Rose Gold Plated",
    style: "WESTERN",
    description: "A sleek rose gold-plated cuff with a soft modern silhouette. Anti-tarnish, waterproof, and nickel-free for sensitive skin.",
    stock: 2,
    reviews: [],
    sku: "MOCK4",
    metaTitle: null,
    metaDescription: null,
    focusKeywords: [],
    category: null,
    categoryId: "",
  },
];

async function getProduct(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) return null;

    const relatedProducts = await prisma.product.findMany({
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

    return { product, relatedProducts };
  } catch (e) {
    console.log("DB not ready, fetching mock");
    const mock = MOCK_PRODUCTS.find((p) => p.slug === slug);
    if (!mock) return null;
    return {
      product: mock,
      relatedProducts: MOCK_PRODUCTS.filter((p) => p.slug !== slug).slice(0, 4),
    };
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProduct(slug);

  if (!data) return { title: "Product Not Found" };

  const { product } = data;
  const categoryName = product.category?.name || "";
  const material = product.material || "";
  const titleParts = [product.name];
  if (material) titleParts.push(material);
  if (categoryName) titleParts.push(`${categoryName} for Women`);
  titleParts.push("SatvaStones");

  const metaTitle = product.metaTitle || titleParts.join(" | ");
  const rawDesc = product.description || "";
  const desc = product.metaDescription || (rawDesc.length > 200 ? rawDesc.substring(0, 197) + "..." : rawDesc);
  const keywords =
    typeof product.focusKeywords === "string" && product.focusKeywords.trim().length > 0
      ? product.focusKeywords
          .split(",")
          .map((k: string) => k.trim())
          .filter(Boolean)
      : undefined;

  return {
    title: metaTitle,
    description: desc,
    keywords,
    alternates: { canonical: `https://satvastones.in/product/${slug}` },
    openGraph: {
      type: "website",
      url: `https://satvastones.in/product/${slug}`,
      title: metaTitle,
      description: desc,
      ...(product.images && product.images[0] ? { images: [product.images[0]] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: desc,
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

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const data = await getProduct(slug);

  if (!data) notFound();

  const { product, relatedProducts } = data;
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const reviewCount = reviews.length;

  const avgRating =
    reviewCount > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount
      : 0;

  const productUrl = `https://satvastones.in/product/${product.slug}`;
  const categorySlug = product.category?.slug || "";

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${productUrl}#breadcrumb`,
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
        "name": product.category?.name || "Shop",
        "item": `https://satvastones.in/shop/${categorySlug}`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": productUrl,
      },
    ],
  };

  const productJsonLd: any = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    "name": product.name,
    "description": product.description,
    "image": (product.images ?? []).map((img: string) =>
      img.startsWith("http") ? img : `https://satvastones.in${img}`
    ),
    "sku": product.sku || product.slug,
    "mpn": product.sku || product.slug,
    "brand": {
      "@type": "Brand",
      "name": "Satva Stones",
    },
    "material": product.material || "Premium Alloy",
    "color": product.style || "Natural",
    "offers": {
      "@type": "Offer",
      "@id": `${productUrl}#offer`,
      "url": productUrl,
      "priceCurrency": "INR",
      "price": String(product.price),
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "INR",
        },
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN",
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 2,
            "unitCode": "DAY",
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 3,
            "maxValue": 7,
            "unitCode": "DAY",
          },
        },
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnPermitted",
        "merchantReturnDays": 30,
        "returnMethod": "https://schema.org/ReturnByMail",
        "returnFees": "https://schema.org/ReturnFeesCustomerResponsibility",
      },
    },
  };

  if (reviewCount > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": String(Math.round(avgRating * 10) / 10),
      "reviewCount": String(reviewCount),
      "bestRating": "5",
      "worstRating": "1",
    };

    productJsonLd.review = reviews.slice(0, 5).map((r: any) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.user?.name || "Verified Buyer",
      },
      "datePublished": new Date(r.createdAt || new Date()).toISOString().split("T")[0],
      "reviewBody": r.comment || "Beautiful jewelry item!",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": String(r.rating),
        "bestRating": "5",
        "worstRating": "1",
      },
    }));
  }

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${productUrl}#faq`,
    mainEntity: [
      {
        "@type": "Question",
        name: `Is ${product.name} anti-tarnish and waterproof?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. ${product.name} in ${product.material || "premium plated"} finish is anti-tarnish, waterproof and skin-safe for everyday wear. Avoid perfumes and store dry for lasting shine.`,
        },
      },
      {
        "@type": "Question",
        name: "How long is delivery and is COD available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Dispatch within 24-48 hours with estimated delivery in 3-5 business days across India. COD is available and prepaid orders over ₹399 ship free with live tracking.",
        },
      },
      {
        "@type": "Question",
        name: "What if my jewellery arrives damaged?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Email support@satvastones.in within 48 hours of delivery with photos and your Order ID for a free replacement. All sales are final except verified damage claims.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <ProductDetail
        product={product}
        relatedProducts={relatedProducts}
        avgRating={avgRating}
      />
    </>
  );
}
