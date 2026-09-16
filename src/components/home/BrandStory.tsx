import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Droplets, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/motion";

// Optional lifestyle image. Empty → styled gradient panel (no broken image).
const STORY_IMAGE = "";

const PILLARS = [
  { Icon: Sparkles, label: "Anti-Tarnish" },
  { Icon: Droplets, label: "Waterproof" },
  { Icon: ShieldCheck, label: "Nickel-Free" },
];

export default function BrandStory() {
  return (
    <section className="relative py-24 lg:py-32 bg-ink overflow-hidden">
      {/* soft brand glows */}
      <div className="absolute inset-0 opacity-[0.12] pointer-events-none">
        <div className="absolute top-0 left-0 w-72 h-72 bg-accent rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-metal rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="container-premium relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Visual */}
          <Reveal y={20}>
            <div className="relative aspect-[4/5] lg:aspect-square rounded-3xl overflow-hidden border border-white/10">
              {STORY_IMAGE ? (
                <Image src={STORY_IMAGE} alt="SatvaStones jewellery, worn every day" fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-accent-strong/40 via-ink to-ink">
                  <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-accent/25 blur-2xl" />
                  <span className="absolute inset-0 flex items-center justify-center font-serif text-3xl tracking-[0.28em] uppercase text-white/25">
                    SatvaStones
                  </span>
                </div>
              )}
            </div>
          </Reveal>

          {/* Copy */}
          <Reveal y={20} delay={0.05} className="text-center lg:text-left">
            <span className="label-sm text-metal">Our story</span>
            <h2 className="heading-section text-white mt-4 mb-6">
              Crafted For Real Life,
              <br />
              <span className="text-accent">Made To Last</span>
            </h2>
            <p className="text-white/70 leading-relaxed max-w-md mx-auto lg:mx-0 mb-8">
              SatvaStones began with a simple idea: everyday jewellery shouldn&apos;t fade, irritate or
              be saved for special occasions. Our anti-tarnish, waterproof pieces are made in India to
              stay bright through showers, workouts and everything in between — luxury you can actually live in.
            </p>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
              {PILLARS.map(({ Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 text-xs font-medium text-white/80">
                  <Icon className="w-4 h-4 text-metal" strokeWidth={1.75} />
                  {label}
                </span>
              ))}
            </div>

            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-white hover:text-accent transition-colors"
            >
              Read our story
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
