import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  material?: string | null;
  isNewCollection?: boolean;
}

const FALLBACK_PRODUCTS: Product[] = [
  { id: "p1", name: "Korean Minimalist Gold Ring", slug: "korean-minimalist-gold-ring", price: 599, comparePrice: 899, images: ["/gold_ring_minimalist_1774634383905.png"], isNewCollection: true },
  { id: "p2", name: "Seoul Twist Hoop Earrings", slug: "abstract-seoul-earrings", price: 499, comparePrice: null, images: ["/korean_earrings_premium_1774634324348.png"], isNewCollection: true },
  { id: "p3", name: "Layered Gold Chain Necklace", slug: "elite-western-necklace", price: 799, comparePrice: 1199, images: ["/western_necklace_premium_1774634354735.png"], isNewCollection: true },
  { id: "p4", name: "Rose Gold Cuff Bracelet", slug: "emerald-horizon-bracelet", price: 699, comparePrice: 999, images: ["/emerald_bracelet_hero_1774677499386.png"], isNewCollection: true },
];

export default function NibsProductStrip({ products }: { products: Product[] }) {
  const displayList = products.length >= 4 ? products.slice(0, 4) : FALLBACK_PRODUCTS;

  return (
    <section className="bg-canvas py-16 lg:py-20" aria-labelledby="new-in-heading">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex items-end justify-between gap-6 border-b border-line pb-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-accent-strong">Your jewellery box, upgraded</p>
            <h2 id="new-in-heading" className="mt-3 font-serif text-4xl leading-none tracking-[-0.03em] text-ink sm:text-5xl">
              On heavy <em className="font-normal text-accent-strong">rotation.</em>
            </h2>
          </div>
          <Link href="/shop" className="hidden shrink-0 items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-ink underline decoration-line-strong underline-offset-8 transition-colors hover:text-accent-strong sm:inline-flex">
            Explore the edit <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-9 pt-8 sm:grid-cols-4 sm:gap-x-5 lg:gap-x-7">
          {displayList.map((product, index) => {
            const discount = product.comparePrice ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;
            const image = product.images[0] || FALLBACK_PRODUCTS[index].images[0];

            return (
              <Link key={product.id} href={`/product/${product.slug}`} className="group min-w-0">
                <div className="relative aspect-[3/4] overflow-hidden bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute left-3 top-3 flex gap-2">
                    {product.isNewCollection && <span className="bg-surface px-2 py-1 text-[8px] font-semibold tracking-[0.13em] uppercase text-ink">New</span>}
                    {discount > 0 && <span className="bg-accent-strong px-2 py-1 text-[8px] font-semibold tracking-[0.13em] uppercase text-white">Save {discount}%</span>}
                  </div>
                </div>
                <div className="pt-3">
                  <h3 className="font-serif text-base leading-tight text-ink transition-colors group-hover:text-accent-strong sm:text-lg">{product.name}</h3>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-ink-mute">{product.material || "Anti-tarnish finish"}</p>
                  <div className="mt-2 flex items-baseline gap-2 text-sm">
                    <span className="font-semibold text-ink">Rs. {product.price.toLocaleString("en-IN")}</span>
                    {product.comparePrice && <span className="text-xs text-ink-mute line-through">Rs. {product.comparePrice.toLocaleString("en-IN")}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        <Link href="/shop" className="mt-10 inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-ink underline decoration-line-strong underline-offset-8 sm:hidden">
          Explore the edit <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
