"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag, Eye, Plus } from "lucide-react";
import { useCartStore } from "@/hooks/useCart";
import { useWishlistStore } from "@/hooks/useWishlist";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  material: string | null;
  style: string;
  stock: number;
  category: { name: string; slug: string };
  _count?: { reviews: number };
}

export default function ProductCard({ product }: { product: Product }) {
  const addItemToCart = useCartStore((s) => s.addItem);
  const { addItem: addItemToWishlist, removeItem: removeFromWishlist, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) {
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

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItemToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      stock: product.stock,
    });
  };

  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="group flex flex-col h-full animate-luxury-fade relative pb-6 border-b border-luxury-brown/5 lg:border-none">
      <Link href={`/products/${product.slug}`} className="block relative aspect-[4/5] bg-white overflow-hidden mb-8 border border-luxury-brown/5 group-hover:border-luxury-gold transition-colors duration-500 shadow-sm">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-1000 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-luxury-brown/10 text-[10px] uppercase tracking-widest font-bold bg-luxury-cream">
            No Imagery
          </div>
        )}

        {/* Overlay Gradients */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-luxury-brown/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        {/* Badges */}
        <div className="absolute top-6 left-6 flex flex-col gap-3">
          {discount > 0 && (
            <span className="bg-luxury-gold text-white text-[9px] px-3 py-1 font-bold tracking-[0.2em] uppercase shadow-lg">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-white text-luxury-brown/40 text-[9px] px-3 py-1 font-bold tracking-[0.2em] uppercase border border-luxury-brown/10 shadow-sm">
              Archived
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
          <button
            onClick={toggleWishlist}
            className={`w-10 h-10 flex items-center justify-center transition-all bg-white shadow-xl border border-luxury-brown/5 hover:border-luxury-gold ${
              wishlisted ? "text-luxury-gold" : "text-luxury-brown/40"
            }`}
          >
            <Heart className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} />
          </button>
          <button
            onClick={addToCart}
            disabled={product.stock === 0}
            className="w-10 h-10 flex items-center justify-center bg-white shadow-xl border border-luxury-brown/5 hover:border-luxury-gold text-luxury-brown transition-all disabled:opacity-30"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Hover Text */}
        <div className="absolute bottom-6 inset-x-0 text-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 px-6">
          <p className="text-[10px] text-luxury-brown tracking-[0.3em] uppercase font-bold flex items-center justify-center gap-2">
            View Details <Eye className="w-3 h-3 text-luxury-gold" />
          </p>
        </div>
      </Link>

      <div className="flex-1 flex flex-col items-center text-center px-4">
        <h3 className="text-lg font-serif text-luxury-brown mb-2 line-clamp-1 group-hover:text-luxury-gold transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-luxury-brown font-bold text-sm">₹{product.price.toLocaleString()}</span>
          {product.comparePrice && (
            <span className="text-luxury-brown/30 text-xs line-through font-light">
              ₹{product.comparePrice.toLocaleString()}
            </span>
          )}
        </div>
        
        <button
          onClick={addToCart}
          disabled={product.stock === 0}
          className="w-full py-4 border border-luxury-brown/10 text-[10px] tracking-[0.3em] font-bold uppercase transition-all hover:bg-luxury-brown hover:text-white disabled:opacity-20"
        >
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>
    </div>
  );
}
