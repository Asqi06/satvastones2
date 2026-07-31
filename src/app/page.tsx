import NewArrivalsSlider from "@/components/home/HeroBanner";
import BenefitBanner from "@/components/home/BenefitBanner";
import BestSellers from "@/components/home/FeaturedProducts";
import CollectionGallery from "@/components/home/CollectionGallery";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import SocialProof from "@/components/home/SocialProof";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Satvastones – Anti Tarnish Korean Aesthetic Jewellery Online India",
  description: "Shop anti tarnish, waterproof fashion jewellery online — Korean aesthetic earrings, necklaces, rings & bracelets. Free shipping ₹399+. COD across India.",
  alternates: { canonical: "https://satvastones.in" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Satvastones",
    url: "https://satvastones.in",
    title: "Satvastones – Anti Tarnish Korean Aesthetic Jewellery Online India",
    description: "Shop anti tarnish, waterproof fashion jewellery online — Korean aesthetic earrings, necklaces, rings & bracelets. Free shipping ₹399+. COD across India.",
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
  let newCollectionProducts: any[] = [];
  let categories: { id: string; name: string; slug: string; description?: string | null; image?: string | null }[] = [];

  try {
    categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true, description: true, image: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch (e) {
    console.log("DB not ready for categories", e);
  }

  try {
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

    bestSellers = await prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
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

    newCollectionProducts = await prisma.product.findMany({
      where: { isActive: true, isNewCollection: true },
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

  const displayBestSellers = bestSellers.length > 0 ? bestSellers : MOCK_PRODUCTS;
  const displayNewCollection = newCollectionProducts.length > 0 ? newCollectionProducts : MOCK_PRODUCTS;
  const displayAllProducts = allProducts.length > 0 ? allProducts : MOCK_PRODUCTS;

  return (
    <main className="bg-white relative">
      {/* Hero Banner */}
      <NewArrivalsSlider />

      {/* Hero Intro Copy */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="container-premium max-w-3xl mx-auto px-4 text-center">
          <p className="text-luxury-brown/70 text-base lg:text-lg leading-relaxed max-w-3xl mx-auto">
            Satvastones is an online jewellery store in India for anti tarnish, waterproof fashion jewellery you can wear every single day. From Korean aesthetic earrings and 18K gold plated necklaces to stackable rings and bracelets, every piece is built to survive sweat, water, and daily wear without fading. Shop the latest Korean jewellery drop, browse ₹99 rings, or pick a ready-made gift hamper — with free shipping above ₹399 and Cash on Delivery available pan-India.
          </p>
        </div>
      </section>

      {/* Category Showcase - Traditional Indian Jewellery Style */}
      <CategoryShowcase categories={categories} />

      {/* Social Proof - Reviews, Ratings & Trust */}
      <SocialProof />

      {/* Benefit Banner */}
      <BenefitBanner />

      {/* Best Sellers */}
      <BestSellers products={displayBestSellers} />

      {/* New Collection */}
      <BestSellers products={displayNewCollection} />

      {/* Whole Collection Gallery */}
      <CollectionGallery products={displayAllProducts} />
    </main>
  );
}