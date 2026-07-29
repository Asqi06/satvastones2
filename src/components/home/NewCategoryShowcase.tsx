"use client";

import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { optimizeImage, getSrcSet } from '../../utils/cloudinary';

interface Category {
  title: string;
  image: string;
  size?: string;
}

export default function NewCategoryShowcase({ categories, onCategoryClick }: { 
  categories: Category[];
  onCategoryClick: (cat: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isPausedRef = useRef(false);
  const manualPauseRef = useRef(false);
  const scrollPosRef = useRef(0);
  const timerRef = useRef<any>(null);

  // Triple the items for seamless loop
  const items = [...categories, ...categories, ...categories];

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || categories.length <= 1) return;

    // Start from middle set
    const oneSetWidth = el.scrollWidth / 3;
    scrollPosRef.current = oneSetWidth;
    el.scrollLeft = oneSetWidth;

    let animId: number;

    const tick = () => {
      if (!isPausedRef.current && !manualPauseRef.current) {
        scrollPosRef.current += 0.6;
        // When we've scrolled past the second set, jump back to first set
        if (scrollPosRef.current >= oneSetWidth * 2) {
          scrollPosRef.current = oneSetWidth;
        }
        el.scrollLeft = scrollPosRef.current;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animId);
  }, [categories.length]);

  const handleTouchStart = () => {
    manualPauseRef.current = true;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      manualPauseRef.current = false;
    }, 3000);
  };

  const handleMouseDown = () => {
    manualPauseRef.current = true;
    clearTimeout(timerRef.current);
  };

  const handleMouseUp = () => {
    timerRef.current = setTimeout(() => {
      manualPauseRef.current = false;
    }, 2000);
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-4 sm:py-6 lg:py-10" style={{ background: '#f79da6' }}>
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-8">
        <div 
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 lg:gap-5 overflow-x-auto no-scrollbar pb-2"
          onMouseEnter={() => { isPausedRef.current = true; }}
          onMouseLeave={() => { isPausedRef.current = false; }}
          onTouchStart={handleTouchStart}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          {items.map((cat, index) => {
            const isDuplicate = index < categories.length || index >= categories.length * 2;
            return (
              <Link
                key={`${cat.title}-${index}`}
                to={`/shop/${cat.title?.toLowerCase()}`}
                className="flex-shrink-0 group"
                {...(isDuplicate ? { 'aria-hidden': 'true', tabIndex: -1 } : {})}
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-52 lg:h-52 rounded-xl lg:rounded-2xl overflow-hidden bg-white/50 transition-transform duration-300 group-hover:scale-105 shadow-sm">
                  <img
                    src={optimizeImage(cat.image, 300, 300)}
                    srcSet={getSrcSet(cat.image, [96, 128, 208], 1.0)}
                    sizes="(max-width: 640px) 96px, (max-width: 1024px) 128px, 208px"
                    alt={cat.title}
                    className="w-full h-full object-cover"
                    loading={index < 6 ? "eager" : "lazy"}
                  />
                </div>
                <p className="text-center text-[10px] sm:text-xs lg:text-sm font-medium text-gray-800 mt-1.5 sm:mt-2 lg:mt-2.5">
                  {cat.title}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
