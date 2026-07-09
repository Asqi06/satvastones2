import { useState, useEffect } from 'react';
import { Menu, Heart, ShoppingBag, User, Home } from 'lucide-react';

export default function HeaderSection({
  cartCount = 0,
  wishlistCount = 0,
  onMenuToggle,
  onNavigate,
}: any) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 h-16 bg-card transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_2px_12px_rgba(0,0,0,0.06)]' : ''
      }`}
    >
      <div className="mx-auto flex h-full max-w-[390px] items-center justify-between px-4 md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px]">
        <button onClick={onMenuToggle} className="p-1 md:hidden" aria-label="Menu">
          <Menu className="h-5 w-5 text-[#3D2B24]" />
        </button>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {['Home', 'Shop', 'Earrings', 'Necklaces', 'Rings'].map((item) => (
            <button
              key={item}
              onClick={() => onNavigate?.(item === 'Home' ? 'home' : `shop/${item.toLowerCase()}`)}
              className="text-xs font-semibold uppercase tracking-widest text-[#3D2B24]/70 hover:text-[#9C6A3B] transition-colors"
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="flex items-center">
          <button onClick={() => onNavigate?.('home')} className="font-display text-xl font-bold tracking-tight text-[#3D2B24] md:text-2xl">
            Satva<span className="text-[#B78453]">Stones</span>
          </button>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <button onClick={() => onNavigate?.('home')} className="hidden md:block">
            <Home className="h-[22px] w-[22px] text-[#3D2B24] hover:text-[#9C6A3B] transition-colors" />
          </button>
          <button onClick={() => onNavigate?.('wishlist')} className="relative">
            <Heart className="h-[22px] w-[22px] text-[#3D2B24] hover:text-[#9C6A3B] transition-colors" />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#B78453] text-[8px] font-bold text-card">
                {wishlistCount}
              </span>
            )}
          </button>
          <button onClick={() => onNavigate?.('cart')} className="relative">
            <ShoppingBag className="h-[22px] w-[22px] text-[#3D2B24] hover:text-[#9C6A3B] transition-colors" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#B78453] text-[8px] font-bold text-card">
                {cartCount}
              </span>
            )}
          </button>
          <button onClick={() => onNavigate?.('account')}>
            <User className="h-[22px] w-[22px] text-[#3D2B24] hover:text-[#9C6A3B] transition-colors" />
          </button>
        </div>
      </div>
    </header>
  );
}
