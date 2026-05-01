import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SessionProvider } from "next-auth/react";

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
  "name": "Satvastones",
  "url": "https://satvastones.in",
  "description": "Luxury Korean and Western Jewellery",
  "brand": {
    "@type": "Brand",
    "name": "Satvastones"
  }
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Satvastones",
  "url": "https://satvastones.in",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://satvastones.in/products?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${montserrat.variable}`}>
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
      <body className="min-h-full flex flex-col antialiased bg-white text-gray-900">
        <SessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
