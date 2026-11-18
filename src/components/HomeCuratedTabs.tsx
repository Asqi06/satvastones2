import React, { useState, useEffect } from 'react';
import { PRODUCTS, formatPrice } from '../data/products';
import { getAllCatalogProducts, syncCatalogFromCloudflare } from '../stores/catalogStore';
import { addToCart } from '../stores/cartStore';
import { toggleWishlist, isInWishlist } from '../stores/wishlistStore';
import type { Product } from '../types/ecommerce';

interface TabConfig {
  id: string;
  label: string;
  badge?: string;
  filter: (p: Product) => boolean;
}

const TABS: TabConfig[] = [
  {
    id: 'bestsellers',
    label: 'Patron Bestsellers',
    badge: 'Popular',
    filter: (p) => p.isBestseller
  },
  {
    id: 'new-arrivals',
    label: 'Fresh Drops',
    badge: 'New',
    filter: (p) => p.isNewArrival
  },
  {
    id: 'necklaces',
    label: 'Liquid Chains & Pendants',
    filter: (p) => p.category === 'necklaces'
  },
  {
    id: 'rings',
    label: 'Waterproof Rings',
    filter: (p) => p.category === 'rings'
  },
  {
    id: 'bundles',
    label: 'Gifting Capsules & Sets',
    badge: 'Save 15%',
    filter: (p) => p.category === 'gift-sets' || p.category === 'jewellery-set' || p.id.includes('capsule') || p.id.includes('jar')
  }
];

function getOptimizedImageUrl(url: string, width = 450): string {
  if (!url) return url;
  if (url.includes('images.unsplash.com')) {
    let clean = url.replace(/w=\d+/, `w=${width}`).replace(/&q=\d+/, '&q=80');
    if (!clean.includes('fm=')) clean += '&fm=webp';
    return clean;
  }
  return url;
}

export default function HomeCuratedTabs() {
  const [activeTab, setActiveTab] = useState('bestsellers');
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(PRODUCTS);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Initial local merge
    const merged = getAllCatalogProducts();
    setCatalogProducts(merged);

    // 2. Sync latest from Cloudflare D1
    syncCatalogFromCloudflare().then((latest) => {
      if (latest && latest.length > 0) setCatalogProducts(latest);
    });

    const handleProductsUpdated = () => {
      setCatalogProducts(getAllCatalogProducts());
    };
    window.addEventListener('satvastones:products_updated', handleProductsUpdated);

    const updateWishlist = () => {
      const activeIds = new Set<string>();
      catalogProducts.forEach((p) => {
        if (isInWishlist(p.id)) activeIds.add(p.id);
      });
      setWishlistIds(activeIds);
    };

    updateWishlist();
    window.addEventListener('satvastones:wishlist_updated', updateWishlist);
    return () => {
      window.removeEventListener('satvastones:wishlist_updated', updateWishlist);
      window.removeEventListener('satvastones:products_updated', handleProductsUpdated);
    };
  }, []);

  const currentTabConfig = TABS.find((t) => t.id === activeTab) || TABS[0];
  let filteredProducts = catalogProducts.filter(currentTabConfig.filter);
  if (filteredProducts.length === 0) {
    filteredProducts = catalogProducts.slice(0, 4);
  }
  const displayProducts = filteredProducts.slice(0, 8);

  const handleWishlistClick = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowSaved = toggleWishlist(product);
    setWishlistIds((prev) => {
      const next = new Set(prev);
      if (isNowSaved) next.add(product.id);
      else next.delete(product.id);
      return next;
    });
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      pricePaise: product.pricePaise,
      image: product.images[0]?.url || '',
      quantity: 1
    });

    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Section Header with Dynamic Headline & Tab Pills */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-4 border-b border-[#e5ded3]">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8d3f3d] flex items-center gap-1.5">
            <span className="text-[#c5a059]">✦</span>
            <span>CURATED ATELIER EDIT</span>
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#171513] tracking-tight mt-1">
            Engineered For Everyday Elegance
          </h2>
          <p className="text-xs sm:text-sm text-[#6e6863] mt-1 max-w-lg">
            Guaranteed 100% waterproof, sweat-resistant 18K vacuum gold PVD over 316L surgical stainless steel. Zero green skin marks.
          </p>
        </div>

        {/* Filter Tab Pills (shadcn style responsive horizontal strip) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-2  text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#171513] text-white shadow-sm'
                    : 'bg-[#faf8f5] text-[#332f2c] hover:bg-[#f2ece4] border border-[#e5ded3]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2  font-bold ${
                      isActive ? 'bg-[#8d3f3d] text-white' : 'bg-[#eef8f3] text-[#1b6d48]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Product Grid (2-Cols Mobile / 4-Cols Desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in duration-300">
        {displayProducts.map((product) => {
          const isSaved = wishlistIds.has(product.id);
          const rawPrimary = product.images[0]?.url || '';
          const rawSecondary = product.images[1]?.url || rawPrimary;
          const primaryImg = getOptimizedImageUrl(rawPrimary, 450);
          const secondaryImg = getOptimizedImageUrl(rawSecondary, 450);

          const discount = product.compareAtPricePaise
            ? Math.round(((product.compareAtPricePaise - product.pricePaise) / product.compareAtPricePaise) * 100)
            : 0;

          return (
            <div
              key={product.id}
              className="product-card group relative flex flex-col bg-white border border-[#e5ded3] rounded-[18px] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_28px_rgba(23,21,19,0.06)] hover:border-[#c5a059]/40"
            >
              {/* 3:4 Squircle Aspect Container */}
              <a
                href={`/products/${product.slug}`}
                className="relative block aspect-[3/4] overflow-hidden bg-[#faf8f5] rounded-t-[18px]"
                aria-label={product.name}
              >
                {/* Top Left Badges */}
                <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
                  {product.isBestseller && (
                    <span className="bg-[#8d3f3d] text-white text-[9px] font-semibold uppercase tracking-[0.08em] px-2.5 py-0.5">
                      Hot Selling
                    </span>
                  )}
                  {discount > 0 && (
                    <span className="bg-[#171513] text-[#fbf8f5] text-[9px] font-bold px-2 py-0.5">
                      -{discount}%
                    </span>
                  )}
                  {product.isNewArrival && !product.isBestseller && (
                    <span className="bg-[#c5a059] text-white text-[9px] font-bold uppercase tracking-[0.08em] px-2 py-0.5">
                      New
                    </span>
                  )}
                </div>

                {/* Wishlist Heart Button */}
                <button
                  type="button"
                  onClick={(e) => handleWishlistClick(e, product)}
                  className={`absolute bottom-2.5 right-2.5 z-10 w-8 h-8  border border-[#e5ded3] flex items-center justify-center transition-all  hover:shadow-md cursor-pointer hover:scale-105 active:scale-95 ${
                    isSaved
                      ? 'bg-[#f4efe7] text-[#8d3f3d] border-[#8d3f3d]'
                      : 'bg-white/95 hover:bg-white text-[#171513] hover:text-[#8d3f3d]'
                  }`}
                  aria-label={`Save ${product.name} to wishlist`}
                >
                  <svg
                    className={`w-4 h-4 stroke-[1.8] ${isSaved ? 'fill-current' : 'fill-none'}`}
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                    />
                  </svg>
                </button>

                {/* Primary Image */}
                <img
                  src={primaryImg}
                  alt={product.name}
                  width="400"
                  height="533"
                  loading="lazy"
                  decoding="async"
                  className="product-card-image absolute inset-0 w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                />

                {/* Hover Image */}
                <img
                  src={secondaryImg}
                  alt={`${product.name} detail view`}
                  width="400"
                  height="533"
                  loading="lazy"
                  decoding="async"
                  className="product-card-image absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              </a>

              {/* Card Content */}
              <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between space-y-2.5 bg-white">
                <div className="space-y-1">
                  {/* Star Rating */}
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <div className="flex items-center text-[#c5a059] gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-3 h-3 ${i < Math.round(product.rating) ? 'fill-current' : 'text-gray-200 fill-current'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-bold text-[#171513] text-[11px]">{product.rating}</span>
                    <span className="text-[#6e6863] text-[10px]">({product.reviewCount})</span>
                  </div>

                  {/* Product Name */}
                  <h3 className="text-[13px] sm:text-[14px] font-medium text-[#171513] leading-snug line-clamp-2 hover:text-[#8d3f3d] transition-colors">
                    <a href={`/products/${product.slug}`}>{product.name}</a>
                  </h3>

                  <p className="text-[11px] text-[#6e6863] line-clamp-1">{product.material}</p>
                </div>

                {/* Price & Add to Bag */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-base sm:text-lg text-[#171513]">
                      {formatPrice(product.pricePaise)}
                    </span>
                    {product.compareAtPricePaise && (
                      <span className="text-xs text-[#99918b] line-through font-normal">
                        {formatPrice(product.compareAtPricePaise)}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, product)}
                    aria-label={`Add ${product.name} to cart`}
                    className={`quick-add-btn w-full py-2.5 rounded-[10px] text-[11px] font-bold uppercase tracking-[0.08em] transition-all duration-200  hover:shadow-md cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.99] ${
                      addedId === product.id
                        ? 'bg-[#1b6d48] text-white'
                        : 'bg-[#171513] hover:bg-[#8d3f3d] text-white'
                    }`}
                  >
                    {addedId === product.id ? (
                      <>
                        <svg className="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span>ADDED TO BAG</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 stroke-[1.8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                          />
                        </svg>
                        <span>ADD TO BAG</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* View All CTA */}
      <div className="mt-10 text-center">
        <a
          href="/shop"
          className="inline-flex items-center gap-2 bg-[#faf8f5] hover:bg-[#171513] text-[#171513] hover:text-white border border-[#e5ded3] px-8 py-3.5 text-xs font-bold uppercase tracking-[0.12em] transition-all duration-200 hover:shadow-md cursor-pointer"
        >
          <span>EXPLORE COMPLETE COLLECTION ({PRODUCTS.length} SUITES)</span>
          <svg className="w-4 h-4 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </section>
  );
}
