"use client";

import { useState, useEffect, useCallback } from "react";
import { optimizeImage, getSrcSet } from '../../utils/cloudinary';

interface Banner {
  _id: string;
  title: string;
  image: string;
  link?: string;
  linkUrl?: string;
}

export default function NewHeroBanner({ banners, onBannerClick }: { 
  banners: Banner[];
  onBannerClick?: (banner: Banner) => void;
}) {
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners || banners.length === 0) return null;

  return (
    <section className="relative w-full overflow-hidden" style={{ background: '#f79da6' }}>
      {/* Taller banner */}
      <div className="relative w-full" style={{ paddingBottom: 'min(90vw, 45%)' }}>
        {banners.map((banner, index) => (
          <div
            key={banner._id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
            onClick={() => onBannerClick?.(banner)}
            role={onBannerClick ? "button" : undefined}
            tabIndex={onBannerClick ? 0 : undefined}
            onKeyDown={(e) => e.key === 'Enter' && onBannerClick?.(banner)}
            style={{ cursor: onBannerClick ? 'pointer' : undefined }}
          >
            <img
              src={optimizeImage(banner.image, 1600, 900)}
              srcSet={getSrcSet(banner.image, [400, 640, 768, 1024, 1280, 1600], 0.5625)}
              sizes="100vw"
              alt={banner.title}
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
      </div>

      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(i); }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? 'bg-white w-5' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
