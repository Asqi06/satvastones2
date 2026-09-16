import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NibsSplitBottom() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-white" aria-label="Collections for family">
      {[
        { title: "Korean Edit", desc: "Minimalist hoops, pearls & dainty rings inspired by Seoul street style.", href: "/shop?style=KOREAN", img: "/silver-jewellery-category.jpg" },
        { title: "Gifts For Her", desc: "Necklaces, bracelets & gift-ready sets under ₹999 for birthdays & anniversaries.", href: "/shop/necklaces", img: "/gold-jewellery-category.jpg" },
      ].map((c) => (
        <div key={c.title} className="relative h-[480px] sm:h-[560px] lg:h-[620px] overflow-hidden rounded-2xl border border-line group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          <div className="absolute inset-0 p-7 sm:p-10 flex flex-col justify-end">
            <h3 className="font-serif text-3xl sm:text-4xl text-white tracking-[-0.02em]">{c.title}</h3>
            <p className="text-sm text-white/85 mt-2 max-w-[36ch]">{c.desc}</p>
            <Link href={c.href} className="mt-5 inline-flex items-center gap-2 self-start px-6 py-3 rounded-full bg-white text-ink text-xs font-semibold tracking-[0.14em] uppercase hover:bg-canvas shadow-lg transition-colors">
              Shop now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}
