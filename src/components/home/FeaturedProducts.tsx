"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, ShoppingBag, Heart } from "lucide-react";
import { useCartStore } from "@/hooks/useCart";
import { useWishlistStore } from "@/hooks/useWishlist";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  material: string | null;
  style: string;
}

interface BestSellersProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: BestSellersProps) {
  const addItemToCart = useCartStore((s) => s.addItem);
  const { addItem: addItemToWishlist, removeItem: removeFromWishlist, isWishlisted } = useWishlistStore();

  const toggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addItemToWishlist({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0] || "",
      });
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItemToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      stock: 10,
    });
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 lg:py-36 bg-[var(--luxury-cream)] overflow-hidden">
      <div className="container-premium text-center">
        
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center mb-16 lg:mb-24 px-4 max-w-2xl mx-auto">
          <p className="label-sm text-[var(--luxury-gold)] mb-4 lg:mb-6 animate-fade-in">Satvastones Heritage</p>
          <h2 className="heading-section text-[var(--luxury-brown)] mb-6 animate-fade-in text-shadow-sm">
            Curated Artisanal <br className="hidden md:block" /> Masterpieces
          </h2>
          <div className="h-px w-24 bg-[var(--luxury-gold)]/40 mx-auto mt-4 duration-500 ease-in-out"></div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {products.map((product, index) => {
            const discount = product.comparePrice 
              ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) 
              : 0;
            
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group flex flex-col items-center text-center animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Image Box */}
                <div className="relative w-full aspect-[4/5] bg-white border border-[var(--luxury-border)] transition-all duration-700 group-hover:shadow-xl overflow-hidden mb-6">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--luxury-border)] font-serif text-6xl">
                      SV
                    </div>
                  )}
                  
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 bg-[var(--luxury-gold)] text-white px-3 py-1 label-sm shadow-md z-[2]">
                      {discount}% OFF
                    </div>
                  )}

                  {/* Quick Actions overlay */}
                   <div className="absolute inset-0 bg-[var(--luxury-brown)]/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-4 z-[2]">
                    <button
                      onClick={(e) => toggleWishlist(e, product)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center bg-white border border-[var(--luxury-border)] transition-transform hover:scale-110 shadow-lg ${
                        isWishlisted(product.id) ? "text-[var(--luxury-gold)]" : "text-[var(--luxury-brown)]"
                      }`}
                    >
                      <Heart className="w-5 h-5" fill={isWishlisted(product.id) ? "var(--luxury-gold)" : "none"} />
                    </button>
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className="w-12 h-12 rounded-full bg-[var(--luxury-brown)] flex items-center justify-center text-white transition-transform hover:scale-110 shadow-lg group-hover:delay-75"
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Info Text */}
                <h3 className="font-serif text-[1.1rem] lg:text-[1.25rem] italic text-[var(--luxury-brown)] group-hover:text-[var(--luxury-gold)] transition-colors line-clamp-1 mb-3">
                  {product.name}
                </h3>
                
                <div className="flex items-center justify-center gap-4">
                  <p className="label-md font-bold text-[var(--luxury-brown)]">
                    ₹{product.price.toLocaleString()}
                  </p>
                  {product.comparePrice && (
                    <p className="label-md text-[var(--luxury-brown)]/40 line-through font-normal">
                      ₹{product.comparePrice.toLocaleString()}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* Footer CTA */}
        <div className="mt-20 lg:mt-28">
          <Link 
            href="/products" 
            className="inline-block px-12 py-5 border-2 border-[var(--luxury-brown)] text-[var(--luxury-brown)] label-sm hover:bg-[var(--luxury-brown)] hover:text-[var(--luxury-cream)] transition-all ease-in-out duration-300 shadow-sm"
          >
            VIEW ALL COLLECTIONS
          </Link>
        </div>
      </div>
    </section>
  );
}
