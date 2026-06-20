import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Calendar, User, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { optimizeImage } from '../utils/cloudinary';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${API_URL}/blogs/published`);
        if (res.ok) {
          const data = await res.json();
          setBlogs(data);
        }
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-stone-50 py-16 md:py-24 text-center px-4">
        <h1 className="font-display text-5xl md:text-8xl font-bold uppercase tracking-tight text-stone-900">
          The <span className="text-stone-400">Journal</span>
        </h1>
        <p className="mt-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-stone-500">
          Aesthetic Musings, Style Guides & Trends
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 py-20">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 animate-pulse">Loading Stories...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 border border-stone-100 bg-stone-50">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">No journal entries yet. Check back soon for style guides and aesthetic inspiration.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {blogs.map((post) => (
              <Link key={post._id} to={`/blog/${post.slug}`} className="group cursor-pointer">
                <div className="relative aspect-video overflow-hidden bg-stone-100 mb-8">
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    loading="lazy"
                    width="800"
                    height="450"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-black">
                      {post.category || 'Style Guide'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest text-stone-400">
                    <span className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-2"><User className="h-3 w-3" /> BY {post.author || 'SATVASTONES'}</span>
                    {post.readTime && <span className="flex items-center gap-2"><Clock className="h-3 w-3" /> {post.readTime}</span>}
                  </div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-tight text-stone-900 leading-tight group-hover:text-stone-500 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-stone-500 text-[11px] uppercase tracking-widest leading-loose line-clamp-2">
                    {post.excerpt}
                  </p>
                  <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-black border-b border-black pb-1 pt-4 transition-all hover:gap-4">
                    Read Journal <ArrowUpRight className="h-3 w-3" />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Newsletter */}
        <div className="mt-32 bg-stone-900 p-12 md:p-20 text-center space-y-8">
          <h2 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-tight text-white">Join The Community</h2>
          <p className="text-stone-400 text-xs uppercase tracking-[0.3em] max-w-lg mx-auto leading-loose">
            Subscribe to get early access to new arrivals and aesthetic style guides.
          </p>
          <form className="max-w-md mx-auto flex flex-col md:flex-row gap-4" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="YOUR EMAIL" 
              className="flex-1 bg-white/10 border border-white/20 px-6 py-4 text-xs font-bold uppercase tracking-widest text-white focus:border-white outline-hidden"
            />
            <button className="bg-white text-black px-10 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-200 transition-all">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
