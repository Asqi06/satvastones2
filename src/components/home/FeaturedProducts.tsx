"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useCartStore } from "@/hooks/useCart";
import { useWishlistStore } from "@/hooks/useWishlist";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number | null;
  images: string[];
  material?: string | null;
  style?: string;
  category?: { name: string; slug: string } | null;
  isNewCollection?: boolean;
}

interface FeaturedProductsProps {
  products: Product[];
}

const TABS = [
  { id: "all", label: "All pieces" },
  { id: "earrings", label: "Earrings" },
  { id: "necklaces", label: "Necklaces" },
  { id: "rings", label: "Rings" },
  { id: "bracelets", label: "Bracelets" },
];

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [addedId, setAddedId] = useState<string | null>(null);

  const addItemToCart = useCartStore((s) => s.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isWishlisted } = useWishlistStore();

  const filteredProducts = useMemo(() => {
    if (!products || products.length === 0) return [];
    if (activeTab === "all") return products.slice(0, 12);

    const keyword = activeTab.toLowerCase();
    const matches = products.filter((p) => {
      const name = p.name.toLowerCase();
      const cat = (p.category?.name || "").toLowerCase();
      const style = (p.style || "").toLowerCase();

      if (keyword === "earrings") {
        return cat.includes("earring") || name.includes("earring") || name.includes("hoop") || name.includes("stud") || style.includes("earring");
      }
      if (keyword === "necklaces") {
        return cat.includes("necklace") || name.includes("necklace") || name.includes("chain") || name.includes("pendant") || style.includes("necklace");
      }
      if (keyword === "rings") {
        return cat.includes("ring") || name.includes("ring") || name.includes("band") || style.includes("ring");
      }
      if (keyword === "bracelets") {
        return cat.includes("bracelet") || name.includes("bracelet") || name.includes("cuff") || name.includes("bangle") || style.includes("bracelet");
      }
      return false;
    });

    return matches.length > 0 ? matches : products.slice(0, 4);
  }, [products, activeTab]);

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItemToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] || "/gold_ring_minimalist_1774634383905.png",
      stock: 99,
    });

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);

    // Notify toast
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { message: `${product.name} — added to your bag.` },
      })
    );
  };

  const handleToggleWishlist = (product: Product, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const saved = isWishlisted(product.id);
    if (saved) {
      removeFromWishlist(product.id);
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { message: "Removed from your saved pieces." },
        })
      );
    } else {
      addToWishlist({
        productId: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        image: product.images[0] || "",
      });
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { message: "Saved for a little later." },
        })
      );
    }
  };

  const money = (val: number) => `₹${val.toLocaleString("en-IN")}`;

  const getProductLabel = (product: Product, index: number) => {
    if (index === 0) return "The everyday favourite";
    if (product.isNewCollection) return "Just landed";
    if (product.comparePrice && product.comparePrice > product.price) return "Special price";
    return "";
  };

  return (
    <section className="shop-section editorial-container" id="shop">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Your jewellery box, upgraded</div>
          <h2>
            On heavy <em>rotation.</em>
          </h2>
        </div>
        <Link href="/shop" className="text-link">
          Explore the edit{" "}
          <svg className="w-4 h-4"><use href="#i-arrow" /></svg>
        </Link>
      </div>

      <div className="shop-toolbar">
        <div className="tabs" role="group" aria-label="Filter jewellery">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              aria-pressed={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <span className="product-count" aria-live="polite">
          {filteredProducts.length} pieces
        </span>
      </div>

      <div className="product-grid" id="productGrid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p, idx) => {
            const saved = isWishlisted(p.id);
            const label = getProductLabel(p, idx);

            return (
              <article key={p.id} className="product-card group">
                <div className="product-image">
                  <Link href={`/product/${p.slug}`} className="block w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images[0] || "/gold_ring_minimalist_1774634383905.png"}
                      alt={`${p.name}, gold-toned anti-tarnish jewellery`}
                      loading={idx < 4 ? "eager" : "lazy"}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {label && <span className="product-label">{label}</span>}

                  <button
                    className={`wish-button ${saved ? "saved" : ""}`}
                    onClick={(e) => handleToggleWishlist(p, e)}
                    aria-label={`${saved ? "Unsave" : "Save"} ${p.name}`}
                    aria-pressed={saved}
                  >
                    <svg className="w-4 h-4"><use href="#i-heart" /></svg>
                  </button>

                  <button
                    className={`quick-add ${addedId === p.id ? "!bg-[var(--olive)] !text-[var(--white)]" : ""}`}
                    onClick={(e) => handleQuickAdd(p, e)}
                    aria-label={`Add ${p.name} to bag`}
                  >
                    <span>{addedId === p.id ? "Added to bag" : "Add to bag"}</span>
                    {addedId === p.id ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5"><use href="#i-plus" /></svg>
                    )}
                  </button>
                </div>

                <div className="product-meta">
                  <div className="product-topline">
                    <Link href={`/product/${p.slug}`}>
                      <h3 className="product-name hover:text-[var(--olive)] transition-colors">
                        {p.name}
                      </h3>
                    </Link>
                    <span className="price">{money(p.price)}</span>
                  </div>

                  <p className="product-subtitle">
                    {p.material ? `${p.material} · Anti-tarnish` : "Your wear-on-repeat piece"}
                  </p>

                  <div className="product-bottom">
                    <span className="gold-dot" role="img" aria-label="Gold finish" />
                    <span>Anti-tarnish finish</span>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="empty-products">
            Nothing here just yet. Try selecting another category or view all pieces.
          </div>
        )}
      </div>

      <div className="collection-footer">
        <p>Good on their own. Even better together.</p>
      </div>
    </section>
  );
}
