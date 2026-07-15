import { Link } from 'react-router-dom';
import { optimizeImage, getSrcSet } from '../utils/cloudinary';

export default function HotDealsPage({ 
  products, 
  cmsData, 
  sales,
  onSelectProduct 
}: { 
  products: any[];
  cmsData?: any;
  sales?: any[];
  onSelectProduct: (p: any) => void;
}) {
  const ninetyNineSale = cmsData?.ninetyNineSale || {};
  const specialOffer = cmsData?.specialOffer || {};

  const activeProductIds = new Set<string>();
  if (sales && sales.length > 0) {
    sales.forEach(sale => {
      (sale.productIds || []).forEach((p: any) => {
        const id = p._id || p;
        activeProductIds.add(id);
      });
    });
  }

  const isInActiveSale = (p: any) => {
    if (activeProductIds.size === 0) return true;
    const pid = p._id || p.id;
    return activeProductIds.has(pid);
  };

  const ninetyNineProducts = ninetyNineSale.isActive ? products.filter((p: any) => p.isNinetyNine && isInActiveSale(p)) : [];
  const discountedProducts = specialOffer.isActive ? products.filter((p: any) => p.oldPrice && p.oldPrice > p.price && !p.isNinetyNine && isInActiveSale(p)) : [];
  const allSaleProducts = [...ninetyNineProducts, ...discountedProducts];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner */}
      {ninetyNineSale.isActive && ninetyNineSale.bannerImage && (
        <section className="relative w-full overflow-hidden bg-gradient-to-r from-[#d4535f] to-[#f2707f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 md:py-20 text-center">
            {ninetyNineSale.badgeText && (
              <span className="inline-block bg-white text-[#d4535f] text-[10px] sm:text-xs font-bold px-4 py-1.5 rounded-full mb-4 sm:mb-6 uppercase tracking-wider">
                {ninetyNineSale.badgeText}
              </span>
            )}
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
              {ninetyNineSale.title || '₹99 Flash Sale'}
            </h1>
            {ninetyNineSale.subTitle && (
              <p className="text-sm sm:text-base md:text-lg text-white/90 mb-2">
                {ninetyNineSale.subTitle}
              </p>
            )}
            {ninetyNineSale.description && (
              <p className="text-xs sm:text-sm text-white/80 max-w-2xl mx-auto mb-6 sm:mb-8">
                {ninetyNineSale.description}
              </p>
            )}
            {ninetyNineSale.guaranteeText && (
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[9px] sm:text-[10px] text-white/70 uppercase tracking-wider">
                {ninetyNineSale.guaranteeText.split('•').map((item: string, i: number) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-white/50" />
                    {item.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* No Sale Active */}
      {allSaleProducts.length === 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Hot Deals</h1>
          <p className="text-sm text-gray-500 mb-8">No active sales right now. Check back soon!</p>
          <Link 
            to="/shop" 
            className="inline-block bg-[#d4535f] text-white text-xs font-bold px-8 py-3 rounded-lg uppercase tracking-wider hover:bg-[#c14050] transition-colors"
          >
            Browse All Products
          </Link>
        </section>
      )}

      {/* ₹99 Flash Sale Products */}
      {ninetyNineProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">
                {ninetyNineSale.title || '₹99 Flash Sale'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {ninetyNineProducts.length} products at just ₹99 each
              </p>
            </div>
            <span className="bg-[#d4535f] text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full">
              ₹99 Only
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
            {ninetyNineProducts.map((product: any) => {
              const pid = product._id || product.id;
              return (
                <Link 
                  key={pid} 
                  to={`/product/${product.slug || pid}`}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
                    <img
                      src={optimizeImage(product.image, 480)}
                      srcSet={getSrcSet(product.image, [320, 480, 768])}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      alt={product.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                    />
                    {product.images && product.images.length > 1 && (
                      <img
                        src={optimizeImage(product.images[1], 480)}
                        srcSet={getSrcSet(product.images[1], [320, 480, 768])}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        alt={product.title}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    )}
                    <span className="absolute top-1.5 left-1.5 bg-[#d4535f] text-white text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      ₹99 Only
                    </span>
                    {(product.stockQuantity || 0) <= 0 && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 border border-gray-400 px-2 py-0.5">Sold Out</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1.5 sm:mt-2 px-0.5">
                    <h3 className="text-[11px] sm:text-xs font-medium text-gray-800 truncate leading-tight">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs sm:text-sm font-bold text-[#d4535f]">Rs. {product.price}</span>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <span className="text-[10px] text-gray-400 line-through">Rs. {product.oldPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Discounted Products */}
      {discountedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 border-t border-gray-100">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900">
                {specialOffer.isActive ? (specialOffer.title || 'Special Offers') : 'More Deals'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {discountedProducts.length} products with discounts
              </p>
            </div>
            {specialOffer.isActive && specialOffer.image && (
              <img 
                src={specialOffer.image} 
                alt="Special Offer" 
                className="h-10 sm:h-12 w-auto object-contain hidden sm:block"
              />
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
            {discountedProducts.map((product: any) => {
              const pid = product._id || product.id;
              const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
              return (
                <Link 
                  key={pid} 
                  to={`/product/${product.slug || pid}`}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
                    <img
                      src={optimizeImage(product.image, 480)}
                      srcSet={getSrcSet(product.image, [320, 480, 768])}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      alt={product.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
                    />
                    {product.images && product.images.length > 1 && (
                      <img
                        src={optimizeImage(product.images[1], 480)}
                        srcSet={getSrcSet(product.images[1], [320, 480, 768])}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        alt={product.title}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    )}
                    <span className="absolute top-1.5 left-1.5 bg-[#d4535f] text-white text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      -{discount}%
                    </span>
                    {(product.stockQuantity || 0) <= 0 && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500 border border-gray-400 px-2 py-0.5">Sold Out</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-1.5 sm:mt-2 px-0.5">
                    <h3 className="text-[11px] sm:text-xs font-medium text-gray-800 truncate leading-tight">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs sm:text-sm font-bold text-[#d4535f]">Rs. {product.price}</span>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <span className="text-[10px] text-gray-400 line-through">Rs. {product.oldPrice}</span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center border-t border-gray-100">
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Looking for something else?
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-6">
          Browse our full collection of aesthetic Korean & Western jewelry
        </p>
        <Link 
          to="/shop" 
          className="inline-block border-2 border-[#d4535f] text-[#d4535f] hover:bg-[#d4535f] hover:text-white text-[10px] sm:text-xs font-bold px-8 py-3 rounded-lg uppercase tracking-wider transition-colors"
        >
          Shop All Products
        </Link>
      </section>
    </div>
  );
}
