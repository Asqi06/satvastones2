"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/hooks/useWishlist";
import { useCartStore } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore();
  const addItemToCart = useCartStore((s) => s.addItem);

  const moveToCart = (item: (typeof items)[0]) => {
    addItemToCart({
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      price: item.price,
      image: item.image,
      stock: 10,
    });
    removeItem(item.productId);
  };

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <div className="editorial-container py-10 lg:py-14">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Saved for a little later</div>
            <h1 className="font-serif font-normal tracking-[-0.035em] leading-[1.05] text-[clamp(42px,4.3vw,63px)] mt-3">
              Your <em className="text-[var(--olive)]">wishlist.</em>
            </h1>
          </div>
          <Link href="/shop" className="text-link">
            Explore the edit
            <svg className="w-4 h-4"><use href="#i-arrow" /></svg>
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-16 lg:py-24 border border-[var(--line)] bg-[var(--white)]">
            <div className="w-16 h-16 rounded-full border border-[var(--line)] bg-[var(--paper)] flex items-center justify-center mb-6">
              <Heart className="w-7 h-7 text-[var(--olive)]/40" />
            </div>
            <h2 className="font-serif text-[32px] lg:text-[40px] font-normal tracking-[-0.03em] mb-3">Nothing saved yet</h2>
            <p className="text-[11px] leading-relaxed tracking-[0.06em] text-[var(--muted)] mb-8 max-w-[360px]">Tap a heart on any piece to save it here. Anti-tarnish, waterproof — your little collection, waiting to happen.</p>
            <Link href="/shop" className="button inline-flex">
              Discover pieces
              <svg className="w-[19px] h-[19px]"><use href="#i-arrow" /></svg>
            </Link>
            <div className="mt-8 flex items-center gap-2 text-[10px] tracking-[0.08em] text-[var(--muted)]">
              <span className="w-6 h-px bg-[var(--line)]" />
              Less saving it. More wearing it.
              <span className="w-6 h-px bg-[var(--line)]" />
            </div>
          </div>
        ) : (
          <div className="product-grid">
            {items.map((item) => (
              <article key={item.productId} className="product-card group">
                <div className="product-image">
                  <Link href={`/product/${item.slug ?? item.productId}`} className="block w-full h-full" aria-label={item.name}>
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[#e7e1d7]">
                        <span className="font-serif text-4xl text-[var(--olive)]/40 tracking-[0.2em]">Satva</span>
                      </div>
                    )}
                  </Link>

                  <button
                    onClick={() => removeItem(item.productId)}
                    aria-label={`Remove ${item.name} from wishlist`}
                    className="wish-button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="product-meta">
                  <div className="product-topline">
                    <Link href={`/product/${item.slug ?? item.productId}`}>
                      <h3 className="product-name hover:text-[var(--olive)] transition-colors line-clamp-1">
                        {item.name}
                      </h3>
                    </Link>
                    <span className="price">{formatPrice(item.price)}</span>
                  </div>
                  <p className="product-subtitle">Saved piece · Anti-tarnish</p>
                  <button
                    onClick={() => moveToCart(item)}
                    className="mt-3 w-full flex items-center justify-between border border-[var(--line)] px-3.5 py-3 text-[11px] text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
                    aria-label={`Move ${item.name} to bag`}
                  >
                    <span>Move to bag</span>
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="collection-footer">
          <p>Good on their own. Even better together.</p>
        </div>
      </div>

      <section className="benefits" aria-label="The SatvaStones details">
        <div className="benefits-inner editorial-container">
          <div className="benefit">
            <svg><use href="#i-sparkle" /></svg> Anti-tarnish finish
          </div>
          <div className="benefit">
            <svg><use href="#i-drop" /></svg> Water-friendly pieces
          </div>
          <div className="benefit">
            <svg><use href="#i-gift" /></svg> Arrives gift-ready
          </div>
          <div className="benefit">
            <svg><use href="#i-truck" /></svg> Shipped across India · COD
          </div>
        </div>
      </section>
    </div>
  );
}
