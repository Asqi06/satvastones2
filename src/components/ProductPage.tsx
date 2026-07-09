import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Heart, ShoppingBag, Star, ChevronDown, ChevronUp,
  ArrowUpRight, Truck, RefreshCcw, ShieldCheck, ChevronLeft, ChevronRight, Zap, Mail
} from 'lucide-react';
import { optimizeImage } from '../utils/cloudinary';
import { Link } from 'react-router-dom';



const AccordionItem = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-stone-200">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="font-accent text-xs font-bold uppercase tracking-[0.15em] text-stone-900">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-stone-500" /> : <ChevronDown className="h-4 w-4 text-stone-500" />}
      </button>
      {open && (
        <div className="pb-5 text-xs leading-relaxed text-stone-500 uppercase tracking-tight">
          {children}
        </div>
      )}
    </div>
  );
};

export default function ProductPage({ 
  product, 
  allProducts = [],
  onBack, 
  onAddToCart,
  onAddReview 
}: { 
  product: any; 
  allProducts?: any[];
  onBack: () => void; 
  onAddToCart: (product: any) => void;
  onAddReview: (productId: string, review: any) => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [customText, setCustomText] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Dynamic Image Logic: Use variant images if a variant is selected, otherwise fallback to main images
  const images = selectedVariant && selectedVariant.images?.length > 0 
    ? selectedVariant.images 
    : (product.images && product.images.length > 0) ? product.images : [product.image];

  const isCustomizable = ['HAMPERS', 'GIFTS', "MOTHER'S DAY"].includes(product.category);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Reset variant and image when product changes
    setSelectedVariant(null);
    setActiveImage(0);
  }, [product]);

  useEffect(() => {
    if (!product.video || !containerRef.current) return;
    const el = containerRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVideoPlaying(true);
          const v = videoRef.current;
          if (v) { v.currentTime = 0; v.play().catch(() => {}); }
        } else {
          setVideoPlaying(false);
          videoRef.current?.pause();
        }
      },
      { rootMargin: '0px 0px -50% 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [product.video]);

  const styles = ['Standard Polish', 'Matte Finish', 'Vintage Aesthetic'];

  if (!product) return null;

  return (
    <div className="min-h-screen bg-white font-sans text-stone-900">
      {/* Breadcrumb - Critical for SEO & Navigation */}
      <div className="border-b border-stone-100 bg-white px-4 py-3 md:px-8">
        <nav className="mx-auto max-w-7xl flex items-center gap-2 text-[10px] uppercase tracking-widest text-stone-400">
          <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
          <ChevronRight className="h-2 w-2" />
          <Link to="/shop" className="hover:text-stone-900 transition-colors">Shop</Link>
          <ChevronRight className="h-2 w-2" />
          <span className="text-stone-900 font-bold">{product.title || 'Product'}</span>
        </nav>
      </div>

      {/* Main Product Section */}
      <section className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">

          {/* LEFT — Gallery */}
          <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div
              ref={containerRef}
              className="relative aspect-square overflow-hidden bg-stone-100 group"
              onMouseEnter={() => {
                if (!product.video) return;
                setVideoPlaying(true);
                const v = videoRef.current;
                if (v) { v.currentTime = 0; v.play().catch(() => {}); }
              }}
              onMouseLeave={() => {
                if (!product.video || !containerRef.current) return;
                const rect = containerRef.current.getBoundingClientRect();
                const isInUpperHalf = rect.top < window.innerHeight * 0.5 && rect.bottom > 0;
                if (!isInUpperHalf) {
                  setVideoPlaying(false);
                  videoRef.current?.pause();
                }
              }}
            >
              <img
                key={images[activeImage]}
                src={optimizeImage(images[activeImage], 1000)}
                alt={product.title || 'Aesthetic jewelry piece'}
                fetchpriority={activeImage === 0 ? 'high' : 'low'}
                width="1000"
                height="1000"
                className={`h-full w-full object-cover transition-opacity duration-500 ${videoPlaying ? 'opacity-0' : 'opacity-100'}`}
              />

              {product.video && (
                <video
                  ref={videoRef}
                  src={product.video}
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${videoPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                />
              )}
              {/* Wishlist */}
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110"
              >
                <Heart className={`h-5 w-5 transition-colors ${wishlisted ? 'fill-red-500 stroke-red-500' : 'stroke-stone-400'}`} />
              </button>

              {/* Anti-Tarnish Badge on Image */}
              {product.isAntiTarnish && (
                <div className="absolute top-4 left-4 z-10">
                  <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-sm shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-200 inline-block"></span>
                    Anti-Tarnish
                  </span>
                </div>
              )}
              {/* Prev / Next */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur-sm transition hover:bg-white"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveImage((p) => (p + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow backdrop-blur-sm transition hover:bg-white"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img: string, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`aspect-square overflow-hidden bg-stone-100 transition-all ${activeImage === i ? 'ring-2 ring-stone-900' : 'opacity-60 hover:opacity-100'}`}
                  >
                    <img src={optimizeImage(img, 200)} alt={product.title ? `${product.title} view ${i + 1}` : 'Product thumbnail'} loading="lazy" width="200" height="200" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* RIGHT — Product Info */}
          <div className="flex flex-col gap-6 lg:sticky lg:top-28 lg:self-start">
            <div className="border-b border-stone-100 pb-6">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{product.category || 'Korean Collection'}</p>
              <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-stone-900 md:text-4xl leading-tight">
                {product.title}
              </h1>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(product.rating || 5) ? 'fill-yellow-400 stroke-yellow-400' : 'fill-stone-200 stroke-stone-200'}`} />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-stone-900">{product.rating || '5.0'}</span>
                <span className="text-[11px] text-stone-400">({(product.reviews && product.reviews.length) || 0} reviews)</span>
              </div>
              <p className="mt-6 text-[11px] leading-relaxed text-stone-500 uppercase tracking-tight">
                {product.description || 'No description available for this aesthetic piece.'}
              </p>
              
              {product.material && (
                <div className="mt-6 flex items-center gap-2 border-l-2 border-stone-900 pl-4 py-1">
                  <span className="text-[10px] font-bold uppercase text-stone-400 tracking-[0.2em]">Material</span>
                  <span className="text-[10px] font-bold uppercase text-stone-900 tracking-widest">{product.material}</span>
                </div>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="font-accent text-3xl font-bold text-stone-900">₹{product.price}</span>
              <span className="text-sm text-stone-400 line-through">₹{product.oldPrice}</span>
              <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Limited Offer</span>
            </div>

            {/* Payment Note */}
            <div className="flex items-start gap-3 rounded-sm border border-stone-200 bg-stone-50 p-4">
              <Zap className="h-4 w-4 shrink-0 text-stone-900 mt-0.5" />
              <p className="text-[10px] leading-relaxed text-stone-600 uppercase tracking-tight">
                <span className="font-bold text-stone-900">Delivery Info:</span> SHIPPING IS CALCULATED BY DISTANCE FROM VAPI. ALL ORDERS OVER ₹399 QUALIFY FOR FREE SHIPPING (LOCAL & REGIONAL ONLY).
              </p>
            </div>

            {/* NEW: Customization for Name Necklace */}
            {product.category === 'NAME NECKLACE' && (
              <div className="space-y-4 p-5 bg-stone-50 border border-stone-200 rounded-sm">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900">Custom Name</label>
                  <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">Required</span>
                </div>
                <input 
                  type="text" 
                  maxLength={15}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                  placeholder="e.g. ANIRUDH"
                  className="w-full bg-white border border-stone-200 p-4 text-sm font-bold uppercase tracking-widest focus:border-stone-900 outline-hidden transition-all placeholder:text-stone-300"
                />
                <p className="text-[9px] text-stone-400 italic">Enter the name exactly as you want it to appear (Max 15 characters).</p>
              </div>
            )}

            {/* NEW: Color Variants Selection */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">
                  Select Color <span className="text-stone-900 ml-2">{selectedVariant?.color || ''}</span>
                </p>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setActiveImage(0); // Reset to first image of variant
                      }}
                      className={`px-5 py-3 border text-[10px] font-bold uppercase tracking-widest transition-all ${selectedVariant?.color === variant.color ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-500 hover:border-stone-400'}`}
                    >
                      {variant.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Options Selection (Old logic kept for other custom options) */}
            {product.customOptions && product.customOptions.length > 0 && (
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.15em] text-stone-500">
                  {isCustomizable ? 'Personalize Your Hamper' : 'Color Options'}
                </p>
                <div className="flex flex-col gap-2">
                  {product.customOptions.map((opt: string) => {
                    const isSelected = selectedOption.includes(opt);
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          if (isCustomizable) {
                            // Toggle for hampers
                            setSelectedOption(prev => 
                              prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
                            );
                          } else {
                            // Single select for normal
                            setSelectedOption([opt]);
                          }
                        }}
                        className={`flex items-center justify-between border px-4 py-4 text-[10px] font-bold uppercase tracking-widest transition-all ${isSelected ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-700 hover:border-stone-500'}`}
                      >
                        <span className="flex items-center gap-3">
                          {isCustomizable && (
                            <div className={`w-3.5 h-3.5 border flex items-center justify-center ${isSelected ? 'border-white bg-white' : 'border-stone-300'}`}>
                              {isSelected && <div className="w-1.5 h-1.5 bg-black" />}
                            </div>
                          )}
                          {opt}
                        </span>
                        {isSelected && !isCustomizable && <ShieldCheck className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
                {isCustomizable && (
                  <p className="mt-2 text-[9px] text-stone-400 italic uppercase tracking-tight">
                    * Select any items you wish to customize or exclude from your hamper.
                  </p>
                )}
              </div>
            )}

            {/* Trust Signals & UX Boosters */}
            <div className={`grid grid-cols-1 gap-4 border-y border-stone-100 py-6 my-4 ${product.isAntiTarnish ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-stone-50 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-stone-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest">Free Shipping</p>
                  <p className="text-[8px] text-stone-400 uppercase">On orders over ₹399 (Local)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-stone-50 flex items-center justify-center">
                  <ShieldCheck className="h-4 w-4 text-stone-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest">Secure Payment</p>
                  <p className="text-[8px] text-stone-400 uppercase">100% encrypted checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-stone-50 flex items-center justify-center">
                  <RefreshCcw className="h-4 w-4 text-stone-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest">Final Sale</p>
                  <p className="text-[8px] text-stone-400 uppercase">No Returns or Exchanges</p>
                </div>
              </div>
              {/* Anti-Tarnish Trust Signal */}
              {product.isAntiTarnish && (
                <div className="flex items-center gap-3 border border-emerald-100 bg-emerald-50 rounded-sm px-3 py-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <span className="text-emerald-600 text-[14px] font-black">✦</span>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700">Anti-Tarnish</p>
                    <p className="text-[8px] text-emerald-500 uppercase">Long-lasting shine guaranteed</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold tracking-tight">₹{product.price}</span>
                  {product.oldPrice > 0 && (
                    <span className="text-sm text-stone-400 line-through decoration-red-500/30">₹{product.oldPrice}</span>
                  )}
                </div>
                <div className="flex items-center bg-stone-50 border border-stone-100 rounded-xs p-1">
                  <button 
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="p-2 hover:bg-white rounded transition-colors"
                  >
                    <ChevronLeft className="h-3 w-3" />
                  </button>
                  <span className="px-4 text-xs font-bold w-10 text-center">{qty}</span>
                  <button 
                    onClick={() => setQty(q => q + 1)}
                    className="p-2 hover:bg-white rounded transition-colors"
                  >
                    <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  disabled={(product.stockQuantity || 0) <= 0}
                  onClick={() => {
                    if (product.category === 'NAME NECKLACE' && !customText.trim()) {
                      alert('Please enter a name for your necklace');
                      return;
                    }
                    const variantImage = selectedVariant?.images?.[0] || product.image;
                    onAddToCart({
                      ...product, 
                      image: variantImage,
                      qty, 
                      options: selectedOption, 
                      variant: selectedVariant?.color, 
                      customText: customText.trim()
                    })
                  }}
                  className={`flex-1 py-5 text-[10px] font-bold uppercase tracking-[0.3em] transition-all shadow-xl active:scale-95 ${
                    (product.stockQuantity || 0) <= 0 
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                      : 'bg-black text-white hover:bg-stone-800'
                  }`}
                >
                  {(product.stockQuantity || 0) <= 0 ? 'Sold Out' : 'Add To Bag'}
                </button>
              </div>

              {/* Restock Notification Form */}
              {(product.stockQuantity || 0) <= 0 && (
                <div className="bg-stone-50 border border-stone-200 p-5 rounded-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Mail className="h-4 w-4 text-stone-600" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-900">Email Me When Restocked</p>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="email" 
                      placeholder="YOUR EMAIL" 
                      className="flex-1 bg-white border border-stone-200 p-3 text-[10px] font-bold uppercase tracking-widest outline-hidden focus:border-stone-900 transition-colors"
                    />
                    <button className="bg-stone-900 text-white px-4 text-[9px] font-bold uppercase tracking-widest hover:bg-black transition-all whitespace-nowrap">
                      Notify Me
                    </button>
                  </div>
                  <p className="text-[8px] text-stone-400 mt-2 uppercase tracking-wider">We will notify you when this piece is back in stock.</p>
                </div>
              )}
            </div>

            {/* Accordions */}
            <div className="mt-2 divide-y divide-stone-100">
              <AccordionItem title="Material & Specifications">
                <div className="space-y-4">
                  <p className="text-[10px] leading-relaxed text-stone-600 uppercase tracking-tight font-medium">
                    Each Satvastones piece is crafted with artisanal precision, featuring a brilliant luster and heirloom-quality finish. The hypoallergenic construction ensures comfortable wear for even the most sensitive skin, while the tarnish-resistant coating preserves its captivating sparkle through every occasion.
                  </p>
                  <div className="bg-stone-100 p-4 space-y-2">
                    {product.specifications && product.specifications.length > 0 ? (
                      product.specifications.map((spec: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-[9px] uppercase tracking-wider">
                          <span className="text-stone-500 font-bold">{spec.key}</span>
                          <span className="text-stone-900 font-bold">{spec.value}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex justify-between text-[9px] uppercase tracking-wider">
                          <span className="text-stone-500 font-bold">Metal</span>
                          <span className="text-stone-900 font-bold">{product.material || 'Premium Alloy'}</span>
                        </div>
                        <div className="flex justify-between text-[9px] uppercase tracking-wider">
                          <span className="text-stone-500 font-bold">Finish</span>
                          <span className="text-stone-900 font-bold">High Polish / Matte</span>
                        </div>
                        <div className="flex justify-between text-[9px] uppercase tracking-wider">
                          <span className="text-stone-500 font-bold">Tarnish Resistance</span>
                          <span className="text-stone-900 font-bold">{product.isAntiTarnish ? 'Anti-Tarnish Guaranteed' : 'Standard'}</span>
                        </div>
                        {product.sku && (
                          <div className="flex justify-between text-[9px] uppercase tracking-wider">
                            <span className="text-stone-500 font-bold">SKU</span>
                            <span className="text-stone-900 font-bold">{product.sku}</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-stone-900">Care Instructions</p>
                    <ul className="space-y-1 list-disc list-inside text-[9px] text-stone-500 uppercase tracking-tight">
                      <li>Avoid direct contact with perfumes, lotions, and water</li>
                      <li>Store in a cool, dry place away from sunlight</li>
                      <li>Gently polish with a soft cloth to restore luster</li>
                      <li>Remove before sleeping, exercising, or swimming</li>
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-[7px] bg-stone-200 text-stone-600 px-2 py-1 font-bold uppercase tracking-wider">Craftsmanship</span>
                    <span className="text-[7px] bg-stone-200 text-stone-600 px-2 py-1 font-bold uppercase tracking-wider">Hypoallergenic</span>
                    <span className="text-[7px] bg-stone-200 text-stone-600 px-2 py-1 font-bold uppercase tracking-wider">Tarnish-Resistant</span>
                    <span className="text-[7px] bg-stone-200 text-stone-600 px-2 py-1 font-bold uppercase tracking-wider">Artisan Quality</span>
                  </div>
                </div>
              </AccordionItem>
              <AccordionItem title="Returns & Policy">
                <p className="text-red-600 font-bold mb-2">STRICT POLICY: NO REFUNDS • NO CANCELLATIONS • NO RETURNS</p>
                <p>All products are final sale. We do not offer any refunds or cancellations once an order is placed. Returns are not accepted under any circumstances to maintain the hygiene and exclusivity of our aesthetic collections.</p>
              </AccordionItem>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="border-t border-stone-100 bg-stone-50/30 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-12">
            
            {/* Left: Review List */}
            <div className="lg:col-span-7">
              <h2 className="font-display text-3xl font-bold uppercase tracking-tight mb-12">Reviews & Community</h2>
              <div className="space-y-10">
                {product.reviews && product.reviews.length > 0 ? (
                  product.reviews.map((rev: any, i: number) => (
                    <div key={i} className="border-b border-stone-100 pb-8 last:border-0">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-bold">
                            {rev.name?.[0] || 'A'}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest">{rev.name}</p>
                            <div className="flex gap-0.5 mt-1">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} className={`h-2.5 w-2.5 ${s <= rev.rating ? 'fill-yellow-400 stroke-yellow-400' : 'fill-stone-200 stroke-stone-200'}`} />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter">
                          {new Date(rev.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-stone-600 uppercase tracking-tight">
                        {rev.comment}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white border border-stone-100">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">No reviews yet. Be the first to share your aesthetic vibe.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Add Review Form */}
            <div className="lg:col-span-5">
              <div className="bg-white border border-stone-100 p-8 sticky top-32">
                <h3 className="font-display text-xl font-bold uppercase tracking-tight mb-2">Write a Review</h3>
                <p className="text-[9px] text-stone-400 uppercase tracking-widest mb-8">Share your experience with this piece</p>
                
                <form 
                  onSubmit={(e: any) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    onAddReview(product._id || product.id, {
                      name: formData.get('name'),
                      rating: Number(formData.get('rating')),
                      comment: formData.get('comment')
                    });
                    e.target.reset();
                  }}
                  className="space-y-5"
                >
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Your Name</label>
                    <input name="name" required className="w-full border-b border-stone-200 py-3 text-xs outline-hidden focus:border-stone-900 transition-colors" placeholder="Full Name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Rating</label>
                    <select name="rating" required className="w-full border-b border-stone-200 py-3 text-xs outline-hidden focus:border-stone-900 appearance-none bg-transparent">
                      <option value="5">5 Stars — Excellent</option>
                      <option value="4">4 Stars — Very Good</option>
                      <option value="3">3 Stars — Average</option>
                      <option value="2">2 Stars — Poor</option>
                      <option value="1">1 Star — Very Poor</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Your Comment</label>
                    <textarea name="comment" required rows={4} className="w-full border-b border-stone-200 py-3 text-xs outline-hidden focus:border-stone-900 transition-colors resize-none" placeholder="What did you think of the design, quality, and aesthetic?" />
                  </div>
                  <button type="submit" className="w-full bg-stone-900 text-white py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">
                    Submit Review
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SEO Content — Product description block for search indexing */}
      <section className="bg-white border-t border-stone-100 py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-6">
              <h2 className="font-display text-2xl md:text-3xl font-bold uppercase tracking-tight">{product.title} — Detailed Guide</h2>
              <div className="w-12 h-0.5 bg-stone-200 mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900">About This Piece</h3>
                <p className="text-[10px] leading-relaxed text-stone-500 uppercase tracking-tight">
                  {product.seoContent ? (
                    <span dangerouslySetInnerHTML={{ __html: product.seoContent }} />
                  ) : (
                    product.description || `Discover the exquisite ${product.title} from Satvastones — a premium ${(product.material || 'gold-plated').toLowerCase()} jewelry piece designed for the modern aesthetic woman. Each detail is crafted with artisanal precision, from the brilliant clarity of the setting to the smooth hypoallergenic finish that ensures comfortable all-day wear.`
                  )}
                </p>
                {!product.seoContent && (
                <p className="text-[10px] leading-relaxed text-stone-500 uppercase tracking-tight">
                  Part of our {product.category || 'signature'} collection, this piece embodies the fusion of Korean minimalism and Western elegance that Satvastones is renowned for. The tarnish-resistant coating and waterproof construction make it perfect for daily wear — whether you are heading to the office, attending a wedding celebration, or curating your weekend aesthetic.
                </p>
                )}
              </div>
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900">Why Choose Satvastones</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-[9px] text-stone-500 uppercase tracking-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-1 shrink-0"></span>
                    <span><strong className="text-stone-900">Anti-Tarnish Craftsmanship:</strong> Our proprietary coating prevents oxidation, ensuring your jewelry maintains its brilliant luster for years without discoloration or fading.</span>
                  </li>
                  <li className="flex items-start gap-3 text-[9px] text-stone-500 uppercase tracking-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-1 shrink-0"></span>
                    <span><strong className="text-stone-900">Hypoallergenic Materials:</strong> All pieces are nickel-free and crafted with sensitive skin in mind. No irritation, no green fingers — just pure elegance.</span>
                  </li>
                  <li className="flex items-start gap-3 text-[9px] text-stone-500 uppercase tracking-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-1 shrink-0"></span>
                    <span><strong className="text-stone-900">Heirloom Quality:</strong> Each piece is meticulously finished with attention to clarity, carat weight, and overall luster — designed to be treasured for generations.</span>
                  </li>
                  <li className="flex items-start gap-3 text-[9px] text-stone-500 uppercase tracking-tight">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-900 mt-1 shrink-0"></span>
                    <span><strong className="text-stone-900">Free Shipping:</strong> On prepaid orders above ₹399. Express dispatch within 24-48 hours from our studio in Vapi. Gift-ready packaging included.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Complete the Look - Related Products */}
      {allProducts.length > 1 && (
        <section className="border-t border-stone-100 bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="mb-12">
              <h2 className="font-display text-3xl font-bold uppercase tracking-tight">Complete The <span className="text-stone-300">Look</span></h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-400 mt-2">Pair this piece with matching jewelry from the same collection</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {allProducts
                .filter((p: any) => (p._id || p.id) !== (product._id || product.id))
                .filter((p: any) => !product.category || p.category === product.category)
                .slice(0, 4)
                .map((related: any) => (
                  <Link 
                    key={related._id || related.id}
                    to={`/product/${related.slug || related._id || related.id}`}
                    className="group flex flex-col gap-3"
                  >
                    <div className="aspect-[4/5] bg-stone-100 overflow-hidden">
                      <img 
                        src={optimizeImage(related.image, 500)} 
                        alt={related.title} 
                        loading="lazy"
                        width="500"
                        height="625"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-900">{related.title}</h3>
                      <p className="text-[10px] font-bold text-stone-900">₹{related.price}</p>
                      {related.isAntiTarnish && (
                        <span className="inline-flex items-center gap-1 text-[8px] text-emerald-600 font-bold uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Anti-Tarnish
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
            {allProducts.filter((p: any) => !product.category || p.category === product.category).length <= 1 && (
              <div className="text-center py-12">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Discover more pieces from our <Link to="/shop" className="underline underline-offset-4 hover:text-stone-900">full collection</Link></p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Instagram Feed */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight md:text-4xl text-stone-400">@SATVASTONES <span className="text-stone-900">AESTHETICS</span></h2>
          </div>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
            {(allProducts.length > 0 ? allProducts : [product]).slice(0, 6).map((p, i) => (
              <div key={i} className="aspect-square overflow-hidden bg-stone-100 group">
                <img src={optimizeImage(p.image, 400)} alt={p.title || 'Shop more aesthetic jewelry'} loading="lazy" width="400" height="400" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
