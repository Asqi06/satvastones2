import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NibsSplitEditorial() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-canvas/30" aria-label="Featured categories">
      {[
        { title: "New In", sub: "Fresh Korean drops, just landed", href: "/shop?sort=newest", img: "/silver-jewellery-category.jpg" },
        { title: "Bestselling Gifts", sub: "Gifts for her under ₹999", href: "/shop/rings", img: "/gold-jewellery-category.jpg" },
      ].map((col) => (
        <div key={col.title} className="relative h-[420px] sm:h-[520px] lg:h-[640px] overflow-hidden rounded-2xl bg-canvas border border-line group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={col.img} alt={col.title} className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-[1.04] transition-transform duration-700 ease-out" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-center justify-end text-center p-6 sm:p-8 pb-8">
            <p className="text-[10px] tracking-[0.24em] uppercase text-white/80 font-semibold mb-2">{col.sub}</p>
            <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-white font-light tracking-[-0.02em] mb-4">{col.title}</h3>
            <Link href={col.href} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-ink text-xs font-semibold tracking-[0.14em] uppercase hover:bg-canvas shadow-lg transition-colors">
              Shop Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}
