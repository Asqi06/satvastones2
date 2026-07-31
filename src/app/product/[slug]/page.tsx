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
    name: "Korean Minimalist Gold Ring",
    slug: "korean-minimalist-gold-ring",
    price: 4999,
    comparePrice: 6999,
    images: ["/gold_ring_minimalist_1774634383905.png"],
    material: "18K Gold",
    style: "KOREAN",
    description: "A minimalist gold ring that captures the essence of modern Seoul street style. Perfect for stacking or wearing strictly solo.",
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
    name: "Abstract Seoul Earrings",
    slug: "abstract-seoul-earrings",
    price: 3499,
    comparePrice: null,
    images: ["/korean_earrings_premium_1774634324348.png"],
    material: "Silver",
    style: "KOREAN",
    description: "Architectural lines meet classic elegance with these abstract earrings. Handcrafted for the sophisticated woman.",
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
    name: "Elite Western Necklace",
    slug: "elite-western-necklace",
    price: 12999,
    comparePrice: 15999,
    images: ["/western_necklace_premium_1774634354735.png"],
    material: "Gold",
    style: "WESTERN",
    description: "An elite statement piece featuring traditional western motifs seamlessly blended into a modern silhouette.",
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
    name: "Emerald Horizon Bracelet",
    slug: "emerald-horizon-bracelet",
    price: 8999,
    comparePrice: 10999,
    images: ["/emerald_bracelet_hero_1774677499386.png"],
    material: "Emerald",
    style: "WESTERN",
    description: "Breathtaking emerald stones set in a delicate horizon arrangement. The ultimate luxury artifact.",
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
      title: metaTitle,
      description: desc,
      images: product.images && product.images[0] ? [product.images[0]] : [],
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
      <ProductDetail
        product={product}
        relatedProducts={relatedProducts}
        avgRating={avgRating}
      />
    </>
  );
}
