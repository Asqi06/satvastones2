import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const QUICK_LINKS = [
  { label: "Earrings", href: "/shop/earrings" },
  { label: "Necklaces", href: "/shop/necklaces" },
  { label: "Rings", href: "/shop/rings" },
  { label: "Bracelets", href: "/shop/bracelets" },
];

export default function NibsHero() {
  return (
    <section className="bg-canvas border-b border-line" aria-label="SatvaStones introduction">
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-2 min-h-[640px] lg:min-h-[720px]">
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-[clamp(3rem,8vw,9rem)] lg:py-24 order-2 lg:order-1">
          <p className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.18em] uppercase text-accent-strong">
            <Sparkles className="w-3.5 h-3.5" /> Made for your everyday
          </p>
          <h1 className="mt-6 font-serif text-[clamp(3.9rem,7vw,6.9rem)] leading-[0.88] tracking-[-0.035em] text-ink">
            A little shine.<br />
            Every <em className="font-normal text-accent-strong">day.</em>
          </h1>
          <p className="mt-7 max-w-md text-sm leading-7 text-ink-soft">
            Korean-inspired jewellery that keeps up with the coffee runs, big plans, and all the moments in between. Anti-tarnish, waterproof, and ready to wear.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/shop" className="inline-flex items-center gap-3 bg-accent-strong px-6 py-4 text-[11px] font-semibold tracking-[0.14em] uppercase text-white transition-colors hover:bg-accent-strong-hover">
              Find your everyday <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/about" className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink underline decoration-line-strong underline-offset-8 transition-colors hover:text-accent-strong">
              Our world
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-5 gap-y-3 border-t border-line pt-5">
            {QUICK_LINKS.map((link) => (
              <Link key={link.label} href={link.href} className="text-[10px] font-semibold tracking-[0.14em] uppercase text-ink-soft transition-colors hover:text-ink">
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="relative min-h-[470px] overflow-hidden bg-canvas-2 order-1 lg:order-2">
          <Image
            src="/hero.png"
            alt="SatvaStones anti-tarnish gold jewellery"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <p className="absolute left-5 top-5 border border-white/60 bg-surface/90 px-3 py-2 text-[9px] font-semibold tracking-[0.16em] uppercase text-ink sm:left-8 sm:top-8">
            The everyday edit / No. 01
          </p>
          <Link href="/shop?sort=newest" className="absolute bottom-5 left-5 right-5 flex items-center justify-between border border-white/70 bg-surface/95 px-4 py-4 text-ink transition-colors hover:bg-white sm:bottom-8 sm:left-8 sm:right-8 sm:px-5">
            <span>
              <span className="block text-[9px] font-semibold tracking-[0.16em] uppercase text-ink-mute">Meet your new plus-one</span>
              <span className="mt-1 block font-serif text-xl leading-none">Small details. Big feeling.</span>
            </span>
            <ArrowRight className="w-5 h-5 flex-shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
