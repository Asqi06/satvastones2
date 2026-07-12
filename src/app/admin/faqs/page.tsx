"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    question: "",
    answer: "",
    sortOrder: "0",
    isActive: true,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/faqs");
      const data = await res.json();
      setFaqs(data);
    } catch {
      console.error("Failed to fetch FAQs");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      question: form.question,
      answer: form.answer,
      sortOrder: parseInt(form.sortOrder),
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await fetch(`/api/faqs/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      fetchFaqs();
      setShowForm(false);
      setEditingId(null);
      setForm({ question: "", answer: "", sortOrder: "0", isActive: true });
    } catch {
      console.error("Failed to save FAQ");
    }
  };

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      sortOrder: faq.sortOrder.toString(),
      isActive: faq.isActive,
    });
    setShowForm(true);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/faqs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchFaqs();
    } catch {
      console.error("Failed to toggle FAQ");
    }
  };

  const deleteFaq = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await fetch(`/api/faqs/${id}`, { method: "DELETE" });
      fetchFaqs();
    } catch {
      console.error("Failed to delete FAQ");
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Support</p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">FAQs</h1>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ question: "", answer: "", sortOrder: "0", isActive: true });
          }}
          className="inline-flex items-center gap-3 px-8 py-4 bg-luxury-gold text-white text-[11px] font-bold tracking-widest uppercase hover:bg-luxury-brown transition-all duration-500 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-luxury-brown/5 p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-xl font-serif text-luxury-brown mb-8 tracking-widest uppercase">
            {editingId ? "Edit FAQ" : "New FAQ"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
            <div className="sm:col-span-2 space-y-2">
              <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Question</label>
              <input
                type="text"
                placeholder="ENTER THE QUESTION"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
                required
                className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Answer</label>
              <textarea
                placeholder="ENTER THE ANSWER"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
                required
                rows={5}
                className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20 resize-none"
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
            <div className="sm:col-span-2 flex gap-6 pt-4">
              <button
                type="submit"
                className="px-10 py-5 bg-luxury-brown text-white text-[10px] tracking-[0.3em] font-bold uppercase hover:bg-luxury-gold transition-all duration-500 shadow-lg"
              >
                {editingId ? "Update FAQ" : "Create FAQ"}
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
        <div className="divide-y divide-luxury-brown/5">
          {faqs.map((faq) => (
            <div key={faq.id} className="hover:bg-luxury-cream/20 transition-colors">
              <div className="flex items-center gap-6 px-8 py-6">
                <span className="text-sm font-bold text-luxury-brown/30 shrink-0">{faq.sortOrder}</span>
                <button
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="flex-1 flex items-center gap-4 text-left group"
                >
                  <span className="text-luxury-brown text-sm font-bold tracking-tight group-hover:text-luxury-gold transition-colors">
                    {faq.question}
                  </span>
                  {expandedId === faq.id ? (
                    <ChevronUp className="w-4 h-4 text-luxury-brown/30 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-luxury-brown/30 shrink-0" />
                  )}
                </button>
                <button
                  onClick={() => toggleActive(faq.id, faq.isActive)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-[9px] tracking-[0.2em] font-bold uppercase border transition-all shrink-0 ${
                    faq.isActive
                      ? "border-emerald-500/30 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                      : "border-luxury-brown/10 text-luxury-brown/30 bg-luxury-cream hover:bg-luxury-cream/50"
                  }`}
                >
                  {faq.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {faq.isActive ? "Active" : "Inactive"}
                </button>
                <div className="flex items-center gap-4 shrink-0">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="w-10 h-10 flex items-center justify-center text-luxury-brown/20 hover:text-luxury-gold hover:bg-luxury-cream transition-all border border-transparent hover:border-luxury-gold/20"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteFaq(faq.id)}
                    className="w-10 h-10 flex items-center justify-center text-luxury-brown/20 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {expandedId === faq.id && (
                <div className="px-8 pb-6 pl-20">
                  <p className="text-luxury-brown/50 text-xs leading-relaxed tracking-wider whitespace-pre-wrap">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
        {faqs.length === 0 && !loading && (
          <div className="py-32 text-center">
            <p className="text-luxury-brown/10 text-xs tracking-[0.5em] uppercase font-bold">No FAQs configured</p>
          </div>
        )}
      </div>
    </div>
  );
}
