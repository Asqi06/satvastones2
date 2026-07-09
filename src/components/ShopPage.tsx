import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Filter, LayoutGrid, Square, ArrowUpRight, ArrowRight, CheckCircle } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { slug: 'all', label: 'All' },
  { slug: '99-sale', label: '₹99 Sale' },
  { slug: 'necklaces', label: 'Necklaces' },
  { slug: 'name-necklace', label: 'Name Necklace' },
  { slug: 'earrings', label: 'Earrings' },
  { slug: 'rings', label: 'Rings' },
  { slug: 'bracelets', label: 'Bracelets' },
  { slug: 'accessories', label: 'Accessories' },
  { slug: 'pendant', label: 'Pendant' },
  { slug: 'gifts', label: 'Gifts' },
  { slug: 'hampers', label: 'Hampers' },
  { slug: 'mothers-day', label: "Mother's Day" },
];

export default function ShopPage({ 
  products,
  onSelectProduct,
  cmsData
}: { 
  products: any[],
  onSelectProduct: (p: any) => void,
  cmsData?: any 
}) {
  const { category: urlCategory } = useParams<{ category?: string }>();
  const navigate = useNavigate();
  
  const [activeCategory, setActiveCategory] = useState(urlCategory?.toLowerCase() || 'all');
  const [viewMode, setViewMode] = useState<'grid' | 'large'>('grid');
  const [sortBy, setSortBy] = useState('Featured');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement>>({});
  const containerRefs = useRef<Record<string, HTMLDivElement>>({});
  const collectionSeo = cmsData?.collectionSeo || {};

  // Sync state if URL path changes
  useEffect(() => {
    setActiveCategory(urlCategory?.toLowerCase() || 'all');
  }, [urlCategory]);

  const SLUG_TO_PRODUCT_CATEGORY: Record<string, string | undefined> = {
    'necklaces': 'necklaces',
    'name-necklace': 'name necklace',
    'earrings': 'earrings',
    'rings': 'rings',
    'bracelets': 'bracelets',
    'accessories': 'accessories',
    'pendant': 'pendant',
    'gifts': 'gifts',
    'hampers': 'hampers',
    'mothers-day': "mother's day",
  };

  const setCategory = (slug: string) => {
    setActiveCategory(slug);
    if (slug === 'all') {
      navigate('/shop');
    } else {
      navigate(`/shop/${slug}`);
    }
  };

  const ninetyNineProducts = products.filter((p: any) => p.isNinetyNine);

  let filteredProducts = activeCategory === 'all' 
    ? [...products] 
    : activeCategory === '99-sale'
      ? [...ninetyNineProducts]
      : products.filter(p => p.category?.toLowerCase() === SLUG_TO_PRODUCT_CATEGORY[activeCategory]);

  if (sortBy === 'Price: Low to High') {
    filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === 'Price: High to Low') {
    filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === 'Newest') {
    filteredProducts.sort((a, b) => String(b._id || b.id || '').localeCompare(String(a._id || a.id || '')));
  } else if (sortBy === 'Featured') {
    filteredProducts.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          const pid = entry.target.getAttribute('data-pid');
          if (!pid || !videoRefs.current[pid]) return;
          if (entry.isIntersecting) {
            setActiveVideoId(pid);
            const v = videoRefs.current[pid];
            if (v) { v.currentTime = 0; v.play().catch(() => {}); }
          } else {
            setActiveVideoId(prev => prev === pid ? null : prev);
            videoRefs.current[pid]?.pause();
          }
        });
      },
      { rootMargin: '0px 0px -50% 0px' }
    );
    const containers = containerRefs.current;
    Object.keys(containers).forEach(pid => { const el = containers[pid]; if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [filteredProducts]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-stone-50 py-16 md:py-24 text-center px-4">
        <h1 className="font-display text-5xl md:text-8xl font-bold uppercase tracking-tight text-stone-900">
          The <span className="text-stone-400">Shop</span>
        </h1>
        <p className="mt-4 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-stone-500">
          Curated Korean & Western Aesthetics
        </p>
      </div>

      {/* ₹99 Sale Banner */}
      {cmsData?.ninetyNineSale?.isActive && ninetyNineProducts.length > 0 && activeCategory !== '99-sale' && (
        <div className="bg-gradient-to-r from-rose-950 via-rose-900 to-pink-900 py-8 md:py-10 px-4 md:px-8">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 md:gap-8">
              <div className="text-center md:text-left">
                <h3 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white">{cmsData.ninetyNineSale.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                  {cmsData.ninetyNineSale.guaranteeText.split('•').map((item: string, i: number) => (
                    <span key={i} className="text-[8px] text-rose-200/70 font-bold uppercase tracking-widest flex items-center gap-1">
                      <CheckCircle className="h-2.5 w-2.5 text-emerald-400" />
                      {item.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setCategory('99-sale')}
              className="shrink-0 bg-white text-black px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] rounded-full hover:bg-rose-100 transition-all flex items-center gap-2 shadow-xl"
            >
              Shop Now <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mx-auto max-w-7xl mt-6">
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {ninetyNineProducts.slice(0, 6).map((p: any) => (
                <div
                  key={p._id || p.id}
                  onClick={() => onSelectProduct(p)}
                  className="shrink-0 w-24 md:w-28 cursor-pointer group"
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-white/10 border border-white/10 group-hover:border-white/30 transition-all">
                    <img src={p.image} alt={p.title} loading="lazy" width="120" height="120" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-[8px] font-bold text-white/80 text-center mt-1.5 truncate uppercase tracking-wider">{p.title}</p>
                  <p className="text-[9px] font-bold text-rose-300 text-center">₹{p.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 md:px-8 py-10">
        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-stone-200 pb-8 mb-10">
          {/* Categories */}
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-4 md:pb-0">
            {CATEGORIES.map(cat => (
              <button
                key={cat.slug}
                onClick={() => setCategory(cat.slug)}
                className={`shrink-0 px-5 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-full border ${activeCategory === cat.slug ? 'bg-black text-white border-black' : 'border-stone-200 text-stone-500 hover:border-stone-900 hover:text-stone-900'}`}
              >
                {cat.label.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              <button onClick={() => setViewMode('grid')} className={`p-1 ${viewMode === 'grid' ? 'text-black' : ''}`}><LayoutGrid className="h-4 w-4" /></button>
              <button onClick={() => setViewMode('large')} className={`p-1 ${viewMode === 'large' ? 'text-black' : ''}`}><Square className="h-4 w-4" /></button>
              <span className="ml-4">{filteredProducts.length} Products</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-900"
              >
                Sort By: <span className="text-stone-500">{sortBy}</span> <ChevronDown className="h-3 w-3" />
              </button>
              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white shadow-xl border border-stone-100 z-50">
                  {['Featured', 'Price: Low to High', 'Price: High to Low', 'Newest'].map(option => (
                    <button
                      key={option}
                      onClick={() => { setSortBy(option); setIsSortOpen(false); }}
                      className={`block w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-stone-50 ${sortBy === option ? 'text-black bg-stone-50' : 'text-stone-500'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className={`grid gap-x-6 gap-y-12 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
          {filteredProducts.map(product => {
            const pid = product._id || product.id;
            return (
            <div 
              key={pid} 
              className="group cursor-pointer flex flex-col gap-4"
              onClick={() => onSelectProduct(product)}
            >
              <div
                data-pid={pid}
                ref={(el) => { if (el) containerRefs.current[pid] = el; }}
                className={`relative overflow-hidden bg-stone-100 ${viewMode === 'grid' ? 'aspect-[4/5]' : 'aspect-square'}`}
                onMouseEnter={() => {
                  if (!product.video) return;
                  setActiveVideoId(pid);
                  const v = videoRefs.current[pid];
                  if (v) { v.currentTime = 0; v.play().catch(() => {}); }
                }}
                onMouseLeave={() => {
                  if (!product.video) return;
                  const el = containerRefs.current[pid];
                  if (!el) return;
                  const rect = el.getBoundingClientRect();
                  const isInUpperHalf = rect.top < window.innerHeight * 0.5 && rect.bottom > 0;
                  if (!isInUpperHalf) {
                    setActiveVideoId(prev => prev === pid ? null : prev);
                    videoRefs.current[pid]?.pause();
                  }
                }}
              >
                <img 
                  src={product.image} 
                  alt={product.title} 
                  loading="lazy"
                  width="600"
                  height="750"
                  className={`h-full w-full object-cover transition-opacity duration-500 ${activeVideoId === pid ? 'opacity-0' : 'opacity-100'}`}
                />
                {product.video && (
                  <video
                    ref={(el) => { if (el) videoRefs.current[pid] = el; }}
                    src={product.video}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${activeVideoId === pid ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                  />
                )}
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                
                {/* Sold Out Badge */}
                {(product.stockQuantity || 0) <= 0 && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-900 border-2 border-stone-900 px-3 py-1">Sold Out</span>
                  </div>
                )}

                {/* ₹99 Sale Badge */}
                {product.isNinetyNine && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center gap-1 bg-rose-600 text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-sm shadow-md">
                      ₹99 Only
                    </span>
                  </div>
                )}

                {/* Anti-Tarnish Badge */}
                {product.isAntiTarnish && (
                  <div className="absolute top-2 left-2 z-10">
                    <span className="inline-flex items-center gap-1 bg-emerald-600 text-white px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-sm shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 inline-block"></span>
                      Anti-Tarnish
                    </span>
                  </div>
                )}
                
                {/* Quick Add */}
                <div className="absolute inset-x-0 bottom-4 flex justify-center translate-y-4 opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 px-4">
                  <button className="w-full bg-white/90 backdrop-blur-md py-3 text-[9px] font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all shadow-xl">
                    View Details
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1 px-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-accent text-xs font-bold uppercase tracking-tight text-stone-900 max-w-[70%] leading-tight">
                    {product.title}
                  </h3>
                  <div className="flex flex-col items-end">
                    <span className="font-accent text-sm font-bold text-stone-900">₹{product.price}</span>
                    <span className="text-[9px] text-stone-400 line-through">₹{product.oldPrice}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="flex text-yellow-400">
                    <span className="text-[10px]">★</span>
                  </div>
                  <span className="text-[9px] font-bold text-stone-900">{product.rating}</span>
                  <span className="text-[9px] text-stone-400 uppercase tracking-tighter">({(product.reviews && Array.isArray(product.reviews)) ? product.reviews.length : (typeof product.reviews === 'number' ? product.reviews : 0)} reviews)</span>
                </div>
              </div>
            </div>
          );
          })}
        </div>

        {/* Load More */}
        <div className="mt-24 flex justify-center">
          <button className="flex items-center gap-3 rounded-full border border-stone-200 px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:bg-black hover:text-white hover:border-black">
            Load More <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        {/* SEO Content Section — rich text for search engines */}
        <section className="mt-32 border-t border-stone-100 pt-20">
          <div className="max-w-4xl mx-auto text-center space-y-10">
            {urlCategory ? (
              <>
                <h2 className="font-display text-3xl font-bold uppercase tracking-tight">
                  {collectionSeo[activeCategory]?.h2 || (
                    activeCategory === '99-sale' ? '₹99 Flash Sale — Premium Aesthetic Jewelry at Unbeatable Prices' :
                    activeCategory === 'necklaces' ? 'Designer Necklaces for Women — Gold Plated, Anti-Tarnish & Waterproof' :
                    activeCategory === 'earrings' ? 'Aesthetic Earrings for Women — Korean, Western & Minimalist Styles' :
                    activeCategory === 'rings' ? 'Minimalist Rings for Women — Stackable, Adjustable & Anti-Tarnish' :
                    activeCategory === 'bracelets' ? 'Chic Bracelets & Bangles — Gold Plated, Waterproof & Trendy' :
                    activeCategory === 'name-necklace' ? 'Personalized Name Necklaces — Custom Engraved Gold & Silver' :
                    activeCategory === 'gifts' ? 'Jewelry Gifts for Her — Curated Gift-Ready Pieces' :
                    activeCategory === 'hampers' ? 'Luxury Jewelry Gift Hampers — Curated Sets for Every Occasion' :
                    activeCategory === 'pendant' ? 'Aesthetic Pendants for Women — Gold Plated & Anti-Tarnish' :
                    activeCategory === 'accessories' ? 'Premium Jewelry Accessories — Anklets, Hair Accessories & More' :
                    activeCategory === 'mothers-day' ? "Mother's Day Jewelry Gifts — Elegant, Thoughtful & Beautifully Packaged" :
                    `Shop ${catLabel || activeCategory} — Premium Aesthetic Jewelry`
                  )}
                </h2>
                <div className="text-[10px] leading-relaxed text-stone-500 uppercase tracking-tight space-y-4 max-w-3xl mx-auto">
                  {collectionSeo[activeCategory]?.content ? (
                    <div dangerouslySetInnerHTML={{ __html: collectionSeo[activeCategory].content }} />
                  ) : (
                    <>
                      {activeCategory === '99-sale' && (
                        <p>Discover our iconic ₹99 Flash Sale featuring premium anti-tarnish jewelry at an incredible price point. Each piece is handpicked from our best-selling Korean and Western aesthetic collection — including minimalist stud earrings, dainty chain necklaces, stackable rings, and charm bracelets. Despite the affordable price, every ₹99 item is crafted with the same hypoallergenic, waterproof, and tarnish-resistant quality that Satvastones is known for. Shop now before stock runs out — limited quantities available. Free shipping on prepaid orders above ₹399.</p>
                      )}
                      {activeCategory === 'necklaces' && (
                        <p>Explore our curated collection of designer necklaces for women, featuring Korean layered chains, Western pendant necklaces, velvet chokers, and gold-plated statement pieces. Each necklace is handcrafted using premium anti-tarnish and waterproof materials, ensuring your jewelry maintains its brilliant luster through daily wear. Our collection includes adjustable lengths, hypoallergenic clasps, and heirloom-quality finishes. Whether you need a minimalist everyday chain or a bold statement piece for weddings and parties, Satvastones has the perfect necklace to elevate your aesthetic. Free shipping on prepaid orders above ₹399.</p>
                      )}
                      {activeCategory === 'earrings' && (
                        <p>Browse over 100 aesthetic earrings for women — from Korean minimalist studs and huggie hoops to Western drop earrings and traditional chandbalis. All our earrings are crafted with hypoallergenic, nickel-free materials and feature anti-tarnish coating for long-lasting wear. Our collection includes lightweight designs for all-day comfort, making them perfect for daily office wear, college, parties, and weddings. Each pair is meticulously crafted with attention to clarity, setting, and overall luster. Shop online with free shipping on prepaid orders above ₹399.</p>
                      )}
                      {activeCategory === 'rings' && (
                        <p>Discover our handpicked collection of aesthetic rings for women, featuring Korean stacking bands, minimalist gold-plated rings, statement cocktail rings, and adjustable daily-wear designs. Each ring is crafted using premium anti-tarnish materials with hypoallergenic properties — safe for sensitive skin. Our adjustable sizes ensure a perfect fit for any finger. From dainty everyday bands to bold fashion rings for special occasions, find the perfect piece to express your unique style. Free shipping on prepaid orders above ₹399.</p>
                      )}
                      {activeCategory === 'bracelets' && (
                        <p>Shop our exclusive range of aesthetic bracelets and bangles — including gold-plated chain bracelets, Korean beaded designs, tennis bracelets, and minimalist cuffs. Every bracelet is designed with anti-tarnish, waterproof materials for lasting beauty. Our collection features adjustable closures, hypoallergenic metals, and artisanal craftsmanship. Whether you are layering multiple bracelets or wearing a single statement piece, these accessories add the perfect finishing touch to any outfit. Free shipping on prepaid orders above ₹399.</p>
                      )}
                      {(!urlCategory || activeCategory === 'all') && (
                        <>
                          <p>Welcome to Satvastones — India's premier destination for aesthetic Korean and Western jewelry. Our carefully curated collection features over 100 pieces including anti-tarnish earrings, waterproof necklaces, hypoallergenic rings, and tarnish-resistant bracelets. Each piece is handcrafted using premium materials including 18K gold plating, sterling silver, and high-grade alloy bases with anti-tarnish coating.</p>
                          <p>Whether you are searching for minimalist everyday jewelry, statement pieces for weddings and parties, or personalized name necklaces for gifting, Satvastones offers trend-forward designs that blend Seoul minimalism with Parisian elegance. All products are backed by our quality guarantee — no color fade, no green fingers, no discoloration. We offer free shipping on prepaid orders above ₹399, secure payments via UPI and cards, and express dispatch within 24-48 hours from our studio in Vapi, Gujarat.</p>
                        </>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-3xl font-bold uppercase tracking-tight">{collectionSeo.all?.h2 || 'Premium Aesthetic Jewelry Online — Korean & Western Collections'}</h2>
                <div className="text-[10px] leading-relaxed text-stone-500 uppercase tracking-tight space-y-4 max-w-3xl mx-auto">
                  {collectionSeo.all?.content ? (
                    <div dangerouslySetInnerHTML={{ __html: collectionSeo.all.content }} />
                  ) : (
                    <>
                      <p>Welcome to Satvastones — India's premier destination for aesthetic Korean and Western jewelry. Our carefully curated collection features over 100 pieces including anti-tarnish earrings, waterproof necklaces, hypoallergenic rings, and tarnish-resistant bracelets. Each piece is handcrafted using premium materials including 18K gold plating, sterling silver, and high-grade alloy bases with anti-tarnish coating.</p>
                      <p>Whether you are searching for minimalist everyday jewelry, statement pieces for weddings and parties, or personalized name necklaces for gifting, Satvastones offers trend-forward designs that blend Seoul minimalism with Parisian elegance. All products are backed by our quality guarantee — no color fade, no green fingers, no discoloration. We offer free shipping on prepaid orders above ₹399, secure payments via UPI and cards, and express dispatch within 24-48 hours from our studio in Vapi, Gujarat.</p>
                      <p>Our collection spans multiple categories: Korean huggie earrings, Western drop earrings, layered chain necklaces, stacking rings, charm bracelets, custom name necklaces, pendant sets, gift hampers, and more. Each category is designed with specific aesthetic sensibilities — from Seoul street style to Parisian chic. Our craftsmanship focuses on durability, comfort, and timeless elegance.</p>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
