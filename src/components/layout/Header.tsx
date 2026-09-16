"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/hooks/useCart";
import { useWishlistStore } from "@/hooks/useWishlist";

interface HeaderProps {
  categories?: { id: string; name: string; slug: string }[];
}

export default function Header({ categories = [] }: HeaderProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data: session } = useSession();
  const currentUser = session?.user ?? null;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "ADMIN";

  const cartItems = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const wishlistItems = useWishlistStore((s) => s.items);

  const cartCount = mounted ? cartItems.reduce((sum, i) => sum + i.quantity, 0) : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;

  const subtotal = mounted
    ? cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    : 0;
  const freeShippingThreshold = 399;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : 79;
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle open cart drawer event from anywhere in the app
  useEffect(() => {
    const handleOpenCart = () => setCartDrawerOpen(true);
    const handleShowToast = (e: CustomEvent<{ message: string }>) => {
      setToastMessage(e.detail.message);
      setTimeout(() => setToastMessage(null), 3500);
    };

    window.addEventListener("open-cart-drawer", handleOpenCart);
    window.addEventListener("show-toast" as any, handleShowToast as any);
    return () => {
      window.removeEventListener("open-cart-drawer", handleOpenCart);
      window.removeEventListener("show-toast" as any, handleShowToast as any);
    };
  }, []);

  // Lock body scroll when cart drawer or mobile menu is open
  useEffect(() => {
    if (cartDrawerOpen || mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [cartDrawerOpen, mobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

  return (
    <>
      {/* SVG Icon Definitions matching Dōri */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-bag" viewBox="0 0 24 24"><path d="M5 7h14l1 14H4L5 7Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 8V6a4 4 0 0 1 8 0v2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="7.2" fill="none" stroke="currentColor" strokeWidth="1.5" /><path d="m16 16 5 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></symbol>
        <symbol id="i-heart" viewBox="0 0 24 24"><path d="M20.3 4.9a5.2 5.2 0 0 0-7.3 0L12 6l-1.1-1.1a5.2 5.2 0 0 0-7.3 7.4L12 21l8.3-8.7a5.2 5.2 0 0 0 0-7.4Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></symbol>
        <symbol id="i-close" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></symbol>
        <symbol id="i-menu" viewBox="0 0 24 24"><path d="M3 7h18M3 16h18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></symbol>
        <symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" /></symbol>
      </svg>

      {/* ANNOUNCEMENT BAR */}
      <div className="announcement-bar">
        A little treat, on us. Free shipping on orders ₹399+
        <span>·</span> Anti-tarnish & waterproof <span>·</span> Made for your everyday
      </div>

      {/* HEADER */}
      <header
        className={`sticky top-0 z-30 transition-all duration-300 bg-[var(--paper)] border-b border-[var(--line)] ${
          isScrolled ? "is-scrolled shadow-[0_8px_28px_-20px_rgba(41,42,35,0.28)]" : ""
        }`}
      >
        <nav className="nav editorial-container flex items-center justify-between h-[88px] max-md:h-[72px]" aria-label="Main navigation">
          {/* Mobile menu trigger */}
          <button
            className="icon-button md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-[22px] h-[22px]"><use href="#i-menu" /></svg>
          </button>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-[29px] text-[12px] flex-1">
            <Link
              href="/shop"
              className="relative py-[10px] text-[var(--ink)] hover:after:w-full after:content-[''] after:absolute after:bottom-[4px] after:left-0 after:w-0 after:h-[1px] after:bg-[var(--ink)] after:transition-all after:duration-200"
            >
              Shop all
            </Link>
            <Link
              href="/about"
              className="relative py-[10px] text-[var(--ink)] hover:after:w-full after:content-[''] after:absolute after:bottom-[4px] after:left-0 after:w-0 after:h-[1px] after:bg-[var(--ink)] after:transition-all after:duration-200"
            >
              Our world
            </Link>
            <Link
              href="/#care"
              className="relative py-[10px] text-[var(--ink)] hover:after:w-full after:content-[''] after:absolute after:bottom-[4px] after:left-0 after:w-0 after:h-[1px] after:bg-[var(--ink)] after:transition-all after:duration-200"
            >
              Care guide
            </Link>
          </div>

          {/* Brand Logo in Instrument Serif */}
          <Link
            href="/"
            className="brand text-center font-serif text-[42px] md:text-[48px] leading-none tracking-[-0.02em] whitespace-nowrap text-[var(--ink)] select-none"
            aria-label="SatvaStones home"
          >
            satvastones<sup className="font-sans text-[8px] font-normal ml-1 align-super tracking-normal">®</sup>
          </Link>

          {/* Nav Actions */}
          <div className="flex items-center justify-end gap-[18px] md:gap-[23px] flex-1">
            <button
              className="icon-button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search jewellery"
              aria-expanded={searchOpen}
            >
              <svg className="w-[20px] h-[20px] md:w-[22px] md:h-[22px]"><use href="#i-search" /></svg>
            </button>

            <Link
              href="/wishlist"
              className="icon-button hidden sm:inline-flex items-center gap-1.5 text-[11px]"
              aria-label={`Wishlist, ${wishlistCount} items`}
            >
              <svg className="w-[20px] h-[20px] md:w-[22px] md:h-[22px]"><use href="#i-heart" /></svg>
              <span>({wishlistCount})</span>
            </Link>

            <button
              className="icon-button bag-button flex items-center gap-1.5 text-[11px]"
              onClick={() => setCartDrawerOpen(true)}
              aria-label={`Open shopping bag, ${cartCount} items`}
            >
              <svg className="w-[20px] h-[20px] md:w-[22px] md:h-[22px]"><use href="#i-bag" /></svg>
              <span id="cartCount">({cartCount})</span>
            </button>

            {/* User Profile */}
            <div className="relative">
              <button
                className="icon-button hidden sm:inline-flex"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-label="Account"
                aria-expanded={userMenuOpen}
              >
                <svg className="w-[20px] h-[20px] md:w-[22px] md:h-[22px]"><use href="#i-user" /></svg>
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-3 w-72 bg-[var(--white)] border border-[var(--line)] shadow-[0_16px_40px_rgba(41,42,35,0.12)] z-50 overflow-hidden"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <div className="px-5 py-4 bg-[var(--paper)] border-b border-[var(--line)]">
                    <p className="font-serif text-[18px] leading-none tracking-[-0.02em] text-[var(--ink)] truncate">
                      {currentUser ? currentUser.name || "Welcome back" : "Welcome"}
                    </p>
                    <p className="text-[11px] text-[var(--muted)] mt-1.5 truncate">
                      {currentUser ? currentUser.email : "Sign in to save pieces & track orders"}
                    </p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 text-[13px] text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
                    >
                      <span>My Account</span>
                      <span className="text-[10px] tracking-[0.08em] text-[var(--muted)]">→</span>
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 text-[13px] text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
                    >
                      <span>Orders & Tracking</span>
                      <span className="text-[10px] tracking-[0.08em] text-[var(--muted)]">→</span>
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2.5 text-[13px] text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
                    >
                      <span>Saved Pieces</span>
                      <span className="text-[10px] tracking-[0.08em] bg-[var(--paper)] border border-[var(--line)] px-1.5 py-0.5">{wishlistCount}</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 text-[13px] text-[var(--olive)] font-medium hover:bg-[var(--paper)] transition-colors"
                      >
                        <span>Admin Panel</span>
                        <span className="text-[10px] tracking-[0.08em]">→</span>
                      </Link>
                    )}
                  </div>
                  <div className="border-t border-[var(--line)] p-2 bg-[var(--paper)]">
                    {currentUser ? (
                      <button
                        onClick={() => signOut({ callbackUrl: "/" })}
                        className="w-full text-left px-3 py-2.5 text-[13px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                      >
                        Sign Out
                      </button>
                    ) : (
                      <Link
                        href="/auth/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-[var(--olive)] text-[var(--white)] text-[11px] tracking-[0.06em] font-medium hover:bg-[var(--olive-dark)] transition-colors"
                      >
                        Sign In
                        <svg className="w-3.5 h-3.5"><use href="#i-arrow" /></svg>
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden flex flex-col px-6 py-7 gap-5 border-t border-[var(--line)] bg-[var(--paper)]">
            <div className="flex flex-col gap-3 font-serif text-[26px]">
              <Link
                href="/shop"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[var(--olive)] transition-colors"
              >
                Shop all pieces
              </Link>
              <Link
                href="/shop/earrings"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[21px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors pl-2"
              >
                — Earrings
              </Link>
              <Link
                href="/shop/necklaces"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[21px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors pl-2"
              >
                — Necklaces
              </Link>
              <Link
                href="/shop/rings"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[21px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors pl-2"
              >
                — Rings
              </Link>
              <Link
                href="/shop/bracelets"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[21px] text-[var(--muted)] hover:text-[var(--ink)] transition-colors pl-2"
              >
                — Bracelets
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[var(--olive)] transition-colors pt-2"
              >
                Our world &amp; story
              </Link>
              <Link
                href="/#care"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[var(--olive)] transition-colors"
              >
                Jewellery care guide
              </Link>
            </div>

            <div className="font-sans text-xs pt-4 border-t border-[var(--line)] space-y-3">
              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[var(--olive)] transition-colors flex items-center justify-between py-1"
              >
                <span>Saved pieces (Wishlist)</span>
                <span className="px-2 py-0.5 border border-[var(--line)] bg-[var(--white)] text-[11px]">{wishlistCount}</span>
              </Link>
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[var(--olive)] transition-colors flex items-center justify-between py-1"
              >
                <span>Account &amp; Orders</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        )}

        {/* SEARCH PANEL */}
        {searchOpen && (
          <div className="search-panel border-t border-[var(--line)] py-5 bg-[var(--paper)]">
            <div className="editorial-container">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-4 pb-3 border-b border-[var(--line)]">
                <svg className="w-5 h-5 text-[var(--muted)] flex-shrink-0"><use href="#i-search" /></svg>
                <input
                  id="searchInput"
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rings, hoops, necklaces, pearl, anti-tarnish..."
                  aria-label="Search products"
                  className="w-full border-0 outline-0 bg-transparent text-[15px] text-[var(--ink)] placeholder:text-[var(--muted)]"
                />
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setSearchOpen(false)}
                  aria-label="Close search"
                >
                  <svg className="w-5 h-5"><use href="#i-close" /></svg>
                </button>
              </form>

              {/* Quick Search Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-3 text-[11px]">
                <span className="text-[var(--muted)] uppercase tracking-wider text-[9px] mr-1">Popular:</span>
                {["Hoops", "Necklace", "Rings", "Bracelets", "Pearl", "Anti-Tarnish"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      router.push(`/shop?search=${encodeURIComponent(tag.toLowerCase())}`);
                      setSearchOpen(false);
                    }}
                    className="px-2.5 py-1 border border-[var(--line)] bg-[var(--white)] text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* SLIDE-IN CART DRAWER */}
      <div
        className={`overlay ${cartDrawerOpen ? "open" : ""}`}
        onClick={() => setCartDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={`cart-drawer ${cartDrawerOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cartTitle"
      >
        <div className="flex items-center justify-between px-[27px] py-[25px] border-b border-[var(--line)]">
          <h2 id="cartTitle" className="m-0 font-serif text-[34px] font-normal text-[var(--ink)]">
            Your little collection
          </h2>
          <button
            className="icon-button"
            onClick={() => setCartDrawerOpen(false)}
            aria-label="Close shopping bag"
          >
            <svg className="w-[20px] h-[20px]"><use href="#i-close" /></svg>
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="p-[20px_27px] border-b border-[var(--line)]">
          <p className="m-0 mb-3 text-[11px] text-[var(--olive)] font-medium">
            {remainingForFreeShipping > 0
              ? `You're ${money(remainingForFreeShipping)} away from complimentary shipping.`
              : "A little extra joy: your shipping is on us."}
          </p>
          <div className="shipping-track">
            <div className="shipping-fill" style={{ width: `${shippingProgress}%` }} />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-[27px]">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.productId} className="grid grid-cols-[78px_1fr] gap-[17px] py-6 border-b border-[var(--line)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/gold_ring_minimalist_1774634383905.png"}
                  alt={item.name}
                  className="w-[78px] h-[102px] object-cover bg-[#e7e1d7]"
                />
                <div className="flex flex-col items-start justify-center">
                  <h3 className="text-[12px] font-medium m-0 mb-1.5 text-[var(--ink)]">{item.name}</h3>
                  <p className="text-[11px] text-[var(--muted)] m-0 mb-3">
                    Anti-tarnish finish · {money(item.price)}
                  </p>
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center border border-[var(--line)]">
                      <button
                        className="bg-none w-7 h-[26px] text-xs flex items-center justify-center cursor-pointer"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-[11px] px-2">{item.quantity}</span>
                      <button
                        className="bg-none w-7 h-[26px] text-xs flex items-center justify-center cursor-pointer"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="bg-none text-[10px] underline text-[var(--muted)] hover:text-[var(--ink)] p-1 cursor-pointer"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="pt-16 text-center">
              <svg className="w-[43px] h-[43px] text-[var(--olive)] mx-auto mb-4"><use href="#i-bag" /></svg>
              <h3 className="font-serif text-[32px] font-normal text-[var(--ink)] m-0 mb-3">
                A little room for lovely.
              </h3>
              <p className="text-[var(--muted)] text-[12px] mb-6">
                Your bag is waiting for its first favourite.
              </p>
              <Link
                href="/shop"
                onClick={() => setCartDrawerOpen(false)}
                className="button inline-flex"
              >
                Explore the collection <svg className="w-[19px] h-[19px]"><use href="#i-arrow" /></svg>
              </Link>
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-[24px_27px] border-t border-[var(--line)]">
            <div className="flex justify-between text-[14px] mb-2.5 text-[var(--ink)] font-medium">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[11px] text-[var(--muted)] mb-3">
              <span>Shipping</span>
              <span>{shipping > 0 ? money(shipping) : "Complimentary"}</span>
            </div>
            <p className="text-[var(--muted)] text-[10px] mb-5 leading-relaxed">
              Prices include applicable taxes. Anti-tarnish finish guaranteed. Thoughtfully packed.
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setCartDrawerOpen(false);
                  router.push("/checkout");
                }}
                className="button w-full justify-between !py-4"
              >
                <span>Proceed to Checkout · {money(subtotal + shipping)}</span>
                <svg className="w-[19px] h-[19px]"><use href="#i-arrow" /></svg>
              </button>
              <button
                onClick={() => {
                  setCartDrawerOpen(false);
                  router.push("/cart");
                }}
                className="w-full block text-center py-2.5 text-[11px] text-[var(--muted)] hover:text-[var(--ink)] tracking-wider uppercase underline underline-offset-4 transition-colors"
              >
                View full bag
              </button>
            </div>
            <div className="text-center text-[9px] text-[var(--muted)] mt-3">
              Free shipping over ₹399 · COD across India
            </div>
          </div>
        )}
      </aside>

      {/* TOAST NOTIFICATION */}
      <div className={`toast ${toastMessage ? "show" : ""}`} role="status" aria-live="polite">
        {toastMessage}
      </div>
    </>
  );
}
