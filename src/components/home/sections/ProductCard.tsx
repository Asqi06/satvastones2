import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef, useState, useEffect, useCallback } from 'react';

export default function ProductCard({ product, onAddToCart, onWishlist, onNavigate }: any) {
  const discount = product.discount ||
    (product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoActive, setVideoActive] = useState(false);

  useEffect(() => {
    if (!product.video || !containerRef.current) return;
    const el = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const v = videoRef.current;
          if (v) { v.currentTime = 0; v.play().catch(() => {}); setVideoActive(true); }
        } else {
          videoRef.current?.pause();
          setVideoActive(false);
        }
      },
      { rootMargin: '0px 0px -50% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [product.video]);

  const handleClick = () => {
    const slug = product.slug || product._id || product.id;
    onNavigate?.(`product/${slug}`);
  };

  const handleMouseEnter = useCallback(() => {
    if (!product.video || !videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().catch(() => {});
    setVideoActive(true);
  }, [product.video]);

  return (
    <motion.div
      className="group w-full rounded-[18px] bg-card p-3 shadow-[0_2px_12px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] cursor-pointer"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35 }}
      onClick={handleClick}
    >
      <div
        ref={containerRef}
        className="relative mb-3 aspect-square w-full overflow-hidden rounded-[16px] bg-[#F2EBE1]"
        onMouseEnter={handleMouseEnter}
      >
        {product.video && videoActive ? (
          <video
            ref={videoRef}
            src={product.video}
            muted
            loop
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          product.image ? (
            <img
              src={product.image}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase tracking-wider text-[#9C6A3B]">
              {product.title?.slice(0, 2) || 'SV'}
            </div>
          )
        )}

        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-[#744D30] px-2.5 py-0.5 text-[10px] font-bold text-card">
            {discount}% OFF
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist?.(product);
          }}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card/80 shadow-sm backdrop-blur-sm transition-transform hover:scale-110"
          aria-label="Add to wishlist"
        >
          <Heart className="h-3.5 w-3.5 text-[#3D2B24]" />
        </button>
      </div>

      <h3 className="mb-1 line-clamp-2 text-sm font-medium leading-tight text-[#3D2B24] md:text-base">
        {product.title || 'Product Name'}
      </h3>

      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-sm font-bold text-[#3D2B24] md:text-base">₹{product.price}</span>
        {product.oldPrice && (
          <span className="text-xs text-[#CBB498] line-through">₹{product.oldPrice}</span>
        )}
        {discount > 0 && (
          <span className="text-xs font-semibold text-[#2E7D32]">{discount}% off</span>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddToCart?.(product);
        }}
        className="flex h-10 w-full items-center justify-center rounded-[20px] bg-[#9C6A3B] text-sm font-semibold text-card transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer"
      >
        Add To Cart
      </button>
    </motion.div>
  );
}
