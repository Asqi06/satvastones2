"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Search } from "lucide-react";
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

interface CollectionGalleryProps {
  products: Product[];
}

export default function CollectionGallery({ products }: CollectionGalleryProps) {
  const [filter, setFilter] = useState("ALL");
  const addItemToCart = useCartStore((s) => s.addItem);
  const { addItem: addItemToWishlist, removeItem: removeFromWishlist, isWishlisted } = useWishlistStore();

  const filtered = filter === "ALL" 
    ? products 
    : products.filter(p => p.style === filter);

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
    <section className="py-24 lg:py-36 bg-[var(--luxury-cream)] overflow-hidden border-t border-[var(--luxury-border)]">
      <div className="container-premium">
        
        {/* Gallery Header */}
        <div className="text-center mb-16 lg:mb-24">
          <p className="label-sm text-[var(--luxury-gold)] mb-4 animate-fade-in">Unveiling The Archive</p>
          <h2 className="heading-section text-[var(--luxury-brown)] mb-12 animate-fade-in">
            Curation Gallery
          </h2>
          
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-14 border-y border-[var(--luxury-border)] py-8 max-w-4xl mx-auto">
            {["ALL", "KOREAN", "WESTERN", "TRADITIONAL"].map((style) => (
              <button
                key={style}
                onClick={() => setFilter(style)}
                className={`label-sm transition-all duration-300 relative group overflow-hidden ${
                  filter === style ? "text-[var(--luxury-gold)] text-shadow-sm" : "text-[var(--luxury-brown)]/40 hover:text-[var(--luxury-brown)]"
                }`}
              >
                {style}
                <span className={`absolute bottom-0 left-0 w-full h-[1px] bg-[var(--luxury-gold)] transition-transform duration-300 ${filter === style ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 xl:gap-12">
          {filtered.map((product, index) => {
             const discount = product.comparePrice 
              ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) 
              : 0;

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group flex flex-col items-center animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image Wrapper */}
                <div className="relative w-full aspect-[4/5] bg-white border border-[var(--luxury-border)] mb-6 overflow-hidden">
                    {product.images?.[0] ? (
                    <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                    />
                    ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--luxury-border)] font-serif text-5xl">
                        SV
                    </div>
                    )}
                    
                    {/* Badge */}
                    {discount > 0 && (
                        <div className="absolute top-4 left-4 bg-[var(--luxury-gold)] text-white px-3 py-1 label-sm z-[2]">
                          -{discount}%
                        </div>
                    )}
                    
                    {/* Floating Add to Cart */}
                    <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="absolute bottom-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm shadow-md rounded-full flex items-center justify-center text-[var(--luxury-brown)] transition-transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 hover:bg-[var(--luxury-brown)] hover:text-white"
                      >
                        <ShoppingBag className="w-5 h-5" />
                    </button>
                    {/* Floating Wishlist */}
                    <button
                        onClick={(e) => toggleWishlist(e, product)}
                        className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center bg-white/90 backdrop-blur-sm shadow-sm transition-transform opacity-0 group-hover:opacity-100 hover:scale-110 ${
                            isWishlisted(product.id) ? "text-[var(--luxury-gold)]" : "text-[var(--luxury-brown)]/50 hover:text-[var(--luxury-gold)]"
                        }`}
                      >
                        <Heart className="w-4 h-4" fill={isWishlisted(product.id) ? "currentColor" : "none"} />
                    </button>
                </div>
                
                {/* Meta */}
                <div className="text-center">
                    <h3 className="font-serif text-[1rem] lg:text-[1.1rem] italic text-[var(--luxury-brown)] mb-2 line-clamp-1 group-hover:text-[var(--luxury-gold)] transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="flex flex-col items-center gap-1">
                        <p className="label-sm text-[var(--luxury-brown)] ml-[-2px]">
                           ₹{product.price.toLocaleString()}
                        </p>
                        <p className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[var(--luxury-brown)]/40 mt-1">
                            {product.style} • {product.material || "Gold"}
                        </p>
                    </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty State Fallback */}
        {filtered.length === 0 && (
          <div className="py-32 text-center bg-white border border-[var(--luxury-border)] mt-8 animate-fade-in max-w-3xl mx-auto shadow-sm">
             <div className="w-16 h-16 rounded-full border border-[var(--luxury-border)] flex items-center justify-center mx-auto mb-8">
                <Search className="w-6 h-6 text-[var(--luxury-brown)]/30" />
              </div>
            <h3 className="heading-section text-[var(--luxury-brown)] mb-4 italic">Archived Collection</h3>
            <p className="label-md text-[var(--luxury-brown)]/50">Pieces currently unlisted. Wait for curation launch.</p>
          </div>
        )}
      </div>
    </section>
  );
}
