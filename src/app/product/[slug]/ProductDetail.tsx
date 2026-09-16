import Link from "next/link";
import { ChevronRight, Truck, ShieldCheck, Star } from "lucide-react";
import ProductGallery from "./ProductGallery";
import ProductActions from "./ProductActions";
import ProductTabs from "./ProductTabs";
import RelatedProducts from "./RelatedProducts";

export interface ProductDetailProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  material: string | null;
  style: string;
  stock: number;
  sku: string | null;
  weight?: number | null;
  seoContent?: string | null;
  category: { id: string; name: string; slug: string } | null;
  reviews?: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    user: { id: string; name: string | null; image: string | null } | null;
  }[];
}

export interface RelatedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  material: string | null;
  style: string;
  stock: number;
  category?: { name: string; slug: string } | null;
}

interface ProductDetailProps {
  product: ProductDetailProduct;
  relatedProducts: RelatedProduct[];
  avgRating: number;
}

export default function ProductDetail({ product, relatedProducts, avgRating }: ProductDetailProps) {
  const reviewCount = product.reviews?.length || 0;
  const tabs = [
    {
      id: "details",
      title: "Curation Details",
      content: `Material: ${product.material || "18K Gold Plated"}\nStyle Pattern: ${product.style}\nDesigned precisely for contemporary wardrobes blending timeless aesthetics.\n\nThis handcrafted piece from SatvaStones is designed for everyday elegance. Each artifact is carefully inspected for quality before shipping. Our jewellery is tarnish-free and waterproof, making it perfect for daily wear.`,
    },
    {
      id: "shipping",
      title: "Transit & Returns",
      content:
        "Dispatch within 24 hours. All sales are final — no returns, refunds, or cancellations. If your item arrives damaged, contact support@satvastones.in within 48 hours with photos for a free replacement.",
    },
    {
      id: "care",
      title: "Care Instructions",
      content:
        "Store in a cool, dry place away from direct sunlight. Avoid contact with perfumes, lotions, and chemicals. Clean gently with a soft, lint-free cloth. While our pieces are tarnish-free and waterproof, proper care ensures lasting beauty.",
    },
  ];

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      {/* Breadcrumbs */}
      <div className="editorial-container pt-8 mb-8">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2.5 text-[11px] text-[var(--muted)]">
          <Link href="/" className="hover:text-[var(--ink)] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-[var(--ink)] transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--ink)] font-medium truncate" aria-current="page">{product.name}</span>
        </nav>
      </div>

      <div className="editorial-container">
        {/* Main Product Layout */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-20 items-start">
          {/* Left Column: Image Gallery */}
          <ProductGallery product={product} />

          {/* Right Column: Product Info */}
          <div className="w-full lg:w-1/2 max-w-xl mx-auto lg:mx-0 py-2">
            <div className="mb-8">
              <div className="flex justify-between items-start gap-6">
                <div>
                  <span className="eyebrow mb-4 block">
                    Anti-tarnish · Waterproof
                  </span>
                  <h1 className="font-serif font-normal tracking-[-0.03em] leading-[1.05] text-[clamp(34px,3.4vw,52px)] mb-5">
                    {product.name}
                  </h1>
                </div>
                <button aria-label="Share this piece" className="round-arrow shrink-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </button>
              </div>

              {/* Rating */}
              {reviewCount > 0 && (
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex" role="img" aria-label={`Rated ${avgRating.toFixed(1)} out of 5`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(avgRating)
                            ? "text-[#a98250] fill-current"
                            : "text-[var(--line)]"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[12px] text-[var(--muted)]">
                    {avgRating.toFixed(1)} ({reviewCount} review{reviewCount > 1 ? "s" : ""})
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-5 mb-7 py-5 border-y border-[var(--line)]">
                <span className="text-3xl font-serif text-[var(--ink)]">
                  {`₹${product.price.toLocaleString("en-IN")}`}
                </span>
                {product.comparePrice && (
                  <span className="text-lg text-[var(--muted)] line-through">
                    {`₹${product.comparePrice.toLocaleString("en-IN")}`}
                  </span>
                )}
                <span className="ml-auto text-[10px] uppercase tracking-[0.12em] text-[var(--muted)] text-right border-l border-[var(--line)] pl-5">
                  Inclusive of all taxes
                </span>
              </div>

              {/* Description Preview */}
              <p className="text-[var(--muted)] leading-relaxed mb-8 text-sm">
                {product.description}
              </p>

              {/* Stock Status */}
              {product.stock > 0 ? (
                <p className="text-[11px] uppercase tracking-[0.12em] text-[var(--olive)] mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[var(--olive)]"></span> In stock (
                  {product.stock} pieces remaining)
                </p>
              ) : (
                <p className="text-[11px] uppercase tracking-[0.12em] text-[#9b5144] mb-5 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#9b5144]"></span> Out of stock
                </p>
              )}

              {/* Delivery Estimate */}
              {product.stock > 0 && (
                <div className="flex items-center gap-2.5 mb-7 text-[var(--muted)]">
                  <Truck className="w-4 h-4 text-[var(--olive)]" strokeWidth={1.5} />
                  <span className="text-[11px] tracking-[0.06em]">
                    Estimated delivery: 3–5 business days · Dispatched within 24 hours
                  </span>
                </div>
              )}

              {/* Quantity & Actions */}
              <ProductActions product={product} />

              {/* Guarantees */}
              <div className="benefits mt-10" aria-label="The SatvaStones details">
                <div className="grid grid-cols-2 py-5">
                  <div className="benefit !border-b-0">
                    <Truck className="w-[19px] h-[19px]" strokeWidth={1.5} />
                    Free shipping over ₹399
                  </div>
                  <div className="benefit !border-b-0">
                    <ShieldCheck className="w-[19px] h-[19px]" strokeWidth={1.5} />
                    Anti-tarnish &amp; waterproof
                  </div>
                </div>
              </div>
            </div>

            {/* Product Tabs (Accordion) */}
            <ProductTabs tabs={tabs} />

            {/* Specifications — visible HTML for Googlebot + shoppers */}
            <section aria-label="Specifications" className="mt-10 bg-[var(--white)] border border-[var(--line)]">
              <h2 className="eyebrow px-6 pt-6">
                Specifications
              </h2>
              <table className="w-full mt-4 text-sm text-[var(--ink)]">
                <tbody>
                  {product.sku && (
                    <tr className="border-t border-[var(--line)]">
                      <th scope="row" className="text-left font-semibold px-6 py-3 w-40 align-top text-[13px]">SKU</th>
                      <td className="px-6 py-3 text-[13px] text-[var(--muted)]">{product.sku}</td>
                    </tr>
                  )}
                  {product.material && (
                    <tr className="border-t border-[var(--line)]">
                      <th scope="row" className="text-left font-semibold px-6 py-3 w-40 align-top text-[13px]">Material</th>
                      <td className="px-6 py-3 text-[13px] text-[var(--muted)]">{product.material}</td>
                    </tr>
                  )}
                  {typeof product.weight === "number" && (
                    <tr className="border-t border-[var(--line)]">
                      <th scope="row" className="text-left font-semibold px-6 py-3 w-40 align-top text-[13px]">Weight</th>
                      <td className="px-6 py-3 text-[13px] text-[var(--muted)]">{product.weight} g</td>
                    </tr>
                  )}
                  <tr className="border-t border-[var(--line)]">
                    <th scope="row" className="text-left font-semibold px-6 py-3 w-40 align-top text-[13px]">Style</th>
                    <td className="px-6 py-3 text-[13px] text-[var(--muted)]">{product.style} · Anti-tarnish & waterproof</td>
                  </tr>
                  {product.category && (
                    <tr className="border-t border-[var(--line)]">
                      <th scope="row" className="text-left font-semibold px-6 py-3 w-40 align-top text-[13px]">Category</th>
                      <td className="px-6 py-3 text-[13px] text-[var(--muted)]">
                        <Link href={`/shop/${product.category.slug}`} className="underline underline-offset-4 hover:text-[var(--olive)]">
                          {product.category.name}
                        </Link>
                      </td>
                    </tr>
                  )}
                  <tr className="border-t border-b border-[var(--line)]">
                    <th scope="row" className="text-left font-semibold px-6 py-3 w-40 align-top text-[13px]">Gift packaging</th>
                    <td className="px-6 py-3 text-[13px] text-[var(--muted)]">Gift-ready box included · Free shipping over ₹399</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* SEO content from admin — rendered when present, fallback to evergreen copy */}
            {product.seoContent ? (
              <div
                className="mt-8 text-[var(--muted)] text-sm leading-relaxed space-y-4"
                dangerouslySetInnerHTML={{ __html: product.seoContent }}
              />
            ) : (
              <p className="mt-8 text-[var(--muted)] text-sm leading-relaxed">
                {product.name} is a Korean-inspired {product.category?.name?.toLowerCase() || "jewellery"} piece in {product.material || "premium plated"} finish — anti-tarnish, waterproof and skin-safe for college, office and festive styling. Pair it with layered chains or stackable rings, gift it for birthdays and anniversaries, and enjoy COD with free shipping over ₹399 across India.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Related pieces */}
      {relatedProducts?.length > 0 && (
        <div className="border-t border-[var(--line)] mt-16 pt-4">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}

      <section className="benefits" aria-label="The SatvaStones details">
        <div className="benefits-inner editorial-container">
          <div className="benefit">
            <svg><use href="#i-sparkle" /></svg> Anti-tarnish finish
          </div>
          <div className="benefit">
            <svg><use href="#i-drop" /></svg> Water-friendly pieces
          </div>
          <div className="benefit">
            <svg><use href="#i-gift" /></svg> Arrives gift-ready
          </div>
          <div className="benefit">
            <svg><use href="#i-truck" /></svg> Shipped across India · COD
          </div>
        </div>
      </section>
    </div>
  );
}
