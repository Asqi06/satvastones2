import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, TrendingUp, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SearchOverlay({ 
  isOpen, 
  onClose, 
  products, 
  onSelectProduct 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  products: any[], 
  onSelectProduct: (p: any) => void 
}) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter(p => 
      p.title?.toLowerCase().includes(q) || 
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [query, products]);

  // Hot selling products (featured + best rated)
  const hotProducts = useMemo(() => {
    return products
      .filter(p => p.isFeatured || (p.rating >= 4.5 && p.reviewsCount > 0))
      .sort((a, b) => (b.reviewsCount || 0) - (a.reviewsCount || 0))
      .slice(0, 6);
  }, [products]);

  const trending = ['EARRINGS', 'NECKLACE', 'NAME NECKLACE', 'KOREAN', 'GOLD', 'BRACELET'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white overflow-y-auto"
        >
          <div className="mx-auto max-w-3xl px-4 pt-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <img src="/logo.png" alt="SatvaStones" className="h-7 w-auto object-contain" />
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Input */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                autoFocus
                type="text" 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for earrings, necklaces, rings..." 
                className="w-full pl-10 pr-4 py-3.5 bg-gray-100 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f2707f]"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X className="h-4 w-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Search Results */}
            {query.trim() && results.length > 0 && (
              <div className="mb-8">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">Search Results</h3>
                <div className="space-y-2">
                  {results.map(p => (
                    <div 
                      key={p._id || p.id} 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => { onSelectProduct(p); onClose(); }}
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img src={p.image} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-medium text-gray-800 truncate">{p.title}</h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          <span className="text-[#d4535f] font-bold">Rs. {p.price}</span>
                          {p.oldPrice && <span className="line-through ml-1">Rs. {p.oldPrice}</span>}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {query.trim() && results.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-gray-400">No products found for "{query}"</p>
              </div>
            )}

            {/* Hot Selling Products (when no query) */}
            {!query.trim() && (
              <>
                {/* Trending Tags */}
                <div className="mb-6">
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3" /> Trending
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trending.map(t => (
                      <button 
                        key={t}
                        onClick={() => setQuery(t)}
                        className="px-3 py-1.5 bg-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-600 hover:bg-[#f2707f] hover:text-white transition-all rounded-full"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hot Products */}
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                    <Flame className="w-3 h-3 text-orange-500" /> Hot Selling
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {hotProducts.map(p => (
                      <div 
                        key={p._id || p.id}
                        className="bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => { onSelectProduct(p); onClose(); }}
                      >
                        <div className="aspect-square bg-gray-100 overflow-hidden">
                          <img src={p.image} alt={p.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="p-2">
                          <h4 className="text-[10px] font-medium text-gray-800 truncate">{p.title}</h4>
                          <p className="text-[10px] text-[#d4535f] font-bold mt-0.5">Rs. {p.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
