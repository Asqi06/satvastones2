import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  keywords?: string[];
  type?: 'website' | 'product' | 'article';
  locale?: string;
  noindex?: boolean;
  publishedTime?: string;
}

const SITE_NAME = 'Satvastones';
const SITE_URL = 'https://satvastones.in';
const DEFAULT_IMAGE = 'https://satvastones.in/logo.png';
const DEFAULT_KEYWORDS = [
  'aesthetic jewelry', 'korean jewelry', 'western jewelry', 'anti-tarnish jewelry',
  'gold plated jewelry', 'minimalist earrings', 'trendy necklace', 'waterproof jewelry',
  'satvastones', 'online jewelry store india', 'affordable jewelry', 'fashion jewelry'
];

const FILTER_PARAMS = ['style', 'category', 'material', 'maxPrice', 'sort', 'minPrice', 'color'];

function getCanonicalUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl, SITE_URL);
    FILTER_PARAMS.forEach((p) => url.searchParams.delete(p));
    return url.toString();
  } catch {
    return rawUrl;
  }
}

const SEO = ({
  title = `${SITE_NAME} | Aesthetic Korean & Western Jewelry`,
  description = 'Discover our curated collection of aesthetic Korean and Western jewelry. From minimalist earrings to statement necklaces, find your vibe at Satvastones.',
  canonical = SITE_URL,
  image = DEFAULT_IMAGE,
  keywords,
  type = 'website',
  locale = 'en_IN',
  noindex = false,
  publishedTime,
}: SEOProps) => {
  const siteTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
  const allKeywords = [...new Set([...(keywords || []), ...DEFAULT_KEYWORDS])].join(', ');
  const cleanCanonical = getCanonicalUrl(canonical);

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <link rel="canonical" href={cleanCanonical} />
      <meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow, max-snippet:-1, max-image-preview:large'} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#0a0a0a" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={cleanCanonical} />
      <meta property="og:locale" content={locale} />
      {publishedTime && <meta property="og:updated_time" content={publishedTime} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@satvastones" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta */}
      <meta name="application-name" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      <meta name="distribution" content="global" />
      <meta name="rating" content="general" />
      <meta name="target" content="all" />
      <meta name="audience" content="all" />
      <meta name="coverage" content="India" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
    </Helmet>
  );
};

export default SEO;
