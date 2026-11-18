import React, { useState, useEffect, useRef } from 'react';
import { PRODUCTS, formatPrice } from '../data/products';
import { getAllCatalogProducts, syncCatalogFromCloudflare } from '../stores/catalogStore';
import type { Product } from '../types/ecommerce';

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 60);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('satvastones:open_search', handleOpen);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('satvastones:open_search', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }

    const all = getAllCatalogProducts();
    const filtered = all.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.headline.toLowerCase().includes(q)
    );
    setResults(filtered);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-[#171513]/60 backdrop-blur-sm transition-opacity duration-200"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search Satvastones Jewellery"
    >
      <div
        className="w-full max-w-2xl bg-[#fcfbf9] rounded-[24px] shadow-2xl border border-[#eae4dc] overflow-hidden flex flex-col max-h-[82vh] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 sm:p-5 border-b border-[#eae4dc] flex items-center gap-3 bg-white">
          <svg className="w-5 h-5 text-[#9f4553] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search anti-tarnish rings, chains, bracelets, earrings..."
            aria-label="Search jewellery collections"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-[#171513] placeholder:text-[#99918b] focus:outline-none font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#99918b] hover:text-[#171513] p-1 cursor-pointer"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close search modal"
            className="text-[11px] bg-[#faf8f5] hover:bg-[#eae4dc] text-[#6e6863] px-2.5 py-1 rounded-lg uppercase tracking-wider font-bold transition-colors cursor-pointer border border-[#eae4dc]"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        {!query && (
          <div className="p-4 sm:p-5 bg-[#faf8f5] border-b border-[#eae4dc] text-xs">
            <span className="text-[#99918b] font-bold uppercase tracking-[0.14em] text-[10px] block mb-2.5">
              Popular Searches
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                'Waterproof Necklace',
                'Snake Chain',
                'Croissant Ring',
                'Kada Bangle',
                'Baroque Pearl',
                'Gift Set'
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="bg-white hover:bg-[#faf4f2] text-[#332f2c] hover:text-[#9f4553] border border-[#eae4dc] hover:border-[#9f4553]/40 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer shadow-2xs"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-[#eae4dc]">
          {query && results.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#faf4f2] flex items-center justify-center text-[#9f4553]">
                <svg className="w-6 h-6 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p className="text-sm font-bold text-[#171513]">No matching atelier pieces found</p>
              <p className="text-xs text-[#6e6863]">Try searching for "necklace", "ring", "bangle", or "18K gold".</p>
            </div>
          ) : (
            results.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.slug}`}
                onClick={() => setIsOpen(false)}
                className="py-3 flex items-center gap-3.5 hover:bg-[#faf8f5] p-2.5 rounded-[16px] transition-colors group"
              >
                <img
                  src={product.images[0]?.url}
                  alt={product.name}
                  className="w-13 h-16 object-cover rounded-[12px] bg-[#faf8f5] border border-[#eae4dc] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[#9f4553] tracking-wider block">
                    {product.category}
                  </span>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#171513] truncate group-hover:text-[#9f4553] transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-[#6e6863] truncate">
                    {product.material}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-[#171513]">
                    {formatPrice(product.pricePaise)}
                  </span>
                  {product.compareAtPricePaise && (
                    <span className="block text-[11px] text-[#99918b] line-through">
                      {formatPrice(product.compareAtPricePaise)}
                    </span>
                  )}
                </div>
              </a>
            ))
          )}
        </div>

        {/* Search Footer */}
        <div className="p-3.5 bg-[#faf8f5] border-t border-[#eae4dc] flex items-center justify-between text-[11px] text-[#6e6863] px-5">
          <span className="flex items-center gap-1.5">
            <span className="text-[#c5a059]">✦</span>
            <span>Free Express Pan-India Delivery &gt; ₹499</span>
          </span>
          <span className="font-medium text-[#171513]">Direct from Vapi Atelier</span>
        </div>
      </div>
    </div>
  );
}
