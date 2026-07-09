import SectionRenderer from './sections/SectionRenderer';
import { defaultSections } from './sections/types';

export default function NewHomePage({
  sections = defaultSections,
  onAddToCart,
  onWishlist,
  onViewAll,
  onMenuToggle,
  onSearch,
  onNavigate,
  cartCount = 0,
  wishlistCount = 0,
}: {
  sections?: any[];
  onAddToCart?: (product: any) => void;
  onWishlist?: (product: any) => void;
  onViewAll?: () => void;
  onMenuToggle?: () => void;
  onSearch?: () => void;
  onNavigate?: (path: string) => void;
  cartCount?: number;
  wishlistCount?: number;
}) {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <SectionRenderer
        sections={sections}
        onAddToCart={onAddToCart}
        onWishlist={onWishlist}
        onViewAll={onViewAll}
        onMenuToggle={onMenuToggle}
        onSearch={onSearch}
        onNavigate={onNavigate}
        cartCount={cartCount}
        wishlistCount={wishlistCount}
      />
    </div>
  );
}
