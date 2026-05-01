"use client";

import { useState, useEffect } from "react";
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
  category: { name: string; slug: string };
  _count?: { reviews: number };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProductsPageClient({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(data.products || []);
        setPagination(data.pagination || { page: 1, pages: 1, total: 0 });
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const currentPage = parseInt(searchParams.get("page") || "1");
  const searchQuery = searchParams.get("search");

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    window.location.href = `?${params.toString()}`;
  };

  return (
    <div className="bg-luxury-cream min-h-screen pt-32 pb-20">
      <div className="container-premium">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-luxury-brown/5 pb-16 mb-20 gap-10">
          <div className="animate-luxury-fade">
            <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase mb-4 font-bold">The Archives</p>
            <h1 className="heading-xl font-serif text-luxury-brown leading-[1.1]">
              {searchQuery ? `Seeking: "${searchQuery}"` : "Full Collection"}
            </h1>
          </div>
          <div className="bg-white border border-luxury-brown/5 px-8 py-4 animate-luxury-fade shadow-sm">
            <p className="text-luxury-brown/60 text-[10px] tracking-widest uppercase font-bold">
              {pagination.total} <span className="text-luxury-brown">Artifacts Catalougued</span>
            </p>
          </div>
        </div>

        <div className="mb-20 animate-luxury-fade delay-100">
          <ProductFilters categories={categories} />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-6">
                <div className="aspect-[4/5] bg-white/5"></div>
                <div className="h-4 bg-white/5 w-1/4"></div>
                <div className="h-6 bg-white/5 w-3/4"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="py-40 text-center flex flex-col items-center justify-center animate-luxury-fade bg-white border border-luxury-brown/5">
            <div className="w-16 h-16 rounded-full border border-luxury-brown/10 flex items-center justify-center mb-8">
              <Search className="w-6 h-6 text-luxury-brown/20" />
            </div>
            <h2 className="text-3xl font-serif text-luxury-brown mb-4 italic">No matches found in the repository</h2>
            <p className="text-luxury-brown/40 text-[10px] tracking-[0.4em] uppercase font-bold">Consider refining your curation parameters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-16 animate-luxury-fade delay-200">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-10 mt-40 border-t border-luxury-brown/10 pt-20">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="p-4 border border-luxury-brown/10 text-luxury-brown/40 hover:text-luxury-brown hover:border-luxury-brown transition-all disabled:opacity-0"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div className="flex items-center gap-6">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === pagination.pages || Math.abs(p - currentPage) <= 1)
                    .map((page, idx, arr) => (
                      <span key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-4 text-luxury-brown/10 font-serif">...</span>
                        )}
                        <button
                          onClick={() => goToPage(page)}
                          className={`text-sm font-bold tracking-widest transition-all duration-500 ${
                            page === currentPage
                              ? "text-luxury-gold scale-125"
                              : "text-luxury-brown/40 hover:text-luxury-brown"
                          }`}
                        >
                          {page.toString().padStart(2, '0')}
                        </button>
                      </span>
                    ))}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= pagination.pages}
                  className="p-4 border border-white/10 text-white/40 hover:text-white hover:border-white transition-all disabled:opacity-0"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
