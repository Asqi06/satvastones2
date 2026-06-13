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
  const url = `https://satvastones.in/product/${product._id || product.id}`;
  const name = product.metaTitle || product.title;
  const description = product.metaDescription || product.description || `Buy ${product.title} at ₹${product.price}. Anti-tarnish, waterproof aesthetic jewelry from Satvastones.`;

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": name,
    "image": [product.image, ...(product.images || [])],
    "description": description,
    "sku": product.sku || product._id || product.id,
    "mpn": product.sku || product._id || product.id,
    "brand": {
      "@type": "Brand",
      "name": "Satvastones"
    },
    "category": product.category || "Jewelry",
    "keywords": (product.focusKeywords || []).join(', '),
    "offers": {
      "@type": "Offer",
      "url": url,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": (product.stockQuantity || 0) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
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
        }
      }
    },
    ...(product.reviews?.length > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating || 5,
        "reviewCount": product.reviews.length,
        "bestRating": 5,
        "worstRating": 1
      },
      "review": product.reviews.slice(0, 5).map((r: any) => ({
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
      }))
    } : {})
  };
};

export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Satvastones",
  "url": "https://satvastones.in",
  "logo": "https://satvastones.in/logo.png",
  "description": "Premium aesthetic Korean and Western jewelry brand. Anti-tarnish, waterproof, trend-forward designs.",
  "foundingDate": "2024",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-0000000000",
    "contactType": "customer service",
    "email": "hello@satvastones.com",
    "availableLanguage": ["English", "Hindi"]
  },
  "sameAs": [
    "https://facebook.com/satvastones",
    "https://instagram.com/satvastones",
    "https://twitter.com/satvastones"
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

export default JsonLd;
