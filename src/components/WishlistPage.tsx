"use client";

import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { optimizeImage, getSrcSet } from '../utils/cloudinary';

interface WishlistItem {
  _id: string;
  id?: string;
  title: string;
  price: number;
  oldPrice?: number;
  image: string;
  slug?: string;
}

export default function WishlistPage({ 
  wishlist, 
  onRemove, 
  onAddToCart, 
  onProductClick 
}: { 
  wishlist: WishlistItem[];
  onRemove: (id: string) => void;
  onAddToCart: (product: any) => void;
  onProductClick: (product: any) => void;
}) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 italic">My Wishlist</h1>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-sm text-gray-400 mb-6">Save your favorite pieces here for later</p>
            <Link 
              to="/shop" 
              className="btn-shimmer inline-flex items-center gap-2 bg-[#f2707f] hover:bg-[#d4535f] text-white text-xs font-bold px-8 py-3 rounded-lg uppercase tracking-wider transition-colors"
            >
              <ShoppingBag className="h-4 w-4" />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {wishlist.map((item) => (
              <div key={item._id || item.id} className="group bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
                <div 
                  className="relative aspect-square bg-gray-50 cursor-pointer overflow-hidden"
                  onClick={() => onProductClick(item)}
                >
                  <img
                    src={optimizeImage(item.image, 400, 400)}
                    srcSet={getSrcSet(item.image, [200, 300, 400], 1.0)}
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); onRemove(item._id || item.id || ''); }}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-red-50 transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                  </button>
                </div>
                <div className="p-2.5 sm:p-3">
                  <h3 
                    className="text-[11px] sm:text-xs font-medium text-gray-800 truncate cursor-pointer hover:text-[#d4535f] transition-colors"
                    onClick={() => onProductClick(item)}
                  >
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs sm:text-sm font-bold text-[#d4535f]">Rs. {item.price}</span>
                    {item.oldPrice && (
                      <span className="text-[10px] text-gray-400 line-through">Rs. {item.oldPrice}</span>
                    )}
                  </div>
                  <button
                    onClick={() => onAddToCart(item)}
                    className="btn-shimmer w-full mt-2 bg-[#f2707f] hover:bg-[#d4535f] text-white text-[9px] sm:text-[10px] font-bold py-2 rounded-md uppercase tracking-wider transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
