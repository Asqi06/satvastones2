import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SessionProvider } from "next-auth/react";
import { prisma } from "@/lib/prisma";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://satvastones.in"),
  title: {
    default: "SatvaStones | Korean & Aesthetic Jewellery India",
    template: "%s | SatvaStones",
  },
  description:
    "Shop premium Korean and aesthetic jewellery online in India. Tarnish-free, waterproof pieces including rings, necklaces, and gifts for her starting under ₹200.",
  keywords: [
    "luxury jewellery",
    "Korean jewellery", 
    "Western jewellery",
    "earrings",
    "necklaces",
    "bracelets",
    "rings",
    "handcrafted jewellery",
    "Satvastones",
  ],
  alternates: {
    canonical: "https://satvastones.in",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "SatvaStones",
    title: "SatvaStones | Korean & Aesthetic Jewellery India",
    description: "Shop premium Korean and aesthetic jewellery online in India. Tarnish-free, waterproof pieces.",
    images: [
      {
        url: "https://www.satvastones.in/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SatvaStones - Korean & Aesthetic Jewellery",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SatvaStones | Korean & Aesthetic Jewellery India",
    description: "Shop premium Korean and aesthetic jewellery online in India. Tarnish-free, waterproof pieces.",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://satvastones.in/#organization",
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
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://satvastones.in/#website",
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
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let categories: { id: string; name: string; slug: string }[] = [];

  try {
    categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch (e) {
    console.log("DB not ready, Header will use curated categories", e);
  }

  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
      <head>
        <link rel="preload" as="image" href="https://www.satvastones.in/og-image.jpg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-white text-gray-900">
        <SessionProvider>
          <Header categories={categories} />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
