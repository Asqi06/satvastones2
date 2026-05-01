"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";
import { useWishlistStore } from "@/hooks/useWishlist";
import { useCartStore } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItemToCart = useCartStore((s) => s.addItem);

  const moveToCart = (item: (typeof items)[0]) => {
    addItemToCart({
      productId: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      stock: 10,
    });
    removeItem(item.productId);
  };

    return (
    <div className="bg-luxury-cream min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Saved Masterpieces</p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Your Wishlist</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-32 bg-white border border-luxury-brown/5 animate-luxury-fade">
            <Heart className="w-16 h-16 text-luxury-brown/10 mx-auto mb-8" />
            <h2 className="text-2xl font-serif text-luxury-brown mb-4">The Archive is Vacant</h2>
            <p className="text-luxury-brown/40 text-sm tracking-widest uppercase font-bold mb-12">Capture items that resonate with your soul</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-6 px-12 py-5 bg-luxury-brown text-white text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-luxury-gold transition-all shadow-xl"
            >
              Discover Collections
              <ArrowRight className="w-4 h-4 translate-y-[-1px]" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {items.map((item) => (
              <div key={item.productId} className="group relative bg-white border border-luxury-brown/5 p-6 hover:shadow-2xl transition-all duration-700">
                <div className="relative aspect-[3/4] overflow-hidden mb-8 bg-luxury-cream">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-1000"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-luxury-brown/10 uppercase tracking-widest text-[9px] font-bold">
                      No Imagery
                    </div>
                  )}

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md text-red-500 rounded-full flex items-center justify-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="text-luxury-brown text-sm font-serif group-hover:text-luxury-gold transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-luxury-gold font-serif text-lg">{formatPrice(item.price)}</p>

                  <button
                    onClick={() => moveToCart(item)}
                    className="w-full py-4 border border-luxury-brown/10 text-luxury-brown text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-luxury-brown hover:text-white transition-all flex items-center justify-center gap-4 group/btn"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Acquire Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
