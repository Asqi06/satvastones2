import NewArrivalsSlider from "@/components/home/HeroBanner";
import BenefitBanner from "@/components/home/BenefitBanner";
import BestSellers from "@/components/home/FeaturedProducts";
import CollectionGallery from "@/components/home/CollectionGallery";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Satvastones | High-End Luxury Jewellery Curation",
  description: "Explore the intersection of Seoul minimalism and Parisian chic. Handcrafted luxury jewellery artifacts designed for the sophisticated woman.",
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Satvastones",
  },
};

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
  }
];

export default async function HomePage() {
  let allProducts: any[] = [];
  let bestSellers: any[] = [];

  try {
    // Fetch all active products for the Gallery
    allProducts = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        material: true,
        style: true,
      },
    });

    // Fetch featured products for the Best Sellers section
    bestSellers = await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        comparePrice: true,
        images: true,
        material: true,
        style: true,
      },
    });
  } catch (e) {
    console.log("DB not ready yet, using mock fallback");
  }

  // Fallback to mock data if DB is empty to ensure UI visibility for the user
  const displayBestSellers = bestSellers.length > 0 ? bestSellers : MOCK_PRODUCTS;
  const displayAllProducts = allProducts.length > 0 ? allProducts : MOCK_PRODUCTS;

  return (
    <main className="bg-luxury-cream relative">
      {/* 1. New Collection Sliders (Hero) */}
      <NewArrivalsSlider />

      {/* 1.5. Benefit Banner */}
      <BenefitBanner />

      {/* 2. Best Sellers */}
      <BestSellers products={displayBestSellers} />

      {/* 3. Whole Collection Gallery */}
      <CollectionGallery products={displayAllProducts} />
    </main>
  );
}
