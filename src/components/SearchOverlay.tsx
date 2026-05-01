import React, { useState, useEffect } from 'react';
import { Search, X, ArrowUpRight, TrendingUp } from 'lucide-react';
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
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (query.trim()) {
      const filtered = products.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        p.category.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5);
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [query, products]);

  const trending = ['CHOKER', 'BUTTERFLY', 'EARRINGS', 'MINIMALIST', 'KOREAN'];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8 pt-8 md:pt-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-16 md:mb-24">
              <span className="font-display text-2xl font-bold tracking-tighter">SATVASTONES.</span>
              <button onClick={onClose} className="p-2 hover:bg-stone-50 rounded-full transition-colors"><X className="h-6 w-6" /></button>
            </div>

            {/* Input */}
            <div className="max-w-4xl mx-auto space-y-12">
              <div className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-8 text-stone-300" />
                <input 
                  autoFocus
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SEARCH THE COLLECTION..." 
                  className="w-full pl-12 pr-4 py-8 bg-transparent border-b border-stone-200 text-3xl md:text-5xl font-display font-bold uppercase tracking-tight focus:border-black outline-hidden"
                />
              </div>

              {/* Suggestions / Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                {/* Results */}
                <div className="space-y-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Search Results</h3>
                  {results.length > 0 ? (
                    <div className="space-y-6">
                      {results.map(p => (
                        <div 
                          key={p.id} 
                          className="flex items-center gap-6 group cursor-pointer"
                          onClick={() => { onSelectProduct(p); onClose(); }}
                        >
                          <div className="w-16 h-20 bg-stone-100 overflow-hidden">
                            <img src={p.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-tight text-stone-900 group-hover:text-stone-400 transition-colors">{p.title}</h4>
                            <p className="text-[9px] text-stone-400 uppercase mt-1">₹{p.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs uppercase tracking-widest text-stone-300 italic">Start typing to find aesthetic pieces...</p>
                  )}
                </div>

                {/* Trending */}
                <div className="space-y-8">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 flex items-center gap-2">
                    <TrendingUp className="h-3 w-3" /> Trending Searches
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {trending.map(t => (
                      <button 
                        key={t}
                        onClick={() => setQuery(t)}
                        className="px-6 py-3 bg-stone-50 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-900 hover:text-white transition-all rounded-full"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
