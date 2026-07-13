import React, { useState, useEffect } from 'react';
import {
  Heart, Star, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Truck, RefreshCcw, ShieldCheck, MessageCircle
} from 'lucide-react';
import { optimizeImage, getSrcSet, getPlaceholder } from '../utils/cloudinary';
import { Link } from 'react-router-dom';

const AccordionItem = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-4 py-3 text-left bg-white">
        <span className="text-sm font-bold text-gray-800">{title}</span>
        {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {open && <div className="px-4 pb-4 text-xs leading-relaxed text-gray-600">{children}</div>}
    </div>
  );
};

export default function ProductPage({
  product,
  allProducts = [],
  onBack,
  onAddToCart,
  onAddReview,
  isWishlisted = false,
  onToggleWishlist
}: {
  product: any;
  allProducts?: any[];
  onBack: () => void;
  onAddToCart: (product: any) => void;
  onAddReview: (productId: string, review: any) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [customText, setCustomText] = useState('');
  const [reviewSort, setReviewSort] = useState('Most Recent');
  const [showReviewForm, setShowReviewForm] = useState(false);

  const images = selectedVariant && selectedVariant.images?.length > 0
    ? selectedVariant.images
    : (product.images && product.images.length > 0) ? product.images : [product.image];

  const isCustomizable = ['HAMPERS', 'GIFTS', "MOTHER'S DAY"].includes(product.category);
  const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  const discountPercent = hasDiscount ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedVariant(null);
    setActiveImage(0);
  }, [product]);

  if (!product) return null;

  const reviews = product.reviews || [];
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const ratingCounts = [5, 4, 3, 2, 1].map(star => reviews.filter((r: any) => r.rating === star).length);

  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-2.5 text-[10px] text-gray-400 border-b border-gray-100">
        <Link to="/" className="hover:text-gray-600">Home</Link>
        <span className="mx-1">/</span>
        <Link to="/shop" className="hover:text-gray-600">Shop</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-medium">{product.title}</span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex gap-2 md:w-[55%]">
            {images.length > 1 && (
              <div className="flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0 md:w-16">
                {images.map((url: string, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${activeImage === i ? 'border-[#f2707f]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                    <img src={optimizeImage(url, 100)} alt={product.title} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="relative flex-1 aspect-square rounded-xl overflow-hidden bg-gray-50">
              <img
                src={optimizeImage(images[activeImage] || product.image, 800)}
                srcSet={getSrcSet(images[activeImage] || product.image, [320, 480, 768, 1024, 1280])}
                sizes="(max-width: 768px) 100vw, 800px"
                alt={product.title}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover"
                style={{ backgroundImage: `url(${getPlaceholder(images[activeImage] || product.image)})`, backgroundSize: 'cover' }}
              />
              {hasDiscount && (
                <span className="absolute top-3 left-3 bg-[#f2707f] text-white text-[10px] font-bold px-2.5 py-1 rounded-md">-{discountPercent}%</span>
              )}
              <button onClick={() => onToggleWishlist?.()} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm">
                <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-[#f2707f] stroke-[#f2707f]' : 'stroke-gray-400'}`} />
              </button>
              {images.length > 1 && (
                <>
                  <button onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => setActiveImage((activeImage + 1) % images.length)} className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="md:w-[45%] flex flex-col gap-3">
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{product.title}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xl font-bold text-[#f2707f]">Rs. {product.price}</span>
                {hasDiscount && <span className="text-sm text-gray-400 line-through">Rs. {product.oldPrice}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(Number(avgRating)) ? 'fill-yellow-400 stroke-yellow-400' : 'fill-gray-200 stroke-gray-200'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500">{reviews.length} reviews</span>
            </div>

            {product.variants && product.variants.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">Color: <span className="text-gray-500">{selectedVariant?.color || ''}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant: any, idx: number) => (
                    <button key={idx} onClick={() => { setSelectedVariant(variant); setActiveImage(0); }}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-md border transition-all ${selectedVariant?.color === variant.color ? 'border-[#f2707f] bg-[#f2707f] text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      {variant.color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.customOptions && product.customOptions.length > 0 && (
              <div>
                <p className="text-xs font-bold text-gray-700 mb-2">{isCustomizable ? 'Personalize Your Hamper' : 'Options'}</p>
                <div className="flex flex-col gap-1.5">
                  {product.customOptions.map((opt: string) => {
                    const isSelected = selectedOption.includes(opt);
                    return (
                      <button key={opt} onClick={() => {
                        if (isCustomizable) setSelectedOption(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]);
                        else setSelectedOption([opt]);
                      }} className={`flex items-center justify-between px-3 py-2.5 text-[10px] font-bold rounded-md border transition-all ${isSelected ? 'border-[#f2707f] bg-[#f2707f] text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                        <span>{opt}</span>
                        {isSelected && <ShieldCheck className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {product.category === 'NAME NECKLACE' && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <label className="text-[10px] font-bold text-gray-700 mb-1.5 block">Custom Name</label>
                <input type="text" maxLength={15} value={customText} onChange={(e) => setCustomText(e.target.value.toUpperCase())} placeholder="e.g. ANIRUDH"
                  className="w-full bg-white border border-gray-200 p-2.5 text-xs font-bold rounded-md focus:border-[#f2707f] outline-none" />
                <p className="text-[9px] text-gray-400 mt-1">Max 15 characters</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2.5 hover:bg-gray-50"><ChevronLeft className="h-3.5 w-3.5" /></button>
                <span className="px-4 text-sm font-bold">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="px-3 py-2.5 hover:bg-gray-50"><ChevronRight className="h-3.5 w-3.5" /></button>
              </div>
            </div>

            <button disabled={(product.stockQuantity || 0) <= 0} onClick={() => {
              if (product.category === 'NAME NECKLACE' && !customText.trim()) { alert('Please enter a name for your necklace'); return; }
              onAddToCart({ ...product, image: selectedVariant?.images?.[0] || product.image, qty, options: selectedOption, variant: selectedVariant?.color, customText: customText.trim() });
            }} className={`w-full py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${(product.stockQuantity || 0) <= 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#f2707f] hover:bg-[#d4535f] text-white'}`}>
              {(product.stockQuantity || 0) <= 0 ? 'SOLD OUT' : 'ADD TO CART'}
            </button>

            <a href={`https://wa.me/919016703180?text=Hi, I'm interested in ${product.title}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-bold transition-colors">
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>

            <div className="grid grid-cols-3 gap-2 mt-1">
              <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                <RefreshCcw className="h-4 w-4 text-gray-500 mb-1" />
                <span className="text-[8px] font-bold text-gray-600 uppercase">Easy Return</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                <Truck className="h-4 w-4 text-gray-500 mb-1" />
                <span className="text-[8px] font-bold text-gray-600 uppercase">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 bg-gray-50 rounded-lg">
                <ShieldCheck className="h-4 w-4 text-gray-500 mb-1" />
                <span className="text-[8px] font-bold text-gray-600 uppercase">COD Available</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 py-2 border-t border-b border-gray-100 text-[9px] text-gray-500 font-medium">
              <span>1M+ Customers</span><span>|</span><span>100K+ Community</span><span>|</span><span>Easy Return</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-2.5">
        <AccordionItem title="Description" defaultOpen={true}>
          <div className="space-y-2">
            <p className="text-xs text-gray-600">{product.description || 'No description available.'}</p>
            {product.material && <p className="text-[10px] text-gray-400">Base Material: {product.material}</p>}
            <p className="text-[10px] text-gray-400">Stone colour: transparent/ white stones</p>
            <p className="text-[10px] text-gray-400">Plating: Gold</p>
            <p className="text-[10px] text-gray-400">Will not lose colour easily</p>
            <p className="text-[10px] text-gray-400 mt-2">Pro Tip: Avoid contact with water or chemical substances for long lasting shine</p>
          </div>
        </AccordionItem>
        <AccordionItem title="Shipping & Returns">
          <div className="space-y-2">
            <p className="text-[10px] text-gray-500">Free shipping on prepaid/UPI orders above ₹399</p>
            <p className="text-[10px] text-gray-500">COD charges ₹40–₹95 extra based on location — save with UPI!</p>
            <p className="text-[10px] text-gray-500">Dispatch within 24–48 hours from Vapi, Gujarat</p>
            <p className="text-[10px] text-gray-500">Returns accepted only for damaged/defective items (unboxing video required)</p>
          </div>
        </AccordionItem>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <h2 className="text-center text-sm font-bold text-gray-900 mb-1">Customer Reviews</h2>
        <div className="flex items-center justify-center gap-1 mb-1">
          {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} className={`h-4 w-4 ${s <= Math.round(Number(avgRating)) ? 'fill-yellow-400 stroke-yellow-400' : 'fill-gray-200 stroke-gray-200'}`} />
          ))}
          <span className="text-sm font-bold text-gray-700 ml-1">{avgRating}</span>
          <span className="text-xs text-gray-400">out of 5</span>
        </div>
        <p className="text-center text-[10px] text-gray-400 mb-4">Based on {reviews.length} reviews</p>

        <div className="space-y-1.5 max-w-xs mx-auto mb-4">
          {[5, 4, 3, 2, 1].map((star, idx) => {
            const count = ratingCounts[idx];
            const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-2 text-[10px]">
                <span className="w-3 text-gray-500 text-right">{star}</span>
                <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-5 text-gray-400 text-right">{count}</span>
              </div>
            );
          })}
        </div>

        {reviews.length > 0 && (
          <div className="space-y-4">
            {[...reviews].sort((a: any, b: any) => {
              if (reviewSort === 'Most Recent') return new Date(b.date).getTime() - new Date(a.date).getTime();
              if (reviewSort === 'Highest Rating') return b.rating - a.rating;
              if (reviewSort === 'Lowest Rating') return a.rating - b.rating;
              return 0;
            }).map((rev: any, i: number) => (
              <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">{rev.name?.[0] || 'A'}</div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-700">{rev.name}</p>
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`h-2.5 w-2.5 ${s <= rev.rating ? 'fill-yellow-400 stroke-yellow-400' : 'fill-gray-200 stroke-gray-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400">{new Date(rev.date).toLocaleDateString()}</span>
                </div>
                <p className="text-[11px] text-gray-600">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mt-4 mb-3">
          <div />
          <select value={reviewSort} onChange={(e) => setReviewSort(e.target.value)} className="text-[10px] font-bold text-gray-700 border border-gray-200 rounded-md px-2 py-1.5 bg-white">
            <option>Most Recent</option>
            <option>Highest Rating</option>
            <option>Lowest Rating</option>
          </select>
        </div>

        <button onClick={() => setShowReviewForm(!showReviewForm)} className="w-full py-3 border-2 border-[#f2707f] text-[#f2707f] rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#f2707f] hover:text-white transition-colors">
          WRITE A REVIEW
        </button>

        {showReviewForm && (
          <form onSubmit={(e: any) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            onAddReview(product._id || product.id, { name: formData.get('name'), rating: Number(formData.get('rating')), comment: formData.get('comment') });
            e.target.reset();
            setShowReviewForm(false);
          }} className="mt-4 space-y-3 p-4 bg-gray-50 rounded-lg">
            <input name="name" required placeholder="Your Name" className="w-full border border-gray-200 p-2.5 text-xs rounded-md bg-white outline-none focus:border-[#f2707f]" />
            <select name="rating" required className="w-full border border-gray-200 p-2.5 text-xs rounded-md bg-white outline-none focus:border-[#f2707f]">
              <option value="5">5 Stars</option><option value="4">4 Stars</option><option value="3">3 Stars</option><option value="2">2 Stars</option><option value="1">1 Star</option>
            </select>
            <textarea name="comment" required rows={3} placeholder="Write your review..." className="w-full border border-gray-200 p-2.5 text-xs rounded-md bg-white outline-none focus:border-[#f2707f] resize-none" />
            <button type="submit" className="w-full py-2.5 bg-[#f2707f] hover:bg-[#d4535f] text-white text-xs font-bold rounded-md transition-colors">Submit Review</button>
          </form>
        )}
      </div>

      {allProducts.length > 1 && (
        <section className="border-t border-gray-100 bg-white py-10">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-sm font-bold text-gray-900 mb-4">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {allProducts.filter((p: any) => (p._id || p.id) !== (product._id || product.id)).slice(0, 4).map((related: any) => (
                <Link key={related._id || related.id} to={`/product/${related.slug || related._id || related.id}`} className="group">
                  <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                    <img
                      src={optimizeImage(related.image, 400)}
                      srcSet={getSrcSet(related.image, [200, 320, 400])}
                      sizes="(max-width: 640px) 50vw, 25vw"
                      alt={related.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="mt-1.5">
                    <h3 className="text-[10px] font-medium text-gray-800 truncate">{related.title}</h3>
                    <p className="text-xs font-bold text-[#f2707f]">Rs. {related.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
