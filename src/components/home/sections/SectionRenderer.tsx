import React from 'react';
import HeaderSection from './HeaderSection';
import SearchBar from './SearchBar';
import OfferToggle from './OfferToggle';
import CategorySlider from './CategorySlider';
import TrustStrip from './TrustStrip';
import HeroBanner from './HeroBanner';
import ProductSection from './ProductSection';
import PromoBanner from './PromoBanner';
import ShopByColor from './ShopByColor';
import ShopByStyle from './ShopByStyle';
import ShopByPersona from './ShopByPersona';
import CollectionCarousel from './CollectionCarousel';
import CelebrityBanner from './CelebrityBanner';
import FooterSection from './FooterSection';
import type { SectionConfig } from './types';

const sectionComponents: Record<string, React.ComponentType<any>> = {
  header: HeaderSection,
  searchBar: SearchBar,
  offerToggle: OfferToggle,
  categorySlider: CategorySlider,
  trustStrip: TrustStrip,
  heroBanner: HeroBanner,
  featuredProducts: ProductSection,
  trendingProducts: ProductSection,
  newestProducts: ProductSection,
  promoBanner: PromoBanner,
  collectionBanner: HeroBanner,
  shopByColor: ShopByColor,
  shopByStyle: ShopByStyle,
  shopByPersona: ShopByPersona,
  collectionCarousel: CollectionCarousel,
  celebrityBanner: CelebrityBanner,
  footer: FooterSection,
};

export default function SectionRenderer({
  sections,
  onAddToCart,
  onWishlist,
  onViewAll,
  onMenuToggle,
  onSearch,
  onNavigate,
  cartCount,
  wishlistCount,
}: {
  sections: SectionConfig[];
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
    <>
      {sections.map((section, index) => {
        const Component = sectionComponents[section.type];
        if (!Component) return null;

        const sectionProps: Record<string, any> = {
          ...section.data,
          key: `${section.type}-${index}`,
          onNavigate,
          onSearch,
        };

        if (section.type === 'header') {
          sectionProps.onMenuToggle = onMenuToggle;
          sectionProps.cartCount = cartCount;
          sectionProps.wishlistCount = wishlistCount;
        }

        if (['featuredProducts', 'trendingProducts', 'newestProducts'].includes(section.type)) {
          sectionProps.onAddToCart = onAddToCart;
          sectionProps.onWishlist = onWishlist;
          sectionProps.onViewAll = onViewAll;
        }

        return <Component {...sectionProps} />;
      })}
    </>
  );
}
