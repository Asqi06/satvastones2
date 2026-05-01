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
              className="appearance-none bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-[#C9A96E] cursor-pointer"
            >
              <option value="">All Styles</option>
              {PRODUCT_STYLES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={currentCategory}
              onChange={(e) => updateFilter("category", e.target.value)}
              className="appearance-none bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-[#C9A96E] cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Material Filter */}
          <div className="relative">
            <select
              value={currentMaterial}
              onChange={(e) => updateFilter("material", e.target.value)}
              className="appearance-none bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-[#C9A96E] cursor-pointer"
            >
              <option value="">All Materials</option>
              {MATERIALS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
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
              className="appearance-none bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-[#C9A96E] cursor-pointer"
            >
              <option value="">All Prices</option>
              {PRICE_RANGES.map((r) => (
                <option key={r.label} value={r.max}>
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {activeFilters > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-red-400 hover:text-red-300"
            >
              <X className="w-4 h-4" />
              Clear ({activeFilters})
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="appearance-none bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:outline-none focus:border-[#C9A96E] cursor-pointer"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden flex items-center justify-between">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-white"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilters > 0 && (
            <span className="w-5 h-5 bg-[#C9A96E] text-black text-xs font-bold rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>

        <div className="relative">
          <select
            value={currentSort}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="appearance-none bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 pr-10 text-sm text-white focus:outline-none"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      {/* Mobile Filter Panel */}
      {isOpen && (
        <div className="lg:hidden mt-4 bg-[#1a1a1a] rounded-xl p-6 border border-[#2a2a2a] space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Style</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter("style", "")}
                className={`px-3 py-1.5 rounded-lg text-sm ${!currentStyle ? "bg-[#C9A96E] text-black" : "bg-[#0f0f0f] text-gray-400 border border-[#2a2a2a]"}`}
              >
                All
              </button>
              {PRODUCT_STYLES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => updateFilter("style", s.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${currentStyle === s.value ? "bg-[#C9A96E] text-black" : "bg-[#0f0f0f] text-gray-400 border border-[#2a2a2a]"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter("category", "")}
                className={`px-3 py-1.5 rounded-lg text-sm ${!currentCategory ? "bg-[#C9A96E] text-black" : "bg-[#0f0f0f] text-gray-400 border border-[#2a2a2a]"}`}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c.slug}
                  onClick={() => updateFilter("category", c.slug)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${currentCategory === c.slug ? "bg-[#C9A96E] text-black" : "bg-[#0f0f0f] text-gray-400 border border-[#2a2a2a]"}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Material</label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => updateFilter("material", "")}
                className={`px-3 py-1.5 rounded-lg text-sm ${!currentMaterial ? "bg-[#C9A96E] text-black" : "bg-[#0f0f0f] text-gray-400 border border-[#2a2a2a]"}`}
              >
                All
              </button>
              {MATERIALS.slice(0, 6).map((m) => (
                <button
                  key={m}
                  onClick={() => updateFilter("material", m)}
                  className={`px-3 py-1.5 rounded-lg text-sm ${currentMaterial === m ? "bg-[#C9A96E] text-black" : "bg-[#0f0f0f] text-gray-400 border border-[#2a2a2a]"}`}
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
              className="w-full py-2.5 text-sm text-red-400 border border-red-400/30 rounded-lg hover:bg-red-400/10"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
