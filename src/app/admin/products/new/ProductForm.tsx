"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, ArrowLeft } from "lucide-react";

export default function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    material: "",
    style: "WESTERN",
    stock: "0",
    sku: "",
    categoryId: "",
    isFeatured: false,
    isBestSeller: false,
    isNewCollection: false,
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
    if (productId) fetchProduct();
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      console.error("Failed to fetch categories");
    }
  };

  const fetchProduct = async () => {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const data = await res.json();
      if (data.product) {
        const p = data.product;
        setForm({
          name: p.name,
          description: p.description,
          price: p.price.toString(),
          comparePrice: p.comparePrice?.toString() || "",
          material: p.material || "",
          style: p.style,
          stock: p.stock.toString(),
          sku: p.sku || "",
          categoryId: p.categoryId,
          isFeatured: p.isFeatured,
          isBestSeller: p.isBestSeller || false,
          isNewCollection: p.isNewCollection || false,
          isActive: p.isActive,
        });
        setImages(p.images || []);
      }
    } catch {
      console.error("Failed to fetch product");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          setImages((prev) => [...prev, data.url]);
        }
      } catch {
        console.error("Upload failed");
      }
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = productId ? `/api/products/${productId}` : "/api/products";
      const method = productId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          images,
          price: parseFloat(form.price),
          comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
          stock: parseInt(form.stock),
        }),
      });

      if (res.ok) {
        router.push("/admin/products");
      } else {
        alert("Failed to save product");
      }
    } catch {
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 bg-white border border-luxury-brown/10 text-luxury-brown text-sm focus:outline-none focus:border-luxury-gold transition-colors rounded-none placeholder:text-luxury-brown/30";
  const labelClass = "text-[10px] tracking-[0.2em] uppercase font-bold text-luxury-brown/50 mb-2 block";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4 border-b border-luxury-brown/5 pb-8">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 flex items-center justify-center border border-luxury-brown/10 text-luxury-brown/40 hover:text-luxury-brown hover:border-luxury-brown/30 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-2">
            {productId ? "Modification" : "Creation"}
          </p>
          <h1 className="text-3xl lg:text-4xl font-serif text-luxury-brown">
            {productId ? "Edit Product" : "Add New Product"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="bg-white border border-luxury-brown/5 p-8 space-y-8 shadow-sm">
          {/* Basic Info */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-luxury-gold mb-6">Basic Information</p>
            <div className="space-y-6">
              <div>
                <label className={labelClass}>Product Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputClass}
                  placeholder="E.G. CELESTIAL GOLD RING"
                />
              </div>

              <div>
                <label className={labelClass}>Description *</label>
                <textarea
                  required
                  rows={5}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputClass} resize-none`}
                  placeholder="DESCRIBE THE PRODUCT IN DETAIL"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Category */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-luxury-gold mb-6">Pricing & Classification</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Price (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Compare Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.comparePrice}
                  onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                  className={inputClass}
                  placeholder="Original price before discount"
                />
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <select
                  required
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Style *</label>
                <select
                  value={form.style}
                  onChange={(e) => setForm({ ...form, style: e.target.value })}
                  className={`${inputClass} appearance-none cursor-pointer`}
                >
                  <option value="KOREAN">Korean</option>
                  <option value="WESTERN">Western</option>
                  <option value="TRADITIONAL">Traditional</option>
                  <option value="FUSION">Fusion</option>
                </select>
              </div>
            </div>
          </div>

          {/* Inventory */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-luxury-gold mb-6">Inventory</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className={labelClass}>Material</label>
                <input
                  type="text"
                  value={form.material}
                  onChange={(e) => setForm({ ...form, material: e.target.value })}
                  className={inputClass}
                  placeholder="E.G. 18K GOLD PLATED"
                />
              </div>
              <div>
                <label className={labelClass}>Stock *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className={inputClass}
                  placeholder="UNIQUE IDENTIFIER"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-luxury-gold mb-6">Product Images</p>
            <div className="flex flex-wrap gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-28 h-28 border border-luxury-brown/10 overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-6 h-6 bg-luxury-brown/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-28 h-28 border-2 border-dashed border-luxury-brown/10 flex flex-col items-center justify-center cursor-pointer hover:border-luxury-gold transition-colors group">
                <Upload className="w-6 h-6 text-luxury-brown/20 group-hover:text-luxury-gold transition-colors" />
                <span className="text-[9px] text-luxury-brown/30 mt-1 tracking-wider uppercase font-bold">Upload</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Flags */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-luxury-gold mb-6">Visibility</p>
            <div className="flex flex-wrap gap-8">
              {[
                { key: "isFeatured", label: "Featured Product" },
                { key: "isBestSeller", label: "Best Seller" },
                { key: "isNewCollection", label: "New Collection" },
                { key: "isActive", label: "Active" },
              ].map((flag) => (
                <label key={flag.key} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={(form as any)[flag.key]}
                      onChange={(e) => setForm({ ...form, [flag.key]: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-luxury-brown/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-luxury-brown/10 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-luxury-gold"></div>
                  </div>
                  <span className="text-[11px] tracking-wider uppercase font-bold text-luxury-brown/60 group-hover:text-luxury-brown transition-colors">
                    {flag.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-4 bg-luxury-brown text-white text-[10px] tracking-[0.3em] font-bold uppercase hover:bg-luxury-gold transition-all duration-500 disabled:opacity-50"
          >
            {loading ? "Processing..." : productId ? "Update Product" : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-10 py-4 border border-luxury-brown/10 text-luxury-brown/30 text-[10px] tracking-[0.2em] font-bold uppercase hover:text-luxury-brown transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
