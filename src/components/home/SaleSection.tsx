import { optimizeImage } from '../../utils/cloudinary';
import { Link } from 'react-router-dom';

interface SaleProduct {
  _id: string;
  title: string;
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  slug?: string;
}

interface SaleData {
  _id: string;
  title: string;
  subtitle?: string;
  discountPercent?: number;
  productIds: SaleProduct[];
  bgColor?: string;
}

export default function SaleSection({ sale, onProductClick }: { sale: SaleData; onProductClick: (p: SaleProduct) => void }) {
  if (!sale || !sale.productIds || sale.productIds.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 lg:py-12 bg-white">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 md:px-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6 lg:mb-8">
          <div>
            <h2 className="font-heading text-lg sm:text-xl lg:text-3xl font-bold text-gray-900 italic">
              {sale.title}
            </h2>
            {sale.subtitle && (
              <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{sale.subtitle}</p>
            )}
          </div>
          {sale.discountPercent > 0 && (
            <span className="bg-[#f2707f] text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full">
              Up to {sale.discountPercent}% OFF
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 lg:gap-4">
          {sale.productIds.map((product) => {
            const hasDiscount = product.oldPrice && product.oldPrice > product.price;
            return (
              <Link key={product._id} to={`/product/${product.slug || product._id}`} className="group">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
                  <img src={product.image} alt={product.title} loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
                  {product.images && product.images.length > 1 && (
                    <img src={product.images[1]} alt={product.title} loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  )}
                  {hasDiscount && (
                    <span className="absolute top-1.5 left-1.5 bg-[#f2707f] text-white text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      -{Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100)}%
                    </span>
                  )}
                </div>
                <div className="mt-1.5 px-0.5">
                  <h3 className="text-[11px] sm:text-xs font-medium text-gray-800 truncate">{product.title}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs sm:text-sm font-bold text-[#f2707f]">Rs. {product.price}</span>
                    {hasDiscount && <span className="text-[10px] text-gray-400 line-through">Rs. {product.oldPrice}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="flex justify-center mt-4 sm:mt-6">
          <Link to="/shop" className="border-2 border-[#f2707f] text-[#d4535f] hover:bg-[#f2707f] hover:text-white text-[10px] sm:text-xs font-bold px-6 sm:px-8 py-2 sm:py-2.5 rounded-lg uppercase tracking-wider transition-colors">
            View All
          </Link>
        </div>
      </div>
    </section>
  );
}
