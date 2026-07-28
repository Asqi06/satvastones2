import React from 'react';

interface JsonLdProps {
  data: any;
}

const JsonLd = ({ data }: JsonLdProps) => {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export const getProductSchema = (product: any) => {
  const url = `https://satvastones.in/product/${product.slug || product._id || product.id}`;
  const name = product.metaTitle || product.title;
  const description = product.metaDescription || product.description || `Buy ${product.title} at ₹${product.price}. Anti-tarnish, waterproof aesthetic jewelry from Satvastones.`;
  const isInStock = (product.stockQuantity || 0) > 0;
  const hasVariants = product.variants?.length > 0;

  const schema: any = {
    "@context": "https://schema.org/",
    "@id": `${url}#product`,
    ...(hasVariants ? {
      "@type": "ProductGroup",
      "productGroupID": product.sku || product._id || product.id,
      "variesBy": [
        "https://schema.org/color",
        ...(product.variants?.some((v: any) => v.size) ? ["https://schema.org/size"] : [])
      ],
      "hasVariant": product.variants.map((v: any) => ({
        "@type": "Product",
        "@id": `https://satvastones.in/product/${v.slug || product.slug || product._id || product.id}#product`,
        "name": v.color ? `${name} - ${v.color}` : name,
        "color": v.color,
        "size": v.size,
        "image": v.images?.[0] || product.image,
        "offers": {
          "@type": "Offer",
          "priceCurrency": "INR",
          "price": product.price,
          "availability": (v.stockQuantity ?? product.stockQuantity ?? 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "url": url
        }
      }))
    } : {
      "@type": "Product",
    }),
    "name": name,
    "image": [product.image, ...(product.images || [])],
    "description": description,
    "sku": product.sku || product._id || product.id,
    "mpn": product.sku || product._id || product.id,
    ...(product.gtin13 ? { "gtin13": product.gtin13 } : {}),
    "brand": {
      "@type": "Brand",
      "name": "Satvastones"
    },
    "category": product.category || "Jewelry",
    "material": product.material || "Premium Alloy",
    "color": product.variants?.map((v: any) => v.color)?.join(', ') || undefined,
    "keywords": (product.focusKeywords || []).join(', '),
    ...(product.specifications?.length > 0 ? {
      "additionalProperty": product.specifications.map((s: any) => ({
        "@type": "PropertyValue",
        "name": s.key,
        "value": s.value
      }))
    } : {}),
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "applicableCountry": "IN",
        "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN"
        },
        ...(isInStock ? {
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
          },
          "shippingRate": {
            "@type": "MonetaryAmount",
            "value": 0,
            "currency": "INR"
          }
        } : {})
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 0,
      "reviewCount": product.reviews?.length || 0,
      "bestRating": 5,
      "worstRating": 1
    },
    "review": (product.reviews?.length || 0) > 0 ? product.reviews.slice(0, 5).map((r: any) => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating || 5,
        "bestRating": 5
      },
      "author": {
        "@type": "Person",
        "name": r.name || "Verified Customer"
      },
      "reviewBody": r.comment || ""
    })) : []
  };

  return schema;
};

export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Satvastones",
  "url": "https://satvastones.in",
  "logo": "https://satvastones.in/logo.png",
  "description": "Premium aesthetic Korean and Western jewelry brand. Anti-tarnish, waterproof, trend-forward designs.",
  "foundingDate": "2026",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Vapi, Gujarat",
    "addressLocality": "Vapi",
    "addressRegion": "Gujarat",
    "postalCode": "396191",
    "addressCountry": "IN"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-9016703180",
    "contactType": "customer service",
    "email": "support@satvastones.in",
    "availableLanguage": ["English", "Hindi"]
  },
  "sameAs": [
    "https://facebook.com/satvastones",
    "https://instagram.com/satvastones",
    "https://twitter.com/satvastones",
    "https://pinterest.com/satvastones",
    "https://tiktok.com/@satvastones"
  ]
});

export const getWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Satvastones",
  "url": "https://satvastones.in",
  "description": "Aesthetic Korean & Western Jewelry Store - Anti-tarnish, Waterproof Jewelry Online in India",
  "inLanguage": "en-IN",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://satvastones.in/shop?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
});

export const getBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, i) => ({
    "@type": "ListItem",
    "position": i + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const getFaqSchema = (faqs: { question: string; answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const getLocalBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "JewelryStore",
  "name": "Satvastones",
  "image": "https://satvastones.in/logo.png",
  "url": "https://satvastones.in",
  "telephone": "+91-9016703180",
  "email": "support@satvastones.in",
  "description": "Premium aesthetic Korean and Western jewelry store based in Vapi, India. Anti-tarnish, waterproof jewelry online.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Vapi, Gujarat",
    "addressLocality": "Vapi",
    "addressRegion": "Gujarat",
    "postalCode": "396191",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 20.3717,
    "longitude": 72.9048
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "09:00",
    "closes": "19:00"
  },
  "priceRange": "₹99 - ₹10,000",
  "areaServed": "IN",
  "sameAs": [
    "https://facebook.com/satvastones",
    "https://instagram.com/satvastones",
    "https://twitter.com/satvastones",
    "https://pinterest.com/satvastones",
    "https://tiktok.com/@satvastones"
  ]
});

export const getProductGroupSchema = (product: any, variants: any[]) => ({
  "@context": "https://schema.org",
  "@type": "ProductGroup",
  "name": product.title,
  "description": product.description || `Shop ${product.title} at Satvastones`,
  "url": `https://satvastones.in/product/${product.slug || product._id || product.id}`,
  "image": [product.image, ...(product.images || [])],
  "brand": {
    "@type": "Brand",
    "name": "Satvastones"
  },
  "productGroupID": product.sku || product._id || product.id,
  "variesBy": [
    "https://schema.org/color"
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": product.rating || 0,
    "reviewCount": product.reviews?.length || 0,
    "bestRating": 5,
    "worstRating": 1
  },
  "review": (product.reviews?.length || 0) > 0 ? product.reviews.slice(0, 5).map((r: any) => ({
    "@type": "Review",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": r.rating || 5,
      "bestRating": 5
    },
    "author": {
      "@type": "Person",
      "name": r.name || "Verified Customer"
    },
    "reviewBody": r.comment || ""
  })) : [],
  "hasVariant": variants.map((v: any, i: number) => ({
    "@type": "Product",
    "name": `${product.title} - ${v.color}`,
    "image": v.images?.[0] || product.image,
    "color": v.color,
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": product.price,
      "availability": "https://schema.org/InStock",
      "url": `https://satvastones.in/product/${product.slug || product._id || product.id}`
    }
  }))
});

export const getArticleSchema = (blog: any) => {
  const url = `https://satvastones.in/blog/${blog.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": blog.metaTitle || blog.title,
    "description": blog.metaDescription || blog.excerpt || `Read ${blog.title} on Satvastones Journal`,
    "image": blog.image || "https://satvastones.in/logo.png",
    "author": {
      "@type": "Person",
      "name": blog.author || "Satvastones"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Satvastones",
      "logo": {
        "@type": "ImageObject",
        "url": "https://satvastones.in/logo.png"
      }
    },
    "datePublished": blog.publishedAt || blog.createdAt,
    "dateModified": blog.updatedAt || blog.createdAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
    },
    "keywords": (blog.focusKeywords || []).join(', '),
    "articleSection": blog.category || "Style Guide"
  };
};

export default JsonLd;
