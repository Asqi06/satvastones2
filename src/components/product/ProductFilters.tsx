"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { PRODUCT_STYLES, MATERIALS, PRICE_RANGES } from "@/lib/constants";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductFilters({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const currentStyle = searchParams.get("style") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentMaterial = searchParams.get("material") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentPrice = searchParams.get("maxPrice") || "";

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname]
  );

  const clearFilters = () => {
    router.push(pathname);
  };

  const activeFilters = [currentStyle, currentCategory, currentMaterial, currentPrice].filter(
    Boolean
  ).length;

  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "price-asc", label: "Price: Low to High" },
    { value: "price-desc", label: "Price: High to Low" },
    { value: "best-selling", label: "Best Selling" },
  ];

  return (
    <div className="mb-8">
      {/* Desktop Filters */}
      <div className="hidden lg:flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Style Filter */}
          <div className="relative">
            <select
              value={currentStyle}
              onChange={(e) => updateFilter("style", e.target.value)}
              className="appearance-none bg-[var(--white)] border border-[var(--line)] px-4 py-2.5 pr-10 text-[12px] text-[var(--ink)] focus:outline-none focus:border-[var(--olive)] cursor-pointer"
            >
              <option value="">All Styles</option>
              {PRODUCT_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={currentCategory}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="appearance-none bg-[var(--white)] border border-[var(--line)] px-4 py-2.5 pr-10 text-[12px] text-[var(--ink)] focus:outline-none focus:border-[var(--olive)] cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
          </div>

          {/* Material Filter */}
          <div className="relative">
            <select
              value={currentMaterial}
              onChange={(e) => updateFilter("material", e.target.value)}
              className="appearance-none bg-[var(--white)] border border-[var(--line)] px-4 py-2.5 pr-10 text-[12px] text-[var(--ink)] focus:outline-none focus:border-[var(--olive)] cursor-pointer"
            >
              <option value="">All Materials</option>
              {MATERIALS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
          </div>

          {/* Price Filter */}
          <div className="relative">
            <select
              value={currentPrice}
              onChange={(e) => {
                const params = new URLSearchParams(searchParams.toString());
                if (e.target.value) {
                  const range = PRICE_RANGES.find((r) => r.max.toString() === e.target.value);
                  if (range) {
                    params.set("minPrice", range.min.toString());
                    params.set("maxPrice", range.max.toString());
                  }
                } else {
                  params.delete("minPrice");
                  params.delete("maxPrice");
                }
                params.delete("page");
                router.push(`${pathname}?${params.toString()}`);
              }}
              className="appearance-none bg-[var(--white)] border border-[var(--line)] px-4 py-2.5 pr-10 text-[12px] text-[var(--ink)] focus:outline-none focus:border-[var(--olive)] cursor-pointer"
            >
              <option value="">All Prices</option>
              {PRICE_RANGES.map((r) => (
                <option key={r.label} value={r.max}>
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
          </div>

          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-[12px] text-[var(--muted)] hover:text-[var(--ink)] underline underline-offset-4"
            >
              <X className="w-3.5 h-3.5" />
              Clear ({activeFilters})
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="appearance-none bg-[var(--white)] border border-[var(--line)] px-4 py-2.5 pr-10 text-[12px] text-[var(--ink)] focus:outline-none focus:border-[var(--olive)] cursor-pointer"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[var(--white)] border border-[var(--line)] text-[12px] text-[var(--ink)]"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilters > 0 && (
            <span className="w-5 h-5 bg-[var(--olive)] text-[var(--white)] text-[11px] font-semibold rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>

        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="appearance-none bg-[var(--white)] border border-[var(--line)] px-4 py-2.5 pr-10 text-[12px] text-[var(--ink)] focus:outline-none focus:border-[var(--olive)]"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
        </div>
      </div>

      {/* Mobile Filter Panel */}
      {isOpen && (
        <div className="lg:hidden mt-4 bg-[var(--white)] p-6 border border-[var(--line)] space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-2.5">Style</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter("style", "")}
                className={`px-3.5 py-1.5 rounded-full text-[12px] border transition-colors ${!currentStyle ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]" : "bg-transparent text-[var(--muted)] border-[var(--line)]"}`}
              >
                All
              </button>
              {PRODUCT_STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => updateFilter("style", s.value)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] border transition-colors ${currentStyle === s.value ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]" : "bg-transparent text-[var(--muted)] border-[var(--line)]"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-2.5">Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter("category", "")}
                className={`px-3.5 py-1.5 rounded-full text-[12px] border transition-colors ${!currentCategory ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]" : "bg-transparent text-[var(--muted)] border-[var(--line)]"}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => updateFilter("category", c.slug)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] border transition-colors ${currentCategory === c.slug ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]" : "bg-transparent text-[var(--muted)] border-[var(--line)]"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.14em] text-[var(--muted)] mb-2.5">Material</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter("material", "")}
                className={`px-3.5 py-1.5 rounded-full text-[12px] border transition-colors ${!currentMaterial ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]" : "bg-transparent text-[var(--muted)] border-[var(--line)]"}`}
              >
                All
              </button>
              {MATERIALS.slice(0, 6).map((m) => (
                <button
                  key={m}
                  onClick={() => updateFilter("material", m)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] border transition-colors ${currentMaterial === m ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]" : "bg-transparent text-[var(--muted)] border-[var(--line)]"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {activeFilters > 0 && (
            <button
              onClick={() => {
                clearFilters();
                setIsOpen(false);
              }}
              className="w-full py-2.5 text-[12px] text-[var(--muted)] border border-[var(--line)] hover:text-[var(--ink)] hover:border-[var(--ink)] transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
