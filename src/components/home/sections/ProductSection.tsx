import { ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function ProductSection({
  title,
  products = [],
  onViewAll,
  onAddToCart,
  onWishlist,
}: any) {
  if (!title) return null;

  return (
    <div className="bg-[#FAF7F2] px-4 pb-6">
      <div className="mx-auto max-w-[390px] md:max-w-[720px] lg:max-w-[960px] xl:max-w-[1200px]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[22px] font-bold leading-tight text-[#3D2B24] md:text-2xl lg:text-3xl">
            {title}
          </h2>
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 rounded-[20px] border border-[#9C6A3B] px-4 py-1.5 text-xs font-semibold text-[#9C6A3B] transition-colors hover:bg-[#9C6A3B] hover:text-card md:px-5 md:py-2"
          >
            View All
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Mobile: 2 cols | Tablet: 3 cols | Desktop: 4 cols */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 8).map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
              onWishlist={onWishlist}
            />
          ))}
        </div>

        {products.length > 4 && (
          <button
            onClick={onViewAll}
            className="mx-auto mt-4 flex items-center gap-1 rounded-[20px] border border-[#9C6A3B] px-6 py-2 text-sm font-semibold text-[#9C6A3B] transition-colors hover:bg-[#9C6A3B] hover:text-card md:mt-6"
          >
            View More
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
