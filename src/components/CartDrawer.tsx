import React, { useState, useEffect } from 'react';
import type { CartItem } from '../types/ecommerce';
import { getCartItems, updateQuantity, addToCart } from '../stores/cartStore';

const FREE_SHIPPING_THRESHOLD_PAISE = 49900; // ₹499
const FREE_GIFT_THRESHOLD_PAISE = 149900; // ₹1,499
const VIP_DISCOUNT_THRESHOLD_PAISE = 249900; // ₹2,499

const CART_UPSELL_ITEMS = [
  {
    productId: 'chloe-sculptural-ribbed-huggies',
    name: 'Chloe Sculptural Ribbed Huggies',
    slug: 'chloe-sculptural-ribbed-huggies',
    pricePaise: 89900,
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=200&q=80',
    tag: 'Bestseller Match'
  },
  {
    productId: 'elysian-croissant-dome-ring',
    name: 'Elysian Croissant Dome Ring',
    slug: 'elysian-croissant-dome-ring',
    pricePaise: 129900,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=80',
    tag: 'Stacking Favourite'
  },
  {
    productId: 'satva-care-pouch-kit',
    name: 'Atelier Velvet Pouch & Polish Cloth',
    slug: 'jewellery-care',
    pricePaise: 19900,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80',
    tag: '18K Luster Protector'
  }
];

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountPaise, setCouponDiscountPaise] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    setItems(getCartItems());

    const handleOpen = () => setIsOpen(true);
    const handleUpdate = (e: CustomEvent<CartItem[]>) => {
      setItems(e.detail || []);
    };

    window.addEventListener('satvastones:open_cart', handleOpen);
    window.addEventListener('satvastones:cart_updated' as any, handleUpdate);

    return () => {
      window.removeEventListener('satvastones:open_cart', handleOpen);
      window.removeEventListener('satvastones:cart_updated' as any, handleUpdate);
    };
  }, []);

  const subtotalPaise = items.reduce((sum, item) => sum + item.pricePaise * item.quantity, 0);

  // Milestone Progress
  let progressPercent = 0;
  let rewardMessage = '';

  if (subtotalPaise < FREE_SHIPPING_THRESHOLD_PAISE) {
    const diff = FREE_SHIPPING_THRESHOLD_PAISE - subtotalPaise;
    progressPercent = Math.min(100, Math.round((subtotalPaise / FREE_SHIPPING_THRESHOLD_PAISE) * 33));
    rewardMessage = `Add ₹${Math.round(diff / 100)} more for FREE Express Delivery!`;
  } else if (subtotalPaise < FREE_GIFT_THRESHOLD_PAISE) {
    const diff = FREE_GIFT_THRESHOLD_PAISE - subtotalPaise;
    progressPercent = 33 + Math.min(33, Math.round(((subtotalPaise - FREE_SHIPPING_THRESHOLD_PAISE) / (FREE_GIFT_THRESHOLD_PAISE - FREE_SHIPPING_THRESHOLD_PAISE)) * 33));
    rewardMessage = `Free Delivery Unlocked! Add ₹${Math.round(diff / 100)} for a Luxury Velvet Box`;
  } else if (subtotalPaise < VIP_DISCOUNT_THRESHOLD_PAISE) {
    const diff = VIP_DISCOUNT_THRESHOLD_PAISE - subtotalPaise;
    progressPercent = 66 + Math.min(34, Math.round(((subtotalPaise - FREE_GIFT_THRESHOLD_PAISE) / (VIP_DISCOUNT_THRESHOLD_PAISE - FREE_GIFT_THRESHOLD_PAISE)) * 34));
    rewardMessage = `Free Delivery & Gift Box Unlocked! Add ₹${Math.round(diff / 100)} for ₹200 OFF`;
  } else {
    progressPercent = 100;
    rewardMessage = `All VIP Atelier Privileges Unlocked: Free Express Delivery + Velvet Box + ₹200 Off`;
  }

  const shippingPaise = subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE || subtotalPaise === 0 ? 0 : 4900;
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

    if (code === 'SATVA10') {
      const discount = Math.round(subtotalPaise * 0.1);
      setCouponDiscountPaise(discount);
      setCouponApplied(true);
      setCouponError('');
    } else if (code === 'FIRSTBUY') {
      const discount = 20000; // ₹200 off
      setCouponDiscountPaise(discount);
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid code. Try FIRSTBUY or SATVA10');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponApplied(false);
    setCouponDiscountPaise(0);
    setCouponCode('');
  };

  const availableUpsells = CART_UPSELL_ITEMS.filter(
    (u) => !items.some((i) => i.productId === u.productId)
  ).slice(0, 2);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-[#171513]/60 backdrop-blur-xs z-50 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Slide-over Drawer */}
      <div
        className={`fixed inset-y-0 right-0 max-w-full w-full sm:max-w-md bg-[#fcfbf9] text-[#171513] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out border-l border-[#eae4dc] ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#eae4dc] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <h2 id="cart-title" className="font-serif text-xl sm:text-2xl font-normal text-[#171513] tracking-tight">
              Your Shopping Bag
            </h2>
            <span className="text-[11px] bg-[#faf4f2] text-[#9f4553] px-2.5 py-0.5 rounded-full font-bold border border-[#eae4dc]">
              {items.reduce((acc, cur) => acc + cur.quantity, 0)} items
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-[#6e6863] hover:text-[#171513] transition-colors rounded-full cursor-pointer hover:bg-[#faf8f5]"
            aria-label="Close cart drawer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tiered Reward Milestone Bar */}
        <div className="bg-[#faf8f5] px-5 py-3.5 border-b border-[#eae4dc] text-xs">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[#c5a059]">✦</span>
            <p className="text-[#171513] font-semibold leading-tight">
              {rewardMessage}
            </p>
          </div>

          <div className="w-full bg-[#eae4dc] h-2 rounded-full overflow-hidden relative">
            <div
              className="bg-gradient-to-r from-[#c5a059] to-[#9f4553] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-[#6e6863] pt-1.5 font-medium">
            <span className={subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE ? 'text-[#9f4553] font-bold' : ''}>
              ₹499 Free Ship
            </span>
            <span className={subtotalPaise >= FREE_GIFT_THRESHOLD_PAISE ? 'text-[#9f4553] font-bold' : ''}>
              ₹1,499 Velvet Box
            </span>
            <span className={subtotalPaise >= VIP_DISCOUNT_THRESHOLD_PAISE ? 'text-[#9f4553] font-bold' : ''}>
              ₹2,499 ₹200 OFF
            </span>
          </div>
        </div>

        {/* Item List / Empty State */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#faf4f2] border border-[#eae4dc] flex items-center justify-center text-[#9f4553]">
                <svg className="w-8 h-8 stroke-[1.6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-normal text-[#171513]">Your bag is currently empty</h3>
                <p className="text-xs text-[#6e6863] max-w-xs leading-relaxed">
                  Discover our permanent collection of 100% waterproof anti-tarnish fine jewellery.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-2 bg-[#171513] hover:bg-[#9f4553] text-white px-7 py-3 text-xs uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md"
              >
                Explore Bestsellers →
              </button>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-[#eae4dc]">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.variantId || 'std'}`} className="py-3.5 flex gap-3.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-18 h-22 object-cover rounded-[14px] bg-[#faf8f5] border border-[#eae4dc] shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs sm:text-sm font-semibold text-[#171513] leading-snug line-clamp-2">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => updateQuantity(item.productId, 0, item.variantId)}
                            className="text-[#99918b] hover:text-red-600 p-1 -mr-1 cursor-pointer shrink-0 transition-colors"
                            title="Remove item"
                            aria-label={`Remove ${item.name} from bag`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-[10px] text-[#6e6863] mt-0.5">316L Surgical Steel • 18K Vacuum Gold PVD</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-[#eae4dc] rounded-lg bg-[#faf8f5]">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                            className="px-2.5 py-0.5 text-xs text-[#171513] hover:text-[#9f4553] font-bold transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="px-2 text-xs font-bold text-[#171513] min-w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            className="px-2.5 py-0.5 text-xs text-[#171513] hover:text-[#9f4553] font-bold transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-sm text-[#171513]">
                            {formatINR(item.pricePaise * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* In-Cart Smart Upsells */}
              {availableUpsells.length > 0 && (
                <div className="pt-3 border-t border-[#eae4dc] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-bold text-[#171513] flex items-center gap-1.5">
                      <span className="text-[#c5a059]">✦</span>
                      <span>Frequently Paired Pieces</span>
                    </span>
                    <span className="text-[10px] text-[#6e6863]">1-Click Add</span>
                  </div>

                  <div className="space-y-2">
                    {availableUpsells.map((upsell) => (
                      <div
                        key={upsell.productId}
                        className="bg-white p-2.5 border border-[#eae4dc] rounded-[14px] flex items-center justify-between gap-3 hover:border-[#c5a059]/50 transition-colors shadow-2xs"
                      >
                        <img
                          src={upsell.image}
                          alt={upsell.name}
                          className="w-12 h-14 object-cover rounded-[10px] bg-[#faf8f5] border border-[#eae4dc] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#171513] truncate">
                            {upsell.name}
                          </p>
                          <p className="text-[10px] text-[#9f4553] font-medium">{upsell.tag}</p>
                          <p className="font-bold text-xs text-[#171513] mt-0.5">
                            {formatINR(upsell.pricePaise)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            addToCart({
                              productId: upsell.productId,
                              name: upsell.name,
                              slug: upsell.slug,
                              pricePaise: upsell.pricePaise,
                              image: upsell.image,
                              quantity: 1
                            });
                          }}
                          className="bg-[#171513] hover:bg-[#9f4553] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shrink-0 transition-all cursor-pointer shadow-2xs"
                        >
                          + Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer & Checkout Area */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#eae4dc] bg-white space-y-3">
            {/* Coupon Input */}
            {!couponApplied ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Privilege code (e.g. FIRSTBUY)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-[#faf8f5] border border-[#eae4dc] px-3.5 py-2 text-xs uppercase tracking-wider rounded-xl focus:outline-none focus:border-[#c5a059]"
                />
                <button
                  type="submit"
                  className="bg-[#171513] hover:bg-[#9f4553] text-white px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between text-xs bg-[#eef8f3] text-[#1b6d48] p-2.5 rounded-xl border border-[#c4e8d3]">
                <span>Code <strong>{couponCode}</strong> applied (−{formatINR(couponDiscountPaise)})</span>
                <button onClick={handleRemoveCoupon} className="text-[#1b6d48] underline font-bold cursor-pointer">Remove</button>
              </div>
            )}
            {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs text-[#6e6863] pt-1">
              <div className="flex justify-between">
                <span>Cart Subtotal</span>
                <span className="text-[#171513] font-bold">{formatINR(subtotalPaise)}</span>
              </div>
              {couponDiscountPaise > 0 && (
                <div className="flex justify-between text-[#1b6d48] font-bold">
                  <span>Privilege Discount</span>
                  <span>− {formatINR(couponDiscountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingPaise === 0 ? <strong className="text-[#1b6d48]">FREE EXPRESS</strong> : formatINR(shippingPaise)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#171513] pt-2 border-t border-[#eae4dc]">
                <span>Estimated Total</span>
                <span className="text-[#171513]">{formatINR(grandTotalPaise)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <a
              href="/checkout"
              className="block w-full text-center bg-[#171513] hover:bg-[#9f4553] text-white py-3.5 text-xs font-bold uppercase tracking-[0.12em] rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span>PROCEED TO SECURE CHECKOUT →</span>
            </a>

            <div className="flex items-center justify-center gap-3 text-[10px] text-[#6e6863] pt-0.5">
              <span>✓ 256-Bit SSL Encrypted</span>
              <span>•</span>
              <span>✓ Free Pan-India Delivery &gt; ₹499</span>
              <span>•</span>
              <span>✓ 24–48h Dispatch</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
