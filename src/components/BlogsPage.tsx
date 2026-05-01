import React from 'react';
import { ArrowUpRight, Calendar, User } from 'lucide-react';

const blogPosts = [
  {
    id: 1,
    title: "HOW TO STYLE KOREAN JEWELRY FOR DAILY WEAR",
    excerpt: "Master the art of minimal layering with our latest Korean aesthetic collection. Less is more when it comes to daily vibes.",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800",
    date: "OCT 12, 2024",
    author: "ADMIN",
    category: "STYLE GUIDE"
  },
  {
    id: 2,
    title: "THE RISE OF WESTERN AESTHETIC IN MINIMALIST FASHION",
    excerpt: "Exploring how western minimal trends are blending perfectly with eastern aesthetics this season.",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800",
    date: "OCT 08, 2024",
    author: "ANIRUDH",
    category: "TRENDS"
  },
  {
    id: 3,
    title: "5 MUST-HAVE AESTHETIC ACCESSORIES FOR YOUR COLLECTION",
    excerpt: "From butterfly studs to velvet chokers, here are the pieces that will define your aesthetic this year.",
    image: "https://images.unsplash.com/photo-1630030532634-1dc30c729bc1?auto=format&fit=crop&q=80&w=800",
    date: "SEP 28, 2024",
    author: "STYLE TEAM",
    category: "COLLECTION"
  },
  {
    id: 4,
    title: "WHY QUALITY MATTERS IN AESTHETIC JEWELRY",
    excerpt: "The truth about alloy bases and how to care for your favorite aesthetic pieces for long-lasting shine.",
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800",
    date: "SEP 15, 2024",
    author: "CARE GUIDE",
    category: "TIPS"
  }
];

export default function BlogsPage() {
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {blogPosts.map((post) => (
            <article key={post.id} className="group cursor-pointer">
              <div className="relative aspect-video overflow-hidden bg-stone-100 mb-8">
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-6 left-6">
                  <span className="bg-white/90 backdrop-blur-md px-4 py-1.5 text-[9px] font-bold uppercase tracking-widest text-black">
                    {post.category}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-6 text-[9px] font-bold uppercase tracking-widest text-stone-400">
                  <span className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {post.date}</span>
                  <span className="flex items-center gap-2"><User className="h-3 w-3" /> BY {post.author}</span>
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
            </article>
          ))}
        </div>

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
