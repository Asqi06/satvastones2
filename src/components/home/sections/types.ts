export interface SectionImage {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface ProductData {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  discount?: number;
  image: string;
  slug?: string;
}

export interface CategoryItem {
  id: string;
  title: string;
  image: string;
}

export interface ColorItem {
  id: string;
  title: string;
  image: string;
  color: string;
}

export interface StyleItem {
  id: string;
  title: string;
  image: string;
}

export interface PersonaItem {
  id: string;
  title: string;
  image: string;
}

export interface CollectionSlide {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  image: string;
}

export interface TrustItem {
  id: string;
  icon: string;
  label: string;
}

export interface SectionConfig {
  type: string;
  data: Record<string, any>;
}

export const defaultSections: SectionConfig[] = [
  { type: 'header', data: {} },
  { type: 'searchBar', data: {} },
  { type: 'offerToggle', data: {} },
  { type: 'categorySlider', data: { categories: [] } },
  { type: 'trustStrip', data: { items: [] } },
  { type: 'heroBanner', data: { image: '' } },
  { type: 'featuredProducts', data: { title: 'Featured Products', products: [] } },
  { type: 'promoBanner', data: { image: '' } },
  { type: 'trendingProducts', data: { title: 'Trending Now', products: [] } },
  { type: 'collectionBanner', data: { image: '' } },
  { type: 'newestProducts', data: { title: 'New Arrivals', products: [] } },
  { type: 'celebrityBanner', data: { image: '' } },
  { type: 'shopByStyle', data: { items: [] } },
  { type: 'shopByColor', data: { items: [] } },
  { type: 'footer', data: {} },
];
