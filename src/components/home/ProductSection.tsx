"use client";

import { optimizeImage, getSrcSet } from '../../utils/cloudinary';

interface Product {
  _id: string;
  title: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  slug?: string;
}

interface Section {
  _id: string;
  title: string;
  badge?: string;
  productIds: Product[];
}

export default function ProductSection({ 
  section, 
  onProductClick, 
  onViewAll 
}: { 
  section: Section;
  onProductClick: (product: Product) => void;
  onViewAll: () => void;
}) {
  if (!section || !section.productIds || section.productIds.length === 0) return null;

  return (
    <section className="py-5 sm:py-8 lg:py-12 bg-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-8">
        <h2 className="font-heading text-lg sm:text-xl lg:text-3xl font-bold text-center text-gray-900 mb-4 sm:mb-6 lg:mb-10 italic">
          {section.title}
        </h2>
        
        <div className="flex gap-2.5 sm:gap-3 lg:gap-5 overflow-x-auto no-scrollbar pb-2">
          {section.productIds.map((product) => (
            <div
              key={product._id}
              className="flex-shrink-0 w-[45%] sm:w-[48%] lg:w-72 cursor-pointer group"
              onClick={() => onProductClick(product)}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg lg:rounded-xl bg-gray-100">
                <img
                  src={optimizeImage(product.image, 400, 400)}
                  srcSet={getSrcSet(product.image, [200, 300, 400], 1.0)}
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 48vw, 288px"
                  alt={product.title}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                  loading="lazy"
                />
                {(product as any).images && (product as any).images.length > 1 && (
                  <img
                    src={optimizeImage((product as any).images[1], 400, 400)}
                    alt={product.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    loading="lazy"
                  />
                )}
                {section.badge && (
                  <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-[#D44638] text-white text-[7px] sm:text-[9px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full uppercase tracking-wider">
                    {section.badge}
                  </span>
                )}
              </div>
              
              <div className="mt-1.5 sm:mt-2 lg:mt-3 px-0.5">
                <h3 className="text-[11px] sm:text-xs lg:text-sm font-medium text-gray-900 truncate leading-tight">
                  {product.title}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1 flex-wrap">
                  <span className="text-xs sm:text-sm font-bold text-[#d4535f]">
                    Rs. {product.price.toFixed(2)}
                  </span>
                  {product.oldPrice && (
                    <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                      Rs. {product.oldPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                <button className="btn-shimmer w-full mt-1.5 sm:mt-2 lg:mt-3 bg-[#f2707f] hover:bg-[#d4535f] text-white text-[9px] sm:text-[10px] lg:text-xs font-bold py-1.5 sm:py-2 lg:py-2.5 rounded-md lg:rounded-lg uppercase tracking-wider transition-colors">
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-4 sm:mt-5 lg:mt-6">
          <button
            onClick={onViewAll}
            className="border-2 border-[#f2707f] text-[#d4535f] hover:bg-[#f2707f] hover:text-white text-[10px] sm:text-xs font-bold px-6 sm:px-8 py-2 sm:py-2.5 lg:py-3 rounded-lg uppercase tracking-wider transition-colors"
          >
            View All
          </button>
        </div>
      </div>
    </section>
  );
}
