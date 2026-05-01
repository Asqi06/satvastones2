"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/hooks/useCart";

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-40 pb-24 bg-[var(--luxury-cream)] flex flex-col items-center justify-center container-premium text-center">
        <div className="w-24 h-24 bg-[var(--luxury-brown)]/5 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-10 h-10 text-[var(--luxury-gold)] opacity-50" />
        </div>
        <h1 className="heading-section text-[var(--luxury-brown)] mb-6 animate-fade-in italic">Your Archive is Empty</h1>
        <p className="text-[var(--luxury-brown)]/60 mb-10 max-w-sm label-md animate-fade-in">
          EXPLORE OUR CURATED COLLECTIONS TO FIND YOUR NEXT ARTIFACT.
        </p>
        <Link
          href="/products"
          className="bg-[var(--luxury-brown)] text-white px-12 py-5 label-sm hover:bg-[var(--luxury-gold)] transition-colors hover:shadow-xl group flex items-center gap-4"
        >
          EXPLORE ARCHIVES
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-[120px] lg:pt-[140px] pb-24 bg-[var(--luxury-cream)] container-premium animate-fade-in">
      <h1 className="heading-section text-[var(--luxury-brown)] mb-12 border-b border-[var(--luxury-border)] pb-8 italic">Shopping Archive</h1>
      
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
        {/* Cart Items */}
        <div className="w-full lg:w-[65%] gap-y-10 flex flex-col">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-6 lg:gap-8 bg-white border border-[var(--luxury-border)] p-4 shadow-sm group">
              <div className="relative w-32 xl:w-40 aspect-[4/5] bg-[var(--luxury-accent)] shrink-0 overflow-hidden">
                <Link href={`/products/${item.productId}`}>
                   <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
                </Link>
              </div>
              
              <div className="flex-1 flex flex-col py-2 pr-4 justify-between">
                <div>
                  <div className="flex justify-between items-start gap-4">
                    <Link href={`/products/${item.productId}`} className="label-md font-bold text-[var(--luxury-brown)] hover:text-[var(--luxury-gold)] transition-colors line-clamp-2 pr-4">
                      {item.name}
                    </Link>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-[var(--luxury-brown)]/40 hover:text-red-800 transition-colors p-2 -mr-2 -mt-2"
                    >
                      <Trash2 className="w-[18px] h-[18px]" />
                    </button>
                  </div>
                  <p className="label-sm text-[var(--luxury-brown)]/60 mt-1 italic opacity-70">
                    Boutique Artifact
                  </p>
                </div>
                
                <div className="flex justify-between items-end mt-4">
                  <div className="flex items-center border border-[var(--luxury-brown)]/20">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center text-[var(--luxury-brown)]/50 hover:bg-[var(--luxury-accent)] hover:text-[var(--luxury-brown)] transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-[var(--luxury-brown)] font-semibold label-md">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-[var(--luxury-brown)]/50 hover:bg-[var(--luxury-accent)] hover:text-[var(--luxury-brown)] transition-colors"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-serif text-[1.25rem] italic text-[var(--luxury-brown)]">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Sticky */}
        <div className="w-full lg:w-[35%]">
          <div className="bg-white border border-[var(--luxury-border)] p-8 sticky top-[150px] shadow-sm">
            <h2 className="label-md font-bold text-[var(--luxury-brown)] mb-8 pb-4 border-b border-[var(--luxury-border)] uppercase tracking-widest flex items-center gap-3">
              <ShoppingBag className="w-4 h-4 text-[var(--luxury-gold)]" /> Archive Summary
            </h2>
            
            <div className="space-y-4 mb-8 text-[0.95rem] text-[var(--luxury-brown)]/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Priority Transit</span>
                <span className="text-[var(--luxury-gold)] label-sm font-black">COMPLIMENTARY</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes</span>
                <span className="text-[var(--luxury-brown)]/50">Calculated at checkout</span>
              </div>
            </div>
            
            <div className="border-t border-[var(--luxury-border)] pt-6 mb-10 text-[var(--luxury-brown)] flex justify-between items-end">
              <span className="label-sm font-bold uppercase">Estimated Total</span>
              <span className="font-serif text-[2rem] leading-none">₹{subtotal.toLocaleString()}</span>
            </div>
            
            <Link
              href="/checkout"
              className="w-full block text-center bg-[var(--luxury-brown)] text-white py-5 label-sm hover:bg-[var(--luxury-gold)] transition-all ease-in-out duration-300 font-bold mb-4 shadow hover:shadow-xl"
            >
              PROCEED TO SECURE CHECKOUT
            </Link>

            <Link
              href="/products"
              className="w-full block text-center border-2 border-[var(--luxury-brown)] text-[var(--luxury-brown)] py-[18px] label-sm hover:bg-[var(--luxury-brown)] hover:text-white transition-all ease-in-out duration-300 font-bold"
            >
              CONTINUE BROWSING
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
