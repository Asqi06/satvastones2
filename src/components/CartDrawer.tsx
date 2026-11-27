import React, { useState, useEffect } from 'react';
import type { CartItem, Product } from '../types/ecommerce';
import { getCartItems, updateQuantity, addToCart } from '../stores/cartStore';
import { validateCouponCode, syncCouponsFromCloudflare } from '../stores/adminStore';
import { ensureCatalog } from '../stores/catalogStore';

const FREE_SHIPPING_THRESHOLD_PAISE = 49900; // ₹499

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountPaise, setCouponDiscountPaise] = useState(0);
  const [couponFreeShipping, setCouponFreeShipping] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);

  useEffect(() => {
    setItems(getCartItems());
    syncCouponsFromCloudflare();

    let cancelled = false;
    const loadCatalog = () => {
      ensureCatalog()
        .then((products) => {
          if (!cancelled) setCatalogProducts(products);
        })
        .catch(() => {});
    };
    loadCatalog();

    window.addEventListener('satvastones:products_updated', loadCatalog);

    const restoreSavedCoupon = () => {
      try {
        const savedCoupon = localStorage.getItem('satvastones_applied_coupon');
        if (savedCoupon) {
          const parsed = JSON.parse(savedCoupon);
          if (parsed.code) {
            setCouponCode(parsed.code);
            setCouponDiscountPaise(Number(parsed.discountPaise) || 0);
            setCouponFreeShipping(Boolean(parsed.freeShipping || String(parsed.code).toUpperCase() === 'WELCOME15FREE'));
            setCouponApplied(true);
          }
        }
      } catch (_) {}
    };
    restoreSavedCoupon();

    const handleOpen = () => setIsOpen(true);
    const handleUpdate = (e: CustomEvent<CartItem[]>) => {
      setItems(e.detail || []);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('satvastones:open_cart', handleOpen);
    window.addEventListener('satvastones:cart_updated' as any, handleUpdate);
    window.addEventListener('satvastones:coupon_applied', restoreSavedCoupon);
    window.addEventListener('keydown', handleKey);

    return () => {
      cancelled = true;
      window.removeEventListener('satvastones:products_updated', loadCatalog);
      window.removeEventListener('satvastones:open_cart', handleOpen);
      window.removeEventListener('satvastones:cart_updated' as any, handleUpdate);
      window.removeEventListener('satvastones:coupon_applied', restoreSavedCoupon);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Lock the page behind the drawer without disturbing the scroll position.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  const subtotalPaise = items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);
  const itemCount = items.reduce((acc, cur) => acc + cur.quantity, 0);

  // Recalculate percentage/min-order coupon discounts live whenever cart subtotal changes
  useEffect(() => {
    if (!couponApplied || !couponCode) return;
    const code = couponCode.trim().toUpperCase();
    const res = validateCouponCode(code, subtotalPaise);
    if (res.valid) {
      setCouponDiscountPaise(res.discountPaise);
      setCouponFreeShipping(Boolean(res.freeShipping));
      try {
        localStorage.setItem(
          'satvastones_applied_coupon',
          JSON.stringify({
            code,
            discountPaise: res.discountPaise,
            discountPercent: res.coupon?.discountPercent,
            freeShipping: Boolean(res.freeShipping),
            description: res.message
          })
        );
      } catch (_) {}
    } else if (subtotalPaise > 0) {
      setCouponDiscountPaise(0);
      setCouponFreeShipping(false);
    }
  }, [couponApplied, couponCode, subtotalPaise]);

  const freeShippingRemaining = couponFreeShipping
    ? 0
    : Math.max(0, FREE_SHIPPING_THRESHOLD_PAISE - subtotalPaise);
  const shippingProgress = couponFreeShipping
    ? 100
    : Math.min(100, Math.round((subtotalPaise / FREE_SHIPPING_THRESHOLD_PAISE) * 100));
  const shippingPaise =
    couponFreeShipping || subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE || subtotalPaise === 0 ? 0 : 4900;
  const grandTotalPaise = Math.max(0, subtotalPaise - couponDiscountPaise + shippingPaise);

  const formatINR = (paise: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Math.round(paise / 100));
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    const res = validateCouponCode(code, subtotalPaise);
    if (res.valid) {
      setCouponDiscountPaise(res.discountPaise);
      setCouponFreeShipping(Boolean(res.freeShipping));
      setCouponApplied(true);
      setCouponError('');
      try {
        localStorage.setItem(
          'satvastones_applied_coupon',
          JSON.stringify({
            code,
            discountPaise: res.discountPaise,
            discountPercent: res.coupon?.discountPercent,
            freeShipping: Boolean(res.freeShipping),
            description: res.message
          })
        );
      } catch (_) {}
    } else {
      setCouponError(res.message);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponDiscountPaise(0);
    setCouponFreeShipping(false);
    setCouponCode('');
    try {
      localStorage.removeItem('satvastones_applied_coupon');
    } catch (_) {}
  };

  // Real catalogue pieces only — never a placeholder SKU. Prefer a different
  // category so the suggestion reads as a genuine pairing.
  const cartIds = new Set(items.map((i) => i.productId));
  const cartCategories = new Set(
    items.map((i) => catalogProducts.find((p) => p.id === i.productId)?.category).filter(Boolean)
  );
  const preferredUpsells = catalogProducts.filter(
    (p) => !cartIds.has(p.id) && !cartCategories.has(p.category) && p.inStock
  );
  const fallbackUpsells = catalogProducts.filter((p) => !cartIds.has(p.id) && p.inStock);
  const availableUpsells = [...preferredUpsells, ...fallbackUpsells]
    .filter((p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx)
    .slice(0, 2);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-50 bg-[#14110f]/55 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden="true"
      />

      {/* Slide-over */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-full transform flex-col border-l border-[#e5ded3] bg-[#fbf9f5] text-[#14110f] shadow-2xl transition-[transform,visibility] duration-300 ease-out sm:max-w-[440px] ${
          isOpen ? 'visible translate-x-0' : 'invisible translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e5ded3] px-5 py-4">
          <div className="flex items-baseline gap-2.5">
            <h2 id="cart-title" className="font-display text-[1.6rem] leading-none">
              Your bag
            </h2>
            <span className="text-[10px] uppercase tracking-[0.14em] text-[#8a8279]">
              {itemCount} {itemCount === 1 ? 'piece' : 'pieces'}
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center border border-[#e0d7c9] text-[#6f675f] transition-colors hover:border-[#14110f] hover:text-[#14110f]"
            aria-label="Close bag"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Free-shipping progress — one honest, real threshold */}
        <div className="border-b border-[#e5ded3] bg-[#f4efe7] px-5 py-3.5">
          <p className="text-[11px] leading-snug text-[#14110f]">
            {freeShippingRemaining > 0 ? (
              <>
                You're <strong className="font-medium">{formatINR(freeShippingRemaining)}</strong> away from free express delivery.
              </>
            ) : (
              <>Free express delivery unlocked.</>
            )}
          </p>
          <div className="mt-2 h-[3px] w-full overflow-hidden bg-[#ded5c7]">
            <div
              className="h-full bg-[#14110f] transition-all duration-500"
              style={{ width: `${subtotalPaise === 0 ? 0 : Math.max(4, shippingProgress)}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] uppercase tracking-[0.12em] text-[#8a8279]">
            <span>₹0</span>
            <span>₹499 free shipping</span>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-2" data-lenis-prevent>
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
              <span className="font-display text-[3.5rem] leading-none text-[#ded5c7]" aria-hidden="true">✦</span>
              <h3 className="font-display mt-4 text-[1.6rem] leading-tight">Your bag is empty.</h3>
              <p className="mt-2 max-w-[240px] text-[12px] leading-relaxed text-[#6f675f]">
                Waterproof 18K gold, made for every day. Start with the pieces everyone loves.
              </p>
              <a
                href="/collections/bestsellers"
                onClick={() => setIsOpen(false)}
                className="mt-6 inline-flex items-center gap-2 bg-[#14110f] px-6 py-3 text-[10px] uppercase tracking-[0.16em] text-[#f6f1e8] transition-colors hover:bg-[#8d3f3d]"
              >
                Shop bestsellers <span aria-hidden="true">→</span>
              </a>
              <a
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="mt-3 text-[10px] uppercase tracking-[0.14em] text-[#6f675f] underline decoration-[#d8c3a6] underline-offset-4"
              >
                Browse everything
              </a>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-[#e5ded3]">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.variantId || 'std'}`} className="flex gap-3.5 py-4">
                    <a href={`/products/${item.slug}`} onClick={() => setIsOpen(false)} className="shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        width="72"
                        height="90"
                        className="h-[90px] w-[72px] object-cover"
                      />
                    </a>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <a
                            href={`/products/${item.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="text-[12px] leading-snug text-[#14110f] hover:underline hover:decoration-[#d8c3a6] hover:underline-offset-2"
                          >
                            {item.name}
                          </a>
                          <button
                            onClick={() => updateQuantity(item.productId, 0, item.variantId)}
                            className="-mr-1 shrink-0 cursor-pointer p-1 text-[#9a938b] transition-colors hover:text-[#8d3f3d]"
                            aria-label={`Remove ${item.name} from bag`}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-[#8a8279]">
                          316L steel · 18K gold PVD
                        </p>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center border border-[#d8d0c4]">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                            className="h-7 w-7 cursor-pointer text-sm text-[#14110f] transition-colors hover:bg-[#f1ece3]"
                            aria-label="Decrease quantity"
                          >−</button>
                          <span className="w-6 text-center text-[11px] font-medium" aria-live="polite">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            className="h-7 w-7 cursor-pointer text-sm text-[#14110f] transition-colors hover:bg-[#f1ece3]"
                            aria-label="Increase quantity"
                          >+</button>
                        </div>
                        <span className="text-[12px] font-medium text-[#14110f]">
                          {formatINR(item.pricePaise * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Real pairings */}
              {availableUpsells.length > 0 && (
                <div className="border-t border-[#e5ded3] pt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-[#8d3f3d]">Complete the look</p>
                    <span className="text-[9px] uppercase tracking-[0.12em] text-[#8a8279]">1-click add</span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {availableUpsells.map((upsell) => (
                      <div key={upsell.id} className="flex items-center gap-3 border border-[#e5ded3] bg-white p-2">
                        <img
                          src={upsell.images[0]?.url}
                          alt={upsell.name}
                          width="48"
                          height="60"
                          className="h-[60px] w-12 shrink-0 object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <a
                            href={`/products/${upsell.slug}`}
                            onClick={() => setIsOpen(false)}
                            className="block truncate text-[11px] text-[#14110f] hover:underline"
                          >
                            {upsell.name}
                          </a>
                          <p className="text-[11px] text-[#6f675f]">{formatINR(upsell.pricePaise)}</p>
                        </div>
                        <button
                          onClick={() => {
                            addToCart({
                              productId: upsell.id,
                              name: upsell.name,
                              slug: upsell.slug,
                              pricePaise: upsell.pricePaise,
                              image: upsell.images[0]?.url || '',
                              quantity: 1
                            });
                          }}
                          className="shrink-0 cursor-pointer border border-[#14110f] px-3 py-1.5 text-[9px] uppercase tracking-[0.12em] text-[#14110f] transition-colors hover:bg-[#14110f] hover:text-[#f6f1e8]"
                          aria-label={`Add ${upsell.name} to bag`}
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>

                  <a
                    href="/stack-builder"
                    onClick={() => setIsOpen(false)}
                    className="mt-3 flex items-center justify-between border border-[#e0d7c9] bg-[#f4efe7] px-3 py-2.5 text-[10px] uppercase tracking-[0.12em] text-[#14110f] transition-colors hover:border-[#c5a059]"
                  >
                    <span>Stack two pieces — save 15%</span>
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="space-y-3 border-t border-[#e5ded3] bg-[#fbf9f5] px-5 pb-4 pt-4">
            {!couponApplied ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Privilege code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  aria-label="Privilege code"
                  className="h-9 flex-1 border border-[#d8d0c4] bg-transparent px-3 text-[11px] uppercase tracking-[0.08em] text-[#14110f] placeholder:text-[#9a938b] placeholder:normal-case focus:border-[#14110f] focus:outline-none"
                />
                <button
                  type="submit"
                  className="h-9 cursor-pointer border border-[#14110f] px-4 text-[9px] uppercase tracking-[0.14em] text-[#14110f] transition-colors hover:bg-[#14110f] hover:text-[#f6f1e8]"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between border border-[#cfe3d6] bg-[#f0f7f2] px-3 py-2 text-[11px] text-[#2f7d5a]">
                <span>
                  <strong className="font-medium">{couponCode}</strong> applied (−{formatINR(couponDiscountPaise)}
                  {couponFreeShipping ? ' + Free delivery' : ''})
                </span>
                <button onClick={handleRemoveCoupon} className="cursor-pointer underline underline-offset-2">
                  Remove
                </button>
              </div>
            )}
            {couponError && <p className="text-[11px] font-medium text-[#8d3f3d]">{couponError}</p>}

            <div className="space-y-1.5 text-[11px] text-[#6f675f]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#14110f]">{formatINR(subtotalPaise)}</span>
              </div>
              {couponDiscountPaise > 0 && (
                <div className="flex justify-between font-medium text-[#2f7d5a]">
                  <span>Privilege discount</span>
                  <span>− {formatINR(couponDiscountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className={shippingPaise === 0 ? 'font-medium text-[#2f7d5a]' : ''}>
                  {shippingPaise === 0 ? 'Free express' : formatINR(shippingPaise)}
                </span>
              </div>
              <div className="flex items-baseline justify-between border-t border-[#e5ded3] pt-2 text-[#14110f]">
                <span className="text-[10px] uppercase tracking-[0.14em]">Total</span>
                <span className="font-display text-[1.5rem] leading-none">{formatINR(grandTotalPaise)}</span>
              </div>
            </div>

            <a
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 bg-[#14110f] py-3.5 text-[10px] uppercase tracking-[0.16em] text-[#f6f1e8] transition-colors hover:bg-[#8d3f3d]"
            >
              Secure checkout
              <span aria-hidden="true">→</span>
            </a>

            <p className="text-center text-[9px] uppercase tracking-[0.1em] text-[#8a8279]">
              UPI · Cards · Netbanking · GST invoice
            </p>
          </div>
        )}
      </div>
    </>
  );
}
