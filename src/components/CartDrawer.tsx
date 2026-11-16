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
    tag: 'Perfect Stacking Pair'
  },
  {
    productId: 'satva-care-pouch-kit',
    name: 'Atelier Velvet Pouch & Polish Cloth',
    slug: 'jewellery-care',
    pricePaise: 19900,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80',
    tag: 'Preserves 18K Luster'
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

  // Milestone Calculations
  let progressPercent = 0;
  let rewardMessage = '';

  if (subtotalPaise < FREE_SHIPPING_THRESHOLD_PAISE) {
    const diff = FREE_SHIPPING_THRESHOLD_PAISE - subtotalPaise;
    progressPercent = Math.min(100, Math.round((subtotalPaise / FREE_SHIPPING_THRESHOLD_PAISE) * 33));
    rewardMessage = `Add ₹${Math.round(diff / 100)} more for FREE Pan-India Delivery!`;
  } else if (subtotalPaise < FREE_GIFT_THRESHOLD_PAISE) {
    const diff = FREE_GIFT_THRESHOLD_PAISE - subtotalPaise;
    progressPercent = 33 + Math.min(33, Math.round(((subtotalPaise - FREE_SHIPPING_THRESHOLD_PAISE) / (FREE_GIFT_THRESHOLD_PAISE - FREE_SHIPPING_THRESHOLD_PAISE)) * 33));
    rewardMessage = `Free Shipping Unlocked! Add ₹${Math.round(diff / 100)} for a Complimentary Velvet Gift Box`;
  } else if (subtotalPaise < VIP_DISCOUNT_THRESHOLD_PAISE) {
    const diff = VIP_DISCOUNT_THRESHOLD_PAISE - subtotalPaise;
    progressPercent = 66 + Math.min(34, Math.round(((subtotalPaise - FREE_GIFT_THRESHOLD_PAISE) / (VIP_DISCOUNT_THRESHOLD_PAISE - FREE_GIFT_THRESHOLD_PAISE)) * 34));
    rewardMessage = `Free Shipping & Velvet Box Unlocked! Add ₹${Math.round(diff / 100)} for ₹200 OFF`;
  } else {
    progressPercent = 100;
    rewardMessage = `All VIP Rewards Unlocked: Free Shipping + Velvet Box + ₹200 Privilege Savings`;
  }

  // Nominal ₹49 courier charge on orders under ₹499 as per user rule
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

  // Filter out recommendations already in cart
  const availableUpsells = CART_UPSELL_ITEMS.filter(
    (u) => !items.some((i) => i.productId === u.productId)
  ).slice(0, 2);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Slide-over panel (Jewelsmars Modern App Drawer) */}
      <div
        className={`fixed inset-y-0 right-0 max-w-full w-full sm:max-w-md bg-white text-gray-900 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        {/* Modern Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <h2 id="cart-title" className="text-xl font-extrabold text-gray-900 tracking-tight">
              Your Bag
            </h2>
            <span className="text-xs bg-[#ffe7e9] text-[#a1505a] px-2.5 py-0.5 rounded-full font-bold">
              {items.reduce((acc, cur) => acc + cur.quantity, 0)} items
            </span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 text-gray-400 hover:text-black transition-colors rounded-full cursor-pointer"
            aria-label="Close cart drawer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Dynamic Multi-Tier Reward Milestone Bar (Jewelsmars Pink Gradient) */}
        <div className="bg-[#fffafb] px-5 py-3.5 border-b border-[#f9d8dc] text-xs">
          <p className="text-gray-900 mb-2 font-bold leading-tight">
            {rewardMessage}
          </p>
          
          <div className="w-full bg-[#f9d8dc] h-2.5 rounded-full overflow-hidden relative">
            <div
              className="bg-gradient-to-r from-[#f2707f] to-[#e05e6d] h-full transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1.5 font-medium">
            <span className={subtotalPaise >= FREE_SHIPPING_THRESHOLD_PAISE ? 'text-[#a1505a] font-bold' : ''}>
              ₹499 Free Ship
            </span>
            <span className={subtotalPaise >= FREE_GIFT_THRESHOLD_PAISE ? 'text-[#a1505a] font-bold' : ''}>
              ₹1,499 Velvet Box
            </span>
            <span className={subtotalPaise >= VIP_DISCOUNT_THRESHOLD_PAISE ? 'text-[#a1505a] font-bold' : ''}>
              ₹2,499 ₹200 OFF
            </span>
          </div>
        </div>

        {/* Item List / Empty State */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#ffe7e9] flex items-center justify-center text-[#f2707f]">
                <svg className="w-8 h-8 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-gray-900">Your bag is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                  Discover trending anti-tarnish waterproof pieces for your everyday stack.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-2 bg-[#f2707f] hover:bg-[#e05e6d] text-white px-7 py-3 text-xs uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-[#f2707f]/20"
              >
                Shop Bestsellers →
              </button>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-gray-100">
                {items.map((item) => (
                  <li key={`${item.productId}-${item.variantId || 'std'}`} className="py-3.5 flex gap-3.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-18 h-22 object-cover rounded-[14px] bg-gray-50 border border-gray-100 shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => updateQuantity(item.productId, 0, item.variantId)}
                            className="text-gray-400 hover:text-red-600 p-1 -mr-1 cursor-pointer shrink-0"
                            title="Remove item"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">18K PVD Gold • Surgical 316L</p>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                            className="px-2.5 py-0.5 text-xs text-gray-700 hover:text-black font-bold transition-colors cursor-pointer"
                          >
                            −
                          </button>
                          <span className="px-2 text-xs font-bold text-gray-900 min-w-5 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                            className="px-2.5 py-0.5 text-xs text-gray-700 hover:text-black font-bold transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="font-extrabold text-sm text-[#f2707f]">
                            {formatINR(item.pricePaise * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              {/* In-Cart Smart Upsells (Jewelsmars High AOV Pattern) */}
              {availableUpsells.length > 0 && (
                <div className="pt-3 border-t border-gray-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider font-bold text-gray-900 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 text-[#f2707f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      Frequently Paired
                    </span>
                    <span className="text-[10px] text-gray-400">Add with 1-click</span>
                  </div>

                  <div className="space-y-2">
                    {availableUpsells.map((upsell) => (
                      <div
                        key={upsell.productId}
                        className="bg-[#fffafb] p-2.5 border border-[#f9d8dc] rounded-[14px] flex items-center justify-between gap-3 hover:border-[#f2707f] transition-colors"
                      >
                        <img
                          src={upsell.image}
                          alt={upsell.name}
                          className="w-12 h-14 object-cover rounded-[10px] bg-white border border-gray-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-900 truncate">
                            {upsell.name}
                          </p>
                          <p className="text-[10px] text-[#a1505a] font-medium">{upsell.tag}</p>
                          <p className="font-extrabold text-xs text-[#f2707f] mt-0.5">
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
                          className="bg-[#f2707f] hover:bg-[#e05e6d] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shrink-0 transition-all cursor-pointer"
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
          <div className="p-4 sm:p-5 border-t border-gray-100 bg-[#fffafb] space-y-3">
            {/* Coupon input */}
            {!couponApplied ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. FIRSTBUY)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-white border border-gray-200 px-3.5 py-2 text-xs uppercase tracking-wider rounded-xl focus:outline-none focus:border-[#f2707f]"
                />
                <button
                  type="submit"
                  className="bg-gray-900 text-white px-4 py-2 text-xs uppercase tracking-wider font-bold rounded-xl hover:bg-black transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200">
                <span>Code <strong>{couponCode}</strong> applied (-{formatINR(couponDiscountPaise)})</span>
                <button onClick={handleRemoveCoupon} className="text-emerald-700 underline font-bold cursor-pointer">Remove</button>
              </div>
            )}
            {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}

            {/* Calculations */}
            <div className="space-y-1.5 text-xs text-gray-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gray-900 font-bold">{formatINR(subtotalPaise)}</span>
              </div>
              {couponDiscountPaise > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Discount</span>
                  <span>− {formatINR(couponDiscountPaise)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingPaise === 0 ? <strong className="text-emerald-700">FREE</strong> : formatINR(shippingPaise)}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200">
                <span>Total Payable</span>
                <span className="text-[#f2707f]">{formatINR(grandTotalPaise)}</span>
              </div>
            </div>

            {/* Checkout CTA */}
            <a
              href="/checkout"
              className="block w-full text-center bg-[#f2707f] hover:bg-[#e05e6d] text-white py-3.5 text-sm font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-[#f2707f]/25 transition-all"
            >
              Proceed to Checkout →
            </a>

            <p className="text-[10px] text-center text-gray-500">
              Dispatched from Vapi in 24–48h • Free delivery above ₹499
            </p>
          </div>
        )}
      </div>
    </>
  );
}
