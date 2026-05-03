import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Heart, ShoppingBag, Star, ChevronDown, ChevronUp,
  ArrowUpRight, Truck, RefreshCcw, ShieldCheck, ChevronLeft, ChevronRight, Zap
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
            <div className="relative aspect-square overflow-hidden bg-stone-100 group">
              <img
                key={images[activeImage]} // Force re-render for smooth transition
                src={optimizeImage(images[activeImage], 1000)}
                alt="Product"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Wishlist */}
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-transform hover:scale-110"
              >
                <Heart className={`h-5 w-5 transition-colors ${wishlisted ? 'fill-red-500 stroke-red-500' : 'stroke-stone-400'}`} />
              </button>
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
                    <img src={optimizeImage(img, 200)} alt="" className="h-full w-full object-cover" />
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
                <span className="font-bold text-stone-900">Payment Tip:</span> UPI is the most cost-effective way to pay. We primarily don't accept COD. COD orders incur a ₹40 platform charge.
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y border-stone-100 py-6 my-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-stone-50 flex items-center justify-center">
                  <Truck className="h-4 w-4 text-stone-600" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[9px] font-bold uppercase tracking-widest">Free Shipping</p>
                  <p className="text-[8px] text-stone-400 uppercase">On orders over ₹1500</p>
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
                  <p className="text-[9px] font-bold uppercase tracking-widest">Easy Returns</p>
                  <p className="text-[8px] text-stone-400 uppercase">7-day exchange policy</p>
                </div>
              </div>
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
                  onClick={() => {
                    if (product.category === 'NAME NECKLACE' && !customText.trim()) {
                      alert('Please enter a name for your necklace');
                      return;
                    }
                    onAddToCart({...product, qty, options: selectedOption, variant: selectedVariant?.color, customText: customText.trim()})
                  }}
                  className="flex-1 bg-black text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-stone-800 transition-all shadow-xl active:scale-95"
                >
                  Add To Bag
                </button>
              </div>
            </div>

            {/* Accordions */}
            <div className="mt-2 divide-y divide-stone-100">
              <AccordionItem title="Material & Care">
                <ul className="space-y-1.5 list-disc list-inside">
                  <li>High-grade aesthetic alloy base</li>
                  <li>Lightweight design for all-day comfort</li>
                  <li>Avoid direct contact with water and perfumes</li>
                  <li>Store in a dry, cool place</li>
                </ul>
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

      {/* Instagram Feed */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight md:text-4xl text-stone-400">@SATVASTONES <span className="text-stone-900">AESTHETICS</span></h2>
          </div>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6 md:gap-3">
            {(allProducts.length > 0 ? allProducts : [product]).slice(0, 6).map((p, i) => (
              <div key={i} className="aspect-square overflow-hidden bg-stone-100 group">
                <img src={optimizeImage(p.image, 400)} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
