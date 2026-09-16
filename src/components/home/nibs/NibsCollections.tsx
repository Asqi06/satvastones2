import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface Cat {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

const DEFAULT_TILES = [
  { title: "Earrings", sub: "Korean Hoops & Drops", slug: "earrings", image: "/silver-jewellery-category.jpg", href: "/shop/earrings" },
  { title: "Necklaces", sub: "Layered Chains", slug: "necklaces", image: "/gold-jewellery-category.jpg", href: "/shop/necklaces" },
  { title: "Rings", sub: "Stackable Dainty", slug: "rings", image: "/hero.png", href: "/shop/rings" },
  { title: "Bracelets", sub: "Cuffs & Charms", slug: "bracelets", image: "/gemstone-jewellery-category.jpg", href: "/shop/bracelets" },
];

export default function NibsCollections({ categories = [] }: { categories?: Cat[] }) {
  return (
    <section className="bg-surface py-16 lg:py-20 border-y border-line" aria-label="Collections edit">
      <div className="max-w-[1600px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-accent-strong mb-2">The Jewellery Shop</p>
            <h2 className="font-serif text-4xl sm:text-5xl tracking-[-0.03em] text-ink">Shop by Collection</h2>
            <p className="text-sm text-ink-soft mt-2 max-w-[52ch]">Anti-tarnish, waterproof Korean & Western jewellery — earrings, necklaces, rings & bracelets for everyday wear and gifting.</p>
          </div>
          <Link href="/shop" className="hidden sm:inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-ink underline decoration-line-strong underline-offset-8 hover:text-accent-strong transition-colors">
            View all <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {DEFAULT_TILES.map((item, idx) => {
            const matched = categories?.[idx];
            const href = matched ? `/shop/${matched.slug}` : item.href;
            const title = matched?.name || item.title;
            const image = matched?.image || item.image;
            return (
              <Link key={matched?.id || item.title} href={href} className="group relative block aspect-[3/4.2] overflow-hidden bg-canvas">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={title} className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.05] transition-transform duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {/* subtle grain shimmer on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-white/5" />

                {/* Top kicker */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center px-2.5 py-1 bg-surface/95 text-[9px] font-semibold tracking-[0.14em] uppercase text-ink">Explore</span>
                </div>

                {/* Bottom glass label */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="bg-surface/95 p-3.5 sm:p-4 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-metal">{item.sub}</p>
                      <p className="font-serif text-[15px] sm:text-[16px] leading-none text-ink truncate">{title}</p>
                    </div>
                    <span className="w-8 h-8 bg-ink text-white flex items-center justify-center flex-shrink-0 group-hover:bg-accent-strong transition-colors">
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
