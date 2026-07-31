import Link from "next/link";
import Image from "next/image";
import type { RelatedProduct } from "./ProductDetail";

export default function RelatedProducts({
  products,
}: {
  products: RelatedProduct[];
}) {
  if (!products || products.length === 0) return null;

  return (
    <section className="py-24 lg:py-36 bg-[var(--luxury-cream)] overflow-hidden">
      <div className="container-premium text-center">
        <div className="flex flex-col items-center justify-center mb-16 lg:mb-24 px-4 max-w-2xl mx-auto">
          <p className="label-sm text-[var(--luxury-gold)] mb-4 lg:mb-6">
            Satvastones Heritage
          </p>
          <h2 className="heading-section text-[var(--luxury-brown)] mb-6 text-shadow-sm">
            Complementary <br className="hidden md:block" /> Artifacts
          </h2>
          <div className="h-px w-24 bg-[var(--luxury-gold)]/40 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {products.map((product) => {
            const discount = product.comparePrice
              ? Math.round(
                  ((product.comparePrice - product.price) /
                    product.comparePrice) *
                    100
                )
              : 0;

            return (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="group flex flex-col items-center text-center animate-fade-in"
              >
                <div className="relative w-full aspect-[4/5] bg-white border border-[var(--luxury-border)] transition-all duration-700 group-hover:shadow-xl overflow-hidden mb-6">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-[2000ms] ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--luxury-border)] font-serif text-6xl">
                      SV
                    </div>
                  )}

                  {discount > 0 && (
                    <div className="absolute top-4 left-4 bg-[var(--luxury-gold)] text-white px-3 py-1 label-sm shadow-md z-[2]">
                      {discount}% OFF
                    </div>
                  )}
                </div>

                <h3 className="font-serif text-[1.1rem] lg:text-[1.25rem] italic text-[var(--luxury-brown)] group-hover:text-[var(--luxury-gold)] transition-colors line-clamp-1 mb-3">
                  {product.name}
                </h3>

                <div className="flex items-center justify-center gap-4">
                  <p className="label-md font-bold text-[var(--luxury-brown)]">
                    ₹{product.price.toLocaleString()}
                  </p>
                  {product.comparePrice && (
                    <p className="label-md text-[var(--luxury-brown)]/40 line-through font-normal">
                      ₹{product.comparePrice.toLocaleString()}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
