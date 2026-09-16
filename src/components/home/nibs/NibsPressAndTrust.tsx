import { Star, ShieldCheck, Droplets, Truck, BadgeCheck } from "lucide-react";
import Link from "next/link";

const TRUST_POINTS = [
  { icon: ShieldCheck, title: "Anti-Tarnish", desc: "Coated for lasting shine" },
  { icon: Droplets, title: "Waterproof", desc: "Rain, sweat & splash safe" },
  { icon: Truck, title: "Free Shipping", desc: "Prepaid orders over ₹399" },
  { icon: BadgeCheck, title: "COD Available", desc: "Across India + tracking" },
];

export default function NibsPressAndTrust() {
  return (
    <section className="bg-canvas/40 py-10 lg:py-14 border-y border-line/60" aria-label="Press and reviews">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        <div className="rounded-[24px] bg-surface border border-line/60 shadow-[var(--shadow-soft)] px-6 sm:px-10 py-8 lg:py-10">
          <p className="text-center text-[10px] font-semibold tracking-[0.22em] uppercase text-ink-mute mb-6">Why customers love SatvaStones</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            {TRUST_POINTS.map((t) => {
              const Icon = t.icon;
              return (
                <div key={t.title} className="flex items-center gap-3 p-4 rounded-2xl bg-canvas/70 border border-line/60">
                  <div className="w-10 h-10 rounded-full bg-white border border-line flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Icon className="w-4 h-4 text-accent-strong" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold tracking-wide text-ink leading-none">{t.title}</p>
                    <p className="text-[11px] text-ink-mute leading-tight mt-1">{t.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 h-px bg-gradient-to-r from-transparent via-line to-transparent" />

          <div className="pt-8 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-canvas border border-line mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-ink text-ink" />
              ))}
              <span className="ml-2 text-xs font-semibold text-ink">4.8 / 5</span>
            </div>
            <p className="font-serif text-xl sm:text-2xl text-ink italic leading-relaxed text-balance">“Lightweight, anti-tarnish jewellery I wear every day — still shining.”</p>
            <p className="text-xs tracking-wide text-ink-mute mt-2">Skin-safe · Nickel-free · Gift-ready packaging</p>
            <Link href="/shop" className="inline-flex mt-6 px-6 py-2.5 rounded-full bg-ink text-white text-xs font-semibold tracking-[0.14em] uppercase hover:bg-accent-strong transition-colors shadow">
              Shop Bestsellers
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
