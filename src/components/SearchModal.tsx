import React, { useState, useEffect, useRef } from 'react';
import { PRODUCTS, formatPrice } from '../data/products';
import type { Product } from '../types/ecommerce';

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 50);
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

    const filtered = PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q)
    );
    setResults(filtered);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-white rounded-[22px] shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center gap-3 bg-white">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search rings, necklaces, bracelets, earrings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm sm:text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2.5 py-1 rounded-lg uppercase tracking-wider font-bold transition-colors cursor-pointer"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Pills */}
        {!query && (
          <div className="p-4 sm:p-5 bg-[#fffafb] border-b border-[#f9d8dc] text-xs">
            <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px] block mb-2">Popular Searches:</span>
            <div className="flex flex-wrap gap-2">
              {['Waterproof Necklace', 'Snake Chain', 'Croissant Ring', 'Huggie Earrings', 'Bangles'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="bg-white hover:bg-[#ffe7e9] text-gray-700 hover:text-[#f2707f] border border-gray-200 px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-gray-100">
          {query && results.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <p className="text-sm font-bold text-gray-800">No matching jewellery found</p>
              <p className="text-xs text-gray-400">Try searching for "necklace", "ring", "earring", or "18K".</p>
            </div>
          ) : (
            results.map((product) => (
              <a
                key={product.id}
                href={`/products/${product.slug}`}
                onClick={() => setIsOpen(false)}
                className="py-3 flex items-center gap-3.5 hover:bg-[#fffafb] p-2 rounded-[14px] transition-colors group"
              >
                <img
                  src={product.images[0]?.url}
                  alt={product.name}
                  className="w-12 h-14 object-cover rounded-[10px] bg-gray-50 border border-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] uppercase font-bold text-[#a1505a] tracking-wider">
                    {product.category}
                  </span>
                  <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#f2707f] transition-colors">
                    {product.name}
                  </h4>
                  <p className="text-xs text-gray-400">
                    18K Gold PVD • 316L Surgical Steel
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-[#f2707f]">
                    {formatPrice(product.pricePaise)}
                  </span>
                  {product.compareAtPricePaise && (
                    <span className="block text-[11px] text-gray-400 line-through">
                      {formatPrice(product.compareAtPricePaise)}
                    </span>
                  )}
                </div>
              </a>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 px-5">
          <span>Free express delivery on orders above ₹499</span>
          <span className="text-gray-500">Dispatched from Vapi in 24–48h</span>
        </div>
      </div>
    </div>
  );
}
