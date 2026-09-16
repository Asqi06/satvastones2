import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Shield, Gem } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About SatvaStones — Korean & Western Aesthetic Jewelry Studio",
  description: "Discover the SatvaStones story — an Indian jewelry brand curating premium Korean aesthetic earrings, anti-tarnish gold necklaces, waterproof rings, and Western minimalist accessories for the modern woman. Handcrafted in Mumbai, shipped across India.",
  keywords: ["about SatvaStones", "Korean aesthetic jewelry brand India", "anti-tarnish jewelry studio", "handcrafted jewelry Mumbai", "women's jewelry brand India", "aesthetic earrings online", "gold plated jewelry brand"],
  alternates: { canonical: "https://satvastones.in/about" },
};

export default function AboutPage() {
  const aboutJsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": "https://satvastones.in/about#aboutpage",
    name: "About SatvaStones — Korean & Western Aesthetic Jewellery Studio",
    url: "https://satvastones.in/about",
    description:
      "Indian jewellery brand curating anti-tarnish, waterproof Korean aesthetic earrings, necklaces, rings and bracelets for everyday wear and gifting.",
    mainEntity: { "@id": "https://satvastones.in/#organization" },
  };

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)] overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd) }}
      />
      {/* Hero Section */}
      <div className="editorial-container py-10 lg:py-14">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
          <div className="w-full lg:w-1/2">
            <span className="eyebrow mb-5 block">A note from SatvaStones</span>
            <h1 className="font-serif font-normal tracking-[-0.04em] leading-[0.98] text-[clamp(52px,6.5vw,96px)] mb-6">
              Life happens.<br /><em className="text-[var(--olive)]">Keep the gold on.</em>
            </h1>
            <p className="text-[13px] text-[var(--muted)] mb-8 max-w-md leading-[1.9]">
              BORN IN BHARAT, CURATED FOR THE WORLD. SATVASTONES IS NOT JUST A BRAND—IT IS AN ARCHIVE OF MASTERPIECES DESIGNED TO EMPOWER THE CONTEMPORARY WARDROBE.
            </p>
            <Link href="/shop" className="button inline-flex">
              Explore the collection
              <svg className="w-[19px] h-[19px]"><use href="#i-arrow" /></svg>
            </Link>
          </div>
          <div className="w-full lg:w-1/2 relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden bg-[#e7e1d7] group">
            <Image
              src="/about_founder_ananya_1774677692958.png"
              alt="Founder Ananya Sharma"
              fill
              className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.03]"
            />
             <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-7 text-white">
                 <p className="font-serif italic text-2xl mb-1">Ananya Sharma</p>
                 <p className="text-[10px] uppercase tracking-[0.16em] opacity-80">Founder & Chief Curator</p>
             </div>
          </div>
        </div>
      </div>

      {/* Our Story — SEO Content Block */}
      <div className="editorial-container py-14 lg:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <span className="eyebrow mb-5 block">Our story</span>
          <h2 className="font-serif font-normal tracking-[-0.03em] text-[clamp(38px,4vw,58px)] leading-[1.05] mb-8">The SatvaStones <em className="text-[var(--olive)]">edit.</em></h2>
          <div className="space-y-6 text-[var(--muted)] font-serif text-lg leading-relaxed">
            <p>
              SatvaStones was born from a simple observation: the modern Indian woman deserves jewelry that
              moves with her — from boardroom meetings to weekend getaways, from traditional festivities to
              casual coffee dates. Our founder Ananya Sharma recognized a gap in the market for affordable,
              high-quality aesthetic jewelry that seamlessly blends Korean minimalism with Western elegance.
            </p>
            <p>
              What started as a curation of handpicked Korean earrings, minimalist gold rings, and designer
              necklaces has grown into India's premier destination for anti-tarnish, waterproof aesthetic jewelry.
              Every piece in our collection — from dainty butterfly earrings to layered chain necklaces, from
              stackable rings to charm bracelets — is selected for its ability to elevate your everyday style
              without breaking the bank.
            </p>
            <p>
              We are headquartered in Mumbai with our design studio in Jaipur, the heart of India's gemstone
              and jewelry craftsmanship. Our team of skilled artisans and curators works tirelessly to bring
              you trend-forward designs that capture the essence of Seoul street style, Parisian chic, and
              timeless Indian artistry.
            </p>
          </div>
        </div>
      </div>

      {/* Philosophy Values Grid */}
      <div className="bg-[#e8eadd] py-16 lg:py-24">
         <div className="editorial-container">
            <div className="text-center mb-12 lg:mb-16">
                <span className="eyebrow mb-4 block">What we stand for</span>
                <h2 className="font-serif font-normal tracking-[-0.03em] text-[clamp(38px,4vw,58px)] leading-[1.05]">Our <em className="text-[var(--olive)]">philosophy.</em></h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-14">
              <div className="text-center flex flex-col items-center group">
                 <div className="round-arrow !w-[72px] !h-[72px] mb-7 group-hover:rotate-[-35deg]">
                    <Compass className="w-7 h-7 text-[var(--olive)]" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-3">Global Design</h3>
                 <p className="text-[13px] text-[#676d5d] leading-relaxed max-w-xs">
                    Bridging Western minimalist structure with intricate traditional artistry from the East. Our designers draw inspiration from Seoul fashion weeks, Paris runways, and Jaipur's heritage craft techniques.
                 </p>
              </div>

              <div className="text-center flex flex-col items-center group">
                 <div className="round-arrow !w-[72px] !h-[72px] mb-7 group-hover:rotate-[-35deg]">
                    <Gem className="w-7 h-7 text-[var(--olive)]" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-3">Premium Materials</h3>
                 <p className="text-[13px] text-[#676d5d] leading-relaxed max-w-xs">
                    We source only pristine, conflict-free metals and precious stones capable of passing generations. Our gold-plated pieces feature thick 18K gold layering for lasting shine, and our silver collections are crafted from genuine 925 sterling silver.
                 </p>
              </div>

              <div className="text-center flex flex-col items-center group">
                 <div className="round-arrow !w-[72px] !h-[72px] mb-7 group-hover:rotate-[-35deg]">
                    <Shield className="w-7 h-7 text-[var(--olive)]" strokeWidth={1.5} />
                 </div>
                 <h3 className="text-[11px] font-semibold tracking-[0.14em] uppercase mb-3">Crafted For Life</h3>
                 <p className="text-[13px] text-[#676d5d] leading-relaxed max-w-xs">
                    Every piece undergoes a rigorous 40-point quality assurance protocol before seeing the light. Our anti-tarnish coating ensures your jewelry stays brilliant — wear it in the rain, at the gym, or through your daily routine without worry.
                 </p>
              </div>
            </div>
         </div>
      </div>

      {/* Sourcing Section */}
      <div className="editorial-container py-14 lg:py-20">
        <div className="flex flex-col-reverse lg:flex-row gap-10 lg:gap-16 items-center">
          <div className="w-full lg:w-1/2 relative aspect-square lg:aspect-[4/5] bg-[var(--white)] border border-[var(--line)] p-3">
            <div className="w-full h-full relative overflow-hidden group">
                 <Image
                    src="/about_ethical_sourcing_1774677719321.png"
                    alt="Ethical Sourcing of Gemstones for SatvaStones Jewelry"
                    fill
                    className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-1000 ease-out"
                />
            </div>
          </div>
          <div className="w-full lg:w-1/2 max-w-xl">
             <span className="eyebrow mb-4 block">Consciously made</span>
             <h2 className="font-serif font-normal tracking-[-0.03em] text-[clamp(38px,4vw,58px)] leading-[1.05] mb-6">Made to <em className="text-[var(--olive)]">last.</em></h2>
             <p className="text-[15px] text-[var(--ink)] leading-relaxed font-serif mb-5">
                From the bustling diamond markets of Mumbai to the serene gold vaults of Geneva, our supply chain is mapped, audited, and fiercely protected.
             </p>
               <p className="text-[13px] leading-[1.9] text-[var(--muted)] mb-8 border-l-2 border-[var(--olive)] pl-4">
                 We believe true luxury doesn't come at the cost of humanity. All our artifacts are crafted by fairly compensated artisans working in state-of-the-art facilities. No compromises.
               </p>

             <div className="space-y-5 mb-8 text-[var(--muted)] text-sm leading-relaxed">
               <p>
                 Our commitment to ethical sourcing means every gemstone, every gram of gold, and every component in our Korean aesthetic earrings, anti-tarnish necklaces, and designer bracelets is traceable to its origin. We work exclusively with suppliers who adhere to the Kimberley Process Certification Scheme for diamonds and maintain verifiable fair labour practices for all artisan partners.
               </p>
               <p>
                 SatvaStones is proudly 'Made in India'. From our design studio in Jaipur — the historic gemstone capital — to our manufacturing unit in Mumbai's jewellery district, every step of our creation process supports local artisans and preserves centuries-old Indian craftsmanship techniques while embracing modern design innovation.
               </p>
             </div>

             <Link href="/shop" className="text-link">
                Discover the collection <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </div>

      {/* Our Collections — SEO Section */}
      <div className="editorial-container py-14 lg:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="eyebrow mb-4 block">Curated for you</span>
            <h2 className="font-serif font-normal tracking-[-0.03em] text-[clamp(38px,4vw,58px)] leading-[1.05]">Our <em className="text-[var(--olive)]">collections.</em></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[var(--muted)] text-sm leading-relaxed">
            <div className="space-y-3 p-7 bg-[var(--white)] border border-[var(--line)]">
              <h3 className="font-semibold text-[13px] tracking-[0.12em] uppercase text-[var(--ink)]">Korean Aesthetic</h3>
              <p>Inspired by the clean lines and understated elegance of Seoul's fashion scene, our Korean collection features minimalist gold earrings, delicate layered necklaces, sleek hoop earrings, and dainty stackable rings. These pieces are designed for everyday wear — lightweight, comfortable, and effortlessly chic. Each item is treated with our signature anti-tarnish coating for lasting brilliance.</p>
            </div>
            <div className="space-y-3 p-7 bg-[var(--white)] border border-[var(--line)]">
              <h3 className="font-semibold text-[13px] tracking-[0.12em] uppercase text-[var(--ink)]">Western Minimalist</h3>
              <p>Our Western collection embraces bold silhouettes and contemporary design. From statement chain necklaces to geometric drop earrings, sculptural cuffs to architectural pendant sets — these pieces are for the woman who wants her jewelry to make a statement. Crafted from premium metals with thick 18K gold plating or genuine 925 sterling silver.</p>
            </div>
            <div className="space-y-3 p-7 bg-[var(--white)] border border-[var(--line)]">
              <h3 className="font-semibold text-[13px] tracking-[0.12em] uppercase text-[var(--ink)]">₹99 Flash Sale</h3>
              <p>Our most-loved collection featuring premium aesthetic jewelry at an unbeatable price point. Each ₹99 piece is handpicked from our best-selling designs and meets the same quality standards as our regular collection — anti-tarnish, waterproof, and beautifully packaged. Limited stock, refreshed regularly.</p>
            </div>
            <div className="space-y-3 p-7 bg-[var(--white)] border border-[var(--line)]">
              <h3 className="font-semibold text-[13px] tracking-[0.12em] uppercase text-[var(--ink)]">Gift Hampers</h3>
              <p>Curated gift sets designed for every occasion — birthdays, anniversaries, festivals, or just because. Our hampers combine complementary pieces from across our collections, presented in elegant packaging ready for gifting. Each hamper includes a personalized note option and can be shipped directly to your loved one anywhere in India.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose SatvaStones — SEO Section */}
      <div className="bg-[#e8eadd] py-16 lg:py-24">
        <div className="editorial-container max-w-4xl text-center">
          <span className="eyebrow mb-4 block">Why choose us</span>
          <h2 className="font-serif font-normal tracking-[-0.03em] text-[clamp(38px,4vw,58px)] leading-[1.05] mb-12">The SatvaStones <em className="text-[var(--olive)]">difference.</em></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
            <div className="p-7 bg-[var(--paper)] border border-[#cbd0bc]">
              <h3 className="font-semibold text-[13px] tracking-[0.12em] uppercase text-[var(--ink)] mb-3">100% Anti-Tarnish</h3>
              <p className="text-[13px] text-[#676d5d] leading-relaxed">All our jewelry is treated with a specialized anti-tarnish coating that prevents oxidation, discolouration, and green fingers. Your pieces stay brilliant for years with minimal care.</p>
            </div>
            <div className="p-7 bg-[var(--paper)] border border-[#cbd0bc]">
              <h3 className="font-semibold text-[13px] tracking-[0.12em] uppercase text-[var(--ink)] mb-3">Waterproof Design</h3>
              <p className="text-[13px] text-[#676d5d] leading-relaxed">Unlike ordinary fashion jewelry that dulls on contact with water, SatvaStones pieces are engineered to withstand moisture. Wear them in the rain, at the gym, or while washing your hands.</p>
            </div>
            <div className="p-7 bg-[var(--paper)] border border-[#cbd0bc]">
              <h3 className="font-semibold text-[13px] tracking-[0.12em] uppercase text-[var(--ink)] mb-3">Free Shipping Over ₹399</h3>
              <p className="text-[13px] text-[#676d5d] leading-relaxed">Enjoy free delivery on all prepaid orders above ₹399 across India. We ship via trusted courier partners with real-time tracking and full insurance.</p>
            </div>
            <div className="p-7 bg-[var(--paper)] border border-[#cbd0bc]">
              <h3 className="font-semibold text-[13px] tracking-[0.12em] uppercase text-[var(--ink)] mb-3">Secure Payments</h3>
              <p className="text-[13px] text-[#676d5d] leading-relaxed">Shop with confidence using UPI (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, or Cash on Delivery. All payments are processed securely via Razorpay.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="editorial-container text-center py-14 lg:py-20">
        <span className="eyebrow mb-4 block">Ready when you are</span>
        <h2 className="font-serif font-normal tracking-[-0.03em] text-[clamp(38px,4vw,58px)] leading-[1.05] mb-5">Experience <em className="text-[var(--olive)]">the edit.</em></h2>
        <p className="font-serif text-lg text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
          Whether you are looking for everyday Korean aesthetic earrings, a show-stopping gold necklace for a special occasion, or a thoughtful gift for someone you love — SatvaStones has the perfect piece waiting for you. Explore our full collection of anti-tarnish, waterproof jewelry curated for the modern woman.
        </p>
        <Link href="/shop" className="button inline-flex">
          Explore the collection
          <svg className="w-[19px] h-[19px]"><use href="#i-arrow" /></svg>
        </Link>
      </div>

    </div>
  );
}
