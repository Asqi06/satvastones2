import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, SlidersHorizontal, X, Play, Pause } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { optimizeImage, getSrcSet } from '../utils/cloudinary';

const CATEGORIES = [
  { slug: 'all', label: 'All' },
  { slug: 'necklaces', label: 'Necklaces' },
  { slug: 'name-necklace', label: 'Name Necklace' },
  { slug: 'earrings', label: 'Earrings' },
  { slug: 'rings', label: 'Rings' },
  { slug: 'bracelets', label: 'Bracelets' },
  { slug: 'accessories', label: 'Accessories' },
  { slug: 'pendant', label: 'Pendant' },
  { slug: 'gifts', label: 'Gifts' },
  { slug: 'hampers', label: 'Hampers' },
  { slug: 'mothers-day', label: "Mother's Day" },
];

const SORT_OPTIONS = [
  'Featured',
  'Alphabetically, A-Z',
  'Alphabetically, Z-A',
  'Price, low to high',
  'Price, high to low',
  'Date, old to new',
  'Date, new to old',
];

export default function ShopPage({ 
  products,
  onSelectProduct,
  cmsData
}: { 
  products: any[],
  onSelectProduct: (p: any) => void,
  cmsData?: any 
}) {
  const { category: urlCategory } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  
  const [activeCategory, setActiveCategory] = useState(urlCategory?.toLowerCase() || 'all');
  const [sortBy, setSortBy] = useState('Featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setActiveCategory(urlCategory?.toLowerCase() || 'all');
  }, [urlCategory]);

  // Close sort dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const SLUG_TO_PRODUCT_CATEGORY: Record<string, string | undefined> = {
    'necklaces': 'necklaces',
    'name-necklace': 'name necklace',
    'earrings': 'earrings',
    'rings': 'rings',
    'bracelets': 'bracelets',
    'accessories': 'accessories',
    'pendant': 'pendant',
    'gifts': 'gifts',
    'hampers': 'hampers',
    'mothers-day': "mother's day",
  };

  const setCategory = (slug: string) => {
    setActiveCategory(slug);
    if (slug === 'all') {
      navigate('/shop');
    } else {
      navigate(`/shop/${slug}`);
    }
  };

  let filteredProducts = activeCategory === 'all' 
    ? [...products] 
    : products.filter(p => p.category?.toLowerCase() === SLUG_TO_PRODUCT_CATEGORY[activeCategory]);

  // Sort
  if (sortBy === 'Price, low to high') {
    filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === 'Price, high to low') {
    filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === 'Date, new to old') {
    filteredProducts.sort((a, b) => String(b._id || b.id || '').localeCompare(String(a._id || a.id || '')));
  } else if (sortBy === 'Date, old to new') {
    filteredProducts.sort((a, b) => String(a._id || a.id || '').localeCompare(String(b._id || b.id || '')));
  } else if (sortBy === 'Alphabetically, A-Z') {
    filteredProducts.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (sortBy === 'Alphabetically, Z-A') {
    filteredProducts.sort((a, b) => (b.title || '').localeCompare(a.title || ''));
  } else if (sortBy === 'Featured') {
    filteredProducts.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Filter / Sort Bar */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-3 sm:px-4 py-3">
          {/* Filter Button */}
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-800 hover:text-[#d4535f] transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filter
          </button>

          {/* Sort By */}
          <div className="relative" ref={sortRef}>
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-gray-800 hover:text-[#d4535f] transition-colors"
            >
              Sort By
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isSortOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white shadow-lg border border-gray-100 rounded-lg overflow-hidden z-50">
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option}
                    onClick={() => { setSortBy(option); setIsSortOpen(false); }}
                    className={`block w-full text-left px-4 py-2.5 text-[11px] hover:bg-pink-50 transition-colors ${
                      sortBy === option ? 'font-bold text-[#d4535f] bg-pink-50' : 'text-gray-600'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilter && (
          <div className="px-3 sm:px-4 pb-3 border-t border-gray-50">
            <div className="flex items-center justify-between py-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Categories</span>
              <button onClick={() => setShowFilter(false)} className="p-1">
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => { setCategory(cat.slug); setShowFilter(false); }}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full transition-all ${
                    activeCategory === cat.slug 
                      ? 'bg-[#f2707f] text-white' 
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Product Count */}
      <div className="px-3 sm:px-4 py-2">
        <p className="text-[10px] text-gray-400">{filteredProducts.length} products</p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4 px-3 sm:px-4 lg:px-6 pb-20">
        {filteredProducts.map(product => {
          const pid = product._id || product.id;
          const hasDiscount = product.oldPrice && product.oldPrice > product.price;
          return (
            <div 
              key={pid} 
              className="group cursor-pointer"
              onClick={() => onSelectProduct(product)}
            >
              {/* Image */}
              <div
                className="relative aspect-square overflow-hidden rounded-lg bg-gray-50"
                onMouseEnter={() => {
                  if (!isTouch && product.video && videoRefs.current[pid]) {
                    const v = videoRefs.current[pid];
                    v.currentTime = 0;
                    v.play().catch(() => {});
                    setActiveVideoId(pid);
                  }
                }}
                onMouseLeave={() => {
                  if (!isTouch && videoRefs.current[pid]) {
                    videoRefs.current[pid].pause();
                    setActiveVideoId(null);
                  }
                }}
              >
                {/* Video (desktop hover) */}
                {product.video && activeVideoId === pid ? (
                  <video
                    ref={(el) => { if (el) videoRefs.current[pid] = el; }}
                    src={product.video}
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : null}
                {/* Primary Image — hide opacity when video is active */}
                <img
                  src={optimizeImage(product.image, 480)}
                  srcSet={getSrcSet(product.image, [320, 480, 768])}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  alt={product.title}
                  loading="lazy"
                  decoding="async"
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${product.video && activeVideoId === pid ? 'opacity-0' : 'group-hover:opacity-0'}`}
                />
                {/* Secondary Image on Hover */}
                {product.images && product.images.length > 1 && (
                  <img
                    src={optimizeImage(product.images[1], 480)}
                    srcSet={getSrcSet(product.images[1], [320, 480, 768])}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    alt={product.title}
                    loading="lazy"
                    decoding="async"
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${product.video && activeVideoId === pid ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}
                  />
                )}

                {/* Mobile play button */}
                {isTouch && product.video && activeVideoId !== pid && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (videoRefs.current[pid]) {
                        const v = videoRefs.current[pid];
                        v.currentTime = 0;
                        v.play().catch(() => {});
                        setActiveVideoId(pid);
                      }
                    }}
                    className="absolute inset-0 z-10 flex items-center justify-center bg-black/10"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                      <Play className="h-5 w-5 ml-0.5 text-stone-900" />
                    </div>
                  </button>
                )}
                {isTouch && product.video && activeVideoId === pid && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (videoRefs.current[pid]) {
                        videoRefs.current[pid].pause();
                        setActiveVideoId(null);
                      }
                    }}
                    className="absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-black/50"
                  >
                    <Pause className="h-3.5 w-3.5 text-white" />
                  </button>
                )}

                {/* Badges */}
                {product.isFeatured && (
                  <span className="absolute top-1.5 left-1.5 bg-[#b32d2d] text-white text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                    Hot Selling
                  </span>
                )}
                {hasDiscount && !product.isFeatured && (
                  <span className="absolute top-1.5 left-1.5 bg-[#b32d2d] text-white text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                    Sale
                  </span>
                )}
                {(product.stockQuantity || 0) <= 0 && (
                  <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 border border-gray-400 px-2 py-0.5">Sold Out</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="mt-1.5 sm:mt-2 px-0.5">
                <h3 className="text-[11px] sm:text-xs font-medium text-gray-800 truncate leading-tight">
                  {product.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-[#c43a4a]">
                    Rs. {product.price}
                  </span>
                  {hasDiscount && (
                    <span className="text-[10px] text-gray-400 line-through">
                      Rs. {product.oldPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <p className="text-sm text-gray-400">No products found in this category</p>
          <button 
            onClick={() => setCategory('all')}
            className="mt-4 text-xs font-bold text-[#d4535f] uppercase tracking-wider"
          >
            View All Products
          </button>
        </div>
      )}
    </div>
  );
}
