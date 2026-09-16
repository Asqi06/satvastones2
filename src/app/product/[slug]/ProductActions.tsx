"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, Check, Zap } from "lucide-react";
import { useCartStore } from "@/hooks/useCart";
import { useWishlistStore } from "@/hooks/useWishlist";
import type { ProductDetailProduct } from "./ProductDetail";

export default function ProductActions({
  product,
}: {
  product: ProductDetailProduct;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItemToCart = useCartStore((s) => s.addItem);
  const {
    addItem: addItemToWishlist,
    removeItem: removeFromWishlist,
    isWishlisted,
  } = useWishlistStore();

  const handleAddToCart = () => {
    if (product.stock === 0) return;
    addItemToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      stock: product.stock,
      quantity,
    });
    setAdded(true);
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { message: `${product.name} (x${quantity}) — added to your bag.` },
      })
    );
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBuyNow = () => {
    if (product.stock === 0) return;
    addItemToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] || "",
      stock: product.stock,
      quantity,
    });
    router.push("/checkout");
  };

  const toggleWishlist = () => {
    if (isWishlisted(product.id)) {
      removeFromWishlist(product.id);
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { message: "Removed from saved pieces." },
        })
      );
    } else {
      addItemToWishlist({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0] || "",
      });
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { message: `${product.name} — saved to wishlist.` },
        })
      );
    }
  };

  const saved = isWishlisted(product.id);

  return (
    <div className="space-y-3.5">
      <div className="flex gap-3 items-stretch">
        {/* Quantity Stepper */}
        <div className="flex items-center border border-[var(--line)] bg-[var(--white)] h-[52px]">
          <button
            onClick={() => quantity > 1 && setQuantity((q) => q - 1)}
            aria-label="Decrease quantity"
            className="w-11 h-full flex justify-center items-center text-[var(--muted)] hover:text-[var(--ink)] transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center font-medium text-[var(--ink)] text-sm">
            {quantity}
          </span>
          <button
            onClick={() =>
              quantity < product.stock && setQuantity((q) => q + 1)
            }
            aria-label="Increase quantity"
            className="w-11 h-full flex justify-center items-center text-[var(--muted)] hover:text-[var(--ink)] transition-colors disabled:opacity-40"
            disabled={quantity >= product.stock}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={toggleWishlist}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved pieces" : "Save for later"}
          className={`h-[52px] px-6 border transition-colors flex items-center gap-2.5 text-[11px] tracking-[0.06em] flex-1 justify-center ${
            saved
              ? "bg-[var(--ink)] border-[var(--ink)] text-[var(--paper)]"
              : "border-[var(--line)] bg-[var(--white)] text-[var(--ink)] hover:border-[var(--ink)]"
          }`}
        >
          <Heart
            className="w-4 h-4"
            fill={saved ? "currentColor" : "none"}
          />
          <span>{saved ? "Saved" : "Save to wishlist"}</span>
        </button>
      </div>

      {/* Add to Bag and Buy Now */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`button w-full justify-center !py-4 transition-all ${
            added ? "!bg-[var(--ink)] !text-[var(--paper)]" : ""
          }`}
        >
          {added ? (
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4" /> Added to bag
            </span>
          ) : product.stock === 0 ? (
            "Out of stock"
          ) : (
            `Add to bag · ₹${(product.price * quantity).toLocaleString("en-IN")}`
          )}
        </button>

        <button
          onClick={handleBuyNow}
          disabled={product.stock === 0}
          className="w-full py-4 border border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--paper)] hover:text-[var(--ink)] text-[11px] font-semibold tracking-wider uppercase flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-40 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
}
