import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, ArrowRight } from 'lucide-react';
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
      {/* Breadcrumb */}
      <div className="px-4 py-2.5 text-[10px] text-gray-400 border-b border-gray-100">
        <Link to="/" className="hover:text-gray-600">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-medium">Blogs</span>
      </div>

      {/* Header */}
      <div className="bg-[#f79da6] px-4 py-6 text-center">
        <h1 className="text-xl font-bold text-white">The Journal</h1>
        <p className="text-white/80 text-[10px] mt-1">Aesthetic Musings, Style Guides & Trends</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16">
            <p className="text-[10px] font-bold text-gray-400 animate-pulse uppercase">Loading Stories...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl">
            <p className="text-[10px] font-bold text-gray-400 uppercase">No journal entries yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {blogs.map((post) => (
              <Link key={post._id} to={`/blog/${post.slug}`} className="group bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={optimizeImage(post.image, 600)}
                    alt={post.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="bg-[#f2707f] text-white px-2 py-1 text-[8px] font-bold uppercase rounded-md">
                      {post.category || 'Style Guide'}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-3 text-[8px] text-gray-400 mb-2">
                    <span className="flex items-center gap-1"><Calendar className="h-2.5 w-2.5" /> {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span className="flex items-center gap-1"><User className="h-2.5 w-2.5" /> {post.author || 'SATVASTONES'}</span>
                    {post.readTime && <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {post.readTime}</span>}
                  </div>
                  <h2 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-[#f2707f] transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{post.excerpt}</p>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#f2707f] uppercase mt-2">
                    Read More <ArrowRight className="h-2.5 w-2.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Newsletter */}
        <div className="mt-8 bg-pink-50 rounded-xl p-6 text-center">
          <h2 className="text-sm font-bold text-gray-900 mb-1">Join The Community</h2>
          <p className="text-[10px] text-gray-500 mb-3">Get early access to new arrivals and style guides.</p>
          <form className="max-w-sm mx-auto flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Your email" className="flex-1 border border-gray-200 px-3 py-2 text-[10px] rounded-lg bg-white outline-none focus:border-[#f2707f]" />
            <button className="bg-[#f2707f] text-white px-4 py-2 text-[10px] font-bold rounded-lg uppercase hover:bg-[#d4535f] transition-colors">Subscribe</button>
          </form>
        </div>
      </div>
    </div>
  );
}
