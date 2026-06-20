import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, User, Clock, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { optimizeImage } from '../utils/cloudinary';
import SEO from './SEO';
import JsonLd, { getArticleSchema, getBreadcrumbSchema } from './JsonLd';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allBlogs, setAllBlogs] = useState<any[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${API_URL}/blogs/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setBlog(data);
        }
      } catch (err) {
        console.error('Failed to fetch blog:', err);
      } finally {
        setLoading(false);
      }
    };
    const fetchAll = async () => {
      try {
        const res = await fetch(`${API_URL}/blogs/published`);
        if (res.ok) {
          const data = await res.json();
          setAllBlogs(data);
        }
      } catch (err) { /* ignore */ }
    };
    fetchBlog();
    fetchAll();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 animate-pulse">Loading Journal...</div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Entry Not Found</p>
          <Link to="/blogs" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black underline underline-offset-4">
            <ArrowLeft className="h-3 w-3" /> Back to Journal
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = allBlogs
    .filter((b: any) => b._id !== blog._id && (!blog.category || b.category === blog.category))
    .slice(0, 3);

  const metaTitle = blog.metaTitle || `${blog.title} | Satvastones Journal`;
  const metaDesc = blog.metaDescription || blog.excerpt || `Read ${blog.title} on Satvastones Journal. Style guides, jewelry care tips, and aesthetic trends.`;

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title={metaTitle}
        description={metaDesc}
        canonical={`https://satvastones.in/blog/${blog.slug}`}
        image={blog.image}
        keywords={blog.focusKeywords || [blog.title, blog.category, 'satvastones journal', 'aesthetic jewelry blog']}
        type="article"
        publishedTime={blog.publishedAt || blog.createdAt}
      />
      <JsonLd data={getArticleSchema(blog)} />
      <JsonLd data={getBreadcrumbSchema([
        { name: 'Home', url: 'https://satvastones.in/' },
        { name: 'The Journal', url: 'https://satvastones.in/blogs' },
        { name: blog.title, url: `https://satvastones.in/blog/${blog.slug}` }
      ])} />

      {/* Breadcrumb */}
      <div className="border-b border-stone-100 bg-white px-4 py-3 md:px-8">
        <nav className="mx-auto max-w-7xl flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400">
          <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
          <ChevronRight className="h-2 w-2" />
          <Link to="/blogs" className="hover:text-stone-900 transition-colors">The Journal</Link>
          <ChevronRight className="h-2 w-2" />
          <span className="text-stone-900 font-bold truncate max-w-[200px]">{blog.title}</span>
        </nav>
      </div>

      {/* Hero */}
      <div className="relative aspect-[2/1] md:aspect-[3/1] overflow-hidden bg-stone-100">
        <img
          src={optimizeImage(blog.image, 1600)}
          alt={blog.title}
          fetchpriority="high"
          width="1600"
          height="533"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="mx-auto max-w-7xl">
            {blog.category && (
              <span className="inline-block bg-white/90 backdrop-blur-md px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-black mb-4">
                {blog.category}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 md:px-8 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Meta */}
          <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-8">
            <span className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            <span className="flex items-center gap-2"><User className="h-3 w-3" /> BY {blog.author || 'SATVASTONES'}</span>
            {blog.readTime && <span className="flex items-center gap-2"><Clock className="h-3 w-3" /> {blog.readTime}</span>}
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-tight text-stone-900 leading-tight mb-10">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-sm md:text-base text-stone-500 uppercase tracking-wider leading-loose mb-12 border-l-4 border-stone-900 pl-6">
              {blog.excerpt}
            </p>
          )}

          {/* Blog Body */}
          <div
            className="prose prose-stone max-w-none text-[11px] md:text-xs leading-relaxed text-stone-600 uppercase tracking-tight space-y-6
              prose-headings:font-display prose-headings:font-bold prose-headings:uppercase prose-headings:tracking-tight prose-headings:text-stone-900
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-4
              prose-p:leading-relaxed prose-p:text-stone-600
              prose-a:text-stone-900 prose-a:underline prose-a:underline-offset-4
              prose-strong:text-stone-900
              prose-ul:list-disc prose-ul:pl-6
              prose-li:my-2
              prose-img:w-full prose-img:my-8
              prose-blockquote:border-l-4 prose-blockquote:border-stone-900 prose-blockquote:pl-6 prose-blockquote:italic"
            dangerouslySetInnerHTML={{ __html: blog.content || '' }}
          />

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-16 pt-12 border-t border-stone-100">
              {blog.tags.map((tag: string) => (
                <span key={tag} className="text-[8px] bg-stone-100 text-stone-600 px-3 py-1.5 font-bold uppercase tracking-wider rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Share */}
          <div className="mt-12 pt-8 border-t border-stone-100 flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest text-stone-400">
            <span>Share This Entry</span>
            <div className="flex gap-4">
              {['Facebook', 'Twitter', 'Pinterest'].map((s) => (
                <span key={s} className="hover:text-stone-900 cursor-pointer transition-colors">{s}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-stone-50 border-t border-stone-100 py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-12">More From The <span className="text-stone-300">Journal</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {relatedPosts.map((rp: any) => (
                <Link key={rp._id} to={`/blog/${rp.slug}`} className="group">
                  <div className="aspect-video bg-stone-200 overflow-hidden mb-6">
                    <img src={optimizeImage(rp.image, 600)} alt={rp.title} loading="lazy" width="600" height="338" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  </div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-stone-400 mb-2">{rp.category || 'Style Guide'}</p>
                  <h3 className="font-display text-lg font-bold uppercase tracking-tight text-stone-900 leading-tight group-hover:text-stone-500 transition-colors">{rp.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
