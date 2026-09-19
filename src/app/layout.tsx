import type { Metadata, Viewport } from "next";
import { Fraunces, Archivo } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import { SessionProvider } from "next-auth/react";
import { prisma } from "@/lib/prisma";

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "SatvaStones",
    title: "SatvaStones | Korean & Aesthetic Jewellery India",
    description: "Shop premium Korean and aesthetic jewellery online in India. Tarnish-free, waterproof pieces.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@satvastones",
    creator: "@satvastones",
    title: "SatvaStones | Korean & Aesthetic Jewellery India",
    description: "Shop premium Korean and aesthetic jewellery online in India. Tarnish-free, waterproof pieces.",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF6E4",
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
      "urlTemplate": "https://satvastones.in/shop?search={search_term_string}"
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
    <html lang="en" className={`${fraunces.variable} ${archivo.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col antialiased bg-[var(--paper)] text-[var(--ink)]">
        <SessionProvider>
          <ScrollReveal />
          <Header categories={categories} />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
