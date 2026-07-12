"use client";

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, User, Menu, X, Phone, Mail, MapPin, Shield, Truck, RotateCcw, Award, Star, Lock, MessageSquare, ChevronDown, ChevronRight } from "lucide-react";

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  currentUser: any;
  onLogout: () => void;
}

export default function Header({ cartCount, wishlistCount, currentUser, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
    }
  };

  const isAdmin = false;

  const trustBadges = [
    { icon: Award, label: "BIS Hallmark\nCertified", desc: "100% Hallmarked\nJewellery" },
    { icon: Shield, label: "Lifetime\nExchange", desc: "Exchange Anytime\nat Full Value" },
    { icon: Truck, label: "Free Shipping\n₹1,999+", desc: "Insured Delivery\nPan India" },
    { icon: RotateCcw, label: "30 Days\nReturn", desc: "Hassle-Free\nReturns Policy" },
    { icon: Lock, label: "Secure\nPayment", desc: "100% Safe &\nEncrypted" },
    { icon: MessageSquare, label: "24/7\nSupport", desc: "Call/WhatsApp\n+91-90167-03180" },
  ];

  const policyLinks = [
    { label: "Shipping Policy", href: "/shipping", icon: Truck },
    { label: "Return & Exchange", href: "/returns", icon: RotateCcw },
    { label: "Warranty & Repair", href: "/warranty", icon: Shield },
    { label: "Cash on Delivery", href: "/cod", icon: Lock },
    { label: "Quality Certificate", href: "/certifications", icon: Award },
    { label: "Grievance Redressal", href: "/grievance", icon: MessageSquare },
  ];

  const navCategories = [
    { label: "Gold Jewellery", href: "/shop/gold", sub: ["Rings", "Earrings", "Necklaces", "Bangles", "Chains", "Pendants", "Mangalsutras"] },
    { label: "Diamond Jewellery", href: "/shop/diamond", sub: ["Rings", "Earrings", "Necklaces", "Bracelets", "Pendants", "Nose Pins"] },
    { label: "Silver Jewellery", href: "/shop/silver", sub: ["Rings", "Earrings", "Necklaces", "Anklets", "Toe Rings", "Pooja Items"] },
    { label: "Gemstone Jewellery", href: "/shop/gemstone", sub: ["Ruby", "Emerald", "Sapphire", "Pearl", "Coral", "Yellow Sapphire"] },
    { label: "Bridal Jewellery", href: "/shop/bridal", sub: ["Necklace Sets", "Maang Tikka", "Nath", "Waist Belt", "Armlet", "Bridal Bangles"] },
    { label: "Men's Jewellery", href: "/shop/mens", sub: ["Rings", "Chains", "Bracelets", "Kadas", "Cufflinks", "Tie Pins"] },
  ];

  const popularSearches = ["Gold Rings", "Diamond Necklaces", "Bridal Sets", "Silver Bangles", "Gemstone Rings", "Mangalsutra", "Daily Wear", "Men's Kada"];

  return (
    <>
      {/* TOP TRUST BAR */}
      <div className="bg-[#1a1612] text-white relative z-[101]">
        <div className="container-premium px-4 py-3 border-b border-white/10 hidden md:flex">
          <div className="flex flex-wrap items-center justify-between gap-4 text-[11px] font-medium uppercase tracking-wider">
            <div className="flex items-center gap-6 text-white/70">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#C5A059]" />
                <a href="tel:+919876543210" className="hover:text-[#C5A059] transition-colors">+91 98765 43210</a>
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                <a href="mailto:curation@satvastones.com" className="hover:text-[#C5A059] transition-colors">curation@satvastones.com</a>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>Mumbai HQ • Delhi • Bangalore • Chennai • Kolkata</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-white/60">
              <span className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> BIS Hallmark</span>
              <span className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> Lifetime Exchange</span>
              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Free Shipping ₹1999+</span>
              <span className="flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> 30 Days Return</span>
              <span className="flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> 100% Secure</span>
            </div>
          </div>
        </div>

        <div className="container-premium px-4 py-2 border-b border-white/10 md:hidden">
          <div className="flex items-center justify-between gap-2 text-[10px] font-medium uppercase tracking-wider overflow-x-auto">
            <div className="flex items-center gap-2 text-white/70 whitespace-nowrap">
              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-[#C5A059]" /><a href="tel:+919876543210" className="hover:text-[#C5A059]">+91 98765 43210</a></span>
              <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-[#C5A059]" /><a href="mailto:curation@satvastones.com" className="hover:text-[#C5A059]">curation@satvastones.com</a></span>
            </div>
            <div className="flex items-center gap-2 text-white/60 whitespace-nowrap">
              <span className="flex items-center gap-1"><Award className="w-3 h-3" /> BIS</span>
              <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Exchange</span>
              <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Free Ship</span>
            </div>
          </div>
        </div>

        <div className="bg-[#C5A059] text-[#1a1612] py-2 overflow-hidden">
          <div className="flex animate-marquee pause-on-hover">
            <div className="flex items-center gap-8 whitespace-nowrap pl-8 text-sm font-semibold tracking-wide">
              <span>✦ 100% BIS HALLMARKED JEWELLERY • EVERY PIECE CERTIFIED ✦</span>
              <span>✦ LIFETIME EXCHANGE GUARANTEE • EXCHANGE AT FULL VALUE ANYTIME ✦</span>
              <span>✦ FREE INSURED SHIPPING ON ORDERS ABOVE ₹1,999 • PAN INDIA ✦</span>
              <span>✦ 30-DAY HASSLE-FREE RETURNS • NO QUESTIONS ASKED ✦</span>
              <span>✦ COD AVAILABLE • SECURE PAYMENT • 24/7 CUSTOMER SUPPORT ✦</span>
              <span>✦ HANDCRAFTED IN INDIA • SUPPORTING LOCAL ARTISANS SINCE 2010 ✦</span>
            </div>
            <div className="flex items-center gap-8 whitespace-nowrap pl-8 text-sm font-semibold tracking-wide">
              <span>✦ 100% BIS HALLMARKED JEWELLERY • EVERY PIECE CERTIFIED ✦</span>
              <span>✦ LIFETIME EXCHANGE GUARANTEE • EXCHANGE AT FULL VALUE ANYTIME ✦</span>
              <span>✦ FREE INSURED SHIPPING ON ORDERS ABOVE ₹1,999 • PAN INDIA ✦</span>
              <span>✦ 30-DAY HASSLE-FREE RETURNS • NO QUESTIONS ASKED ✦</span>
              <span>✦ COD AVAILABLE • SECURE PAYMENT • 24/7 CUSTOMER SUPPORT ✦</span>
              <span>✦ HANDCRAFTED IN INDIA • SUPPORTING LOCAL ARTISANS SINCE 2010 ✦</span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <header className={`fixed w-full transition-all duration-300 z-[100] ${isScrolled ? "top-0 bg-white border-b border-[#E8E2D9] shadow-md" : "top-[48px] md:top-[56px] bg-white/95 backdrop-blur-sm border-b border-transparent"}`}>
        
        <div className="hidden lg:block bg-[#FAF9F6] border-b border-[#E8E2D9] py-2">
          <div className="container-premium px-4">
            <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-medium uppercase tracking-wider text-[#241A14]/70">
              {policyLinks.map((policy) => (
                <Link key={policy.label} to={policy.href} className="flex items-center gap-1.5 hover:text-[#C5A059] transition-colors group">
                  <policy.icon className="w-3.5 h-3.5 text-[#C5A059]/80 group-hover:text-[#C5A059] transition-colors" />
                  <span>{policy.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="container-premium px-4 h-[72px] lg:h-[80px] flex items-center justify-between relative">
          
          <div className="flex items-center gap-6 lg:gap-8 w-full lg:w-auto">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#241A14]"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <Link to="/" className="flex flex-col items-start mr-4 lg:mr-6" aria-label="Satvastones Home">
              <span className="text-lg lg:text-xl font-serif text-[#241A14] tracking-[0.15em] uppercase font-semibold leading-tight">
                SATVASTONES
              </span>
              <span className="text-[9px] lg:text-[10px] text-[#C5A059] italic tracking-[0.3em] uppercase mt-[-2px]">
                Certified Jewellers Since 2010
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main categories">
              {navCategories.map((cat, idx) => (
                <MegaMenu key={cat.label} category={cat} index={idx} />
              ))}
            </nav>
          </div>

          <div className="hidden lg:flex items-center gap-6 px-4">
            {trustBadges.slice(0, 4).map((badge, i) => (
              <div key={i} className="flex items-center gap-2.5 py-1.5 px-3 bg-[#FAF9F6] rounded-full border border-[#E8E2D9] hover:border-[#C5A059]/50 transition-all duration-300 group">
                <div className="w-7 h-7 rounded-full bg-[#1a1612]/5 flex items-center justify-center group-hover:bg-[#C5A059]/10 transition-colors">
                  <badge.icon className="w-3.5 h-3.5 text-[#241A14] group-hover:text-[#C5A059] transition-colors" />
                </div>
                <div className="text-left leading-tight">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#241A14] block">{badge.label.split('\n')[0]}</span>
                  <span className="text-[9px] text-[#241A14]/60 leading-none">{badge.desc.split('\n')[0]}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 lg:gap-4 w-full lg:w-auto justify-end">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-[#241A14]/70 hover:text-[#C5A059] transition-colors relative" aria-label="Search">
              <Search className="w-5 h-5 lg:w-5.5 lg:h-5.5" />
            </button>

            <Link to="/wishlist" className="p-2 text-[#241A14]/70 hover:text-[#C5A059] transition-colors relative hidden sm:block" aria-label="Wishlist">
              <Heart className="w-5 h-5 lg:w-5.5 lg:h-5.5" />
              {wishlistCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#C5A059] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{wishlistCount > 9 ? '9+' : wishlistCount}</span>}
            </Link>

            <Link to="/cart" className="p-2 text-[#241A14]/70 hover:text-[#C5A059] transition-colors relative" aria-label="Shopping bag">
              <ShoppingBag className="w-5 h-5 lg:w-5.5 lg:h-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#241A14] text-white text-[10px] font-bold rounded-full flex items-center justify-center">{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </Link>

            <div className="relative hidden sm:block">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="p-2 text-[#241A14]/70 hover:text-[#C5A059] transition-colors flex items-center gap-1.5 group" aria-label="Account">
                <User className="w-5 h-5 lg:w-5.5 lg:h-5.5" />
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#241A14]/60 group-hover:text-[#241A14] hidden lg:inline">Account</span>
              </button>
              {userMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-[#E8E2D9] shadow-xl z-50 py-2 rounded-lg animate-fade-in" onMouseLeave={() => setUserMenuOpen(false)}>
                  {currentUser ? (
                    <div className="px-4 py-3 border-b border-[#E8E2D9] mb-2">
                      <p className="text-sm font-medium text-[#241A14] truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-[#241A14]/40 truncate">{currentUser.email}</p>
                    </div>
                  ) : (
                    <div className="px-4 py-3 border-b border-[#E8E2D9] mb-2 text-center">
                      <p className="text-sm font-medium text-[#241A14]">Welcome to Satvastones</p>
                      <p className="text-[11px] text-[#241A14]/40">Sign in to access your account</p>
                    </div>
                  )}
                  <Link to="/account" className="px-4 py-2.5 text-sm text-[#241A14]/70 hover:text-[#C5A059] hover:bg-[#FAF9F6] flex items-center gap-2 transition-colors"><User className="w-4 h-4" /> My Profile</Link>
                  <Link to="/account/orders" className="px-4 py-2.5 text-sm text-[#241A14]/70 hover:text-[#C5A059] hover:bg-[#FAF9F6] flex items-center gap-2 transition-colors"><ShoppingBag className="w-4 h-4" /> My Orders</Link>
                  <Link to="/wishlist" className="px-4 py-2.5 text-sm text-[#241A14]/70 hover:text-[#C5A059] hover:bg-[#FAF9F6] flex items-center gap-2 transition-colors"><Heart className="w-4 h-4" /> Wishlist ({wishlistCount})</Link>
                  <Link to="/account/addresses" className="px-4 py-2.5 text-sm text-[#241A14]/70 hover:text-[#C5A059] hover:bg-[#FAF9F6] flex items-center gap-2 transition-colors"><MapPin className="w-4 h-4" /> Addresses</Link>
                  {isAdmin && (
                    <Link to="/aniadmin" className="px-4 py-2.5 text-sm text-[#C5A059] hover:bg-[#FFFEFB] flex items-center gap-2 transition-colors"><Award className="w-4 h-4" /> Admin Dashboard</Link>
                  )}
                  <hr className="my-2 border-[#E8E2D9]" />
                  <button onClick={onLogout} className="w-full px-4 py-2.5 text-sm text-red-700 hover:bg-red-50 text-left flex items-center gap-2 transition-colors"><MessageSquare className="w-4 h-4" /> Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:hidden bg-white border-t border-[#E8E2D9]">
          <div className="container-premium px-4 py-3 overflow-x-auto">
            <nav className="flex gap-3 whitespace-nowrap pb-2" role="navigation" aria-label="Categories">
              {navCategories.map((cat) => (
                <Link key={cat.label} to={cat.href} className="px-4 py-2 bg-[#FAF9F6] text-[#241A14]/80 hover:text-[#C5A059] text-[11px] font-medium uppercase tracking-wider rounded-full border border-[#E8E2D9] whitespace-nowrap transition-colors">
                  {cat.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* FULLSCREEN SEARCH OVERLAY */}
      {searchOpen && (
        <div className="fixed inset-0 z-[150] bg-white animate-fade-in flex flex-col">
          <div className="container-premium px-4 py-6 flex items-center justify-between border-b border-[#E8E2D9]">
            <span className="font-serif text-xl text-[#241A14] tracking-[0.1em] uppercase">Search Satvastones</span>
            <button onClick={() => setSearchOpen(false)} className="p-2 text-[#241A14]/50 hover:text-[#241A14] transition-colors lg:hidden"><X className="w-6 h-6" /></button>
          </div>
          <div className="flex-1 flex items-start justify-center pt-12 px-4">
            <form onSubmit={handleSearch} className="w-full max-w-4xl">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#241A14]/30 w-6 h-6" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for jewellery, designs, collections, gemstones..."
                  autoFocus
                  className="w-full pl-14 pr-16 py-5 bg-[#FAF9F6] border-2 border-[#E8E2D9] text-[#241A14] text-lg font-medium tracking-wide placeholder:text-[#241A14]/20 focus:outline-none focus:border-[#C5A059] focus:bg-white transition-all"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-[#E8E2D9] rounded-full text-[#241A14]/50 transition-colors lg:hidden"><X className="w-5 h-5" /></button>
                <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:block px-6 py-2.5 bg-[#241A14] text-white text-sm font-medium uppercase tracking-wider hover:bg-[#1a1612] transition-colors">Search</button>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#241A14]/50">Popular searches:</span>
                {popularSearches.map((term) => (
                  <Link key={term} to={`/shop?search=${encodeURIComponent(term)}`} className="px-4 py-2 bg-white border border-[#E8E2D9] text-[12px] text-[#241A14]/70 hover:border-[#C5A059] hover:text-[#C5A059] rounded-full transition-all" onClick={() => setSearchOpen(false)}>{term}</Link>
                ))}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-white animate-fade-in flex flex-col">
          <div className="flex items-center justify-between p-4 lg:p-6 border-b border-[#E8E2D9]">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="font-serif tracking-[0.15em] text-[#241A14] text-xl lg:text-2xl">SATVASTONES</Link>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[#241A14]/70 hover:text-[#241A14] transition-colors"><X className="w-7 h-7 lg:w-8 lg:h-8" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="mb-6 p-4 bg-[#FAF9F6] rounded-lg border border-[#E8E2D9]">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#241A14]/50 mb-3">Our Guarantees</h3>
              <div className="grid grid-cols-3 gap-3">
                {trustBadges.map((badge, i) => (
                  <div key={i} className="text-center p-3 bg-white rounded-lg border border-[#E8E2D9]">
                    <div className="w-10 h-10 mx-auto mb-2 bg-[#1a1612]/5 rounded-full flex items-center justify-center">
                      <badge.icon className="w-5 h-5 text-[#241A14]" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#241A14] leading-tight">{badge.label.split('\n')[0]}</p>
                    <p className="text-[9px] text-[#241A14]/50 leading-tight">{badge.desc.split('\n')[0]}</p>
                  </div>
                ))}
              </div>
            </div>

            <nav className="space-y-1 mb-6">
              {navCategories.map((cat) => (
                <MobileCategoryMenu key={cat.label} category={cat} onClose={() => setMobileMenuOpen(false)} />
              ))}
            </nav>

            <div className="border-t border-[#E8E2D9] pt-6 mb-6">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#241A14]/50 mb-4">Policies & Support</h3>
              <div className="grid grid-cols-2 gap-3">
                {policyLinks.map((policy) => (
                  <Link key={policy.label} to={policy.href} className="flex items-center gap-2 p-3 bg-[#FAF9F6] rounded-lg border border-[#E8E2D9] hover:border-[#C5A059]/50 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <policy.icon className="w-4 h-4 text-[#C5A059]" />
                    <span className="text-[11px] font-medium text-[#241A14] leading-tight">{policy.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-[#E8E2D9] pt-6">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#241A14]/50 mb-4">Contact Us</h3>
              <div className="space-y-3 text-sm text-[#241A14]/70">
                <a href="tel:+919016703180" className="flex items-center gap-3 p-3 bg-[#FAF9F6] rounded-lg hover:border-[#C5A059]/50 border border-[#E8E2D9] transition-colors"><Phone className="w-5 h-5 text-[#C5A059]" /><span>Call / WhatsApp: +91 90167 03180</span></a>
                <a href="mailto:support@satvastones.in" className="flex items-center gap-3 p-3 bg-[#FAF9F6] rounded-lg hover:border-[#C5A059]/50 border border-[#E8E2D9] transition-colors"><Mail className="w-5 h-5 text-[#C5A059]" /><span>Email: support@satvastones.in</span></a>
                <div className="flex items-start gap-3 p-3 bg-[#FAF9F6] rounded-lg border border-[#E8E2D9]"><MapPin className="w-5 h-5 text-[#C5A059] mt-0.5 flex-shrink-0" /><span>Mumbai HQ: 123 Jewellery Street, Zaveri Bazaar, Mumbai 400002<br />Delhi • Bangalore • Chennai • Kolkata</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MegaMenu({ category, index }: { category: { label: string; href: string; sub: string[] }; index: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref} onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-[#241A14]/80 hover:text-[#C5A059] transition-colors relative group flex items-center gap-1.5"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {category.label}
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-[720px] bg-white border border-[#E8E2D9] shadow-2xl rounded-lg overflow-hidden z-50 animate-fade-in">
          <div className="p-6 lg:p-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {category.sub.map((sub, si) => (
                <Link key={sub} to={`${category.href}?sub=${sub.toLowerCase()}`} className="group flex flex-col gap-2 p-4 bg-[#FAF9F6] rounded-lg border border-[#E8E2D9] hover:border-[#C5A059]/50 hover:bg-white transition-all duration-300">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#241A14]">{sub}</span>
                  <span className="text-[10px] text-[#241A14]/50 group-hover:text-[#C5A059] transition-colors">View Collection →</span>
                </Link>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-[#E8E2D9] grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-3 bg-[#FFFEFB] rounded-lg border border-[#C5A059]/20">
                <Award className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#241A14]">BIS Hallmarked</p><p className="text-[9px] text-[#241A14]/50">Every piece certified</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#FFFEFB] rounded-lg border border-[#C5A059]/20">
                <Shield className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#241A14]">Lifetime Exchange</p><p className="text-[9px] text-[#241A14]/50">Full value guarantee</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#FFFEFB] rounded-lg border border-[#C5A059]/20">
                <Truck className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#241A14]">Free Shipping</p><p className="text-[9px] text-[#241A14]/50">On orders ₹1,999+</p></div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#FFFEFB] rounded-lg border border-[#C5A059]/20">
                <RotateCcw className="w-5 h-5 text-[#C5A059] flex-shrink-0" />
                <div><p className="text-[10px] font-bold uppercase tracking-wider text-[#241A14]">30-Day Returns</p><p className="text-[9px] text-[#241A14]/50">Hassle-free policy</p></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MobileCategoryMenu({ category, onClose }: { category: { label: string; href: string; sub: string[] }; onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[#E8E2D9] rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 flex items-center justify-between bg-[#FAF9F6] hover:bg-white transition-colors text-left"
        aria-expanded={isOpen}
      >
        <span className="text-[12px] font-bold uppercase tracking-wider text-[#241A14]">{category.label}</span>
        <ChevronDown className={`w-5 h-5 text-[#241A14]/50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-4 py-4 space-y-2 bg-white animate-slide-down">
          {category.sub.map((sub) => (
            <Link key={sub} to={`${category.href}?sub=${sub.toLowerCase()}`} className="flex items-center justify-between px-3 py-2.5 text-[12px] text-[#241A14]/70 hover:text-[#C5A059] hover:bg-[#FAF9F6] rounded-lg transition-colors" onClick={onClose}>
              <span>{sub}</span>
              <ChevronRight className="w-4 h-4 text-[#C5A059]/70" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}