"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Star, Eye, EyeOff } from "lucide-react";

interface Review {
  id: string;
  name: string;
  rating: number;
  title: string;
  comment: string;
  sortOrder: number;
  isActive: boolean;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    rating: "5",
    title: "",
    comment: "",
    sortOrder: "0",
    isActive: true,
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/customer-reviews");
      const data = await res.json();
      setReviews(data);
    } catch {
      console.error("Failed to fetch reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      rating: parseInt(form.rating),
      title: form.title,
      comment: form.comment,
      sortOrder: parseInt(form.sortOrder),
      isActive: form.isActive,
    };

    try {
      if (editingId) {
        await fetch(`/api/customer-reviews/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/customer-reviews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      fetchReviews();
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", rating: "5", title: "", comment: "", sortOrder: "0", isActive: true });
    } catch {
      console.error("Failed to save review");
    }
  };

  const handleEdit = (review: Review) => {
    setEditingId(review.id);
    setForm({
      name: review.name,
      rating: review.rating.toString(),
      title: review.title,
      comment: review.comment,
      sortOrder: review.sortOrder.toString(),
      isActive: review.isActive,
    });
    setShowForm(true);
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/customer-reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      fetchReviews();
    } catch {
      console.error("Failed to toggle review");
    }
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    try {
      await fetch(`/api/customer-reviews/${id}`, { method: "DELETE" });
      fetchReviews();
    } catch {
      console.error("Failed to delete review");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "text-luxury-gold fill-luxury-gold" : "text-luxury-brown/10"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Social Proof</p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Reviews</h1>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setForm({ name: "", rating: "5", title: "", comment: "", sortOrder: "0", isActive: true });
          }}
          className="inline-flex items-center gap-3 px-8 py-4 bg-luxury-gold text-white text-[11px] font-bold tracking-widest uppercase hover:bg-luxury-brown transition-all duration-500 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Add Review
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-luxury-brown/5 p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-xl font-serif text-luxury-brown mb-8 tracking-widest uppercase">
            {editingId ? "Edit Review" : "New Review"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-2">
              <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Customer Name</label>
              <input
                type="text"
                placeholder="CUSTOMER NAME"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Rating</label>
              <div className="flex items-center gap-2 py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, rating: star.toString() })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= parseInt(form.rating)
                          ? "text-luxury-gold fill-luxury-gold"
                          : "text-luxury-brown/10"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Review Title</label>
              <input
                type="text"
                placeholder="REVIEW TITLE"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
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
            <div className="sm:col-span-2 space-y-2">
              <label className="text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase">Comment</label>
              <textarea
                placeholder="CUSTOMER REVIEW COMMENT"
                value={form.comment}
                onChange={(e) => setForm({ ...form, comment: e.target.value })}
                required
                rows={4}
                className="w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20 resize-none"
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
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
                {editingId ? "Update Review" : "Create Review"}
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
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Customer</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Rating</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Review</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Status</th>
                <th className="text-right text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-brown/5">
              {reviews.map((review) => (
                <tr key={review.id} className="hover:bg-luxury-cream/20 transition-colors group">
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-luxury-brown/30">{review.sortOrder}</span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-luxury-brown text-sm font-bold tracking-tight group-hover:text-luxury-gold transition-colors">
                      {review.name}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="max-w-xs">
                      <p className="text-luxury-brown text-sm font-bold">{review.title}</p>
                      <p className="text-luxury-brown/40 text-[10px] tracking-wider mt-1 line-clamp-2">{review.comment}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <button
                      onClick={() => toggleActive(review.id, review.isActive)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 text-[9px] tracking-[0.2em] font-bold uppercase border transition-all ${
                        review.isActive
                          ? "border-emerald-500/30 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                          : "border-luxury-brown/10 text-luxury-brown/30 bg-luxury-cream hover:bg-luxury-cream/50"
                      }`}
                    >
                      {review.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {review.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => handleEdit(review)}
                        className="w-10 h-10 flex items-center justify-center text-luxury-brown/20 hover:text-luxury-gold hover:bg-luxury-cream transition-all border border-transparent hover:border-luxury-gold/20"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteReview(review.id)}
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
          {reviews.length === 0 && !loading && (
            <div className="py-32 text-center">
              <p className="text-luxury-brown/10 text-xs tracking-[0.5em] uppercase font-bold">No reviews yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
