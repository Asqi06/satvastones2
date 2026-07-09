import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const defaultSlides = [
  { id: '1', title: 'Summer Collection', subtitle: 'Bright & Beautiful', cta: 'Explore', image: '' },
  { id: '2', title: 'Festival Edit', subtitle: 'Celebrate in Style', cta: 'Shop Now', image: '' },
  { id: '3', title: 'Wedding Season', subtitle: 'Elegant Pieces', cta: 'View Collection', image: '' },
];

export default function CollectionCarousel({ slides = [], onNavigate }: any) {
  const items = slides.length > 0 ? slides : defaultSlides;
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(intervalRef.current);
  }, [items.length]);

  const slide = items[current];

  return (
    <div className="bg-[#FAF7F2] px-4 pb-6">
      <div className="mx-auto max-w-[390px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px]">
        <div className="relative w-full overflow-hidden rounded-[18px]" style={{ aspectRatio: '4/3' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              className="absolute inset-0 cursor-pointer"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              onClick={() => onNavigate?.('shop')}
            >
              {slide.image ? (
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#F2EBE1]">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#9C6A3B] md:text-2xl">{slide.title}</p>
                    <p className="text-sm text-[#B78453] md:text-base">{slide.subtitle}</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/50 to-transparent p-6 pb-8">
                {slide.title && (
                  <h3 className="text-xl font-bold text-white drop-shadow-md md:text-3xl lg:text-4xl">
                    {slide.title}
                  </h3>
                )}
                {slide.subtitle && (
                  <p className="text-sm text-white/80 drop-shadow-md md:text-lg">{slide.subtitle}</p>
                )}
                {slide.cta && (
                  <span className="mt-3 inline-block rounded-[20px] bg-card px-5 py-1.5 text-xs font-semibold text-[#3D2B24] shadow-md transition-transform hover:scale-105 md:mt-4 md:px-6 md:py-2 md:text-sm">
                    {slide.cta}
                  </span>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {items.map((_: any, i: number) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === current ? 'w-5 bg-card' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
