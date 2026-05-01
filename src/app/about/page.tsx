import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Shield, Gem } from "lucide-react";

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
                    Bridging Western minimalist structure with intricate traditional artistry from the East.
                 </p>
              </div>
              
              <div className="text-center flex flex-col items-center group">
                 <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center mb-8 group-hover:border-[var(--luxury-gold)] transition-colors duration-500">
                    <Gem className="w-8 h-8 text-[var(--luxury-gold)] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" strokeWidth={1.5} />
                 </div>
                 <h3 className="label-md font-bold text-white mb-4 uppercase tracking-[0.2em]">Premium Materials</h3>
                 <p className="text-white/60 text-sm leading-relaxed max-w-xs font-serif italic">
                    We source only pristine, conflict-free metals and precious stones capable of passing generations.
                 </p>
              </div>

              <div className="text-center flex flex-col items-center group">
                 <div className="w-20 h-20 rounded-full border border-white/20 flex items-center justify-center mb-8 group-hover:border-[var(--luxury-gold)] transition-colors duration-500">
                    <Shield className="w-8 h-8 text-[var(--luxury-gold)] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" strokeWidth={1.5} />
                 </div>
                 <h3 className="label-md font-bold text-white mb-4 uppercase tracking-[0.2em]">Crafted For Life</h3>
                 <p className="text-white/60 text-sm leading-relaxed max-w-xs font-serif italic">
                    Every piece undergoes a rigorous 40-point quality assurance protocol before seeing the light.
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
                    alt="Ethical Sourcing"
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
             <Link href="/products" className="inline-flex items-center gap-4 border-b-2 border-[var(--luxury-brown)] pb-2 label-md text-[var(--luxury-brown)] group hover:text-[var(--luxury-gold)] hover:border-[var(--luxury-gold)] transition-colors font-bold tracking-[0.2em]">
                DISCOVER THE ARCHIVE <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
             </Link>
          </div>
        </div>
      </div>
      
    </div>
  );
}
