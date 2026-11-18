import React, { useState, useEffect, useRef } from 'react';
import { formatPrice } from '../data/products';
import { ensureCatalog } from '../stores/catalogStore';
import type { Product } from '../types/ecommerce';

const POPULAR = ['Waterproof necklace', 'Snake chain', 'Croissant ring', 'Kada bangle', 'Baroque pearl', 'Gift set'];

export default function SearchModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  // Refresh the live catalogue every time the palette opens, so products added
  // in the admin panel are searchable without a page rebuild.
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    ensureCatalog()
      .then((products) => {
        if (!cancelled) setCatalog(products);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    const handleOpen = () => {
      lastFocused.current = document.activeElement as HTMLElement | null;
      setIsOpen(true);
      setTimeout(() => inputRef.current?.focus(), 60);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('satvastones:open_search', handleOpen);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('satvastones:open_search', handleOpen);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock background scroll while open, restore focus on close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      lastFocused.current?.focus?.();
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', trap);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', trap);
    };
  }, [isOpen]);

  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setResults([]);
      return;
    }

    const filtered = catalog.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.headline.toLowerCase().includes(q)
    );
    setResults(filtered.slice(0, 8));
  }, [query, catalog]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-[#14110f]/60 px-4 pt-12 backdrop-blur-sm sm:pt-20"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Search Satvastones Jewellery"
    >
      <div
        ref={panelRef}
        className="flex max-h-[82vh] w-full max-w-2xl flex-col overflow-hidden border border-[#e5ded3] bg-[#fbf9f5] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search header */}
        <div className="flex items-center gap-3 border-b border-[#e5ded3] bg-white px-4 py-3.5 sm:px-5">
          <svg
            className="h-4 w-4 shrink-0 text-[#c5a059]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.6}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search rings, chains, bracelets, earrings…"
            aria-label="Search jewellery collections"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-[13.5px] text-[#14110f] placeholder:text-[#9a938b] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="cursor-pointer px-1 text-[11px] uppercase tracking-[0.1em] text-[#8a8279] transition-colors hover:text-[#14110f]"
              aria-label="Clear search"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close search"
            className="shrink-0 cursor-pointer border border-[#e5ded3] bg-[#fbf9f5] px-2 py-1 text-[9px] uppercase tracking-[0.12em] text-[#6f675f] transition-colors hover:border-[#14110f] hover:text-[#14110f]"
          >
            Esc
          </button>
        </div>

        {/* Suggestions */}
        {!query && (
          <div className="border-b border-[#e5ded3] bg-[#f4efe7] px-4 py-4 sm:px-5">
            <span className="mb-2.5 block text-[9px] uppercase tracking-[0.16em] text-[#8a8279]">Popular searches</span>
            <div className="flex flex-wrap gap-2">
              {POPULAR.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="cursor-pointer border border-[#ded5c7] bg-[#fbf9f5] px-3 py-1.5 text-[10.5px] text-[#4a443f] transition-colors hover:border-[#14110f] hover:text-[#14110f]"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {query && results.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="font-display text-[1.3rem] text-[#14110f]">Nothing matched “{query}”.</p>
              <p className="mx-auto mt-1.5 max-w-xs text-[11.5px] leading-relaxed text-[#6f675f]">
                Try a category like necklace, ring or bangle — or browse the full collection.
              </p>
              <a
                href="/shop"
                onClick={() => setIsOpen(false)}
                className="mt-5 inline-flex items-center gap-2 bg-[#14110f] px-5 py-2.5 text-[9px] uppercase tracking-[0.14em] text-[#f6f1e8]"
              >
                Shop all pieces <span aria-hidden="true">→</span>
              </a>
            </div>
          ) : (
            <ul className="divide-y divide-[#e5ded3]">
              {results.map((product) => (
                <li key={product.id}>
                  <a
                    href={`/products/${product.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="group flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-[#f4efe7] sm:px-5"
                  >
                    <img
                      src={product.images[0]?.url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-16 w-[3.25rem] shrink-0 border border-[#e5ded3] bg-[#f1ece3] object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block text-[8.5px] uppercase tracking-[0.16em] text-[#8a8279]">
                        {product.category}
                      </span>
                      <h4 className="mt-0.5 truncate text-[12.5px] text-[#14110f] transition-colors group-hover:text-[#8d3f3d]">
                        {product.name}
                      </h4>
                      <p className="mt-0.5 truncate text-[10.5px] text-[#8a8279]">{product.material}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-[12.5px] font-medium text-[#14110f]">
                        {formatPrice(product.pricePaise)}
                      </span>
                      {product.compareAtPricePaise && (
                        <span className="block text-[10px] text-[#9a938b] line-through">
                          {formatPrice(product.compareAtPricePaise)}
                        </span>
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-[#e5ded3] bg-[#f4efe7] px-4 py-3 text-[9px] uppercase tracking-[0.12em] text-[#6f675f] sm:px-5">
          <span className="flex items-center gap-1.5">
            <span className="text-[#c5a059]" aria-hidden="true">✦</span>
            Free express delivery over ₹499
          </span>
          <span className="hidden sm:inline">Dispatched from Vapi</span>
        </div>
      </div>
    </div>
  );
}
