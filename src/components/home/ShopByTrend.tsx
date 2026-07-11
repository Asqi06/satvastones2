"use client";

import { optimizeImage, getSrcSet } from '../../utils/cloudinary';

interface Trend {
  _id: string;
  title: string;
  image: string;
  productIds?: any[];
}

export default function ShopByTrend({ 
  trends, 
  onTrendClick 
}: { 
  trends: Trend[];
  onTrendClick: (trend: Trend) => void;
}) {
  if (!trends || trends.length === 0) return null;

  return (
    <section className="py-5 sm:py-8 lg:py-12 bg-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-8">
        <h2 className="font-heading text-lg sm:text-xl lg:text-3xl font-bold text-center text-gray-900 mb-4 sm:mb-6 lg:mb-10 italic">
          Shop By Trend
        </h2>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-5">
          {trends.map((trend) => (
            <div
              key={trend._id}
              onClick={() => onTrendClick(trend)}
              className="cursor-pointer group relative aspect-[3/4] overflow-hidden rounded-lg lg:rounded-xl bg-gray-100"
            >
              <img
                src={optimizeImage(trend.image, 400, 533)}
                srcSet={getSrcSet(trend.image, [200, 300, 400], 1.333)}
                sizes="(max-width: 640px) calc(50vw - 16px), (max-width: 1024px) calc(50vw - 20px), calc(25vw - 24px)"
                alt={trend.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 lg:p-5">
                <h3 className="text-white text-xs sm:text-sm lg:text-xl font-bold uppercase tracking-wider">
                  {trend.title}
                </h3>
                <p className="text-white/70 text-[7px] sm:text-[8px] lg:text-[10px] uppercase tracking-widest mt-0.5 lg:mt-1">
                  Jewellery
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
