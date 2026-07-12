"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, GripVertical, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    imageUrl: "",
    link: "",
    sortOrder: "0",
    isActive: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners");
      const data = await res.json();
      setBanners(data);
    } catch {
      console.error("Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      imageUrl: form.imageUrl,
      link: form.link || null,
      sortOrder: parseInt(form.sortOrder),
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await fetch(`/api/banners/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      fetchBanners();
      setShowForm(false);
      setEditingId(null);
      setForm({ title: "", imageUrl: "", link: "", sortOrder: "0", isActive: true });
    } catch {
      console.error("Failed to save banner");
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title,
      imageUrl: banner.imageUrl,
      link: banner.link || "",
      sortOrder: banner.sortOrder.toString(),
      isActive: banner.isActive,
    });
    setShowForm(true);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/banners/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchBanners();
    } catch {
      console.error("Failed to toggle banner");
    }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Delete this banner?")) return;
    try {
      await fetch(`/api/banners/${id}`, { method: "DELETE" });
      fetchBanners();
    } catch {
      console.error("Failed to delete banner");
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Homepage</p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Banners</h1>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ title: "", imageUrl: "", link: "", sortOrder: "0", isActive: true });
          }}
          className="inline-flex items-center gap-3 px-8 py-4 bg-luxury-gold text-white text-[11px] font-bold tracking-widest uppercase hover:bg-luxury-brown transition-all duration-500 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-luxury-brown/5 p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-xl font-serif text-luxury-brown mb-8 tracking-widest uppercase">
            {editingId ? "Edit Banner" : "New Banner"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-2">
              <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Title</label>
              <input
                type="text"
                placeholder="BANNER TITLE"
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
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                required
                className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Link URL (Optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.link}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
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
                className={`flex items-center gap-3 px-4 py-4 border-b border-luxury-brown/10 transition-all ${
                  form.isActive ? "text-luxury-gold" : "text-luxury-brown/30"
                }`}
              >
                {form.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="text-xs tracking-widest uppercase font-bold">
                  {form.isActive ? "Active" : "Inactive"}
                </span>
              </button>
            </div>
            <div className="sm:col-span-2 flex gap-6 pt-4">
              <button
                type="submit"
                className="px-10 py-5 bg-luxury-brown text-white text-[10px] tracking-[0.3em] font-bold uppercase hover:bg-luxury-gold transition-all duration-500 shadow-lg"
              >
                {editingId ? "Update Banner" : "Create Banner"}
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
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Order</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Preview</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Title</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Link</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Status</th>
                <th className="text-right text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-brown/5">
              {banners.map((banner) => (
                <tr key={banner.id} className="hover:bg-luxury-cream/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-luxury-brown/30">
                      <GripVertical className="w-4 h-4" />
                      <span className="text-sm font-bold">{banner.sortOrder}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="w-24 h-14 bg-luxury-cream relative overflow-hidden border border-luxury-brown/5">
                      {banner.imageUrl && (
                        <Image src={banner.imageUrl} alt={banner.title} fill className="object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-luxury-brown text-sm font-bold tracking-tight group-hover:text-luxury-gold transition-colors">
                      {banner.title}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-luxury-brown/40 text-[10px] tracking-widest font-bold truncate max-w-[200px] block">
                      {banner.link || "—"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() => toggleActive(banner.id, banner.isActive)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-[9px] tracking-[0.2em] font-bold uppercase border transition-all ${
                        banner.isActive
                          ? "border-emerald-500/30 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                          : "border-luxury-brown/10 text-luxury-brown/30 bg-luxury-cream hover:bg-luxury-cream/50"
                      }`}
                    >
                      {banner.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {banner.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="w-10 h-10 flex items-center justify-center text-luxury-brown/20 hover:text-luxury-gold hover:bg-luxury-cream transition-all border border-transparent hover:border-luxury-gold/20"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBanner(banner.id)}
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
          {banners.length === 0 && !loading && (
            <div className="py-32 text-center">
              <p className="text-luxury-brown/10 text-xs tracking-[0.5em] uppercase font-bold">No banners configured</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
