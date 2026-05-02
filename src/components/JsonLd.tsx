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
  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.title,
    "image": [product.image, ...(product.images || [])],
    "description": product.description || `High-quality aesthetic jewelry from Satvastones.`,
    "sku": product.id || product._id,
    "brand": {
      "@type": "Brand",
      "name": "Satvastones"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://satvastones.in/product/${product.id || product._id}`,
      "priceCurrency": "INR",
      "price": product.price,
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": product.reviews?.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating || 5,
      "reviewCount": product.reviews.length
    } : undefined
  };
};

export default JsonLd;
