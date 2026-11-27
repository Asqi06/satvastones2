import { PRODUCTS, type Product } from '../data/products';

export interface AdminOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  items: Array<{
    productId?: string;
    name: string;
    quantity: number;
    pricePaise: number;
    image: string;
    slug?: string;
    variantId?: string;
  }>;
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  totalPaise: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED' | 'PENDING_ON_DELIVERY';
  fulfillmentStatus: 'VERIFIED' | 'PACKING_AT_VAPI' | 'DISPATCHED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  courierPartner?: string;
  trackingNumber?: string;
  couponCode?: string;
}

export interface DamageClaim {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  submissionDate: string;
  videoProofUrl: string;
  description: string;
  status: 'PENDING_REVIEW' | 'REPLACEMENT_APPROVED' | 'REJECTED';
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  pricePaise: number;
  compareAtPricePaise?: number;
  headline: string;
  image: string;
  inStock: boolean;
  material: string;
  finish: string;
  // Extended catalogue fields (stored in D1 product_meta / local dev store)
  description?: string;
  gallery?: string[];
  collection?: string;
  dimensions?: string;
  weightGrams?: number;
  careInstructions?: string[];
  warranty?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  isPublished?: boolean;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  costPaise?: number;
  hsnCode?: string;
  gstRate?: number;
  sortOrder?: number;
  variants?: Array<{ id: string; title: string; sku: string; pricePaise: number; stock: number; size?: string }>;
  isDemo?: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface AdminCoupon {
  id: string;
  code: string;
  discountPercent?: number;
  flatDiscountPaise?: number;
  minOrderPaise: number;
  freeShipping?: boolean;
  firstOrderOnly?: boolean;
  isActive: boolean;
  description: string;
}

export interface CategoryDetail {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
}

export interface SiteSettings {
  shippingChargePaise: number; // e.g. 4900 = ₹49
  freeShippingThresholdPaise: number; // e.g. 49900 = ₹499
  stackDiscountPercent: number; // e.g. 15%
  announcementText: string;
  heroHeadline: string;
  heroTagline: string;
  heroImage: string;
  categoryImages: Record<string, string>;
  // Cloudinary credentials & config
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  // Razorpay Gateway
  razorpayKeyId?: string;
  razorpayKeySecret?: string;
  // Google Single Sign-On
  googleClientId?: string;
  // Stack Studio curation: IDs of products available in Stack Studio
  stackStudioEnabledProducts: string[];
  // Editable Category details
  categories: CategoryDetail[];
  // Social Proof Toast Control (Real Orders Only)
  enableSocialProofToast?: boolean;
}

const DEFAULT_CATEGORIES_DATA: CategoryDetail[] = [
  {
    id: 'rings',
    slug: 'rings',
    name: 'Rings',
    tagline: 'Minimalist bands & statement signets',
    description: 'Anti-tarnish rings sculpted in durable 316L stainless steel with rich 18K gold PVD finish.',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bracelets',
    slug: 'bracelets',
    name: 'Bracelets',
    tagline: 'Delicate chains & structured cuffs',
    description: 'Designed for daily wear, effortless stacking, and total water resistance. Anti tarnish jewellery bracelet collection for women.',
    image: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'necklaces',
    slug: 'necklaces',
    name: 'Necklaces',
    tagline: 'Refined pendants & herringbone chains',
    description: 'Graceful silhouettes that retain their luminous shine through workouts and showers. Waterproof jewellery India.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'earrings',
    slug: 'earrings',
    name: 'Earrings',
    tagline: 'Sculptural huggies & understated studs',
    description: 'Featherlight, hypoallergenic studs and hoops that never irritate sensitive ears. 100% nickel-free.',
    image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'bangles',
    slug: 'bangles',
    name: 'Bangles',
    tagline: 'Modern minimal Kada & seamless bangles',
    description: 'Contemporary interpretations of classic Indian wrists, engineered to never discolor.',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'gift-sets',
    slug: 'gift-sets',
    name: 'Gift Sets',
    tagline: 'Curated pairings in bespoke gift boxes',
    description: 'Thoughtfully paired jewellery ensembles ready for birthdays, anniversaries and self-love.',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'jewellery-set',
    slug: 'jewellery-set',
    name: 'Jewellery Sets',
    tagline: 'Coordinated Anti-Tarnish Suites',
    description: 'Complete anti tarnish jewellery set matching necklaces, bracelets, and huggies. Ideal for daily use, festive styling, and pairing with sarees.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'mystery-jewellery-jar',
    slug: 'mystery-jewellery-jar',
    name: 'Mystery Jewellery Jar',
    tagline: 'Surprise Anti-Tarnish Capsule (Value ₹4,999+)',
    description: 'The viral SatvaStones Mystery Jewellery Jar experience. Unbox 3 handcrafted waterproof pieces dispatched from our Vapi store location.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80'
  }
];

const DEFAULT_SETTINGS: SiteSettings = {
  shippingChargePaise: 4900,
  freeShippingThresholdPaise: 49900,
  stackDiscountPercent: 15,
  announcementText: 'LIMITED EDITION BIRTHDAY ATELIER — UPTO 60% PRIVILEGE SAVINGS · COMPLIMENTARY EXPRESS SHIPPING ON ORDERS ABOVE ₹499 · HAND-INSPECTED & DISPATCHED FROM VAPI ATELIER IN 24–48 HOURS · 18K VACUUM GOLD PVD · 100% WATERPROOF & SWEAT-PROOF',
  heroHeadline: 'Anti Tarnish Jewellery That Feels Like You.',
  heroTagline: 'Waterproof, sweat-proof anti-tarnish fine jewellery engineered with 316L surgical stainless steel & 18K vacuum gold PVD. Hand-inspected and dispatched from our Vapi atelier.',
  heroImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2000&q=85',
  categoryImages: {
    rings: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
    bracelets: 'https://images.unsplash.com/photo-1611085583191-a3b181a88401?auto=format&fit=crop&w=600&q=80',
    necklaces: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
    earrings: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80',
    bangles: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=600&q=80',
    'gift-sets': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80'
  },
  cloudinaryCloudName: '',
  cloudinaryUploadPreset: '',
  razorpayKeyId: '',
  razorpayKeySecret: '',
  googleClientId: '',
  enableSocialProofToast: true,
  stackStudioEnabledProducts: [
    'aura-herringbone-snake-chain',
    'elysian-croissant-dome-ring',
    'serene-molten-pearl-pendant',
    'solace-chunky-link-chain-bracelet',
    'chloe-sculptural-ribbed-huggies',
    'vesta-twisted-cable-kada-bangle',
    'mira-dual-bezel-solitaire-ring'
  ],
  categories: DEFAULT_CATEGORIES_DATA
};

const DEFAULT_COUPONS: AdminCoupon[] = [
  {
    id: 'coup-1',
    code: 'FIRSTBUY',
    flatDiscountPaise: 20000,
    minOrderPaise: 249900,
    isActive: true,
    description: 'Flat ₹200 OFF on orders above ₹2,499'
  },
  {
    id: 'coup-2',
    code: 'SATVA10',
    discountPercent: 10,
    minOrderPaise: 0,
    isActive: true,
    description: '10% OFF on all fine anti-tarnish jewellery'
  },
  {
    id: 'coup-3',
    code: 'FESTIVE15',
    discountPercent: 15,
    minOrderPaise: 299900,
    isActive: true,
    description: '15% Privilege savings on festive orders above ₹2,999'
  },
  {
    id: 'coup-welcome-15-free',
    code: 'WELCOME15FREE',
    discountPercent: 15,
    minOrderPaise: 0,
    freeShipping: true,
    firstOrderOnly: true,
    isActive: true,
    description: '15% OFF + Free Express Delivery on your first purchase'
  },
  {
    id: 'coup-stay-10',
    code: 'STAY10',
    discountPercent: 10,
    minOrderPaise: 0,
    isActive: true,
    description: 'Instant 10% OFF Checkout Save Privilege'
  }
];

const DEFAULT_ORDERS: AdminOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'SAT-2026-784912',
    createdAt: '2026-11-14T10:30:00Z',
    customerName: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91 90167 03180',
    address: 'Flat 402, Green Glen Layout, Bellandur',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560103',
    items: [
      {
        name: 'Aura Herringbone Snake Chain',
        quantity: 1,
        pricePaise: 169900,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80'
      }
    ],
    subtotalPaise: 169900,
    shippingPaise: 0,
    discountPaise: 0,
    totalPaise: 169900,
    paymentMethod: 'UPI (Google Pay via Razorpay)',
    paymentStatus: 'PAID',
    fulfillmentStatus: 'DISPATCHED',
    courierPartner: 'BlueDart Air Express',
    trackingNumber: 'BLR-892147321'
  },
  {
    id: 'ord-2',
    orderNumber: 'SAT-2026-641029',
    createdAt: '2026-11-15T08:15:00Z',
    customerName: 'Sneha Patel',
    email: 'sneha.patel@yahoo.com',
    phone: '+91 97123 88410',
    address: '12 Shantiniketan Bungalows, Satellite',
    city: 'Ahmedabad',
    state: 'Gujarat',
    pincode: '380015',
    items: [
      {
        name: 'Elysian Croissant Dome Ring',
        quantity: 1,
        pricePaise: 129900,
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=80'
      },
      {
        name: 'Chloe Sculptural Ribbed Huggies',
        quantity: 1,
        pricePaise: 89900,
        image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=200&q=80'
      }
    ],
    subtotalPaise: 219800,
    shippingPaise: 0,
    discountPaise: 0,
    totalPaise: 219800,
    paymentMethod: 'Credit Card (HDFC via Razorpay)',
    paymentStatus: 'PAID',
    fulfillmentStatus: 'PACKING_AT_VAPI',
    courierPartner: 'Delhivery Prime',
    trackingNumber: 'DEL-39102451'
  },
  {
    id: 'ord-3',
    orderNumber: 'SAT-2026-519283',
    createdAt: '2026-11-15T11:45:00Z',
    customerName: 'Ananya Sen',
    email: 'ananya.sen@gmail.com',
    phone: '+91 99031 22849',
    address: '44 Salt Lake Sector V',
    city: 'Kolkata',
    state: 'West Bengal',
    pincode: '700091',
    items: [
      {
        name: 'The Golden Hour Gifting Capsule',
        quantity: 1,
        pricePaise: 349900,
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=200&q=80'
      }
    ],
    subtotalPaise: 349900,
    shippingPaise: 0,
    discountPaise: 20000,
    totalPaise: 329900,
    paymentMethod: 'UPI (PhonePe via Razorpay)',
    paymentStatus: 'PAID',
    fulfillmentStatus: 'VERIFIED'
  }
];

const DEFAULT_CLAIMS: DamageClaim[] = [
  {
    id: 'claim-1',
    orderNumber: 'SAT-2026-000098',
    customerName: 'Rhea Kapoor',
    phone: '+91 98111 23456',
    submissionDate: '2026-11-13',
    videoProofUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    description: 'Outer carton crushed in transit by courier. Unboxing video shows broken earring post.',
    status: 'REPLACEMENT_APPROVED'
  }
];

// LocalStorage Keys
const ORDERS_KEY = 'satvastones_admin_orders';
const CLAIMS_KEY = 'satvastones_admin_claims';
const PRODUCTS_KEY = 'satvastones_admin_products';
const COUPONS_KEY = 'satvastones_admin_coupons';
const SETTINGS_KEY = 'satvastones_site_settings';

// Centralized helper to retrieve the authenticated session token from either storage
export function getAdminToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('satvastones_admin_token') : null) ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('satvastones_admin_token') : null) ||
    ''
  );
}

// ==========================================
// 1. ORDERS ENGINE
// ==========================================
export function getAdminOrders(): AdminOrder[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(ORDERS_KEY);
  if (stored === null) {
    return [];
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const getOrders = getAdminOrders;

export function saveAdminOrders(orders: AdminOrder[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent('satvastones:orders_updated', { detail: orders }));
}

export function addAdminOrder(order: AdminOrder): void {
  const current = getAdminOrders();
  const updated = [order, ...current];
  saveAdminOrders(updated);
}

export function updateOrderStatus(
  orderNumber: string,
  newStatus: AdminOrder['fulfillmentStatus'],
  courier?: string,
  tracking?: string
): void {
  const orders = getAdminOrders();
  const updated = orders.map((o) => {
    if (o.orderNumber === orderNumber) {
      return {
        ...o,
        fulfillmentStatus: newStatus,
        ...(courier ? { courierPartner: courier } : {}),
        ...(tracking ? { trackingNumber: tracking } : {})
      };
    }
    return o;
  });
  saveAdminOrders(updated);
}

export async function deleteAdminOrder(orderNumber: string): Promise<boolean> {
  const orders = getAdminOrders();
  const updated = orders.filter((o) => o.orderNumber !== orderNumber);
  saveAdminOrders(updated);

  // Sync deletion permanently to Cloudflare D1
  if (typeof window !== 'undefined') {
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/orders?orderNumber=${encodeURIComponent(orderNumber)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        },
        credentials: 'include'
      });
      return res.ok;
    } catch (err) {
      console.warn('Order delete D1 sync error:', err);
      return false;
    }
  }
  return true;
}

export function findOrderByRef(ref: string): AdminOrder | null {
  const q = ref.trim().toUpperCase();
  const orders = getAdminOrders();
  return (
    orders.find(
      (o) =>
        o.orderNumber.toUpperCase() === q ||
        (o.trackingNumber && o.trackingNumber.toUpperCase() === q) ||
        o.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) ||
        o.email.toUpperCase() === q
    ) || null
  );
}

// ==========================================
// 2. PRODUCTS & INVENTORY CRUD
// ==========================================
function productToAdmin(p: Product): AdminProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    category: p.category,
    pricePaise: p.pricePaise,
    compareAtPricePaise: p.compareAtPricePaise,
    headline: p.headline,
    image: p.images?.[0]?.url || '',
    inStock: p.inStock,
    material: p.material,
    finish: p.finish,
    description: p.description,
    gallery: (p.images || []).map((img) => img.url),
    collection: p.collection || '',
    dimensions: p.dimensions || '',
    weightGrams: p.weightGrams,
    careInstructions: p.careInstructions || [],
    warranty: p.warranty,
    isBestseller: Boolean(p.isBestseller),
    isNewArrival: Boolean(p.isNewArrival),
    isPublished: true,
    rating: p.rating,
    reviewCount: p.reviewCount
  };
}

export function getAdminProducts(): AdminProduct[] {
  if (typeof window === 'undefined') {
    return PRODUCTS.map(productToAdmin);
  }

  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (stored !== null) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    } catch (_) {}
  }

  // No cache yet: nothing is invented. The catalogue is fetched from /api/products
  // by syncProductsFromCloudflare(), which is the single source of truth.
  return [];
}

export function saveAdminProducts(products: AdminProduct[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  window.dispatchEvent(new CustomEvent('satvastones:products_updated', { detail: products }));
}

export async function addAdminProduct(product: AdminProduct): Promise<boolean> {
  const current = getAdminProducts();
  const updated = [product, ...current];
  saveAdminProducts(updated);

  // Sync to Cloudflare D1
  if (typeof window !== 'undefined') {
    const token = getAdminToken();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(product)
      });
      return res.ok;
    } catch (err) {
      console.warn('Product D1 sync error:', err);
      return false;
    }
  }
  return true;
}

export async function updateAdminProduct(product: AdminProduct): Promise<boolean> {
  const current = getAdminProducts();
  const updated = current.map((p) => (p.id === product.id ? product : p));
  saveAdminProducts(updated);

  // Sync to Cloudflare D1
  if (typeof window !== 'undefined') {
    const token = getAdminToken();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        credentials: 'include',
        body: JSON.stringify(product)
      });
      return res.ok;
    } catch (err) {
      console.warn('Product D1 sync error:', err);
      return false;
    }
  }
  return true;
}

export async function deleteAdminProduct(productId: string): Promise<boolean> {
  const current = getAdminProducts();
  const updated = current.filter((p) => p.id !== productId);
  saveAdminProducts(updated);

  // Sync to Cloudflare D1
  if (typeof window !== 'undefined') {
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(productId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        },
        credentials: 'include'
      });
      return res.ok;
    } catch (err) {
      console.warn('Product delete D1 sync error:', err);
      return false;
    }
  }
  return true;
}

export async function syncProductsFromCloudflare(): Promise<AdminProduct[]> {
  try {
    const res = await fetch('/api/products', { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Catalogue API responded ${res.status}`);
    const data = await res.json();
    if (data?.success && Array.isArray(data.products)) {
      const adminFormat: AdminProduct[] = data.products.map((p: any) => {
        const galleryUrls = Array.isArray(p.images)
          ? p.images.map((img: any) => (typeof img === 'string' ? img : img.url)).filter(Boolean)
          : Array.isArray(p.gallery)
            ? p.gallery.filter(Boolean)
            : [];
        const heroImage = p.image || p.imageUrl || galleryUrls[0] || '';
        return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku || `SAT-${p.id}`,
        category: p.category || 'necklaces',
        pricePaise: Number(p.pricePaise) || 0,
        compareAtPricePaise: p.compareAtPricePaise ? Number(p.compareAtPricePaise) : undefined,
        headline: p.headline || p.name,
        image: heroImage,
        material: p.material || '316L Surgical Stainless Steel + 18K Gold PVD',
        finish: p.finish || 'Mirror Polished',
        inStock: p.inStock !== false,
        description: p.description || '',
        gallery: galleryUrls.filter((url: string) => url !== heroImage),
        collection: p.collection || '',
        dimensions: p.dimensions || '',
        weightGrams: p.weightGrams ?? undefined,
        careInstructions: Array.isArray(p.careInstructions) ? p.careInstructions : [],
        warranty: p.warranty || '',
        stockQuantity: p.stockQuantity ?? undefined,
        lowStockThreshold: p.lowStockThreshold ?? undefined,
        isBestseller: Boolean(p.isBestseller),
        isNewArrival: Boolean(p.isNewArrival),
        isPublished: p.isPublished !== false,
        tags: Array.isArray(p.tags) ? p.tags : [],
        seoTitle: p.seoTitle || '',
        seoDescription: p.seoDescription || '',
        costPaise: Number(p.costPaise) || 0,
        hsnCode: p.hsnCode || '',
        gstRate: Number(p.gstRate) || 3,
        sortOrder: Number(p.sortOrder) || 0,
        variants: Array.isArray(p.variants) ? p.variants : [],
        isDemo: Boolean(p.isDemo),
        rating: Number(p.rating) || 4.9,
        reviewCount: Number(p.reviewCount) || 0
        };
      });
      saveAdminProducts(adminFormat);
      return adminFormat;
    }
  } catch (err) {
    console.warn('Catalogue sync failed:', err);
    window.dispatchEvent(new CustomEvent('satvastones:catalog_error', { detail: String(err) }));
  }
  return getAdminProducts();
}

/**
 * Removes the seeded demo catalogue. Keeps every product the owner created.
 * Works against the edge API first, then mirrors the change locally.
 */
export async function removeDemoProducts(): Promise<{ ok: boolean; removed: number; message: string }> {
  const local = getAdminProducts();
  const demoIds = new Set(local.filter((p) => p.isDemo).map((p) => p.id));

  try {
    const res = await fetch('/api/products/demo', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getAdminToken()}` },
      credentials: 'include'
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.success === false) {
      return { ok: false, removed: 0, message: data.error || `Catalogue API responded ${res.status}` };
    }
    saveAdminProducts(getAdminProducts().filter((p) => !p.isDemo));
    return { ok: true, removed: Number(data.removed) || demoIds.size, message: 'Demo catalogue removed.' };
  } catch (err: any) {
    return { ok: false, removed: 0, message: err?.message || 'Could not reach the catalogue API.' };
  }
}

export function toggleAdminProductStock(productId: string): void {
  const current = getAdminProducts();
  const updated = current.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p));
  saveAdminProducts(updated);
}

// ==========================================
// 3. COUPONS CRUD
// ==========================================
export function getAdminCoupons(): AdminCoupon[] {
  if (typeof window === 'undefined') return DEFAULT_COUPONS;
  const stored = localStorage.getItem(COUPONS_KEY);
  if (stored === null) {
    // Match the edge API: a catalogue with no saved coupons still honours the
    // three launch offers, so the storefront discount field works out of the box.
    return DEFAULT_COUPONS;
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : DEFAULT_COUPONS;
  } catch {
    return DEFAULT_COUPONS;
  }
}

export function saveAdminCoupons(coupons: AdminCoupon[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
  window.dispatchEvent(new CustomEvent('satvastones:coupons_updated', { detail: coupons }));
}

export function addAdminCoupon(coupon: AdminCoupon): void {
  const current = getAdminCoupons();
  const updated = [coupon, ...current];
  saveAdminCoupons(updated);

  // Sync to Cloudflare D1
  if (typeof window !== 'undefined') {
    const token = getAdminToken();
    fetch('/api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(coupon)
    }).catch((err) => console.warn('Coupon D1 sync error:', err));
  }
}

export function updateAdminCoupon(coupon: AdminCoupon): void {
  const current = getAdminCoupons();
  const updated = current.map((c) => (c.id === coupon.id ? coupon : c));
  saveAdminCoupons(updated);

  // Sync to Cloudflare D1
  if (typeof window !== 'undefined') {
    const token = getAdminToken();
    fetch('/api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(coupon)
    }).catch((err) => console.warn('Coupon D1 sync error:', err));
  }
}

export async function deleteAdminCoupon(couponId: string): Promise<boolean> {
  const current = getAdminCoupons();
  const updated = current.filter((c) => c.id !== couponId);
  saveAdminCoupons(updated);

  // Sync to Cloudflare D1
  if (typeof window !== 'undefined') {
    const token = getAdminToken();
    try {
      const res = await fetch(`/api/coupons?id=${encodeURIComponent(couponId)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        },
        credentials: 'include'
      });
      return res.ok;
    } catch (err) {
      console.warn('Coupon delete D1 sync error:', err);
      return false;
    }
  }
  return true;
}

export function toggleCouponActive(couponId: string): void {
  const current = getAdminCoupons();
  const updated = current.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c));
  saveAdminCoupons(updated);

  const toggled = updated.find((c) => c.id === couponId);
  if (toggled && typeof window !== 'undefined') {
    const token = getAdminToken();
    fetch('/api/coupons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify(toggled)
    }).catch((err) => console.warn('Coupon toggle D1 sync error:', err));
  }
}

export async function syncCouponsFromCloudflare(): Promise<AdminCoupon[]> {
  try {
    const res = await fetch('/api/coupons');
    const data = await res.json();
    if (data?.success && Array.isArray(data.coupons)) {
      saveAdminCoupons(data.coupons);
      return data.coupons;
    }
  } catch (_) {}
  return getAdminCoupons();
}

export function validateCouponCode(
  code: string,
  subtotalPaise: number
): { valid: boolean; discountPaise: number; freeShipping?: boolean; message: string; coupon?: AdminCoupon } {
  const coupons = getAdminCoupons();
  const normalized = code.trim().toUpperCase();
  const match =
    coupons.find((c) => c.code.toUpperCase() === normalized && c.isActive) ||
    DEFAULT_COUPONS.find((c) => c.code.toUpperCase() === normalized && c.isActive);

  if (!match) {
    return { valid: false, discountPaise: 0, freeShipping: false, message: 'Invalid or expired coupon code. Try FIRSTBUY or SATVA10' };
  }

  if (match.minOrderPaise && subtotalPaise < match.minOrderPaise) {
    const minRupees = Math.round(match.minOrderPaise / 100);
    return {
      valid: false,
      discountPaise: 0,
      freeShipping: false,
      message: `Minimum order of ₹${minRupees.toLocaleString('en-IN')} required for coupon ${match.code}.`
    };
  }

  let discount = 0;
  if (match.discountPercent) {
    discount = Math.round(subtotalPaise * (match.discountPercent / 100));
  } else if (match.flatDiscountPaise) {
    discount = Math.min(subtotalPaise, match.flatDiscountPaise);
  }

  const freeShipping = Boolean(match.freeShipping || normalized === 'WELCOME15FREE');

  return {
    valid: true,
    discountPaise: discount,
    freeShipping,
    message: match.description || `Coupon ${match.code} applied successfully!`,
    coupon: match
  };
}

// ==========================================
// 4. SITE SETTINGS & PRICING CONFIG
// ==========================================
export function getSiteSettings(): SiteSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (!stored) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  try {
    const parsed = JSON.parse(stored);
    let changed = false;

    // Migrate/sanitize outdated green brooch hero image
    if (!parsed.heroImage || parsed.heroImage.includes('photo-1535632066927-ab7c9ab60908')) {
      parsed.heroImage = DEFAULT_SETTINGS.heroImage;
      changed = true;
    }

    // Migrate/sanitize broken 404 bracelet image
    if (parsed.categoryImages) {
      if (parsed.categoryImages.bracelets && parsed.categoryImages.bracelets.includes('photo-1611591475152')) {
        parsed.categoryImages.bracelets = DEFAULT_SETTINGS.categoryImages.bracelets;
        changed = true;
      }
    }

    if (parsed.categories && Array.isArray(parsed.categories)) {
      parsed.categories = parsed.categories.map((c: any) => {
        if (c.slug === 'bracelets' && c.image && c.image.includes('photo-1611591475152')) {
          changed = true;
          return { ...c, image: DEFAULT_SETTINGS.categoryImages.bracelets };
        }
        return c;
      });
    }

    const merged = { ...DEFAULT_SETTINGS, ...parsed };
    if (changed) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    }
    return merged;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSiteSettings(settings: SiteSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new CustomEvent('satvastones:settings_updated', { detail: settings }));

  // Sync to Cloudflare D1
  const token = getAdminToken();
  fetch('/api/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    credentials: 'include',
    body: JSON.stringify(settings)
  }).catch((err) => console.warn('Settings D1 sync error:', err));
}

export async function syncSiteSettingsFromCloudflare(): Promise<SiteSettings> {
  try {
    const res = await fetch('/api/settings');
    const data = await res.json();
    if (data?.success && data.settings) {
      const merged = { ...getSiteSettings(), ...data.settings };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('satvastones:settings_updated', { detail: merged }));
      return merged;
    }
  } catch (_) {}
  return getSiteSettings();
}

export function updateAdminCategory(slug: string, details: Partial<CategoryDetail>): void {
  const settings = getSiteSettings();
  const currentCats = settings.categories && settings.categories.length > 0 ? settings.categories : DEFAULT_CATEGORIES_DATA;
  const updatedCategories = currentCats.map((cat) =>
    cat.slug === slug ? { ...cat, ...details } : cat
  );
  const updatedImages = { ...settings.categoryImages };
  if (details.image) {
    updatedImages[slug] = details.image;
  }
  saveSiteSettings({
    ...settings,
    categories: updatedCategories,
    categoryImages: updatedImages
  });
}

export function toggleStackStudioProduct(productId: string): void {
  const settings = getSiteSettings();
  const current = settings.stackStudioEnabledProducts || [];
  const exists = current.includes(productId);
  const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];
  saveSiteSettings({
    ...settings,
    stackStudioEnabledProducts: updated
  });
}

export function updateCloudinaryConfig(cloudName: string, uploadPreset: string): void {
  const settings = getSiteSettings();
  saveSiteSettings({
    ...settings,
    cloudinaryCloudName: cloudName,
    cloudinaryUploadPreset: uploadPreset
  });
}

// ==========================================
// 5. 360° VIDEO CLAIMS
// ==========================================
export function getDamageClaims(): DamageClaim[] {
  if (typeof window === 'undefined') return DEFAULT_CLAIMS;
  const stored = localStorage.getItem(CLAIMS_KEY);
  if (!stored) {
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(DEFAULT_CLAIMS));
    return DEFAULT_CLAIMS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_CLAIMS;
  }
}

export function saveDamageClaims(claims: DamageClaim[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
}

export function updateClaimStatus(claimId: string, status: DamageClaim['status']): void {
  const claims = getDamageClaims();
  const updated = claims.map((c) => (c.id === claimId ? { ...c, status } : c));
  saveDamageClaims(updated);
}
