"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ShoppingBag, Heart, User, Menu, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/hooks/useCart";
import { useWishlistStore } from "@/hooks/useWishlist";

export default function Header() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.getItemCount());

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
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <>
      {/* Announcement Bar - Static Block at the top */}
      <div className="bg-[var(--luxury-brown)] py-[6px] overflow-hidden w-full relative z-[101]">
        <div className="flex animate-marquee pause-on-hover">
          <div className="flex items-center gap-12 whitespace-nowrap pl-12 text-[var(--luxury-gold)] label-sm">
            <span>✦ FINEST HANDCRAFTED GEMS FROM BHARAT FOR THE WORLD</span>
            <span>✦ COMPLIMENTARY DOMESTIC TRANSIT ABOVE ₹1999</span>
            <span>✦ LAUNCHING SOON: THE SEOUL ABSTRACT SERIES</span>
          </div>
          {/* Exact duplicate right adjacent for seamless looping */}
          <div className="flex items-center gap-12 whitespace-nowrap pl-12 text-[var(--luxury-gold)] label-sm">
             <span>✦ FINEST HANDCRAFTED GEMS FROM BHARAT FOR THE WORLD</span>
            <span>✦ COMPLIMENTARY DOMESTIC TRANSIT ABOVE ₹1999</span>
            <span>✦ LAUNCHING SOON: THE SEOUL ABSTRACT SERIES</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className={`fixed w-full transition-all duration-500 h-[70px] lg:h-[80px] z-[100] ${
        isScrolled 
          ? "top-0 bg-[var(--luxury-cream)] border-b border-[var(--luxury-border)] shadow-sm" 
          : "top-[36px] bg-transparent"
      }`}>
        <div className="container-premium h-full flex items-center justify-between">
          
          {/* Left Side: Navigation Links (Desktop) & Menu Toggle (Mobile) */}
          <div className="w-[30%] lg:w-[35%] flex justify-start items-center">
             <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-[var(--luxury-brown)]"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <nav className="hidden lg:flex items-center gap-8">
              {[
                { label: "SHOP", href: "/products" },
                { label: "GIFTS", href: "/products?category=gifts" },
                { label: "COLLECTIONS", href: "/products?category=collections" },
              ].map((item) => (
                <Link 
                  key={item.label}
                  href={item.href}
                  className="label-sm text-[var(--luxury-brown)]/80 hover:text-[var(--luxury-gold)] transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-[var(--luxury-gold)] transition-all ease-in-out duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Center Side: Logo */}
          <div className="w-[40%] lg:w-[30%] flex justify-center items-center">
            <Link href="/" className="flex flex-col items-center">
              <span className="text-xl lg:text-[1.75rem] font-serif text-[var(--luxury-brown)] tracking-[0.25em] lg:tracking-[0.35em] uppercase font-medium">
                SATVASTONES
              </span>
            </Link>
          </div>

          {/* Right Side: Utility Icons */}
          <div className="w-[30%] lg:w-[35%] flex justify-end items-center gap-1 sm:gap-3">
             <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 text-[var(--luxury-brown)] hover:text-[var(--luxury-gold)] transition-colors">
              <Search className="w-[18px] h-[18px] lg:w-5 lg:h-5" />
            </button>
            <Link href="/wishlist" className="p-2 text-[var(--luxury-brown)] hover:text-[var(--luxury-gold)] transition-colors relative hidden sm:block">
              <Heart className="w-[18px] h-[18px] lg:w-5 lg:h-5" />
              {wishlistCount > 0 && <span className="absolute top-[6px] right-[6px] w-[5px] h-[5px] bg-[var(--luxury-gold)] rounded-full"></span>}
            </Link>
            <Link href="/cart" className="p-2 text-[var(--luxury-brown)] hover:text-[var(--luxury-gold)] transition-colors relative">
              <ShoppingBag className="w-[18px] h-[18px] lg:w-5 lg:h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-[16px] h-[16px] bg-[var(--luxury-brown)] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)} 
                className="p-2 text-[var(--luxury-brown)] hover:text-[var(--luxury-gold)] transition-colors hidden sm:block"
              >
                <User className="w-[18px] h-[18px] lg:w-5 lg:h-5" />
              </button>
              
               {/* User Dropdown */}
               {userMenuOpen && (
                <div
                  className="absolute top-full right-0 mt-2 w-56 bg-white border border-[var(--luxury-border)] shadow-xl z-50 py-2"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  {session ? (
                    <div className="flex flex-col">
                      <div className="px-5 py-3 border-b border-[var(--luxury-border)] mb-1">
                        <p className="label-sm text-[var(--luxury-brown)] truncate leading-relaxed">{session.user?.name}</p>
                        <p className="text-[10px] text-[var(--luxury-brown)]/40 truncate">{session.user?.email}</p>
                      </div>
                      <Link href="/account" className="px-5 py-2 label-md text-[var(--luxury-brown)]/70 hover:text-[var(--luxury-gold)] transition-colors">My Profile</Link>
                      {isAdmin && (
                        <Link href="/admin" className="px-5 py-2 label-md text-[var(--luxury-gold)] hover:bg-[var(--luxury-accent)] transition-colors">Admin Dashboard</Link>
                      )}
                      <button onClick={() => signOut()} className="px-5 py-2 label-md text-red-900/70 hover:bg-red-50 text-left transition-colors mt-1">Sign Out</button>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <Link href="/auth/login" className="px-5 py-3 label-md text-[var(--luxury-brown)]/70 hover:bg-[var(--luxury-accent)] transition-colors">Login</Link>
                      <Link href="/auth/register" className="px-5 py-3 label-md text-[var(--luxury-brown)] hover:text-white hover:bg-[var(--luxury-brown)] transition-colors">Register</Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fullscreen Search Overlay */}
        {searchOpen && (
          <div className="fixed inset-0 top-[100px] bg-[var(--luxury-cream)]/98 backdrop-blur-md z-40 flex items-start justify-center pt-24 animate-fade-in px-4">
            <form onSubmit={handleSearch} className="w-full max-w-3xl relative">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-[var(--luxury-brown)]/30 w-6 h-6" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH ARCHIVES..."
                autoFocus
                className="w-full pl-12 pr-16 py-6 bg-transparent border-b-2 border-[var(--luxury-brown)]/10 text-[var(--luxury-brown)] text-xl font-sans tracking-widest placeholder:text-[var(--luxury-brown)]/20 focus:outline-none focus:border-[var(--luxury-gold)] transition-colors"
              />
              <button 
                type="button" 
                onClick={() => setSearchOpen(false)} 
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 hover:bg-[var(--luxury-accent)] rounded-full text-[var(--luxury-brown)] transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </form>
          </div>
        )}
      </header>

       {/* Mobile Full Screen Menu */}
       {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] bg-[var(--luxury-cream)] animate-fade-in flex flex-col">
          <div className="flex items-center justify-between p-6">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="font-serif tracking-[0.2em] text-[var(--luxury-brown)] text-xl">
              SATVASTONES
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-[var(--luxury-brown)]">
              <X className="w-8 h-8" />
            </button>
          </div>
          <div className="flex flex-col justify-center items-center flex-1 gap-10">
             {["SHOP", "GIFTS", "COLLECTIONS", "OUR STORY", "ACCOUNT"].map((item) => (
              <Link
                key={item}
                href={item === "OUR STORY" ? "/about" : item === "ACCOUNT" ? "/account" : "/products"}
                className="font-serif text-3xl italic text-[var(--luxury-brown)] tracking-wider hover:text-[var(--luxury-gold)] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
