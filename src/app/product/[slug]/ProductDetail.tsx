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
        "Dispatch within 24 hours. All sales are final — no returns, refunds, or cancellations. If your item arrives damaged, contact curation@satvastones.com within 48 hours with photos for a free replacement.",
    },
    {
      id: "care",
      title: "Care Instructions",
      content:
        "Store in a cool, dry place away from direct sunlight. Avoid contact with perfumes, lotions, and chemicals. Clean gently with a soft, lint-free cloth. While our pieces are tarnish-free and waterproof, proper care ensures lasting beauty.",
    },
  ];

  return (
    <div className="bg-[var(--luxury-cream)] min-h-screen pt-[120px] lg:pt-[140px] pb-24">
      {/* Breadcrumbs */}
      <div className="container-premium mb-12">
        <div className="flex items-center gap-3 label-sm text-[var(--luxury-brown)]/50">
          <Link href="/" className="hover:text-[var(--luxury-brown)] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href="/shop" className="hover:text-[var(--luxury-brown)] transition-colors">
            Curations
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[var(--luxury-brown)] font-bold truncate">{product.name}</span>
        </div>
      </div>

      <div className="container-premium">
        {/* Main Product Layout */}
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 mb-32 items-start">
          {/* Left Column: Image Gallery */}
          <ProductGallery product={product} />

          {/* Right Column: Product Info */}
          <div className="w-full lg:w-1/2 max-w-xl mx-auto lg:mx-0 py-4">
            <div className="mb-10">
              <div className="flex justify-between items-start gap-6">
                <div>
                  <span className="label-sm text-[var(--luxury-gold)] mb-4 block">
                    Handcrafted Artifact
                  </span>
                  <h1 className="heading-section text-[var(--luxury-brown)] mb-6 leading-tight">
                    {product.name}
                  </h1>
                </div>
                <button className="p-3 border border-[var(--luxury-border)] rounded-full text-[var(--luxury-brown)] hover:bg-[var(--luxury-brown)] hover:text-white transition-colors shrink-0">
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
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(avgRating)
                            ? "text-[var(--luxury-gold)] fill-current"
                            : "text-[var(--luxury-brown)]/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="label-sm text-[var(--luxury-brown)]/60">
                    {avgRating.toFixed(1)} ({reviewCount} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center gap-6 mb-8 py-6 border-y border-[var(--luxury-border)]">
                <span className="text-3xl lg:text-4xl font-serif text-[var(--luxury-brown)]">
                  {`₹${product.price.toLocaleString()}`}
                </span>
                {product.comparePrice && (
                  <span className="text-xl text-[var(--luxury-brown)]/40 line-through">
                    {`₹${product.comparePrice.toLocaleString()}`}
                  </span>
                )}
                <span className="ml-auto label-sm text-[var(--luxury-brown)]/50 text-right w-32 border-l border-[var(--luxury-border)] pl-6">
                  INCLUSIVE OF ALL TAXES
                </span>
              </div>

              {/* Description Preview */}
              <p className="text-[var(--luxury-brown)]/80 leading-relaxed mb-10 text-[0.95rem]">
                {product.description}
              </p>

              {/* Stock Status */}
              {product.stock > 0 ? (
                <p className="label-md text-emerald-700/80 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-700"></span> In Stock (
                  {product.stock} pieces remaining)
                </p>
              ) : (
                <p className="label-md text-red-800/80 mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-800"></span> Archived (Out of
                  Stock)
                </p>
              )}

              {/* Quantity & Actions */}
              <ProductActions product={product} />

              {/* Guarantees */}
              <div className="mt-12 py-8 border-t border-[var(--luxury-border)] grid grid-cols-2 gap-y-6">
                <div className="flex items-center gap-4 text-[var(--luxury-brown)]">
                  <Truck className="w-5 h-5 text-[var(--luxury-gold)]" strokeWidth={1.5} />
                  <span className="label-sm">
                    Free Global
                    <br />
                    Shipping
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[var(--luxury-brown)]">
                  <ShieldCheck
                    className="w-5 h-5 text-[var(--luxury-gold)]"
                    strokeWidth={1.5}
                  />
                  <span className="label-sm">
                    Lifetime
                    <br />
                    Warranty
                  </span>
                </div>
              </div>
            </div>

            {/* Product Tabs (Accordion) */}
            <ProductTabs tabs={tabs} />
          </div>
        </div>
      </div>

      {/* Related Artifacts */}
      {relatedProducts?.length > 0 && (
        <div className="border-t border-[var(--luxury-border)] pt-8">
          <RelatedProducts products={relatedProducts} />
        </div>
      )}
    </div>
  );
}
