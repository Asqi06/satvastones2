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

const TICKER_ITEMS = [
  "Free shipping over ₹399",
  "COD across India",
  "Anti-tarnish finish",
  "Waterproof pieces",
  "Gift-ready packaging",
  "New drops every Friday",
];

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

  const todayLine = mounted
    ? new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Vapi Edition";

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

  const navCategories = categories.slice(0, 5);

  return (
    <>
      {/* SVG Icon Definitions */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} aria-hidden="true">
        <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M4 12h15M13 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-bag" viewBox="0 0 24 24"><path d="M5 7h14l1 14H4L5 7Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M8 8V6a4 4 0 0 1 8 0v2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-search" viewBox="0 0 24 24"><circle cx="10.8" cy="10.8" r="7.2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="m16 16 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></symbol>
        <symbol id="i-heart" viewBox="0 0 24 24"><path d="M20.3 4.9a5.2 5.2 0 0 0-7.3 0L12 6l-1.1-1.1a5.2 5.2 0 0 0-7.3 7.4L12 21l8.3-8.7a5.2 5.2 0 0 0 0-7.4Z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></symbol>
        <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></symbol>
        <symbol id="i-close" viewBox="0 0 24 24"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></symbol>
        <symbol id="i-menu" viewBox="0 0 24 24"><path d="M3 7h18M3 12h12M3 17h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></symbol>
        <symbol id="i-user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2" /></symbol>
      </svg>

      {/* TICKER */}
      <div className="announcement-bar" aria-label="Store announcements">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <span key={copy} aria-hidden={copy === 1}>
              {TICKER_ITEMS.map((item) => (
                <span key={`${copy}-${item}`}>
                  {item} <i className="tick-star not-italic">✳</i>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* MASTHEAD */}
      <header
        className={`sticky top-0 z-30 bg-[var(--paper)] transition-shadow duration-300 ${
          isScrolled ? "shadow-[0_3px_0_0_var(--color-ink)]" : ""
        }`}
      >
        <div className="editorial-container">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 pt-5 pb-4 max-md:pt-4">
            {/* Dateline */}
            <div className="text-[10px] font-extrabold tracking-[0.18em] uppercase text-[var(--ink)] leading-relaxed max-md:hidden">
              {todayLine}
              <br />
              <span className="text-[var(--pop,#CE3B17)]">Vapi Edition · Est. 2026</span>
            </div>
            {/* Mobile menu trigger */}
            <div className="md:hidden">
              <button
                className="icon-button border-2 border-[var(--ink)] bg-[var(--surface,#FFFEF8)]"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
              >
                <svg className="w-[22px] h-[22px]"><use href="#i-menu" /></svg>
              </button>
            </div>

            {/* Nameplate */}
            <Link
              href="/"
              className="masthead-wordmark text-center text-[44px] md:text-[64px] select-none"
              aria-label="SatvaStones home"
            >
              satvastones<sup className="font-sans text-[9px] font-extrabold ml-1 align-super tracking-normal">®</sup>
            </Link>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 md:gap-3">
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
                className="icon-button hidden sm:inline-flex items-center gap-1 text-[12px] font-extrabold"
                aria-label={`Wishlist, ${wishlistCount} items`}
              >
                <svg className="w-[20px] h-[20px] md:w-[22px] md:h-[22px]"><use href="#i-heart" /></svg>
                <span>({wishlistCount})</span>
              </Link>

              <button
                className="icon-button flex items-center gap-1 text-[12px] font-extrabold border-2 border-[var(--ink)] bg-[var(--accent,#F2A007)] px-2.5 py-1.5 shadow-[3px_3px_0_0_var(--color-ink)] hover:shadow-[4px_4px_0_0_var(--color-ink)]"
                onClick={() => setCartDrawerOpen(true)}
                aria-label={`Open shopping bag, ${cartCount} items`}
              >
                <svg className="w-[20px] h-[20px]"><use href="#i-bag" /></svg>
                <span id="cartCount">Bag ({cartCount})</span>
              </button>

              {/* User Profile */}
              <div className="relative hidden sm:block">
                <button
                  className="icon-button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  aria-label="Account"
                  aria-expanded={userMenuOpen}
                >
                  <svg className="w-[20px] h-[20px] md:w-[22px] md:h-[22px]"><use href="#i-user" /></svg>
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-3 w-72 bg-[var(--surface,#FFFEF8)] border-2 border-[var(--ink)] shadow-[6px_6px_0_0_var(--color-ink)] z-50 overflow-hidden"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-5 py-4 bg-[var(--accent,#F2A007)] border-b-2 border-[var(--ink)]">
                      <p className="font-serif text-[20px] font-black leading-none tracking-tight text-[var(--ink)] truncate">
                        {currentUser ? currentUser.name || "Welcome back" : "Hello, reader"}
                      </p>
                      <p className="text-[11px] font-bold text-[var(--ink)] mt-1.5 truncate">
                        {currentUser ? currentUser.email : "Sign in to save pieces & track orders"}
                      </p>
                    </div>
                    <div className="p-2">
                      <Link
                        href="/account"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 text-[13px] font-bold text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
                      >
                        <span>My Account</span>
                        <span className="text-[12px]">→</span>
                      </Link>
                      <Link
                        href="/account/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 text-[13px] font-bold text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
                      >
                        <span>Orders & Tracking</span>
                        <span className="text-[12px]">→</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 text-[13px] font-bold text-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
                      >
                        <span>Saved Pieces</span>
                        <span className="text-[10px] font-extrabold bg-[var(--paper)] border-2 border-[var(--ink)] px-1.5 py-0.5">{wishlistCount}</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-2.5 text-[13px] font-extrabold text-[var(--pop,#CE3B17)] hover:bg-[var(--paper)] transition-colors"
                        >
                          <span>Admin Panel</span>
                          <span className="text-[12px]">→</span>
                        </Link>
                      )}
                    </div>
                    <div className="border-t-2 border-[var(--ink)] p-2 bg-[var(--paper)]">
                      {currentUser ? (
                        <button
                          onClick={() => signOut({ callbackUrl: "/" })}
                          className="w-full text-left px-3 py-2.5 text-[13px] font-bold text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
                        >
                          Sign Out
                        </button>
                      ) : (
                        <Link
                          href="/auth/login"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 bg-[var(--ink)] text-[var(--paper)] text-[11px] tracking-[0.08em] font-extrabold uppercase hover:bg-[#3D2F14] transition-colors"
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
          </div>
        </div>

        {/* NAV ROW */}
        <nav className="nav-rule hidden md:block" aria-label="Sections">
          <div className="editorial-container flex items-center justify-center gap-8 py-2.5 text-[12px] font-extrabold tracking-[0.12em] uppercase">
            <Link href="/shop" className="hover:text-[var(--pop,#CE3B17)] transition-colors">
              Shop all
            </Link>
            {navCategories.map((c) => (
              <Link
                key={c.id}
                href={`/shop/${c.slug}`}
                className="hover:text-[var(--pop,#CE3B17)] transition-colors"
              >
                {c.name}
              </Link>
            ))}
            <Link href="/blog" className="hover:text-[var(--pop,#CE3B17)] transition-colors">
              Journal
            </Link>
            <Link href="/about" className="hover:text-[var(--pop,#CE3B17)] transition-colors">
              Our world
            </Link>
            <Link href="/#care" className="hover:text-[var(--pop,#CE3B17)] transition-colors">
              Care guide
            </Link>
          </div>
        </nav>
        <div className="rule-double" aria-hidden="true" />

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t-2 border-[var(--ink)] bg-[var(--paper)]">
            <div className="editorial-container flex flex-col gap-1 py-6 font-serif font-black text-[30px] tracking-tight">
              <Link href="/shop" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[var(--pop,#CE3B17)]">
                Shop all pieces
              </Link>
              {navCategories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop/${c.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1 pl-5 text-[22px] text-[var(--muted)] hover:text-[var(--ink)]"
                >
                  — {c.name}
                </Link>
              ))}
              <Link href="/blog" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[var(--pop,#CE3B17)]">
                Journal
              </Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[var(--pop,#CE3B17)]">
                Our world
              </Link>
              <Link href="/#care" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-[var(--pop,#CE3B17)]">
                Care guide
              </Link>
            </div>
            <div className="editorial-container border-t-2 border-[var(--ink)] py-4 text-xs font-bold space-y-3 pb-6">
              <Link href="/wishlist" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between">
                <span>Saved pieces (Wishlist)</span>
                <span className="px-2 py-0.5 border-2 border-[var(--ink)] bg-[var(--surface,#FFFEF8)] text-[11px] font-extrabold">{wishlistCount}</span>
              </Link>
              <Link href="/account" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-between">
                <span>Account & Orders</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        )}

        {/* SEARCH PANEL */}
        {searchOpen && (
          <div className="search-panel border-t-2 border-[var(--ink)] py-5 bg-[var(--accent,#F2A007)]">
            <div className="editorial-container">
              <form onSubmit={handleSearchSubmit} className="flex items-center gap-4 pb-3 border-b-2 border-[var(--ink)]">
                <svg className="w-5 h-5 flex-shrink-0"><use href="#i-search" /></svg>
                <input
                  id="searchInput"
                  type="search"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rings, hoops, necklaces, pearl…"
                  aria-label="Search products"
                  className="w-full border-0 outline-0 bg-transparent text-[16px] font-bold text-[var(--ink)] placeholder:text-[#7A5B00]"
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

              <div className="flex flex-wrap items-center gap-2 pt-3 text-[11px]">
                <span className="uppercase tracking-wider text-[10px] font-extrabold mr-1">Filed under:</span>
                {["Hoops", "Necklace", "Rings", "Bracelets", "Pearl", "Anti-Tarnish"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      router.push(`/shop?search=${encodeURIComponent(tag.toLowerCase())}`);
                      setSearchOpen(false);
                    }}
                    className="px-2.5 py-1 border-2 border-[var(--ink)] bg-[var(--surface,#FFFEF8)] font-bold text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors"
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
        <div className="flex items-center justify-between px-6 py-5 border-b-[3px] border-[var(--ink)] bg-[var(--accent,#F2A007)]">
          <h2 id="cartTitle" className="m-0 font-serif text-[30px] font-black tracking-tight text-[var(--ink)]">
            Your bag
          </h2>
          <button
            className="icon-button border-2 border-[var(--ink)] bg-[var(--surface,#FFFEF8)]"
            onClick={() => setCartDrawerOpen(false)}
            aria-label="Close shopping bag"
          >
            <svg className="w-[18px] h-[18px]"><use href="#i-close" /></svg>
          </button>
        </div>

        {/* Free shipping progress */}
        <div className="px-6 py-5 border-b-[3px] border-[var(--ink)]">
          <p className="m-0 mb-3 text-[12px] font-extrabold uppercase tracking-wider">
            {remainingForFreeShipping > 0
              ? `${money(remainingForFreeShipping)} away from free shipping`
              : "Free shipping unlocked. Nicely done."}
          </p>
          <div className="shipping-track">
            <div className="shipping-fill" style={{ width: `${shippingProgress}%` }} />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto px-6">
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <div key={item.productId} className="grid grid-cols-[78px_1fr] gap-4 py-5 border-b-2 border-dashed border-[var(--line)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image || "/gold_ring_minimalist_1774634383905.png"}
                  alt={item.name}
                  className="w-[78px] h-[102px] object-cover bg-[#F4E7C9] border-2 border-[var(--ink)]"
                />
                <div className="flex flex-col items-start justify-center">
                  <h3 className="font-serif text-[16px] font-bold m-0 mb-1 text-[var(--ink)] leading-snug">{item.name}</h3>
                  <p className="text-[11px] font-bold text-[var(--muted)] m-0 mb-3">
                    Anti-tarnish · {money(item.price)}
                  </p>
                  <div className="w-full flex items-center justify-between">
                    <div className="flex items-center border-2 border-[var(--ink)] bg-[var(--surface,#FFFEF8)]">
                      <button
                        className="bg-none w-7 h-[26px] text-xs font-extrabold flex items-center justify-center cursor-pointer"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="text-[11px] font-extrabold px-2">{item.quantity}</span>
                      <button
                        className="bg-none w-7 h-[26px] text-xs font-extrabold flex items-center justify-center cursor-pointer"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="bg-none text-[10px] font-bold uppercase tracking-wider underline underline-offset-4 text-[var(--muted)] hover:text-[var(--pop,#CE3B17)] p-1 cursor-pointer"
                      onClick={() => removeItem(item.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="pt-14 text-center">
              <span className="sticker sticker-sun mb-5">Empty, for now</span>
              <h3 className="font-serif text-[30px] font-black tracking-tight m-0 mb-3">
                Room for something lovely.
              </h3>
              <p className="text-[var(--muted)] text-[12px] font-semibold mb-6">
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
          <div className="p-6 border-t-[3px] border-[var(--ink)] bg-[var(--surface,#FFFEF8)]">
            <div className="flex justify-between text-[15px] mb-2 text-[var(--ink)] font-extrabold">
              <span>Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-[var(--muted)] mb-3">
              <span>Shipping</span>
              <span>{shipping > 0 ? money(shipping) : "FREE"}</span>
            </div>
            <p className="text-[var(--muted)] text-[10px] font-semibold mb-5 leading-relaxed">
              Taxes included. Anti-tarnish finish. Thoughtfully packed.
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setCartDrawerOpen(false);
                  router.push("/checkout");
                }}
                className="button w-full justify-between !py-4"
              >
                <span>Checkout · {money(subtotal + shipping)}</span>
                <svg className="w-[19px] h-[19px]"><use href="#i-arrow" /></svg>
              </button>
              <button
                onClick={() => {
                  setCartDrawerOpen(false);
                  router.push("/cart");
                }}
                className="w-full block text-center py-2.5 text-[11px] font-extrabold text-[var(--muted)] hover:text-[var(--ink)] tracking-wider uppercase underline underline-offset-4 transition-colors"
              >
                View full bag
              </button>
            </div>
            <div className="text-center text-[10px] font-extrabold uppercase tracking-wider text-[var(--muted)] mt-3">
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
