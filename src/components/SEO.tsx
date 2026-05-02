import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
}

const SEO = ({ 
  title = "Satvastones | Aesthetic Korean & Western Jewelry", 
  description = "Discover our curated collection of aesthetic Korean and Western jewelry. From minimalist earrings to statement necklaces, find your vibe at Satvastones.", 
  canonical = "https://satvastones.in", 
  image = "https://satvastones.in/logo.png" 
}: SEOProps) => {
  const siteTitle = title.includes("Satvastones") ? title : `${title} | Satvastones`;

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* AEO / JSON-LD structured data can be added here too */}
    </Helmet>
  );
};

export default SEO;
