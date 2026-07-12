"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Eye,
  EyeOff,
  X,
  Search,
  Image as ImageIcon,
  Package,
} from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface TrendProduct {
  id: string;
  productId: string;
  sortOrder: number;
  product: Product;
}

interface Trend {
  id: string;
  title: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
  products: TrendProduct[];
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<Trend[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showProductPicker, setShowProductPicker] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    image: "",
    sortOrder: "0",
    isActive: true,
  });
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  useEffect(() => {
    fetchTrends();
    fetchProducts();
  }, []);

  const fetchTrends = async () => {
    try {
      const res = await fetch("/api/trends");
      const data = await res.json();
      setTrends(data);
    } catch {
      console.error("Failed to fetch trends");
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch {
      console.error("Failed to fetch products");
    }
  };

  const resetForm = () => {
    setForm({ title: "", image: "", sortOrder: "0", isActive: true });
    setEditingId(null);
    setSelectedProductIds([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      image: form.image,
      sortOrder: parseInt(form.sortOrder),
      isActive: form.isActive,
      productIds: selectedProductIds,
    };

    try {
      if (editingId) {
        await fetch(`/api/trends/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/trends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      fetchTrends();
      setShowForm(false);
      resetForm();
    } catch {
      console.error("Failed to save trend");
    }
  };

  const handleEdit = (trend: Trend) => {
    setEditingId(trend.id);
    setForm({
      title: trend.title,
      image: trend.image,
      sortOrder: trend.sortOrder.toString(),
      isActive: trend.isActive,
    });
    setSelectedProductIds(trend.products.map((tp) => tp.productId));
    setShowForm(true);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/trends/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      setTrends((prev) =>
        prev.map((t) => (t.id === id ? { ...t, isActive: !isActive } : t))
      );
    } catch {
      console.error("Failed to toggle trend");
    }
  };

  const deleteTrend = async (id: string) => {
    try {
      await fetch(`/api/trends/${id}`, { method: "DELETE" });
      setTrends((prev) => prev.filter((t) => t.id !== id));
      setDeleteConfirm(null);
    } catch {
      console.error("Failed to delete trend");
    }
  };

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Homepage</p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Shop by Trend</h1>
          <p className="text-luxury-brown/40 text-[10px] tracking-[0.3em] uppercase font-bold mt-4">
            {trends.length} trend{trends.length !== 1 ? "s" : ""} configured
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="inline-flex items-center gap-3 px-8 py-4 bg-luxury-gold text-white text-[11px] font-bold tracking-widest uppercase hover:bg-luxury-brown transition-all duration-500 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Trend
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-luxury-brown/5 p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-xl font-serif text-luxury-brown mb-8 tracking-widest uppercase">
            {editingId ? "Edit Trend" : "New Trend"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Title</label>
                <input
                  type="text"
                  placeholder="TREND TITLE"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Image URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  required
                  className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                  className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Status</label>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`flex items-center gap-3 px-4 py-4 border-b border-luxury-brown/10 transition-all w-full ${
                    form.isActive ? "text-luxury-gold" : "text-luxury-brown/30"
                  }`}
                >
                  {form.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="text-xs tracking-widest uppercase font-bold">
                    {form.isActive ? "Active" : "Inactive"}
                  </span>
                </button>
              </div>
            </div>

            {/* Product Selector */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">
                  Products ({selectedProductIds.length} selected)
                </label>
                <button
                  type="button"
                  onClick={() => setShowProductPicker(showProductPicker ? null : "form")}
                  className="text-[9px] tracking-[0.2em] uppercase text-luxury-gold font-bold hover:text-luxury-brown transition-colors flex items-center gap-2"
                >
                  <Package className="w-3 h-3" />
                  {showProductPicker ? "Close Picker" : "Pick Products"}
                </button>
              </div>

              {showProductPicker === "form" && (
                <div className="border border-luxury-brown/10 p-4 space-y-4 bg-luxury-cream/10">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-brown/30 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white border border-luxury-brown/10 text-xs tracking-widest text-luxury-brown placeholder-luxury-brown/20 focus:outline-none focus:border-luxury-gold transition-all"
                    />
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {filteredProducts.map((product) => {
                      const isSelected = selectedProductIds.includes(product.id);
                      return (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => toggleProduct(product.id)}
                          className={`w-full flex items-center gap-4 p-3 text-left transition-all ${
                            isSelected
                              ? "bg-luxury-gold/10 border border-luxury-gold/20"
                              : "bg-white border border-luxury-brown/5 hover:border-luxury-brown/10"
                          }`}
                        >
                          <div className="w-10 h-10 bg-luxury-cream relative overflow-hidden flex-shrink-0 border border-luxury-brown/5">
                            {product.images[0] && (
                              <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-luxury-brown font-bold tracking-tight truncate">{product.name}</p>
                            <p className="text-[9px] text-luxury-gold font-serif">{formatPrice(product.price)}</p>
                          </div>
                          <div
                            className={`w-5 h-5 border flex items-center justify-center transition-all ${
                              isSelected
                                ? "bg-luxury-gold border-luxury-gold"
                                : "border-luxury-brown/20"
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </button>
                      );
                    })}
                    {filteredProducts.length === 0 && (
                      <p className="text-luxury-brown/20 text-[10px] tracking-[0.3em] uppercase font-bold text-center py-8">
                        No products found
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedProductIds.length > 0 && showProductPicker !== "form" && (
                <div className="flex flex-wrap gap-2">
                  {selectedProductIds.map((pid) => {
                    const product = products.find((p) => p.id === pid);
                    if (!product) return null;
                    return (
                      <span
                        key={pid}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-luxury-gold/10 border border-luxury-gold/20 text-[9px] tracking-[0.1em] uppercase font-bold text-luxury-brown"
                      >
                        {product.name}
                        <button
                          type="button"
                          onClick={() => toggleProduct(pid)}
                          className="text-luxury-brown/30 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-6 pt-4">
              <button
                type="submit"
                className="px-10 py-5 bg-luxury-brown text-white text-[10px] tracking-[0.3em] font-bold uppercase hover:bg-luxury-gold transition-all duration-500 shadow-lg"
              >
                {editingId ? "Update Trend" : "Create Trend"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="px-10 py-5 border border-luxury-brown/10 text-luxury-brown/30 text-[10px] tracking-[0.2em] font-bold uppercase hover:text-luxury-brown transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="bg-white border border-red-200 p-8 flex items-center gap-6 shadow-sm">
          <div className="w-14 h-14 flex items-center justify-center bg-red-50 border border-red-200">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-red-800 tracking-wide">Delete this trend permanently?</p>
            <p className="text-xs text-red-600 mt-1">This will remove all product associations for this trend.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => deleteTrend(deleteConfirm)}
              className="px-6 py-3 bg-red-500 text-white text-[10px] tracking-[0.2em] font-bold uppercase hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setDeleteConfirm(null)}
              className="px-6 py-3 border border-luxury-brown/10 text-luxury-brown/30 text-[10px] tracking-[0.2em] font-bold uppercase hover:text-luxury-brown transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {trends.map((trend) => (
          <div
            key={trend.id}
            className={`bg-white border overflow-hidden shadow-sm group transition-all duration-500 ${
              trend.isActive
                ? "border-luxury-brown/5 hover:border-luxury-gold/30 hover:shadow-lg"
                : "border-luxury-brown/5 opacity-60"
            }`}
          >
            {/* Image Preview */}
            <div className="relative aspect-[16/10] bg-luxury-cream overflow-hidden">
              {trend.image ? (
                <Image src={trend.image} alt={trend.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 text-luxury-brown/10" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="text-[8px] tracking-[0.2em] uppercase font-bold px-3 py-1.5 bg-white/90 backdrop-blur-sm text-luxury-brown border border-luxury-brown/10">
                  #{trend.sortOrder}
                </span>
                <button
                  onClick={() => toggleActive(trend.id, trend.isActive)}
                  className={`text-[8px] tracking-[0.2em] uppercase font-bold px-3 py-1.5 backdrop-blur-sm border transition-all ${
                    trend.isActive
                      ? "bg-emerald-50/90 text-emerald-600 border-emerald-200"
                      : "bg-white/90 text-luxury-brown/30 border-luxury-brown/10"
                  }`}
                >
                  {trend.isActive ? "Active" : "Inactive"}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-luxury-brown text-lg font-serif mb-1 group-hover:text-luxury-gold transition-colors">
                {trend.title}
              </h3>
              <p className="text-[9px] text-luxury-brown/30 tracking-[0.2em] uppercase font-bold mb-4">
                {trend.products.length} product{trend.products.length !== 1 ? "s" : ""}
              </p>

              {/* Product Thumbnails */}
              {trend.products.length > 0 && (
                <div className="flex -space-x-2 mb-6">
                  {trend.products.slice(0, 5).map((tp) => (
                    <div
                      key={tp.id}
                      className="w-10 h-10 bg-luxury-cream border-2 border-white relative overflow-hidden"
                    >
                      {tp.product.images[0] && (
                        <Image src={tp.product.images[0]} alt={tp.product.name} fill className="object-cover" />
                      )}
                    </div>
                  ))}
                  {trend.products.length > 5 && (
                    <div className="w-10 h-10 bg-luxury-cream border-2 border-white flex items-center justify-center">
                      <span className="text-[8px] text-luxury-brown/40 font-bold">+{trend.products.length - 5}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-luxury-brown/5">
                <button
                  onClick={() => handleEdit(trend)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-[9px] tracking-[0.2em] uppercase font-bold text-luxury-brown/40 hover:text-luxury-gold border border-luxury-brown/5 hover:border-luxury-gold/20 transition-all"
                >
                  <Edit className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(trend.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-[9px] tracking-[0.2em] uppercase font-bold text-luxury-brown/40 hover:text-red-500 border border-luxury-brown/5 hover:border-red-200 transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {trends.length === 0 && !loading && (
        <div className="py-32 text-center">
          <p className="text-luxury-brown/10 text-xs tracking-[0.5em] uppercase font-bold">No trends configured</p>
        </div>
      )}
    </div>
  );
}
