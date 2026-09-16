import Image from "next/image";
import Link from "next/link";
import { Truck } from "lucide-react";
import { Reveal } from "@/components/motion";

// Optional bundle image. Empty → styled gradient panel (no broken image).
const BUNDLE_IMAGE = "";

const TIERS = [
  { badge: "2", label: "Buy 2", value: "10% off" },
  { badge: "3", label: "Buy 3 or more", value: "15% off" },
];

export default function BundleSection() {
  return (
    <section className="py-24 lg:py-32 bg-blush overflow-hidden">
      <div className="container-premium">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Copy */}
          <Reveal y={20} className="text-center lg:text-left">
            <span className="label-sm text-accent-strong">Bundle &amp; save</span>
            <h2 className="heading-section text-ink mt-4 mb-6">
              Build Your <span className="text-accent-strong">Stack</span>
            </h2>
            <p className="text-ink-soft leading-relaxed max-w-md mx-auto lg:mx-0 mb-8">
              Mix and match your favourites. The more you add, the more you save — layer rings, earrings
              and necklaces into one effortless everyday set.
            </p>

            <div className="space-y-3 mb-8 max-w-sm mx-auto lg:mx-0">
              {TIERS.map((t) => (
                <div key={t.badge} className="flex items-center gap-4 p-3 rounded-xl bg-surface border border-line">
                  <span className="w-9 h-9 rounded-full bg-accent-strong text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                    {t.badge}
                  </span>
                  <span className="text-sm text-ink font-medium">{t.label}</span>
                  <span className="ml-auto text-sm font-semibold text-accent-strong">{t.value}</span>
                </div>
              ))}
              <div className="flex items-center gap-3 px-3 pt-1 text-sm text-ink-soft">
                <Truck className="w-4 h-4 text-metal flex-shrink-0" />
                Free shipping on orders above <span className="font-semibold text-ink">₹399</span>
              </div>
            </div>

            <Link href="/shop" className="btn-primary inline-block">
              Shop &amp; save
            </Link>
          </Reveal>

          {/* Visual */}
          <Reveal y={20} delay={0.05}>
            <div className="relative aspect-square rounded-3xl overflow-hidden border border-line">
              {BUNDLE_IMAGE ? (
                <Image src={BUNDLE_IMAGE} alt="SatvaStones jewellery bundle" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent-soft via-surface to-metal-soft/40">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-accent/25 blur-3xl" />
                  <span className="absolute inset-0 flex items-center justify-center font-serif text-3xl tracking-[0.24em] uppercase text-accent-strong/25">
                    Stack &amp; Save
                  </span>
                </div>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
