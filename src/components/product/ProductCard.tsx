"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Plus, Check, Star } from "lucide-react";
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
  /** Optional: homepage/mock feeds omit it — treated as in-stock unless explicitly 0. */
  stock?: number;
  category?: { name: string; slug: string };
  _count?: { reviews: number };
}

export default function ProductCard({ product }: { product: Product }) {
  const addItemToCart = useCartStore((s) => s.addItem);
  const { addItem: addItemToWishlist, removeItem: removeFromWishlist, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);
  const [added, setAdded] = useState(false);

  const outOfStock = product.stock === 0;
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;
  const reviewCount = product._count?.reviews ?? 0;

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (wishlisted) {
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

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItemToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/gold_ring_minimalist_1774634383905.png",
      stock: product.stock ?? 99,
    });
    setAdded(true);
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { message: `${product.name} — added to bag.` },
      })
    );
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <article className="product-card group flex flex-col h-full">
      <div className="product-image">
        <Link href={`/product/${product.slug}`} className="block w-full h-full" aria-label={product.name}>
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#F4E7C9]">
              <span className="font-serif font-black text-4xl tracking-tight text-transparent" style={{ WebkitTextStroke: "2px #211A0C" }}>
                Satva
              </span>
            </div>
          )}
        </Link>

        {discount > 0 && !outOfStock && (
          <span className="product-label starburst" role="img" aria-label={`${discount} percent off`}>
            −{discount}%
          </span>
        )}
        {outOfStock && (
          <span className="product-label sticker sticker-pop">Sold out</span>
        )}

        <button
          onClick={toggleWishlist}
          aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          aria-pressed={wishlisted}
          className={`wish-button ${wishlisted ? "saved" : ""}`}
        >
          <Heart className="w-4 h-4" fill={wishlisted ? "currentColor" : "none"} />
        </button>

        <button
          onClick={addToCart}
          disabled={outOfStock}
          aria-label={`Add ${product.name} to bag`}
          className="quick-add"
        >
          <span>{added ? "In the bag ✓" : outOfStock ? "Sold out" : "Add to bag"}</span>
          {added ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="product-meta flex-1 flex flex-col justify-between">
        <div>
          <div className="product-topline">
            <Link href={`/product/${product.slug}`}>
              <h3 className="product-name hover:text-[var(--color-pop)] transition-colors line-clamp-2">
                {product.name}
              </h3>
            </Link>
            <span className="price">₹{product.price.toLocaleString("en-IN")}</span>
          </div>

          <p className="product-subtitle">
            {product.material ? `${product.material} · Anti-tarnish` : "Anti-tarnish finish"}
            {product.comparePrice && product.comparePrice > product.price ? (
              <>
                {" · "}
                <s>₹{product.comparePrice.toLocaleString("en-IN")}</s>
                {" · You save ₹" + (product.comparePrice - product.price).toLocaleString("en-IN")}
              </>
            ) : ""}
          </p>
        </div>

        <div className="product-bottom mt-auto">
          <span className="flex items-center gap-2">
            <span className="gold-dot" role="img" aria-label="Gold finish" />
            {product.category ? product.category.name : "Everyday gold"}
          </span>
          {reviewCount > 0 ? (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-[#F2A007]" />
              {reviewCount}
            </span>
          ) : (
            <span>Waterproof</span>
          )}
        </div>
      </div>
    </article>
  );
}
