import { PRODUCTS, type Product } from '../data/products';
import { getAdminProducts, syncProductsFromCloudflare, type AdminProduct } from './adminStore';

/**
 * The storefront catalogue used to be the build-time `PRODUCTS` array, with a
 * per-browser localStorage patch on top. That meant products created in the admin
 * panel only appeared in the browser that created them. The edge API (`/api/products`,
 * D1 in production, `.data/dev-store.json` in dev) is now the single source of truth;
 * `PRODUCTS` is only used as the server-render fallback and when the API is unreachable.
 */

function adminProductToProduct(ap: AdminProduct): Product {
  // The admin form stores the hero shot separately from the supporting gallery.
  // Deduplicate so a gallery entry that repeats the hero shot is not rendered twice.
  const gallery = [ap.image, ...(ap.gallery || [])].filter(
    (url, index, all) => Boolean(url) && all.indexOf(url) === index
  );
  const images = gallery.map((url, index) => ({
    url,
    alt: `${ap.name}${index === 0 ? '' : ` detail ${index}`}`,
    isPrimary: index === 0
  }));
  return {
    id: ap.id,
    name: ap.name,
    slug: ap.slug,
    sku: ap.sku,
    category: ap.category as any,
    collection: ap.collection || 'atelier-curations',
    headline: ap.headline || ap.name,
    description: ap.description || ap.headline || ap.name,
    material: ap.material || '316L Surgical Stainless Steel + 18K Gold PVD',
    finish: ap.finish || 'Mirror Polished',
    dimensions: ap.dimensions || '',
    weightGrams: ap.weightGrams,
    careInstructions:
      ap.careInstructions && ap.careInstructions.length
        ? ap.careInstructions
        : [
            'Safe for regular showers, gym sessions, and humid weather',
            'Wipe dry with the included microfiber pouch'
          ],
    warranty: ap.warranty || '6 Months Anti-Tarnish Assurance',
    pricePaise: ap.pricePaise,
    compareAtPricePaise: ap.compareAtPricePaise,
    rating: ap.rating ?? 4.9,
    reviewCount: ap.reviewCount ?? 0,
    isBestseller: Boolean(ap.isBestseller),
    isNewArrival: Boolean(ap.isNewArrival),
    inStock: ap.inStock,
    images: images.length ? images : [{ url: '', alt: ap.name, isPrimary: true }]
  };
}

export function getAllCatalogProducts(): Product[] {
  if (typeof window === 'undefined') return PRODUCTS;

  try {
    const adminProducts = getAdminProducts();
    if (!adminProducts.length) return PRODUCTS;

    const baseMap = new Map(PRODUCTS.map((p) => [p.slug, p]));
    const baseIdMap = new Map(PRODUCTS.map((p) => [p.id, p]));

    return adminProducts
      .filter((ap) => ap.isPublished !== false)
      .map((ap) => {
        const existing = baseMap.get(ap.slug) || baseIdMap.get(ap.id);
        if (existing) {
          // Keep editorial extras (material copy, alt copy) from the base record
          // while the admin-owned values win on everything commercial.
          return {
            ...existing,
            ...adminProductToProduct(ap)
          };
        }
        return adminProductToProduct(ap);
      });
  } catch {
    return PRODUCTS;
  }
}

let inflight: Promise<Product[]> | null = null;

/**
 * Fetch the authoritative catalogue once, cache it, and return the storefront shape.
 * Safe to call from every island; concurrent callers share a single request.
 */
export function ensureCatalog(force = false): Promise<Product[]> {
  if (typeof window === 'undefined') return Promise.resolve(PRODUCTS);
  if (!force && inflight) return inflight;

  inflight = syncProductsFromCloudflare()
    .then(() => getAllCatalogProducts())
    .catch(() => getAllCatalogProducts())
    .finally(() => {
      // Allow a later refresh, but not a request storm.
      setTimeout(() => {
        inflight = null;
      }, 30_000);
    });

  return inflight;
}

/** Backwards-compatible alias used by existing pages. */
export async function syncCatalogFromCloudflare(): Promise<Product[]> {
  return ensureCatalog(true);
}

export function getProductBySlug(slug: string): Product | null {
  const all = getAllCatalogProducts();
  return all.find((p) => p.slug === slug) || null;
}

export function getProductById(id: string): Product | null {
  const all = getAllCatalogProducts();
  return all.find((p) => p.id === id) || null;
}
