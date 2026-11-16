export interface ProductImage {
  url: string;
  alt: string;
  isPrimary?: boolean;
}

export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  pricePaise: number;
  stock: number;
  size?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string; // 'rings' | 'bracelets' | 'necklaces' | 'earrings' | 'bangles' | 'gift-sets'
  collection?: string;
  headline: string;
  description: string;
  material: string;
  finish: string;
  dimensions?: string;
  weightGrams?: number;
  careInstructions: string[];
  warranty: string;
  pricePaise: number;
  compareAtPricePaise?: number;
  rating: number;
  reviewCount: number;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  images: ProductImage[];
  variants?: ProductVariant[];
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  verifiedPurchase: boolean;
  productName: string;
  content: string;
  date: string;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  pricePaise: number;
  image: string;
  quantity: number;
}
