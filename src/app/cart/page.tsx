"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { useCartStore } from "@/hooks/useCart";

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 399;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : 79;
  const shippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (items.length === 0) {
    return (
      <div className="bg-[var(--paper)] text-[var(--ink)] min-h-[65vh] flex items-center">
        <div className="editorial-container py-16 lg:py-24 flex flex-col items-center justify-center text-center">
          <div className="round-arrow !w-[72px] !h-[72px] mb-8 bg-[var(--white)]" aria-hidden="true">
            <ShoppingBag className="w-7 h-7 text-[var(--olive)]" />
          </div>
          <div className="eyebrow">Your bag is empty</div>
          <h1 className="font-serif font-normal tracking-[-0.03em] leading-[1.02] text-[clamp(42px,4.3vw,63px)] mt-3 mb-4">
            A little room <em className="text-[var(--olive)]">for lovely.</em>
          </h1>
          <p className="text-[var(--muted)] text-[13px] mb-10 max-w-sm">
            Explore our anti-tarnish &amp; waterproof everyday pieces to find your next favourite.
          </p>
          <Link href="/shop" className="button inline-flex">
            Explore the collection
            <svg className="w-[19px] h-[19px]"><use href="#i-arrow" /></svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)] pb-28 lg:pb-16">
      <div className="editorial-container py-10 lg:py-14">
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="eyebrow">Your curated selection</div>
            <h1 className="font-serif font-normal tracking-[-0.03em] leading-[1.02] text-[clamp(40px,4vw,60px)] mt-2">
              Shopping <em className="text-[var(--olive)]">bag.</em>
            </h1>
          </div>
          <span className="text-[11px] text-[var(--muted)] font-medium">
            {items.reduce((s, i) => s + i.quantity, 0)} items in your edit
          </span>
        </div>

        {/* Free Shipping Progress Strip */}
        <div className="p-5 mb-8 border border-[var(--line)] bg-[var(--white)] shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2.5">
            <span className="text-[12px] font-medium text-[var(--olive)] flex items-center gap-2">
              <Truck className="w-4 h-4" />
              {remainingForFreeShipping > 0 ? (
                <>Add <strong className="font-serif text-[15px]">₹{remainingForFreeShipping}</strong> more for complimentary shipping across India</>
              ) : (
                <>🎉 You&apos;ve unlocked complimentary shipping!</>
              )}
            </span>
            <span className="text-[11px] font-semibold text-[var(--muted)] shrink-0">
              ₹{subtotal} / ₹{freeShippingThreshold}
            </span>
          </div>
          <div className="w-full h-2 bg-[var(--paper)] overflow-hidden border border-[var(--line)]">
            <div
              className="h-full bg-[var(--olive)] transition-all duration-500 ease-out"
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
          {/* Cart Items */}
          <div className="w-full lg:w-[65%] flex flex-col">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-4 sm:gap-6 bg-[var(--white)] border border-[var(--line)] border-b-0 last:border-b p-4 sm:p-5 group">
                <div className="relative w-24 sm:w-32 aspect-[4/5] bg-[#e7e1d7] shrink-0 overflow-hidden border border-[var(--line)]">
                  <Link href={`/product/${item.slug ?? item.productId}`} aria-label={item.name}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 96px, 128px"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </Link>
                </div>

                <div className="flex-1 flex flex-col py-1 justify-between min-w-0">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <Link
                        href={`/product/${item.slug ?? item.productId}`}
                        className="text-[13px] sm:text-[14px] font-medium text-[var(--ink)] hover:text-[var(--olive)] transition-colors line-clamp-2"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.name}`}
                        className="text-[var(--muted)] hover:text-[#9b5144] transition-colors p-1 -mr-1 -mt-1 flex-shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[var(--muted)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#b39757]" />
                      <span>Anti-tarnish · Waterproof</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[var(--line)] bg-[var(--paper)]">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="w-8 h-8 flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-[var(--ink)] text-[12px] font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="w-8 h-8 flex items-center justify-center text-[var(--muted)] hover:text-[var(--ink)] transition-colors disabled:opacity-40 cursor-pointer"
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-serif text-[1.4rem] leading-none text-[var(--ink)]">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </p>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-[var(--muted)]">
                          ₹{item.price.toLocaleString("en-IN")} each
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Reassurance Row below cart */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
              <div className="p-3 border border-[var(--line)] bg-[var(--white)] flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <ShieldCheck className="w-4 h-4 text-[var(--olive)] shrink-0" />
                <span>Anti-tarnish guarantee</span>
              </div>
              <div className="p-3 border border-[var(--line)] bg-[var(--white)] flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <Truck className="w-4 h-4 text-[var(--olive)] shrink-0" />
                <span>Free shipping over ₹399</span>
              </div>
              <div className="col-span-2 sm:col-span-1 p-3 border border-[var(--line)] bg-[var(--white)] flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--muted)]">
                <Sparkles className="w-4 h-4 text-[var(--olive)] shrink-0" />
                <span>COD Available</span>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-[35%]">
            <div className="bg-[var(--white)] border border-[var(--line)] p-7 lg:sticky lg:top-28 shadow-sm">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--ink)] mb-6 pb-4 border-b border-[var(--line)]">
                Order summary
              </h2>

              <div className="space-y-3.5 mb-6 text-sm text-[var(--ink)]">
                <div className="flex justify-between">
                  <span className="text-[var(--muted)] text-[12px]">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--muted)] text-[12px]">Shipping</span>
                  <span className={shipping === 0 ? "text-[var(--olive)] text-[12px] font-medium" : "font-medium"}>
                    {shipping === 0 ? "Complimentary" : `₹${shipping}`}
                  </span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[var(--muted)]">Taxes</span>
                  <span className="text-[var(--muted)]">Calculated at checkout</span>
                </div>
              </div>

              <div className="border-t border-[var(--line)] pt-5 mb-7 flex justify-between items-baseline">
                <div>
                  <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[var(--ink)] block">Estimated Total</span>
                  <span className="text-[9px] text-[var(--muted)]">Inclusive of all taxes</span>
                </div>
                <span className="font-serif text-[2rem] leading-none text-[var(--olive)]">
                  ₹{(subtotal + shipping).toLocaleString("en-IN")}
                </span>
              </div>

              <Link href="/checkout" className="button w-full mb-3 justify-center !py-4 shadow-sm">
                <span>Proceed to Checkout</span>
                <svg className="w-[18px] h-[18px]"><use href="#i-arrow" /></svg>
              </Link>

              <Link
                href="/shop"
                className="w-full block text-center border border-[var(--line)] text-[var(--ink)] py-3 text-[11px] uppercase tracking-[0.08em] hover:border-[var(--ink)] hover:bg-[var(--paper)] transition-colors"
              >
                Continue browsing
              </Link>

              <div className="mt-6 pt-5 border-t border-[var(--line)] text-center">
                <p className="text-[10px] text-[var(--muted)] leading-relaxed">
                  Gift-ready packaging on every order · Dispatched in 24 hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FIXED MOBILE CHECKOUT BAR (Do NOT revert per FIXES.MD) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--white)] border-t border-[var(--line)] p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.08)] z-40 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] block">Total</span>
          <span className="font-serif text-2xl font-normal leading-none text-[var(--ink)]">
            ₹{(subtotal + shipping).toLocaleString("en-IN")}
          </span>
        </div>
        <Link href="/checkout" className="button !py-3.5 !px-6 flex-1 justify-center">
          <span>Checkout</span>
          <svg className="w-[18px] h-[18px]"><use href="#i-arrow" /></svg>
        </Link>
      </div>
    </div>
  );
}
