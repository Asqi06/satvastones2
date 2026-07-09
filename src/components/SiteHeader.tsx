import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function SiteHeader({
  cartCount,
  wishlistCount,
  currentUser,
  onLogout,
}: {
  cartCount: number;
  wishlistCount: number;
  currentUser: any;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(Array.isArray(data) ? data : data.products || []);
        }
      } catch { /* silent */ }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setSearchFocused(false);
      setSearchQuery('');
    }
  };

  const selectProduct = (p: any) => {
    const slug = p.slug || p._id || p.id;
    navigate(`/product/${slug}`);
    setSearchFocused(false);
    setSearchQuery('');
  };

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop All', to: '/shop' },
    { label: 'Earrings', to: '/shop/earrings' },
    { label: 'Necklaces', to: '/shop/necklaces' },
    { label: 'Rings', to: '/shop/rings' },
    { label: 'Bracelets', to: '/shop/bracelets' },
  ];

  const popularSearches = ['Earrings', 'Rings', 'Necklace', 'Korean', 'Under ₹500'];

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-brown text-cream text-center text-[11px] py-2.5 px-4 font-medium tracking-wide">
        Free Shipping above ₹399 • COD Available • Easy Returns
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 w-full z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'
        }`}
      >
        <div className="container-site">
          <div className="flex items-center justify-between h-16 lg:h-20 gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-brown hover:text-gold transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className="text-sm font-medium text-brown-light hover:text-brown transition-colors tracking-wide"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <span className="font-display text-2xl lg:text-3xl font-bold text-brown tracking-tight">
                Satva<span className="text-gold">Stones</span>
              </span>
            </Link>

            {/* Right Section: Search + Icons */}
            <div className="flex items-center gap-1 lg:gap-3">
              {/* Search Bar - Desktop */}
              <div ref={searchRef} className="hidden lg:relative lg:flex items-center">
                <form onSubmit={handleSearchSubmit} className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-lighter" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setSearchFocused(true)}
                    placeholder="Search jewellery..."
                    className="w-48 xl:w-64 pl-9 pr-3 py-2 bg-cream border border-border-light rounded-full text-sm text-brown placeholder:text-brown-lighter focus:outline-none focus:border-gold focus:bg-white transition-all"
                  />
                </form>
                {/* Auto-suggest dropdown */}
                {searchFocused && searchQuery.trim() && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border-light rounded-xl shadow-lg z-50 py-2 animate-slideDown">
                    {searchResults.length > 0 ? (
                      searchResults.map((p: any) => (
                        <button
                          key={p._id || p.id}
                          onClick={() => selectProduct(p)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-cream transition-colors text-left"
                        >
                          <div className="w-10 h-12 rounded-lg bg-cream overflow-hidden shrink-0">
                            <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-brown truncate">{p.title}</p>
                            <p className="text-xs text-gold font-semibold">₹{p.price}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-sm text-brown-lighter">No results found</p>
                        <button
                          onClick={handleSearchSubmit}
                          className="mt-2 text-xs text-gold font-medium hover:underline"
                        >
                          Search all products &rarr;
                        </button>
                      </div>
                    )}
                    <div className="border-t border-border-light mt-1 pt-2 px-4">
                      <p className="text-[10px] text-brown-lighter uppercase tracking-wider mb-1.5">Popular</p>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((s) => (
                          <button
                            key={s}
                            onClick={() => { setSearchQuery(s); navigate(`/shop?q=${encodeURIComponent(s)}`); setSearchFocused(false); }}
                            className="text-xs text-brown-light hover:text-brown bg-cream hover:bg-gold-light px-3 py-1 rounded-full transition-colors"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={() => {
                  setSearchFocused(true);
                  setTimeout(() => {
                    const input = document.getElementById('mobile-search-input');
                    if (input) input.focus();
                  }, 100);
                }}
                className="lg:hidden p-2 text-brown hover:text-gold transition-colors"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist */}
              <Link to="/wishlist" className="p-2 text-brown hover:text-gold transition-colors relative hidden sm:block">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose rounded-full" />
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="p-2 text-brown hover:text-gold transition-colors relative">
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2 text-brown hover:text-gold transition-colors"
                  aria-label="Account"
                >
                  <User className="w-5 h-5" />
                </button>
                {userMenuOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-56 bg-white border border-border-light rounded-xl shadow-lg z-50 py-2 animate-scaleIn"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    {currentUser ? (
                      <>
                        <div className="px-4 py-3 border-b border-border-light mb-1">
                          <p className="text-sm font-semibold text-brown">{currentUser.name}</p>
                          <p className="text-xs text-brown-lighter">{currentUser.email}</p>
                        </div>
                        <Link to="/account" className="block px-4 py-2.5 text-sm text-brown hover:bg-cream transition-colors" onClick={() => setUserMenuOpen(false)}>My Account</Link>
                        <Link to="/wishlist" className="block px-4 py-2.5 text-sm text-brown hover:bg-cream transition-colors" onClick={() => setUserMenuOpen(false)}>Wishlist</Link>
                        <button onClick={() => { onLogout(); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red hover:bg-red-light transition-colors">Sign Out</button>
                      </>
                    ) : (
                      <Link to="/account" className="block px-4 py-2.5 text-sm text-brown hover:bg-cream transition-colors" onClick={() => setUserMenuOpen(false)}>Login / Register</Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      {searchFocused && (
        <div className="fixed inset-0 z-[60] bg-white lg:hidden animate-fadeIn">
          <div className="p-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown-lighter" />
                <input
                  id="mobile-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jewellery..."
                  autoFocus
                  className="w-full pl-9 pr-3 py-3 bg-cream border border-border-light rounded-full text-sm text-brown focus:outline-none focus:border-gold"
                />
              </div>
              <button type="button" onClick={() => { setSearchFocused(false); setSearchQuery(''); }} className="text-sm text-brown-light font-medium">Cancel</button>
            </form>
            <div className="mt-4 space-y-1">
              {searchResults.map((p: any) => (
                <button key={p._id || p.id} onClick={() => selectProduct(p)} className="w-full flex items-center gap-3 px-2 py-2.5 hover:bg-cream rounded-xl transition-colors text-left">
                  <div className="w-12 h-14 rounded-lg bg-cream overflow-hidden shrink-0">
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-brown">{p.title}</p>
                    <p className="text-xs text-gold font-semibold">₹{p.price}</p>
                  </div>
                </button>
              ))}
              <div className="pt-3 mt-3 border-t border-border-light">
                <p className="text-[10px] text-brown-lighter uppercase tracking-wider mb-2">Popular Searches</p>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((s) => (
                    <button key={s} onClick={() => { setSearchQuery(s); navigate(`/shop?q=${encodeURIComponent(s)}`); setSearchFocused(false); }} className="text-xs text-brown-light bg-cream px-3 py-1.5 rounded-full">{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white animate-fadeIn lg:hidden">
          <div className="flex items-center justify-between p-4 border-b border-border-light">
            <span className="font-display text-xl font-bold text-brown">SatvaStones</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-brown hover:text-gold">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col p-4 gap-1 overflow-y-auto max-h-[calc(100vh-80px)]">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="py-3.5 px-3 text-brown hover:text-gold hover:bg-cream rounded-xl transition-colors text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-border-light space-y-2">
              <Link to="/wishlist" className="flex items-center gap-3 py-3.5 px-3 text-brown hover:bg-cream rounded-xl transition-colors text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>
                <Heart className="w-4 h-4" /> Wishlist
              </Link>
              <Link to="/account" className="block w-full text-center bg-gold text-white py-3.5 rounded-full text-sm font-semibold hover:bg-gold-dark transition-colors" onClick={() => setMobileMenuOpen(false)}>
                {currentUser ? 'My Account' : 'Login / Register'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
