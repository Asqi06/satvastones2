"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Award, Truck, RotateCcw, Lock, MessageSquare, Gem, Crown, Heart, Star, Factory, Search, ChevronRight, ChevronDown } from "lucide-react";

const categories = [
  {
    id: "gold",
    label: "Gold Jewellery",
    slug: "gold",
    image: "/gold-jewellery-category.jpg",
    shortDesc: "22K & 18K BIS Hallmarked Gold — Traditional & Contemporary Designs",
    longDesc: "Every piece crafted from 91.6% pure 22K gold or 75% pure 18K gold, fully BIS hallmarked with laser-engraved HUID (Hallmark Unique Identification) for complete traceability. From daily wear chains to elaborate bridal sets, our gold jewellery undergoes 14 quality checkpoints.",
    trustPoints: [
      "BIS Hallmark + HUID on Every Piece",
      "22K (916) & 18K (750) Purity Guaranteed",
      "Lifetime Exchange at Full Gold Value",
      "Making Charges Transparent — No Hidden Costs",
      "Free Gold Purity Certificate with Purchase",
    ],
    subcategories: ["Rings", "Earrings", "Necklaces", "Bangles", "Chains", "Pendants", "Mangalsutras", "Bridal Sets"],
    startingPrice: "₹8,999",
    cta: "Explore Gold Collection",
  },
  {
    id: "diamond",
    label: "Diamond Jewellery",
    slug: "diamond",
    image: "/diamond-jewellery-category.jpg",
    shortDesc: "IGI/GIA Certified Natural Diamonds — Conflict-Free, Ethically Sourced",
    longDesc: "Featuring IGI and GIA certified natural diamonds with full 4Cs documentation (Cut, Color, Clarity, Carat). Every diamond is laser-inscribed with certificate number. We offer H-SI to D-VVS grades with transparent pricing — no treated or synthetic diamonds sold as natural.",
    trustPoints: [
      "IGI / GIA Certified — Certificate Provided",
      "Conflict-Free Kimberley Process Compliant",
      "Laser Inscription Matching Certificate",
      "30-Day Return on Diamond Jewellery",
      "Lifetime Diamond Upgrade Program",
    ],
    subcategories: ["Solitaire Rings", "Diamond Earrings", "Tennis Bracelets", "Pendants", "Nose Pins", "Anniversary Bands"],
    startingPrice: "₹24,999",
    cta: "View Diamond Collection",
  },
  {
    id: "silver",
    label: "Silver Jewellery",
    slug: "silver",
    image: "/silver-jewellery-category.jpg",
    shortDesc: "92.5% Sterling Silver Hallmarked — Oxidised, Polished & Gold-Plated Finishes",
    longDesc: "Certified 925 sterling silver with BIS hallmark. Available in three finishes: high-polish rhodium plated (tarnish-resistant), antique oxidised (traditional look), and 18K gold vermeil (2.5 micron). Every piece stamped with 925 purity mark and our maker's mark.",
    trustPoints: [
      "925 Sterling Silver — BIS Hallmarked",
      "Rhodium / Gold Vermeil / Oxidised Finishes",
      "Anti-Tarnish Coating on Polished Pieces",
      "Lifetime Polish & Re-plating Service",
      "Nickel-Free & Hypoallergenic",
    ],
    subcategories: ["Rings", "Earrings", "Necklaces", "Anklets", "Toe Rings", "Pooja Items", "Men's Kadas", "Bracelets"],
    startingPrice: "₹1,299",
    cta: "Shop Silver Collection",
  },
  {
    id: "gemstone",
    label: "Gemstone Jewellery",
    slug: "gemstone",
    image: "/gemstone-jewellery-category.jpg",
    shortDesc: "Lab-Certified Natural Gemstones — Vedic Astrology Approved, Untreated",
    longDesc: "Government lab-certified (IGI-GTL, GII, IIG) natural gemstones for astrological and jewellery purposes. Each stone comes with detailed certificate: species, variety, weight, measurements, refractive index, specific gravity, treatment disclosure. Untreated/natural stones only — no glass-filled, dyed, or synthetic.",
    trustPoints: [
      "Govt. Lab Certified (IGI-GTL / GII / IIG)",
      "Treatment Disclosure on Certificate",
      "Vedic Astrology Compliant Selection",
      "Free Gemstone Recommendation Consultation",
      "Lifetime Authenticity Guarantee",
    ],
    subcategories: ["Ruby (Manik)", "Emerald (Panna)", "Yellow Sapphire (Pukhraj)", "Blue Sapphire (Neelam)", "Pearl (Moti)", "Red Coral (Moonga)", "Hessonite (Gomed)", "Cat's Eye (Lehsunia)"],
    startingPrice: "₹3,499",
    cta: "Explore Gemstones",
  },
  {
    id: "bridal",
    label: "Bridal Jewellery",
    slug: "bridal",
    image: "/bridal-jewellery-category.jpg",
    shortDesc: "Complete Bridal Sets — Gold, Diamond, Polki, Kundan, Temple Jewellery",
    longDesc: "Curated bridal collections for every ceremony: engagement, mehendi, wedding, reception. Includes traditional South Indian temple jewellery, North Indian kundan/polki, and contemporary diamond sets. Each set includes necklace, earrings, maang tikka, nath, waist belt, bangles, and haath phool. Custom design service available.",
    trustPoints: [
      "Complete Ceremony-Wise Sets Curated",
      "Temple / Kundan / Polki / Diamond Options",
      "Free Bridal Consultation (Video/In-Store)",
      "Custom Design & Size Adjustment Included",
      "Secure Storage Until Wedding Date",
    ],
    subcategories: ["Necklace Sets", "Maang Tikka", "Nath (Nose Ring)", "Waist Belt (Kamarbandh)", "Armlet (Bajuband)", "Bridal Bangles (Chooda)", "Haath Phool", "Anklets (Payal)"],
    startingPrice: "₹85,000",
    cta: "View Bridal Collection",
  },
  {
    id: "mens",
    label: "Men's Jewellery",
    slug: "mens",
    image: "/mens-jewellery-category.jpg",
    shortDesc: "Gold, Diamond & Silver for Men — Kadas, Chains, Rings, Cufflinks, Tie Pins",
    longDesc: "Masculine designs in 22K gold, 18K gold, platinum, and sterling silver. Includes traditional kadas (bangles), heavy curb chains, signet rings with gemstones, diamond-studded pieces, and formal accessories (cufflinks, tie pins, lapel pins). All pieces hallmarked. Custom engraving available.",
    trustPoints: [
      "BIS Hallmarked Gold & Silver",
      "Platinum 950 Available on Request",
      "Custom Engraving (Names, Dates, Mantras)",
      "Heavy Weight Options for Daily Wear",
      "Corporate Gifting & Bulk Orders Welcome",
    ],
    subcategories: ["Gold Kadas", "Chains & Necklaces", "Signet Rings", "Diamond Rings", "Bracelets", "Cufflinks", "Tie Pins", "Lapel Pins", "Kara (Sikh)"],
    startingPrice: "₹15,999",
    cta: "Shop Men's Collection",
  },
];

export default function CategoryShowcase() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  return (
    <section className="bg-white py-16 lg:py-24" aria-labelledby="categories-heading">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        <header className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
          <span className="inline-block px-4 py-1.5 bg-[#FFFEFB] border border-[#C5A059]/30 rounded-full text-[10px] font-bold uppercase tracking-widest text-[#C5A059] mb-4">
            Shop by Category
          </span>
          <h2 id="categories-heading" className="font-serif text-3xl lg:text-4xl xl:text-5xl text-[#241A14] tracking-[0.02em] leading-tight mb-4">
            Explore Our Certified Jewellery Collections
          </h2>
          <p className="text-lg lg:text-xl text-[#241A14]/60 leading-relaxed max-w-2xl mx-auto">
            Every category features <span className="font-semibold text-[#241A14]">BIS Hallmarked</span> pieces with <span className="font-semibold text-[#241A14]">full certification</span>, <span className="font-semibold text-[#241A14]">transparent pricing</span>, and our <span className="font-semibold text-[#C5A059]">Lifetime Exchange Guarantee</span>.
          </p>
        </header>

        <div className="hidden lg:flex items-center justify-center gap-8 lg:gap-16 mb-12 lg:mb-16 flex-wrap px-4">
          <div className="flex items-center gap-2 text-[#241A14]/50">
            <Award className="w-5 h-5 text-[#C5A059]" />
            <span className="text-sm font-medium">100% Hallmarked</span>
          </div>
          <div className="w-px h-6 bg-[#E8E2D9]" />
          <div className="flex items-center gap-2 text-[#241A14]/50">
            <Shield className="w-5 h-5 text-[#C5A059]" />
            <span className="text-sm font-medium">Lifetime Exchange</span>
          </div>
          <div className="w-px h-6 bg-[#E8E2D9]" />
          <div className="flex items-center gap-2 text-[#241A14]/50">
            <Truck className="w-5 h-5 text-[#C5A059]" />
            <span className="text-sm font-medium">Free Shipping ₹1,999+</span>
          </div>
          <div className="w-px h-6 bg-[#E8E2D9]" />
          <div className="flex items-center gap-2 text-[#241A14]/50">
            <RotateCcw className="w-5 h-5 text-[#C5A059]" />
            <span className="text-sm font-medium">30-Day Returns</span>
          </div>
          <div className="w-px h-6 bg-[#E8E2D9]" />
          <div className="flex items-center gap-2 text-[#241A14]/50">
            <Lock className="w-5 h-5 text-[#C5A059]" />
            <span className="text-sm font-medium">Secure Payment</span>
          </div>
          <div className="w-px h-6 bg-[#E8E2D9]" />
          <div className="flex items-center gap-2 text-[#241A14]/50">
            <MessageSquare className="w-5 h-5 text-[#C5A059]" />
            <span className="text-sm font-medium">24/7 Support</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {categories.map((cat, index) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isExpanded={expandedCategory === cat.id}
              onToggleExpand={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
            />
          ))}
        </div>

        <div className="text-center mt-12 lg:mt-16">
          <Link to="/shop" className="inline-flex items-center gap-3 px-8 py-4 bg-[#241A14] text-white text-sm font-medium uppercase tracking-wider hover:bg-[#1a1612] transition-colors rounded-lg">
            View All Categories & Collections
            <ChevronRight className="w-5 h-5" />
          </Link>
          <p className="mt-4 text-sm text-[#241A14]/50">
            Or browse by <Link to="/shop?metal=GOLD"  className="underline hover:text-[#C5A059]">Metal</Link> • <Link to="/shop?category=bridal" className="underline hover:text-[#C5A059]">Occasion</Link> • <Link to="/shop?style=traditional" className="underline hover:text-[#C5A059]">Style</Link> • <Link to="/shop?price=under-10000" className="underline hover:text-[#C5A059]">Budget</Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function CategoryCard({ category, isExpanded, onToggleExpand }: {
  category: typeof categories[0];
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  return (
    <div className={`relative group overflow-hidden rounded-2xl border border-[#E8E2D9] bg-white transition-all duration-500 hover:shadow-2xl hover:border-[#C5A059]/50 ${isExpanded ? 'z-10' : ''}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-[#FAF9F6]">
        <img
          src={category.image}
          alt={category.label}
          loading={isExpanded ? "eager" : "lazy"}
          width="600"
          height="450"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex flex-col gap-1.5">
          <span className="px-3 py-1 bg-[#241A14]/90 backdrop-blur text-white text-[9px] font-bold uppercase tracking-widest rounded">Certified</span>
          <span className="px-3 py-1 bg-[#C5A059]/90 backdrop-blur text-white text-[9px] font-bold uppercase tracking-widest rounded">Hallmarked</span>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        <div className="mb-4">
          <h3 className="font-serif text-xl lg:text-2xl text-[#241A14] tracking-[0.01em] mb-2">{category.label}</h3>
          <p className="text-sm lg:text-base text-[#241A14]/60 leading-relaxed line-clamp-2">{category.shortDesc}</p>
        </div>

        <div className="mb-4 flex items-center gap-3 p-3 bg-[#FAF9F6] rounded-lg border border-[#E8E2D9]">
          <Gem className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#241A14]/50 block">Starting From</span>
            <span className="text-lg font-bold text-[#241A14]">{category.startingPrice}</span>
          </div>
        </div>

        <div className="mb-4 space-y-2">
          {category.trustPoints.slice(0, 3).map((point, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-[#241A14]/70">
              <Shield className="w-3.5 h-3.5 text-[#C5A059] flex-shrink-0 mt-0.5" />
              <span>{point}</span>
            </div>
          ))}
          {category.trustPoints.length > 3 && (
            <button onClick={onToggleExpand} className="text-[11px] font-medium text-[#C5A059] hover:underline flex items-center gap-1">
              +{category.trustPoints.length - 3} more guarantees <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {category.subcategories.slice(0, 5).map((sub) => (
            <span key={sub} className="px-2.5 py-1 bg-[#FFFEFB] border border-[#E8E2D9] text-[10px] font-medium uppercase tracking-wider text-[#241A14]/70 rounded-full hover:border-[#C5A059]/50 hover:text-[#C5A059] transition-colors">{sub}</span>
          ))}
          {category.subcategories.length > 5 && (
            <span className="px-2.5 py-1 bg-[#FAF9F6] border border-[#E8E2D9] text-[10px] font-medium uppercase tracking-wider text-[#241A14]/50 rounded-full">+{category.subcategories.length - 5} more</span>
          )}
        </div>

        <Link
          to={`/shop/${category.slug}`}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#241A14] text-white text-sm font-medium uppercase tracking-wider hover:bg-[#1a1612] transition-colors rounded-lg group"
        >
          {category.cta} <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>

        {isExpanded && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onToggleExpand}>
            <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-8 animate-fade-in" onClick={e => e.stopPropagation()}>
              <div className="space-y-6">
                <button onClick={onToggleExpand} className="w-full flex justify-end"><ChevronDown className="w-6 h-6 text-[#241A14]/50 rotate-180" /></button>
                <div>
                  <h4 className="font-serif text-lg lg:text-xl text-[#241A14] mb-3">About This Collection</h4>
                  <p className="text-[#241A14]/70 leading-relaxed text-base">{category.longDesc}</p>
                </div>
                <div className="border-t border-[#E8E2D9] pt-6">
                  <h4 className="font-serif text-lg lg:text-xl text-[#241A14] mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-[#C5A059]" /> Our Guarantees for {category.label}</h4>
                  <ul className="space-y-3">
                    {category.trustPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-[#FAF9F6] rounded-lg border border-[#E8E2D9]">
                        <div className="w-8 h-8 rounded-full bg-[#FFFEFB] border border-[#C5A059]/30 flex items-center justify-center flex-shrink-0"><Shield className="w-4 h-4 text-[#C5A059]" /></div>
                        <span className="text-sm text-[#241A14] leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border-t border-[#E8E2D9] pt-6">
                  <h4 className="font-serif text-lg lg:text-xl text-[#241A14] mb-4">Sub-Collections Available</h4>
                  <div className="flex flex-wrap gap-2">
                    {category.subcategories.map((sub) => (
                      <Link key={sub} to={`/shop?category=${category.slug}&sub=${sub.toLowerCase()}`}
                        className="px-4 py-2 bg-white border border-[#E8E2D9] text-sm text-[#241A14]/70 hover:border-[#C5A059] hover:text-[#C5A059] hover:bg-[#FFFEFB] transition-colors rounded-lg">{sub}</Link>
                    ))}
                  </div>
                </div>
                <div className="border-t border-[#E8E2D9] pt-6 bg-[#FFFEFB] rounded-lg p-4 border border-[#C5A059]/20">
                  <h4 className="font-serif text-lg text-[#241A14] mb-3 flex items-center gap-2"><Award className="w-5 h-5 text-[#C5A059]" /> Certification & Quality Details</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#241A14]/70">
                    <div className="flex items-center gap-2"><Search className="w-4 h-4 text-[#C5A059]" /><span>BIS Hallmark Verification Portal Link on Invoice</span></div>
                    <div className="flex items-center gap-2"><Search className="w-4 h-4 text-[#C5A059]" /><span>HUID (Hallmark Unique ID) Laser Engraved</span></div>
                    <div className="flex items-center gap-2"><Search className="w-4 h-4 text-[#C5A059]" /><span>Government Lab Certificate for Gemstones</span></div>
                    <div className="flex items-center gap-2"><Search className="w-4 h-4 text-[#C5A059]" /><span>4Cs Diamond Certificate (IGI/GIA) Provided</span></div>
                    <div className="flex items-center gap-2"><Search className="w-4 h-4 text-[#C5A059]" /><span>Making Charges Breakdown on Every Invoice</span></div>
                    <div className="flex items-center gap-2"><Search className="w-4 h-4 text-[#C5A059]" /><span>Weight & Purity Stamped on Each Piece</span></div>
                  </div>
                </div>
                <div className="border-t border-[#E8E2D9] pt-6 flex flex-col sm:flex-row gap-3">
                  <Link to={`/shop/${category.slug}`} className="flex-1 text-center px-6 py-3.5 bg-[#241A14] text-white text-sm font-medium uppercase tracking-wider hover:bg-[#1a1612] transition-colors rounded-lg">Browse All {category.label}</Link>
                  <a href="tel:+919876543210" className="flex-1 text-center px-6 py-3.5 border-2 border-[#241A14] text-[#241A14] text-sm font-medium uppercase tracking-wider hover:bg-[#241A14] hover:text-white transition-colors rounded-lg flex items-center justify-center gap-2"><MessageSquare className="w-4 h-4" /> Consult Expert</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}