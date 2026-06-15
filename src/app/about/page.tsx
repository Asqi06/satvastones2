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
  return (
    <div className="bg-[var(--luxury-cream)] min-h-screen pt-[140px] lg:pt-[180px] pb-24 overflow-hidden">
      {/* Hero Section */}
      <div className="container-premium mb-24 lg:mb-32">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-center">
          <div className="w-full lg:w-1/2 animate-fade-in relative z-10">
            <span className="label-sm text-[var(--luxury-gold)] mb-6 block border-l-2 border-[var(--luxury-gold)] pl-4">The Satvastones Legacy</span>
            <h1 className="heading-hero text-[var(--luxury-brown)] mb-8 leading-[0.9] text-shadow-sm pr-12 lg:pr-0">
              Artistry <br className="hidden lg:block"/> in Stone
            </h1>
            <p className="label-md text-[var(--luxury-brown)]/70 mb-10 max-w-lg leading-[2] tracking-widest font-normal italic">
              BORN IN BHARAT, CURATED FOR THE WORLD. SATVASTONES IS NOT JUST A BRAND—IT IS AN ARCHIVE OF MASTERPIECES DESIGNED TO EMPOWER THE CONTEMPORARY WARDROBE.
            </p>
          </div>
          <div className="w-full lg:w-1/2 relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden border border-[var(--luxury-border)] group bg-white shadow-xl">
            <Image
              src="/about_founder_ananya_1774677692958.png"
              alt="Founder Ananya Sharma"
              fill
              className="object-cover object-center grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 ease-out hover:scale-105"
            />
             <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--luxury-brown)]/80 to-transparent p-8 text-white">
                 <p className="font-serif italic text-2xl mb-2">Ananya Sharma</p>
                 <p className="label-sm opacity-80">Founder & Chief Curator</p>
             </div>
          </div>
        </div>
      </div>

      {/* Our Story — SEO Content Block */}
      <div className="container-premium my-24 lg:my-32">
        <div className="max-w-3xl mx-auto text-center">
          <span className="label-sm text-[var(--luxury-gold)] mb-6 block border-l-2 border-[var(--luxury-gold)] pl-4 max-w-max mx-auto">Our Story</span>
          <h2 className="heading-section text-[var(--luxury-brown)] mb-12 italic">The SatvaStones Edit</h2>
          <div className="space-y-6 text-[var(--luxury-brown)]/70 font-serif text-lg leading-relaxed">
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
      <div className="bg-[var(--luxury-brown)] text-white py-24 lg:py-32 my-32">
         <div className="container-premium">
            <div className="text-center mb-16 lg:mb-24">
                <h2 className="heading-section text-[var(--luxury-gold)] mb-6 italic">Our Philosophy</h2>
                <div className="w-16 h-px bg-white/30 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
              <div className="text-center flex flex-col items-center group">
                 <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center mb-8 group-hover:border-[var(--luxury-gold)] transition-colors duration-500">
                    <Compass className="w-8 h-8 text-[var(--luxury-gold)] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" strokeWidth={1.5} />
                 </div>
                 <h3 className="label-md font-bold text-white mb-4 uppercase tracking-[0.2em]">Global Design</h3>
                 <p className="text-white/60 text-sm leading-relaxed max-w-xs font-serif italic">
                    Bridging Western minimalist structure with intricate traditional artistry from the East. Our designers draw inspiration from Seoul fashion weeks, Paris runways, and Jaipur's heritage craft techniques.
                 </p>
              </div>
              
              <div className="text-center flex flex-col items-center group">
                 <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center mb-8 group-hover:border-[var(--luxury-gold)] transition-colors duration-500">
                    <Gem className="w-8 h-8 text-[var(--luxury-gold)] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" strokeWidth={1.5} />
                 </div>
                 <h3 className="label-md font-bold text-white mb-4 uppercase tracking-[0.2em]">Premium Materials</h3>
                 <p className="text-white/60 text-sm leading-relaxed max-w-xs font-serif italic">
                    We source only pristine, conflict-free metals and precious stones capable of passing generations. Our gold-plated pieces feature thick 18K gold layering for lasting shine, and our silver collections are crafted from genuine 925 sterling silver.
                 </p>
              </div>

              <div className="text-center flex flex-col items-center group">
                 <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center mb-8 group-hover:border-[var(--luxury-gold)] transition-colors duration-500">
                    <Shield className="w-8 h-8 text-[var(--luxury-gold)] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" strokeWidth={1.5} />
                 </div>
                 <h3 className="label-md font-bold text-white mb-4 uppercase tracking-[0.2em]">Crafted For Life</h3>
                 <p className="text-white/60 text-sm leading-relaxed max-w-xs font-serif italic">
                    Every piece undergoes a rigorous 40-point quality assurance protocol before seeing the light. Our anti-tarnish coating ensures your jewelry stays brilliant — wear it in the rain, at the gym, or through your daily routine without worry.
                 </p>
              </div>
            </div>
         </div>
      </div>

      {/* Sourcing Section */}
      <div className="container-premium my-24 lg:my-32">
        <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-24 items-center">
          <div className="w-full lg:w-1/2 relative aspect-square lg:aspect-[4/5] bg-white border border-[var(--luxury-border)] p-4 shadow-sm">
            <div className="w-full h-full relative overflow-hidden group">
                 <Image
                    src="/about_ethical_sourcing_1774677719321.png"
                    alt="Ethical Sourcing of Gemstones for SatvaStones Jewelry"
                    fill
                    className="object-cover object-center group-hover:scale-[1.03] transition-transform duration-[3000ms] ease-out origin-top"
                />
            </div>
          </div>
          <div className="w-full lg:w-1/2 max-w-xl pr-4">
             <h2 className="heading-section text-[var(--luxury-brown)] mb-8 italic">Conscious Extraction</h2>
             <p className="text-[var(--luxury-brown)]/80 text-[1.1rem] leading-relaxed font-serif mb-6 italic">
                From the bustling diamond markets of Mumbai to the serene gold vaults of Geneva, our supply chain is mapped, audited, and fiercely protected. 
             </p>
               <p className="label-md leading-[2] text-[var(--luxury-brown)]/60 mb-10 tracking-[0.15em] font-normal uppercase border-l border-[var(--luxury-gold)] pl-4">
                 We believe true luxury doesn't come at the cost of humanity. All our artifacts are crafted by fairly compensated artisans working in state-of-the-art facilities. No compromises.
             </p>

             <div className="space-y-6 mt-12 mb-10 text-[var(--luxury-brown)]/80 font-serif text-base leading-relaxed">
               <p>
                 Our commitment to ethical sourcing means every gemstone, every gram of gold, and every component in our Korean aesthetic earrings, anti-tarnish necklaces, and designer bracelets is traceable to its origin. We work exclusively with suppliers who adhere to the Kimberley Process Certification Scheme for diamonds and maintain verifiable fair labour practices for all artisan partners.
               </p>
               <p>
                 SatvaStones is proudly 'Made in India'. From our design studio in Jaipur — the historic gemstone capital — to our manufacturing unit in Mumbai's jewellery district, every step of our creation process supports local artisans and preserves centuries-old Indian craftsmanship techniques while embracing modern design innovation.
               </p>
             </div>

             <Link href="/products" className="inline-flex items-center gap-4 border-b-2 border-[var(--luxury-brown)] pb-2 label-md text-[var(--luxury-brown)] group hover:text-[var(--luxury-gold)] hover:border-[var(--luxury-gold)] transition-colors font-bold tracking-[0.2em]">
                DISCOVER THE ARCHIVE <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
             </Link>
          </div>
        </div>
      </div>

      {/* Our Collections — SEO Section */}
      <div className="container-premium my-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="label-sm text-[var(--luxury-gold)] mb-6 block">Curated For You</span>
            <h2 className="heading-section text-[var(--luxury-brown)] mb-8 italic">Our Collections</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-[var(--luxury-brown)]/70 font-serif text-base leading-relaxed">
            <div className="space-y-4 p-8 bg-white border border-[var(--luxury-border)]">
              <h3 className="font-bold text-lg tracking-widest uppercase text-[var(--luxury-brown)]">Korean Aesthetic</h3>
              <p>Inspired by the clean lines and understated elegance of Seoul's fashion scene, our Korean collection features minimalist gold earrings, delicate layered necklaces, sleek hoop earrings, and dainty stackable rings. These pieces are designed for everyday wear — lightweight, comfortable, and effortlessly chic. Each item is treated with our signature anti-tarnish coating for lasting brilliance.</p>
            </div>
            <div className="space-y-4 p-8 bg-white border border-[var(--luxury-border)]">
              <h3 className="font-bold text-lg tracking-widest uppercase text-[var(--luxury-brown)]">Western Minimalist</h3>
              <p>Our Western collection embraces bold silhouettes and contemporary design. From statement chain necklaces to geometric drop earrings, sculptural cuffs to architectural pendant sets — these pieces are for the woman who wants her jewelry to make a statement. Crafted from premium metals with thick 18K gold plating or genuine 925 sterling silver.</p>
            </div>
            <div className="space-y-4 p-8 bg-white border border-[var(--luxury-border)]">
              <h3 className="font-bold text-lg tracking-widest uppercase text-[var(--luxury-brown)]">₹99 Flash Sale</h3>
              <p>Our most-loved collection featuring premium aesthetic jewelry at an unbeatable price point. Each ₹99 piece is handpicked from our best-selling designs and meets the same quality standards as our regular collection — anti-tarnish, waterproof, and beautifully packaged. Limited stock, refreshed regularly.</p>
            </div>
            <div className="space-y-4 p-8 bg-white border border-[var(--luxury-border)]">
              <h3 className="font-bold text-lg tracking-widest uppercase text-[var(--luxury-brown)]">Gift Hampers</h3>
              <p>Curated gift sets designed for every occasion — birthdays, anniversaries, festivals, or just because. Our hampers combine complementary pieces from across our collections, presented in elegant packaging ready for gifting. Each hamper includes a personalized note option and can be shipped directly to your loved one anywhere in India.</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Why Choose SatvaStones — SEO Section */}
      <div className="bg-[var(--luxury-brown)]/5 py-24 lg:py-32 my-32">
        <div className="container-premium max-w-4xl text-center">
          <span className="label-sm text-[var(--luxury-gold)] mb-6 block">Why Choose Us</span>
          <h2 className="heading-section text-[var(--luxury-brown)] mb-16 italic">The SatvaStones Difference</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
            <div className="p-8 bg-white border border-[var(--luxury-border)]">
              <h3 className="font-bold text-sm tracking-widest uppercase text-[var(--luxury-brown)] mb-4">100% Anti-Tarnish</h3>
              <p className="font-serif text-[var(--luxury-brown)]/70 leading-relaxed">All our jewelry is treated with a specialized anti-tarnish coating that prevents oxidation, discolouration, and green fingers. Your pieces stay brilliant for years with minimal care.</p>
            </div>
            <div className="p-8 bg-white border border-[var(--luxury-border)]">
              <h3 className="font-bold text-sm tracking-widest uppercase text-[var(--luxury-brown)] mb-4">Waterproof Design</h3>
              <p className="font-serif text-[var(--luxury-brown)]/70 leading-relaxed">Unlike ordinary fashion jewelry that dulls on contact with water, SatvaStones pieces are engineered to withstand moisture. Wear them in the rain, at the gym, or while washing your hands.</p>
            </div>
            <div className="p-8 bg-white border border-[var(--luxury-border)]">
              <h3 className="font-bold text-sm tracking-widest uppercase text-[var(--luxury-brown)] mb-4">Free Shipping Over ₹399</h3>
              <p className="font-serif text-[var(--luxury-brown)]/70 leading-relaxed">Enjoy free delivery on all prepaid orders above ₹399 across India. We ship via trusted courier partners with real-time tracking and full insurance.</p>
            </div>
            <div className="p-8 bg-white border border-[var(--luxury-border)]">
              <h3 className="font-bold text-sm tracking-widest uppercase text-[var(--luxury-brown)] mb-4">Secure Payments</h3>
              <p className="font-serif text-[var(--luxury-brown)]/70 leading-relaxed">Shop with confidence using UPI (Google Pay, PhonePe, Paytm), credit/debit cards, net banking, or Cash on Delivery. All payments are processed securely via Razorpay.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container-premium text-center my-24">
        <h2 className="heading-section text-[var(--luxury-brown)] mb-8 italic">Experience The Edit</h2>
        <p className="font-serif text-lg text-[var(--luxury-brown)]/70 max-w-2xl mx-auto mb-12 leading-relaxed">
          Whether you are looking for everyday Korean aesthetic earrings, a show-stopping gold necklace for a special occasion, or a thoughtful gift for someone you love — SatvaStones has the perfect piece waiting for you. Explore our full collection of anti-tarnish, waterproof jewelry curated for the modern woman.
        </p>
        <Link href="/products" className="inline-flex items-center gap-4 border-b-2 border-[var(--luxury-brown)] pb-2 label-md text-[var(--luxury-brown)] group hover:text-[var(--luxury-gold)] hover:border-[var(--luxury-gold)] transition-colors font-bold tracking-[0.2em]">
          EXPLORE THE COLLECTION <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
        </Link>
      </div>

    </div>
  );
}
