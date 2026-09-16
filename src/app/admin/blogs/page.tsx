"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  author: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  image: "",
  author: "",
  metaTitle: "",
  metaDescription: "",
  isPublished: false,
};

export default function BlogsAdminPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/blogs");
      const data = await res.json();
      setBlogs(data.blogs || []);
    } catch {
      console.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/blogs/${editingId}` : "/api/blogs";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to save post");
        return;
      }

      await fetchBlogs();
      setShowForm(false);
      resetForm();
    } catch {
      alert("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingId(blog.id);
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      content: blog.content,
      image: blog.image || "",
      author: blog.author || "",
      metaTitle: blog.metaTitle || "",
      metaDescription: blog.metaDescription || "",
      isPublished: blog.isPublished,
    });
    setShowForm(true);
  };

  const togglePublished = async (blog: Blog) => {
    try {
      const res = await fetch(`/api/blogs/${blog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...blog, isPublished: !blog.isPublished }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to update post");
        return;
      }
      fetchBlogs();
    } catch {
      console.error("Failed to toggle post");
    }
  };

  const deleteBlog = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/blogs/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("Failed to delete post");
        return;
      }
      fetchBlogs();
    } catch {
      console.error("Failed to delete post");
    }
  };

  const fieldClass =
    "w-full bg-luxury-cream/20 border-b border-luxury-brown/10 px-4 py-4 text-luxury-brown text-xs tracking-widest transition-all focus:outline-none focus:border-luxury-gold placeholder-luxury-brown/20";
  const labelClass =
    "text-[9px] text-luxury-brown/30 tracking-[0.3em] font-bold uppercase";

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">
            Content
          </p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Journal</h1>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            resetForm();
          }}
          className="inline-flex items-center gap-3 px-8 py-4 bg-luxury-gold text-white text-[11px] font-bold tracking-widest uppercase hover:bg-luxury-brown transition-all duration-500 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-luxury-brown/5 p-10 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-luxury-gold/5 blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-xl font-serif text-luxury-brown mb-8 tracking-widest uppercase">
            {editingId ? "Edit Post" : "New Post"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-8 relative z-10"
          >
            <div className="sm:col-span-2 space-y-2">
              <label className={labelClass}>Title *</label>
              <input
                type="text"
                required
                placeholder="POST TITLE"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Slug</label>
              <input
                type="text"
                placeholder="LEAVE BLANK TO GENERATE FROM TITLE"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Author</label>
              <input
                type="text"
                placeholder="AUTHOR NAME"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className={labelClass}>Cover Image URL</label>
              <input
                type="text"
                placeholder="HTTPS://..."
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className={labelClass}>Excerpt</label>
              <textarea
                rows={2}
                placeholder="SHORT SUMMARY SHOWN ON THE BLOG INDEX"
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className={`${fieldClass} resize-none`}
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className={labelClass}>Content *</label>
              <textarea
                rows={12}
                required
                placeholder="FULL POST CONTENT"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className={`${fieldClass} resize-y`}
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className={labelClass}>Meta Title</label>
              <input
                type="text"
                placeholder="DEFAULTS TO POST TITLE"
                value={form.metaTitle}
                onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div className="sm:col-span-2 space-y-2">
              <label className={labelClass}>Meta Description</label>
              <textarea
                rows={2}
                placeholder="SHOWN IN GOOGLE SEARCH RESULTS"
                value={form.metaDescription}
                onChange={(e) =>
                  setForm({ ...form, metaDescription: e.target.value })
                }
                className={`${fieldClass} resize-none`}
              />
            </div>

            <div className="space-y-2">
              <label className={labelClass}>Status</label>
              <button
                type="button"
                onClick={() => setForm({ ...form, isPublished: !form.isPublished })}
                className={`flex items-center gap-3 px-4 py-4 border-b border-luxury-brown/10 transition-all w-full ${
                  form.isPublished ? "text-luxury-gold" : "text-luxury-brown/30"
                }`}
              >
                {form.isPublished ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span className="text-xs tracking-widest uppercase font-bold">
                  {form.isPublished ? "Published" : "Draft"}
                </span>
              </button>
            </div>

            <div className="sm:col-span-2 flex gap-6 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="px-10 py-5 bg-luxury-brown text-white text-[10px] tracking-[0.3em] font-bold uppercase hover:bg-luxury-gold transition-all duration-500 shadow-lg disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update Post" : "Create Post"}
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

      <div className="bg-white border border-luxury-brown/5 overflow-hidden shadow-sm">
        <div className="divide-y divide-luxury-brown/5">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="flex flex-col sm:flex-row sm:items-center gap-4 px-8 py-6 hover:bg-luxury-cream/20 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-luxury-brown text-sm font-bold tracking-tight truncate">
                  {blog.title}
                </p>
                <p className="text-luxury-brown/30 text-[10px] tracking-widest uppercase mt-1">
                  /blog/{blog.slug}
                  {blog.author ? ` · ${blog.author}` : ""}
                </p>
              </div>

              <button
                onClick={() => togglePublished(blog)}
                className={`inline-flex items-center gap-2 px-3 py-1.5 text-[9px] tracking-[0.2em] font-bold uppercase border transition-all shrink-0 ${
                  blog.isPublished
                    ? "border-emerald-500/30 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                    : "border-luxury-brown/10 text-luxury-brown/30 bg-luxury-cream hover:bg-luxury-cream/50"
                }`}
              >
                {blog.isPublished ? (
                  <Eye className="w-3 h-3" />
                ) : (
                  <EyeOff className="w-3 h-3" />
                )}
                {blog.isPublished ? "Published" : "Draft"}
              </button>

              <div className="flex items-center gap-4 shrink-0">
                {blog.isPublished && (
                  <a
                    href={`/blog/${blog.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center text-luxury-brown/20 hover:text-luxury-gold hover:bg-luxury-cream transition-all border border-transparent hover:border-luxury-gold/20"
                    aria-label="View post"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => handleEdit(blog)}
                  className="w-10 h-10 flex items-center justify-center text-luxury-brown/20 hover:text-luxury-gold hover:bg-luxury-cream transition-all border border-transparent hover:border-luxury-gold/20"
                  aria-label="Edit post"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteBlog(blog.id)}
                  className="w-10 h-10 flex items-center justify-center text-luxury-brown/20 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-500/20"
                  aria-label="Delete post"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {blogs.length === 0 && !loading && (
          <div className="py-32 text-center">
            <p className="text-luxury-brown/10 text-xs tracking-[0.5em] uppercase font-bold">
              No posts yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
