import { PRODUCTS, type Product } from '../data/products';
import { getAdminProducts, type AdminProduct } from './adminStore';

function adminProductToProduct(ap: AdminProduct): Product {
  return {
    id: ap.id,
    name: ap.name,
    slug: ap.slug,
    sku: ap.sku,
    category: ap.category as any,
    collection: 'atelier-curations',
    headline: ap.headline || ap.name,
    description: ap.name,
    material: ap.material || '316L Surgical Stainless Steel + 18K Gold PVD',
    finish: ap.finish || 'Mirror Polished',
    careInstructions: [
      'Safe for regular showers, gym sessions, and humid weather',
      'Wipe dry with the included microfiber pouch'
    ],
    warranty: '6 Months Anti-Tarnish Assurance',
    pricePaise: ap.pricePaise,
    compareAtPricePaise: ap.compareAtPricePaise,
    rating: 4.9,
    reviewsCount: 16,
    isBestseller: true,
    isNewArrival: true,
    inStock: ap.inStock,
    images: [
      {
        url: ap.image,
        alt: ap.name,
        isPrimary: true
      }
    ]
  };
}

export function getAllCatalogProducts(): Product[] {
  if (typeof window === 'undefined') return PRODUCTS;

  try {
    const adminProducts = getAdminProducts();
    if (!adminProducts) return PRODUCTS;

    const baseMap = new Map(PRODUCTS.map((p) => [p.slug, p]));
    const baseIdMap = new Map(PRODUCTS.map((p) => [p.id, p]));

    return adminProducts.map((ap) => {
      const existing = baseMap.get(ap.slug) || baseIdMap.get(ap.id);
      if (existing) {
        return {
          ...existing,
          id: ap.id,
          name: ap.name,
          slug: ap.slug,
          sku: ap.sku,
          category: ap.category as any,
          pricePaise: ap.pricePaise,
          compareAtPricePaise: ap.compareAtPricePaise,
          headline: ap.headline || existing.headline,
          inStock: ap.inStock,
          material: ap.material || existing.material,
          finish: ap.finish || existing.finish,
          images: ap.image ? [{ url: ap.image, alt: ap.name, isPrimary: true }, ...(existing.images || []).slice(1)] : existing.images
        };
      }
      return adminProductToProduct(ap);
    });
  } catch {
    return PRODUCTS;
  }
}

export async function syncCatalogFromCloudflare(): Promise<Product[]> {
  if (typeof window === 'undefined') return PRODUCTS;
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data?.success && Array.isArray(data.products)) {
      // Store in admin products cache
      const adminFormat = data.products.map((p: any) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku || `SAT-${p.id}`,
        category: p.category || 'necklaces',
        pricePaise: p.pricePaise,
        compareAtPricePaise: p.compareAtPricePaise,
        headline: p.headline || p.name,
        image: p.images?.[0]?.url || p.image || '',
        inStock: p.inStock !== false,
        material: p.material || '316L Surgical Stainless Steel + 18K Gold PVD',
        finish: p.finish || 'Mirror Polished'
      }));
      localStorage.setItem('satvastones_admin_products', JSON.stringify(adminFormat));
      window.dispatchEvent(new CustomEvent('satvastones:products_updated', { detail: adminFormat }));
    }
  } catch (_) {}
  return getAllCatalogProducts();
}

export function getProductBySlug(slug: string): Product | null {
  const all = getAllCatalogProducts();
  return all.find((p) => p.slug === slug) || null;
}

export function getProductById(id: string): Product | null {
  const all = getAllCatalogProducts();
  return all.find((p) => p.id === id) || null;
}
