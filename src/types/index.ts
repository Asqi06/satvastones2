export interface ProductWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  material: string | null;
  style: "KOREAN" | "WESTERN" | "TRADITIONAL" | "FUSION";
  stock: number;
  sku: string | null;
  isFeatured: boolean;
  isActive: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  reviews?: ReviewWithUser[];
  _count?: {
    reviews: number;
  };
}

export interface ReviewWithUser {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface CartItemWithProduct {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: string[];
    stock: number;
  };
}

export interface OrderWithItems {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  finalAmount: number;
  paymentMethod: string | null;
  paymentId: string | null;
  paymentStatus: string;
  notes: string | null;
  createdAt: Date;
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string | null;
    product: {
      id: string;
      slug: string;
    };
  }[];
  shippingAddress: {
    id: string;
    name: string;
    phone: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  } | null;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  recentOrders: OrderWithItems[];
  salesData: { date: string; revenue: number; orders: number }[];
}

export type SortOption = "newest" | "price-asc" | "price-desc" | "best-selling";

export interface ProductFilters {
  category?: string;
  style?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: SortOption;
}
