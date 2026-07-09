import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useRef, useState, useEffect, useCallback } from 'react';

export default function ProductCard({ product, onAddToCart, onWishlist, onNavigate }: any) {
  const discount = product.discount ||
    (product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoEndedRef = useRef(false);
  const [videoActive, setVideoActive] = useState(false);

  const handleVideoEnded = useCallback(() => {
    setVideoActive(false);
    videoEndedRef.current = true;
    const v = videoRef.current;
    if (v) { v.pause(); v.currentTime = 0; }
  }, []);

  const playVideo = useCallback((seekToStart = true) => {
    const v = videoRef.current;
    if (!v) return;
    if (!v.paused && !v.ended) return;
    if (seekToStart) v.currentTime = 0;
    v.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!product.video || !containerRef.current) return;
    const el = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (videoEndedRef.current) return;
          setVideoActive(true);
          playVideo(true);
        } else {
          setVideoActive(false);
          videoEndedRef.current = false;
          videoRef.current?.pause();
        }
      },
      { rootMargin: '0px 0px -50% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [product.video, playVideo]);

  const handleClick = () => {
    const slug = product.slug || product._id || product.id;
    onNavigate?.(`product/${slug}`);
  };

  const handleMouseEnter = useCallback(() => {
    if (!product.video) return;
    setVideoActive(true);
    playVideo(true);
  }, [product.video, playVideo]);

  const handleMouseLeave = useCallback(() => {
    if (!product.video || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const isInUpperHalf = rect.top < window.innerHeight * 0.5 && rect.bottom > 0;
    if (!isInUpperHalf) {
      setVideoActive(false);
      videoRef.current?.pause();
    }
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
        onMouseLeave={handleMouseLeave}
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className={`h-full w-full object-cover transition-opacity duration-500 ${videoActive ? 'opacity-0' : 'opacity-100'}`}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] font-bold uppercase tracking-wider text-[#9C6A3B]">
            {product.title?.slice(0, 2) || 'SV'}
          </div>
        )}

        {product.video && (
          <video
            ref={videoRef}
            src={product.video}
            muted
            playsInline
            preload="metadata"
            onEnded={handleVideoEnded}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 pointer-events-none ${videoActive ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-full bg-[#744D30] px-2.5 py-0.5 text-[10px] font-bold text-card z-10">
            {discount}% OFF
          </span>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlist?.(product);
          }}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-card/80 shadow-sm backdrop-blur-sm transition-transform hover:scale-110 z-10"
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
        className="flex h-10 w-full items-center justify-center rounded-[20px] bg-[#9C6A3B] text-sm font-semibold text-card transition-transform hover:scale-[1.02] active:scale-95 cursor-pointer z-10"
      >
        Add To Cart
      </button>
    </motion.div>
  );
}
