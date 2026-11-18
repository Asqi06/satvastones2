import type { Product } from '../types/ecommerce';
import { formatPrice } from '../data/products';
import { addToCart } from '../stores/cartStore';
import { toggleWishlist, isInWishlist } from '../stores/wishlistStore';
import { ensureCatalog } from '../stores/catalogStore';

/**
 * Client-side product card renderer.
 *
 * The static Astro `ProductCard.astro` remains the server-rendered/SEO version.
 * This mirrors it for grids that must reflect catalogue changes made in the admin
 * panel without a rebuild (home bestsellers, collection grids, search).
 *
 * Every interpolated value is escaped: catalogue data is owner-supplied but still
 * untrusted at render time, and this string goes through innerHTML.
 */

const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

export function esc(value: unknown): string {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPE_MAP[char]);
}

function optimizedImage(url: string, width = 450): string {
  if (!url) return url;
  if (!url.includes('images.unsplash.com')) return url;
  let clean = url.replace(/w=\d+/, `w=${width}`).replace(/&q=\d+/, '&q=80');
  if (!clean.includes('fm=')) clean += '&fm=webp';
  return clean;
}

export function renderProductCard(product: Product): string {
  const rawPrimary = product.images?.[0]?.url || '';
  const rawSecondary = product.images?.[1]?.url || rawPrimary;
  const primary = optimizedImage(rawPrimary, 450);
  const secondary = optimizedImage(rawSecondary, 450);
  const compare = product.compareAtPricePaise || 0;
  const discount = compare > product.pricePaise ? Math.round(((compare - product.pricePaise) / compare) * 100) : 0;

  const badges = [
    product.isBestseller
      ? '<span class="bg-[#14110f] px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.18em] text-[#f6f1e8]">Bestseller</span>'
      : '',
    discount > 0
      ? `<span class="bg-[#c5a059] px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.18em] text-white">−${discount}%</span>`
      : '',
    product.isNewArrival && !product.isBestseller
      ? '<span class="bg-[#f6f1e8] px-2.5 py-1 text-[8px] font-medium uppercase tracking-[0.18em] text-[#14110f]">New</span>'
      : ''
  ].join('');

  return `
<div class="product-card group relative flex flex-col" data-product-card>
  <a href="/products/${esc(product.slug)}" class="relative block aspect-[3/4] overflow-hidden bg-[#f1ece3]" aria-label="${esc(product.name)}">
    <div class="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">${badges}</div>
    <button
      type="button"
      data-wishlist-id="${esc(product.id)}"
      data-wishlist-name="${esc(product.name)}"
      data-wishlist-slug="${esc(product.slug)}"
      data-wishlist-price="${esc(product.pricePaise)}"
      data-wishlist-image="${esc(primary)}"
      class="card-wishlist-btn absolute bottom-3 right-3 z-10 flex h-8 w-8 items-center justify-center border border-[#14110f]/15 bg-white/85 text-[#14110f] backdrop-blur-sm transition-all hover:border-[#14110f] hover:bg-white hover:text-[#8d3f3d] cursor-pointer"
      title="Save to wishlist"
      aria-label="Save ${esc(product.name)} to wishlist"
      aria-pressed="false"
    >
      <svg class="h-4 w-4 stroke-[1.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    </button>
    <img src="${esc(primary)}" alt="${esc(product.images?.[0]?.alt || product.name)}" width="400" height="533" loading="lazy" decoding="async" class="product-card-image absolute inset-0 h-full w-full object-cover transition-opacity duration-500 group-hover:opacity-0" />
    <img src="${esc(secondary)}" alt="${esc(product.images?.[1]?.alt || product.name)}" width="400" height="533" loading="lazy" decoding="async" class="product-card-image absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
  </a>

  <div class="flex flex-1 flex-col gap-2.5 pt-3.5">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="font-serif text-[15px] leading-snug text-[#14110f] transition-colors hover:text-[#8d3f3d] sm:text-base">
          <a href="/products/${esc(product.slug)}">${esc(product.name)}</a>
        </h3>
        <p class="mt-1 line-clamp-1 text-[9px] uppercase tracking-[0.14em] text-[#8b837a]">${esc(product.material)}</p>
      </div>
      <div class="mt-0.5 flex shrink-0 items-center gap-1 text-[10px] text-[#8b837a]">
        <svg class="h-2.5 w-2.5 fill-[#c5a059]" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
        <span>${esc(product.rating)}</span>
        <span class="text-[#b3aaa1]">(${esc(product.reviewCount)})</span>
      </div>
    </div>

    <div class="mt-auto space-y-2.5">
      <div class="flex items-baseline gap-2">
        <span class="text-sm font-medium text-[#14110f] sm:text-[15px]">${formatPrice(product.pricePaise)}</span>
        ${compare > product.pricePaise ? `<span class="text-[11px] font-normal text-[#a39a91] line-through">${formatPrice(compare)}</span>` : ''}
      </div>
      <button
        type="button"
        data-product-id="${esc(product.id)}"
        data-product-name="${esc(product.name)}"
        data-product-slug="${esc(product.slug)}"
        data-product-price="${esc(product.pricePaise)}"
        data-product-image="${esc(primary)}"
        aria-label="Add ${esc(product.name)} to bag"
        class="quick-add-btn w-full border border-[#14110f]/25 py-2.5 text-[9px] font-medium uppercase tracking-[0.2em] text-[#14110f] transition-colors duration-300 hover:border-[#14110f] hover:bg-[#14110f] hover:text-[#f6f1e8] cursor-pointer active:scale-[0.99]"
      >Add to bag</button>
    </div>
  </div>
</div>`;
}

const SAVED_CLASSES = ['text-[#8d3f3d]', 'bg-[#f4efe7]', 'border-[#8d3f3d]'];

export function bindProductCards(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>('.product-card[data-product-card]').forEach((card) => {
    if (card.dataset.bound === 'true') return;
    card.dataset.bound = 'true';

    const wishlistBtn = card.querySelector<HTMLElement>('.card-wishlist-btn');
    const addBtn = card.querySelector<HTMLElement>('.quick-add-btn');

    if (wishlistBtn) {
      const id = wishlistBtn.dataset.wishlistId || '';
      if (id && isInWishlist(id)) {
        wishlistBtn.classList.add(...SAVED_CLASSES);
        wishlistBtn.setAttribute('aria-pressed', 'true');
      }

      wishlistBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const isSaved = toggleWishlist({
          id: wishlistBtn.dataset.wishlistId || '',
          name: wishlistBtn.dataset.wishlistName || '',
          slug: wishlistBtn.dataset.wishlistSlug || '',
          sku: '',
          category: '',
          headline: '',
          description: '',
          material: '',
          finish: '',
          careInstructions: [],
          warranty: '',
          pricePaise: parseInt(wishlistBtn.dataset.wishlistPrice || '0', 10),
          rating: 5,
          reviewCount: 0,
          images: [{ url: wishlistBtn.dataset.wishlistImage || '', alt: wishlistBtn.dataset.wishlistName || '' }],
          inStock: true
        });
        wishlistBtn.classList.toggle('text-[#8d3f3d]', isSaved);
        wishlistBtn.classList.toggle('bg-[#f4efe7]', isSaved);
        wishlistBtn.classList.toggle('border-[#8d3f3d]', isSaved);
        wishlistBtn.setAttribute('aria-pressed', String(isSaved));
      });
    }

    if (addBtn) {
      addBtn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        addToCart({
          productId: addBtn.dataset.productId || '',
          name: addBtn.dataset.productName || '',
          slug: addBtn.dataset.productSlug || '',
          pricePaise: parseInt(addBtn.dataset.productPrice || '0', 10),
          image: addBtn.dataset.productImage || '',
          quantity: 1
        });
      });
    }
  });
}

type GridFilter = 'all' | 'bestsellers' | 'new' | string;

function filterProducts(products: Product[], filter: GridFilter): Product[] {
  if (filter === 'all') return products;
  if (filter === 'bestsellers') {
    const best = products.filter((p) => p.isBestseller);
    return best.length ? best : products;
  }
  if (filter === 'new') {
    const fresh = products.filter((p) => p.isNewArrival);
    return fresh.length ? fresh : products;
  }
  return products.filter((p) => p.category === filter);
}
/**
 * Replaces every `[data-catalog-grid]` with the live catalogue.
 * Attributes: data-catalog-grid="all|bestsellers|new|<category>", data-catalog-limit="8"
 */
export async function hydrateCatalogGrids(): Promise<void> {
  const grids = Array.from(document.querySelectorAll<HTMLElement>('[data-catalog-grid]'));
  if (!grids.length) return;

  let products: Product[] = [];
  try {
    products = await ensureCatalog();
  } catch {
    return;
  }
  if (!products.length) {
    grids.forEach((grid) => {
      if (grid.dataset.catalogKeepFallback === 'true') return;
      grid.innerHTML =
        '<p class="col-span-full py-10 text-center text-[10px] uppercase tracking-[0.2em] text-[#8b837a]">The atelier catalogue is being restocked. Please check back shortly.</p>';
    });
    return;
  }

  grids.forEach((grid) => {
    const filter = (grid.dataset.catalogGrid || 'all') as GridFilter;
    const limit = Number(grid.dataset.catalogLimit) || 0;
    const exclude = new Set(
      (grid.dataset.catalogExclude || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    );
    let filtered = filterProducts(products, filter).filter(
      (product) => !exclude.has(product.id) && !exclude.has(product.slug)
    );
    // A PDP category grid should never look thinner than the static fallback.
    if (filtered.length < 2 && exclude.size) {
      filtered = products.filter((product) => !exclude.has(product.id) && !exclude.has(product.slug));
    }
    const list = limit ? filtered.slice(0, limit) : filtered;
    if (!list.length) {
      grid.innerHTML =
        '<p class="col-span-full py-10 text-center text-[10px] uppercase tracking-[0.2em] text-[#8b837a]">No pieces in this edit yet.</p>';
      return;
    }
    grid.innerHTML = list
      .map(
        (product, index) =>
          `<div data-catalog-item style="--reveal-delay:${(index % 4) * 70}ms">${renderProductCard(product)}</div>`
      )
      .join('');
    bindProductCards(grid);
  });

  window.dispatchEvent(new CustomEvent('satvastones:catalog_hydrated'));
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => void hydrateCatalogGrids(), { once: true });
  } else {
    void hydrateCatalogGrids();
  }
  window.addEventListener('satvastones:products_updated', () => void hydrateCatalogGrids());
}
