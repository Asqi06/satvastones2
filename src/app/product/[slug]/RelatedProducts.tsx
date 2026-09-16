import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import type { RelatedProduct } from "./ProductDetail";

export default function RelatedProducts({
  products,
}: {
  products: RelatedProduct[];
}) {
  if (!products || products.length === 0) return null;

  return (
    <section className="editorial-container shop-section" aria-labelledby="related-heading">
      <div className="section-heading">
        <div>
          <div className="eyebrow">Complete the look</div>
          <h2 id="related-heading">
            Pairs <em>well with.</em>
          </h2>
        </div>
        <Link href="/shop" className="text-link">
          Explore the edit
          <svg className="w-4 h-4"><use href="#i-arrow" /></svg>
        </Link>
      </div>

      <div className="product-grid">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
