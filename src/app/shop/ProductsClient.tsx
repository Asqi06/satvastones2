"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import ProductFilters from "@/components/product/ProductFilters";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  material: string | null;
  style: string;
  stock: number;
  category?: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Pagination {
  page: number;
  pages: number;
  total: number;
}

export default function ProductsPageClient({
  categories,
  products,
  pagination,
  searchQuery,
}: {
  categories: Category[];
  products: Product[];
  pagination: Pagination;
  searchQuery: string | null;
}) {
  const searchParams = useSearchParams();
  const currentPage = pagination.page;

  const pageHref = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", page.toString());
    }
    const query = params.toString();
    return query ? `/shop?${query}` : "/shop";
  };

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <div className="editorial-container py-10 lg:py-14">
        <div className="section-heading">
          <div>
            <div className="eyebrow">Korean · Anti-tarnish · Waterproof</div>
            <h1 className="font-serif font-normal tracking-[-0.035em] leading-[1.05] text-[clamp(42px,4.3vw,63px)] mt-3">
              {searchQuery ? (
                <>Seeking <em className="text-[var(--olive)]">“{searchQuery}”.</em></>
              ) : (
                <>Shop <em className="text-[var(--olive)]">everyday gold.</em></>
              )}
            </h1>
            {!searchQuery && (
              <p className="text-[var(--muted)] mt-4 max-w-2xl leading-relaxed text-[13px]">
                Korean &amp; aesthetic earrings, necklaces, rings &amp; bracelets — anti-tarnish, waterproof, skin-safe. Gifts for her from under ₹500 with COD &amp; free shipping over ₹399.
              </p>
            )}
          </div>
          <span className="product-count" aria-live="polite">
            {pagination.total} pieces
          </span>
        </div>

        <ProductFilters categories={categories} />

        {products.length === 0 ? (
          <div className="empty-products">
            <div className="round-arrow mx-auto mb-6" aria-hidden="true">
              <Search className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-[32px] font-normal mb-3">Nothing here just yet</h2>
            <p className="text-[11px] text-[var(--muted)]">Try a different search or category.</p>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <nav
                aria-label="Pagination"
                className="flex items-center justify-center gap-8 mt-14 pt-10 border-t border-[var(--line)]"
              >
                {currentPage > 1 ? (
                  <Link
                    href={pageHref(currentPage - 1)}
                    rel="prev"
                    aria-label="Previous page"
                    className="round-arrow"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="round-arrow opacity-0" aria-hidden="true">
                    <ChevronLeft className="w-4 h-4" />
                  </span>
                )}

                <div className="flex items-center gap-5">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - currentPage) <= 1)
                    .map((page, idx, arr) => (
                      <span key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-3 text-[var(--muted)] font-serif">…</span>
                        )}
                        <Link
                          href={pageHref(page)}
                          aria-current={page === currentPage ? "page" : undefined}
                          className={`text-[13px] tracking-wide transition-colors ${
                            page === currentPage
                              ? "text-[var(--olive)] font-semibold"
                              : "text-[var(--muted)] hover:text-[var(--ink)]"
                          }`}
                        >
                          {page.toString().padStart(2, "0")}
                        </Link>
                      </span>
                    ))}
                </div>

                {currentPage < pagination.pages ? (
                  <Link
                    href={pageHref(currentPage + 1)}
                    rel="next"
                    aria-label="Next page"
                    className="round-arrow"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <span className="round-arrow opacity-0" aria-hidden="true">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                )}
              </nav>
            )}
          </>
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
