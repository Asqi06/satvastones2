"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Archive } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    parentId: "",
    sortOrder: "0",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {
      console.error("Archive fetch failure.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = form.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    try {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          slug: `${slug}-${Date.now()}`,
          sortOrder: parseInt(form.sortOrder),
          parentId: form.parentId || null,
        }),
      });
      fetchCategories();
      setShowForm(false);
      setForm({ name: "", description: "", parentId: "", sortOrder: "0" });
    } catch {
      console.error("Curation failure.");
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm("Remove this archive permanently?")) return;
    try {
      await fetch(`/api/categories/${id}`, { method: "DELETE" });
      fetchCategories();
    } catch {
      console.error("Removal failure.");
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Hierarchies</p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Archives</h1>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="luxury-button inline-flex items-center gap-3"
        >
          <Plus className="w-4 h-4" />
          Define New Archive
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-luxury-brown/5 p-10 animate-luxury-fade relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <h2 className="text-xl font-serif text-luxury-brown mb-8 tracking-widest uppercase">Archive Specification</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-2">
              <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Archive Name</label>
              <input
                type="text"
                placeholder="E.G. CELESTIAL EARRINGS"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-0 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/10 px-4"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Parent Authority</label>
              <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold appearance-none"
              >
                <option value="" className="bg-white text-luxury-brown">Supreme Archive (Top Level)</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white text-luxury-brown">{c.name}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Archival Context (Description)</label>
              <textarea
                placeholder="SPECIFY THE ESSENCE OF THIS COLLECTION"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold h-20 resize-none placeholder-luxury-brown/10"
              />
            </div>
            <div className="sm:col-span-2 flex gap-6 pt-4">
              <button
                type="submit"
                className="px-10 py-5 bg-luxury-brown text-white text-[10px] tracking-[0.3em] font-bold uppercase hover:bg-luxury-gold transition-all duration-500 shadow-lg"
              >
                Execute Curation
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-10 py-5 border border-luxury-brown/10 text-luxury-brown/30 text-[10px] tracking-[0.2em] font-bold uppercase hover:text-luxury-brown transition-all"
              >
                Abort
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-luxury-brown/5 overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-luxury-brown/5 bg-luxury-cream/30">
              <th className="text-left text-[9px] text-luxury-brown/30 uppercase tracking-[0.3em] px-8 py-6 font-bold">Designation</th>
              <th className="text-left text-[9px] text-luxury-brown/30 uppercase tracking-[0.3em] px-8 py-6 font-bold">Identifier (Slug)</th>
              <th className="text-left text-[9px] text-luxury-brown/30 uppercase tracking-[0.3em] px-8 py-6 font-bold">Context</th>
              <th className="text-right text-[9px] text-luxury-brown/30 uppercase tracking-[0.3em] px-8 py-6 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-luxury-brown/5">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-luxury-cream/20 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <Archive className="w-4 h-4 text-luxury-gold opacity-30 group-hover:opacity-100 transition-opacity" />
                    <span className="text-luxury-brown text-sm font-bold tracking-tight group-hover:text-luxury-gold transition-colors">{cat.name}</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-luxury-brown/20 text-[10px] tracking-widest font-mono uppercase italic">{cat.slug}</td>
                <td className="px-8 py-6">
                  <p className="text-luxury-brown/40 text-[11px] font-light italic truncate max-w-xs">{cat.description || "No context specified."}</p>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="w-10 h-10 flex items-center justify-center bg-luxury-cream text-luxury-brown/20 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-500/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {categories.length === 0 && (
          <div className="py-32 text-center">
            <p className="text-luxury-brown/10 text-xs tracking-[0.5em] uppercase font-bold">Archive empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
