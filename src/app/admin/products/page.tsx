"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Plus, Edit, Trash2, Search, Star, Sparkles, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef } from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  stock: number;
  sku: string;
  isActive: boolean;
  isBestSeller: boolean;
  isNewCollection: boolean;
  category?: { id: string; name: string; slug: string };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 12, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState<string | null>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  const fetchProducts = useCallback(async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "12");
    if (search) params.set("search", search);
    if (selectedCategory) params.set("category", selectedCategory);
    params.set("sort", "newest");

    try {
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      let filtered = data.products || [];

      if (stockFilter) {
        filtered = filtered.filter((p: Product) => {
          if (stockFilter === "in-stock") return p.stock > 5;
          if (stockFilter === "low-stock") return p.stock > 0 && p.stock <= 5;
          if (stockFilter === "out-of-stock") return p.stock === 0;
          return true;
        });
      }

      setProducts(filtered);
      setPagination(data.pagination || { page: 1, limit: 12, total: 0, pages: 0 });
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, stockFilter]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts(1);
    setSelectedIds(new Set());
  }, [fetchProducts]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {}, 0);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      }
    } finally {
      setDeleting(null);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getStockBadge = (stock: number) => {
    if (stock === 0) return <span className="inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full bg-red-100 text-red-700">Out of Stock</span>;
    if (stock <= 5) return <span className="inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700">Low Stock</span>;
    return <span className="inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full bg-green-100 text-green-700">In Stock</span>;
  };

  const pages = Array.from({ length: pagination.pages }, (_, i) => i + 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-serif text-luxury-brown">Products</h1>
          <p className="text-sm text-luxury-brown/50 mt-1">{pagination.total} product{pagination.total !== 1 ? "s" : ""} total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-luxury-gold text-white px-6 py-3 text-[11px] font-bold tracking-widest uppercase hover:bg-luxury-brown transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
        <div className="relative flex-1 w-full lg:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-luxury-brown/30 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-luxury-brown/10 text-sm focus:outline-none focus:border-luxury-gold transition-colors"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2.5 bg-white border border-luxury-brown/10 text-xs tracking-wider uppercase font-bold outline-none focus:border-luxury-gold transition-colors"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-luxury-brown/10 text-xs tracking-wider uppercase font-bold outline-none focus:border-luxury-gold transition-colors"
        >
          <option value="">All Stock</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-luxury-gold/10 border border-luxury-gold/20 text-sm text-luxury-brown">
          <span className="font-bold">{selectedIds.size} selected</span>
          <button
            onClick={async () => {
              if (!confirm(`Delete ${selectedIds.size} product(s)?`)) return;
              for (const id of selectedIds) {
                await fetch(`/api/products/${id}`, { method: "DELETE" });
              }
              setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)));
              setSelectedIds(new Set());
            }}
            className="text-red-600 hover:text-red-700 font-bold text-xs uppercase tracking-wider"
          >
            Delete Selected
          </button>
        </div>
      )}

      <div className="bg-white border border-luxury-brown/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-luxury-brown/10 bg-luxury-cream/30">
                <th className="px-5 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedIds.size === products.length}
                    onChange={toggleSelectAll}
                    className="accent-luxury-gold w-4 h-4"
                  />
                </th>
                <th className="text-left text-[10px] text-luxury-brown/50 uppercase tracking-widest px-5 py-4 font-bold">Product</th>
                <th className="text-left text-[10px] text-luxury-brown/50 uppercase tracking-widest px-5 py-4 font-bold">SKU</th>
                <th className="text-left text-[10px] text-luxury-brown/50 uppercase tracking-widest px-5 py-4 font-bold">Category</th>
                <th className="text-left text-[10px] text-luxury-brown/50 uppercase tracking-widest px-5 py-4 font-bold">Stock</th>
                <th className="text-right text-[10px] text-luxury-brown/50 uppercase tracking-widest px-5 py-4 font-bold">Price</th>
                <th className="text-center text-[10px] text-luxury-brown/50 uppercase tracking-widest px-5 py-4 font-bold">Status</th>
                <th className="text-right text-[10px] text-luxury-brown/50 uppercase tracking-widest px-5 py-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-brown/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-20 text-center">
                    <Loader2 className="w-6 h-6 text-luxury-gold animate-spin mx-auto" />
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-20 text-center text-luxury-brown/30 uppercase tracking-[0.3em] font-bold text-xs">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-luxury-cream/20 transition-colors group">
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(product.id)}
                        onChange={() => toggleSelect(product.id)}
                        className="accent-luxury-gold w-4 h-4"
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-luxury-cream relative rounded-sm overflow-hidden border border-luxury-brown/5 shrink-0">
                          {product.images?.[0] && (
                            <Image src={product.images[0]} alt="" fill className="object-cover" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-luxury-brown truncate">{product.name}</span>
                            {product.isBestSeller && (
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                            {product.isNewCollection && (
                              <Sparkles className="w-3.5 h-3.5 text-blue-500 fill-blue-500 shrink-0" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-luxury-brown/40 text-[11px] font-mono tracking-tighter uppercase">{product.sku}</td>
                    <td className="px-5 py-4 text-luxury-brown/60 text-sm">{product.category?.name || "—"}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {getStockBadge(product.stock)}
                        <span className="text-[11px] text-luxury-brown/40">({product.stock})</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-luxury-brown">{formatPrice(product.price)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full ${
                        product.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {product.isActive ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/products/new?id=${product.id}`}
                          className="p-2 text-luxury-brown/30 hover:text-luxury-gold hover:bg-luxury-gold/5 transition-colors rounded"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="p-2 text-luxury-brown/30 hover:text-red-500 hover:bg-red-50 transition-colors rounded disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-luxury-brown/40">
            Page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => fetchProducts(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 text-luxury-brown/40 hover:text-luxury-brown hover:bg-luxury-cream/50 transition-colors disabled:opacity-30 disabled:pointer-events-none rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pages.map((p) => (
              <button
                key={p}
                onClick={() => fetchProducts(p)}
                className={`min-w-[32px] h-8 text-xs font-bold transition-colors rounded ${
                  p === pagination.page
                    ? "bg-luxury-gold text-white"
                    : "text-luxury-brown/50 hover:bg-luxury-cream/50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => fetchProducts(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="p-2 text-luxury-brown/40 hover:text-luxury-brown hover:bg-luxury-cream/50 transition-colors disabled:opacity-30 disabled:pointer-events-none rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
