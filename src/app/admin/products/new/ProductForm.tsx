"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X } from "lucide-react";

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

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-serif text-white mb-8">
        {productId ? "Edit Product" : "Add New Product"}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="bg-[#1a1a1a] rounded-xl border border-[#2a2a2a] p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Product Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A96E]"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Description *</label>
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A96E] resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Compare Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.comparePrice}
                onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category *</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A96E]"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Style *</label>
              <select
                value={form.style}
                onChange={(e) => setForm({ ...form, style: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A96E]"
              >
                <option value="KOREAN">Korean</option>
                <option value="WESTERN">Western</option>
                <option value="TRADITIONAL">Traditional</option>
                <option value="FUSION">Fusion</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Material</label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Stock *</label>
              <input
                type="number"
                required
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">SKU</label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-4 py-3 bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg text-white text-sm focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Product Images</label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden bg-[#0f0f0f]">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 rounded-lg border-2 border-dashed border-[#2a2a2a] flex flex-col items-center justify-center cursor-pointer hover:border-[#C9A96E] transition-colors">
                <Upload className="w-6 h-6 text-gray-500" />
                <span className="text-xs text-gray-500 mt-1">Upload</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Flags */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="accent-[#C9A96E]"
              />
              Featured Product
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="accent-[#C9A96E]"
              />
              Active
            </label>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-[#C9A96E] text-black font-semibold rounded-lg hover:bg-[#b8955d] transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : productId ? "Update Product" : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-8 py-3 border border-[#2a2a2a] text-gray-400 rounded-lg hover:border-[#3a3a3a]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
