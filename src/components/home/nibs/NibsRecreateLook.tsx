import Link from "next/link";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  images: string[];
}

export default function NibsRecreateLook({ products = [] }: { products?: Product[] }) {
  const featured = products?.[0] ?? {
    id: "spotlight-1",
    name: "Korean Minimalist Gold Ring",
    slug: "korean-minimalist-gold-ring",
    price: 599,
    comparePrice: 899,
    images: ["/gold_ring_minimalist_1774634383905.png"],
  };

  return (
    <section className="bg-white py-10 lg:py-14" aria-label="Spotlight collection">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.45fr_0.85fr] gap-6 lg:gap-8 items-stretch">
          <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[16/10] rounded-2xl overflow-hidden bg-canvas border border-line group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/western_necklace_premium_1774634354735.png" alt="Layered gold necklace styling look" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            <Link href={`/product/${featured.slug}`} className="absolute top-[46%] left-[42%] w-9 h-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95 border border-white shadow-lg flex items-center justify-center group/hot hover:scale-110 transition-transform" aria-label="View featured item">
              <span className="w-3 h-3 rounded-full bg-ink animate-ping absolute opacity-60" />
              <span className="w-2.5 h-2.5 rounded-full bg-ink relative" />
            </Link>
            <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-auto bg-surface/92 backdrop-blur-xl border border-white/60 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-[var(--shadow-soft)] max-w-[280px]">
              <div className="w-10 h-10 rounded-xl bg-canvas border border-line overflow-hidden flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={featured.images[0]} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-ink truncate">Shop the look</p>
                <p className="text-[11px] text-ink-mute truncate">{featured.name}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-canvas/60 border border-line p-6 sm:p-8 flex flex-col items-center justify-center text-center">
            <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-metal mb-2">Spotlight</p>
            <h3 className="font-serif text-3xl sm:text-4xl text-ink tracking-[-0.02em]">Everyday Gold Layers</h3>
            <p className="text-sm text-ink-soft mt-3 max-w-[32ch] text-balance">Anti-tarnish hoops, chains & stackable rings — waterproof shine for daily wear.</p>
            <Link href="/shop" className="mt-6 inline-flex px-6 py-3 rounded-full bg-ink text-white text-xs font-semibold tracking-[0.14em] uppercase hover:bg-accent-strong transition-colors shadow">Shop Now</Link>

            <div className="mt-8 w-full max-w-[260px] rounded-2xl bg-surface border border-line overflow-hidden shadow-sm p-3 text-center">
              <Link href={`/product/${featured.slug}`} className="block group">
                <div className="aspect-[3/4] rounded-xl overflow-hidden bg-canvas border border-line/60 mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={featured.images[0]} alt={featured.name} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500" />
                </div>
                <h4 className="font-serif text-[14px] leading-snug text-ink group-hover:text-accent-strong transition-colors line-clamp-2">{featured.name}</h4>
                <p className="mt-1 text-xs font-semibold text-ink">₹{featured.price.toLocaleString("en-IN")}</p>
                <span className="inline-block mt-2 text-[11px] font-semibold tracking-[0.12em] uppercase underline underline-offset-4 decoration-ink/30 group-hover:decoration-ink">View item</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
