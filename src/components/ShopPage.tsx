import React, { useState } from 'react';
import { Search, ChevronDown, Filter, LayoutGrid, Square, ArrowUpRight } from 'lucide-react';

const products = [
  { id: 1, title: 'KOREAN VELVET CHOKER', price: 299, oldPrice: 450, rating: 4.9, reviews: 89, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800', category: 'NECKLACES' },
  { id: 2, title: 'AESTHETIC BUTTERFLY STUDS', price: 199, oldPrice: 350, rating: 4.8, reviews: 54, image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&q=80&w=800', category: 'EARRINGS' },
  { id: 3, title: 'WESTERN MINIMALIST RING', price: 249, oldPrice: 399, rating: 4.7, reviews: 120, image: 'https://images.unsplash.com/photo-1590548784585-643d2b9f2912?auto=format&fit=crop&q=80&w=800', category: 'RINGS' },
  { id: 4, title: 'KAWAII PEARL HAIRPIN', price: 149, oldPrice: 250, rating: 4.9, reviews: 210, image: 'https://images.unsplash.com/photo-1630030532634-1dc30c729bc1?auto=format&fit=crop&q=80&w=800', category: 'ACCESSORIES' },
  { id: 5, title: 'VINTAGE FLOWER EARRINGS', price: 279, oldPrice: 400, rating: 4.6, reviews: 45, image: 'https://images.unsplash.com/photo-1543294001-f7cd5d7fb516?auto=format&fit=crop&q=80&w=800', category: 'EARRINGS' },
  { id: 6, title: 'Y2K STAR PENDANT', price: 329, oldPrice: 499, rating: 4.9, reviews: 112, image: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800', category: 'NECKLACES' },
  { id: 7, title: 'SOFT GIRL BRACELET', price: 189, oldPrice: 299, rating: 4.5, reviews: 32, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800', category: 'BRACELETS' },
  { id: 8, title: 'DREAMY CLOUD STUDS', price: 219, oldPrice: 320, rating: 4.8, reviews: 76, image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800', category: 'EARRINGS' },
];

const categories = ['ALL', 'NECKLACES', 'EARRINGS', 'RINGS', 'BRACELETS', 'ACCESSORIES'];

export default function ShopPage({ onSelectProduct }: { onSelectProduct: (p: any) => void }) {
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');

  const filteredProducts = activeCategory === 'ALL' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-stone-50 py-16 md:py-24 text-center px-4">
        <h1 className="font-display text-5xl md:text-8xl font-bold uppercase tracking-tight text-stone-900">
          The <span className="text-stone-400">Shop</span>
        </h1>
        <p className="mt-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-stone-500">
          Curated Korean & Western Aesthetics
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-stone-200 pb-8 mb-10">
          {/* Categories */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-4 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-full border ${activeCategory === cat ? 'bg-black text-white border-black' : 'border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              <button onClick={() => setViewMode('grid')} className={`p-1 ${viewMode === 'grid' ? 'text-black' : ''}`}><LayoutGrid className="h-4 w-4" /></button>
              <button onClick={() => setViewMode('large')} className={`p-1 ${viewMode === 'large' ? 'text-black' : ''}`}><Square className="h-4 w-4" /></button>
              <span className="ml-4">{filteredProducts.length} Products</span>
            </div>
            
            <div className="relative group">
              <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-900">
                Sort By <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className={`grid gap-x-6 gap-y-12 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="group cursor-pointer flex flex-col gap-4"
              onClick={() => onSelectProduct(product)}
            >
              <div className={`relative overflow-hidden bg-stone-100 ${viewMode === 'grid' ? 'aspect-[4/5]' : 'aspect-square'}`}>
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                
                {/* Quick Add */}
                <div className="absolute inset-x-0 bottom-4 flex justify-center translate-y-4 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 px-4">
                  <button className="w-full bg-white/90 backdrop-blur-md py-3 text-[9px] font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all shadow-xl">
                    View Details
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 px-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-accent text-xs font-bold uppercase tracking-tight text-stone-900 max-w-[70%] leading-tight">
                    {product.title}
                  </h3>
                  <div className="flex flex-col items-end">
                    <span className="font-accent text-sm font-bold text-stone-900">₹{product.price}</span>
                    <span className="text-[9px] text-stone-400 line-through">₹{product.oldPrice}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex text-yellow-400">
                    <span className="text-[10px]">★</span>
                  </div>
                  <span className="text-[9px] font-bold text-stone-900">{product.rating}</span>
                  <span className="text-[9px] text-stone-400 uppercase tracking-tighter">({product.reviews} reviews)</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-24 flex justify-center">
          <button className="flex items-center gap-3 rounded-full border border-stone-200 px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-black hover:text-white hover:border-black">
            Load More <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
