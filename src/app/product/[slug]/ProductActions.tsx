"use client";

import { useState } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/hooks/useCart";
import { useWishlistStore } from "@/hooks/useWishlist";
import type { ProductDetailProduct } from "./ProductDetail";

export default function ProductActions({
  product,
}: {
  product: ProductDetailProduct;
}) {
  const [quantity, setQuantity] = useState(1);
  const addItemToCart = useCartStore((s) => s.addItem);
  const {
    addItem: addItemToWishlist,
    removeItem: removeFromWishlist,
    isWishlisted,
  } = useWishlistStore();

  const handleAddToCart = () => {
    addItemToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      stock: product.stock,
      quantity,
    });
  };

  const toggleWishlist = () => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addItemToWishlist({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0] || "",
      });
    }
  };

  const saved = isWishlisted(product.id);

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <div className="flex items-center border border-[var(--luxury-brown)] h-[56px] bg-white max-w-[140px]">
          <button
            onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
            className="w-12 h-full flex justify-center items-center text-[var(--luxury-brown)]/50 hover:text-[var(--luxury-brown)]"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-12 text-center font-bold text-[var(--luxury-brown)]">
            {quantity}
          </span>
          <button
            onClick={() =>
              quantity < product.stock && setQuantity((q) => q + 1)
            }
            className="w-12 h-full flex justify-center items-center text-[var(--luxury-brown)]/50 hover:text-[var(--luxury-brown)]"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={toggleWishlist}
          className={`h-[56px] px-8 border transition-colors flex items-center gap-3 label-sm ${
            saved
              ? "bg-[var(--luxury-gold)] border-[var(--luxury-gold)] text-white"
              : "border-[var(--luxury-brown)] text-[var(--luxury-brown)] hover:bg-[var(--luxury-brown)] hover:text-white"
          }`}
        >
          <Heart
            className="w-4 h-4"
            fill={saved ? "currentColor" : "none"}
          />
          <span className="hidden sm:block">{saved ? "SAVED" : "WISHLIST"}</span>
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={product.stock === 0}
        className="w-full h-[64px] bg-[var(--luxury-brown)] text-white label-sm hover:bg-[var(--luxury-gold)] transition-colors disabled:bg-[var(--luxury-brown)]/20 shadow-md hover:shadow-xl"
      >
        ADD TO CART
      </button>
    </div>
  );
}
