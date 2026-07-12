"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Check, Tag } from "lucide-react";
import Image from "next/image";

interface Sale {
  id: string;
  title: string;
  subtitle: string | null;
  discountPercent: number;
  bgColor: string | null;
  type: string;
  sortOrder: number;
  isActive: boolean;
  products: { id: string; name: string; price: number; images: string[] }[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    discountPercent: "",
    bgColor: "#C9A96E",
    type: "regular",
    sortOrder: "0",
    isActive: true,
    productIds: [] as string[],
  });
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/sales").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([salesData, productsData]) => {
        setSales(salesData);
        setProducts(productsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      subtitle: form.subtitle || null,
      discountPercent: parseFloat(form.discountPercent),
      bgColor: form.bgColor || null,
      type: form.type,
      sortOrder: parseInt(form.sortOrder),
      isActive: form.isActive,
      productIds: form.productIds,
    };

    try {
      if (editingId) {
        await fetch(`/api/sales/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/sales", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      const res = await fetch("/api/sales");
      const data = await res.json();
      setSales(data);
      setShowForm(false);
      setEditingId(null);
      setForm({
        title: "",
        subtitle: "",
        discountPercent: "",
        bgColor: "#C9A96E",
        type: "regular",
        sortOrder: "0",
        isActive: true,
        productIds: [],
      });
    } catch {
      console.error("Failed to save sale");
    }
  };

  const handleEdit = (sale: Sale) => {
    setEditingId(sale.id);
    setForm({
      title: sale.title,
      subtitle: sale.subtitle || "",
      discountPercent: sale.discountPercent.toString(),
      bgColor: sale.bgColor || "#C9A96E",
      type: sale.type,
      sortOrder: sale.sortOrder.toString(),
      isActive: sale.isActive,
      productIds: sale.products.map((p) => p.id),
    });
    setShowForm(true);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/sales/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const res = await fetch("/api/sales");
      const data = await res.json();
      setSales(data);
    } catch {
      console.error("Failed to toggle sale");
    }
  };

  const deleteSale = async (id: string) => {
    if (!confirm("Delete this sale section?")) return;
    try {
      await fetch(`/api/sales/${id}`, { method: "DELETE" });
      setSales(sales.filter((s) => s.id !== id));
    } catch {
      console.error("Failed to delete sale");
    }
  };

  const toggleProduct = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Promotions</p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Sale Sections</h1>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({
              title: "",
              subtitle: "",
              discountPercent: "",
              bgColor: "#C9A96E",
              type: "regular",
              sortOrder: "0",
              isActive: true,
              productIds: [],
            });
          }}
          className="inline-flex items-center gap-3 px-8 py-4 bg-luxury-gold text-white text-[11px] font-bold tracking-widest uppercase hover:bg-luxury-brown transition-all duration-500 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Sale Section
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-luxury-brown/5 p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-xl font-serif text-luxury-brown mb-8 tracking-widest uppercase">
            {editingId ? "Edit Sale Section" : "New Sale Section"}
          </h2>
          <form onSubmit={handleSubmit} className="relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              <div className="space-y-2">
                <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Title</label>
                <input
                  type="text"
                  placeholder="SALE TITLE"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Subtitle</label>
                <input
                  type="text"
                  placeholder="OPTIONAL SUBTITLE"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Discount %</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.discountPercent}
                  onChange={(e) => setForm({ ...form, discountPercent: e.target.value })}
                  required
                  min="0"
                  max="100"
                  className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold appearance-none"
                >
                  <option value="regular" className="bg-white">Regular Sale</option>
                  <option value="ninetyNine" className="bg-white">₹99 Sale</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Background Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.bgColor}
                    onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                    className="w-12 h-12 border border-luxury-brown/10 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.bgColor}
                    onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                    className="flex-1 bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold"
                  />
                </div>
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

            <div className="space-y-4">
              <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">
                Select Products ({form.productIds.length} selected)
              </label>
              <input
                type="text"
                placeholder="Search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-3 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20"
              />
              <div className="max-h-64 overflow-y-auto border border-luxury-brown/5 bg-luxury-cream/10 p-4 space-y-2">
                {filteredProducts.map((product) => (
                  <label
                    key={product.id}
                    className={`flex items-center gap-4 p-3 cursor-pointer transition-all hover:bg-white ${
                      form.productIds.includes(product.id) ? "bg-luxury-gold/5 border border-luxury-gold/20" : ""
                    }`}
                  >
                    <div
                      className={`w-5 h-5 border flex items-center justify-center transition-all ${
                        form.productIds.includes(product.id)
                          ? "bg-luxury-gold border-luxury-gold"
                          : "border-luxury-brown/20"
                      }`}
                    >
                      {form.productIds.includes(product.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="w-10 h-10 bg-luxury-cream relative overflow-hidden border border-luxury-brown/5 shrink-0">
                      {product.images[0] && (
                        <Image src={product.images[0]} alt="" fill className="object-cover" />
                      )}
                    </div>
                    <span className="text-luxury-brown text-sm font-bold">{product.name}</span>
                    <span className="text-luxury-brown/40 text-xs ml-auto">₹{product.price.toLocaleString()}</span>
                  </label>
                ))}
                {filteredProducts.length === 0 && (
                  <p className="text-center text-luxury-brown/30 text-xs py-4">No products found</p>
                )}
              </div>
            </div>

            <div className="flex gap-6 pt-8">
              <button
                type="submit"
                className="px-10 py-5 bg-luxury-brown text-white text-[10px] tracking-[0.3em] font-bold uppercase hover:bg-luxury-gold transition-all duration-500 shadow-lg"
              >
                {editingId ? "Update Sale" : "Create Sale"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-10 py-5 border border-luxury-brown/10 text-luxury-brown/30 text-[10px] tracking-[0.2em] font-bold uppercase hover:text-luxury-brown transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-luxury-brown/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-luxury-brown/5 bg-luxury-cream/30">
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Title</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Type</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Discount</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Products</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Status</th>
                <th className="text-right text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-brown/5">
              {sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-luxury-cream/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div>
                      <span className="text-luxury-brown text-sm font-bold tracking-tight group-hover:text-luxury-gold transition-colors">
                        {sale.title}
                      </span>
                      {sale.subtitle && (
                        <p className="text-luxury-brown/40 text-[10px] tracking-widest uppercase mt-1">{sale.subtitle}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[9px] tracking-[0.2em] font-bold uppercase border ${
                        sale.type === "ninetyNine"
                          ? "border-amber-500/30 text-amber-600 bg-amber-50"
                          : "border-luxury-gold/30 text-luxury-gold bg-luxury-gold/5"
                      }`}
                    >
                      <Tag className="w-3 h-3" />
                      {sale.type === "ninetyNine" ? "₹99 Sale" : "Regular"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-luxury-gold text-lg font-serif">{sale.discountPercent}%</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-luxury-brown/60 text-[10px] tracking-widest uppercase font-bold">
                      {sale.products.length} products
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() => toggleActive(sale.id, sale.isActive)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-[9px] tracking-[0.2em] font-bold uppercase border transition-all ${
                        sale.isActive
                          ? "border-emerald-500/30 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                          : "border-luxury-brown/10 text-luxury-brown/30 bg-luxury-cream hover:bg-luxury-cream/50"
                      }`}
                    >
                      {sale.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {sale.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => handleEdit(sale)}
                        className="w-10 h-10 flex items-center justify-center text-luxury-brown/20 hover:text-luxury-gold hover:bg-luxury-cream transition-all border border-transparent hover:border-luxury-gold/20"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSale(sale.id)}
                        className="w-10 h-10 flex items-center justify-center text-luxury-brown/20 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sales.length === 0 && !loading && (
            <div className="py-32 text-center">
              <p className="text-luxury-brown/10 text-xs tracking-[0.5em] uppercase font-bold">No sale sections configured</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
