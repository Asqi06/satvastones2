import Link from "next/link";
import { Globe, Share2, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[var(--luxury-brown)] pt-24 lg:pt-36 pb-12 w-full text-white overflow-hidden">
      <div className="container-premium px-8 lg:px-16">
        {/* Main Footer Grid */}
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 mb-24 lg:mb-32">
          
          {/* Brand Col */}
          <div className="w-full lg:w-[40%] flex flex-col items-start gap-8">
            <Link href="/" className="mb-2 lg:mb-4 block group">
              <span className="font-serif text-[2.5rem] tracking-[0.2em] uppercase font-light text-white group-hover:text-[var(--luxury-gold)] transition-colors">
                SATVASTONES
              </span>
              <span className="block label-md text-[var(--luxury-gold)] italic mt-2 opacity-80 animate-fade-in">
                Boutique Artifacts
              </span>
            </Link>
            
            <p className="text-white/60 label-md leading-[2] tracking-widest uppercase italic max-w-sm">
              Handcrafting timeless artifacts that bridge the gap between contemporary Western minimalism and heritage Korean aesthetics.
            </p>
            
            <div className="flex gap-8 mt-6">
              {[Globe, Share2].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center text-white/50 hover:border-[var(--luxury-gold)] hover:text-[var(--luxury-gold)] transition-all ease-in-out duration-300">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Cols */}
          <div className="w-full lg:w-[60%] grid grid-cols-1 sm:grid-cols-3 gap-12 lg:gap-16 pt-4">
            {/* Quick Links */}
            <div>
              <h3 className="label-sm text-[var(--luxury-gold)] mb-8 italic">Archives</h3>
              <ul className="space-y-6">
                <li><Link href="/products" className="label-md text-white/50 hover:text-white transition-colors">All Collections</Link></li>
                <li><Link href="/products?style=KOREAN" className="label-md text-white/50 hover:text-white transition-colors">Seoul Minimal</Link></li>
                <li><Link href="/products?style=WESTERN" className="label-md text-white/50 hover:text-white transition-colors">Parisian Chic</Link></li>
              </ul>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="label-sm text-[var(--luxury-gold)] mb-8 italic">Navigation</h3>
              <ul className="space-y-6">
                <li><Link href="/account" className="label-md text-white/50 hover:text-white transition-colors">Account Console</Link></li>
                <li><Link href="/shipping" className="label-md text-white/50 hover:text-white transition-colors">Transit Policy</Link></li>
                <li><Link href="/about" className="label-md text-white/50 hover:text-white transition-colors">Our Story</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="label-sm text-[var(--luxury-gold)] mb-8 italic">Contact Info</h3>
              <ul className="space-y-8">
                <li className="flex items-start gap-4 group cursor-default">
                  <MapPin className="w-[18px] h-[18px] text-[var(--luxury-gold)] group-hover:text-white transition-colors flex-shrink-0 mt-0.5" />
                  <span className="label-md text-white/50 leading-relaxed italic group-hover:text-white transition-colors">
                    Mumbai Headquarters,<br />Bharat 400001
                  </span>
                </li>
                <li className="flex items-center gap-4 group cursor-default">
                  <Mail className="w-[18px] h-[18px] text-[var(--luxury-gold)] group-hover:text-white transition-colors flex-shrink-0" />
                  <span className="label-md text-white/50 italic underline underline-offset-8 decoration-white/10 truncate group-hover:text-white group-hover:decoration-[var(--luxury-gold)] transition-all">
                    curation@satvastones.com
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-white/10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
            <p className="label-sm text-white/30 italic">
              &copy; {new Date().getFullYear()} SATVASTONES. All works archived. Designed for the Enlightened.
            </p>
            
            <div className="flex items-center gap-8">
              <Link href="/privacy" className="label-md text-white/40 hover:text-white transition-colors italic underline underline-offset-[6px]">
                Privacy Rights
              </Link>
              <Link href="/terms" className="label-md text-white/40 hover:text-white transition-colors italic underline underline-offset-[6px]">
                Terms of Protocol
              </Link>
            </div>
            
             <div className="flex items-center gap-3 grayscale opacity-30 hover:opacity-100 transition-opacity duration-[2000ms]">
               {[...Array(5)].map((_, i) => (
                <div key={i} className="w-10 h-6 bg-white/20 rounded-sm"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
