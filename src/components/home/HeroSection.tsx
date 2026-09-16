"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Droplets, Truck } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { EASE_OUT } from "@/components/motion";

// Optional hero photograph. Leave empty to render the styled gradient composition
// (no broken image). Set to a /public path once brand imagery is supplied.
const HERO_IMAGE = "";

const CHIPS = [
  { label: "Anti-Tarnish", Icon: Sparkles },
  { label: "Waterproof", Icon: Droplets },
  { label: "Free Shipping ₹399+", Icon: Truck },
];

const parent: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const child: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

export default function HeroSection() {
  const reduce = useReducedMotion();

  const eyebrow = (
    <span className="inline-flex items-center gap-2 label-sm text-accent-strong">
      <span className="w-8 h-px bg-accent-strong/50" />
      New In · Korean Aesthetic
    </span>
  );
  const heading = (
    <h1 className="heading-hero text-ink">
      Everyday Luxury,
      <br />
      <span className="text-accent-strong">Tarnish-Free.</span>
    </h1>
  );
  const copy = (
    <p className="text-lg text-ink-soft max-w-md leading-relaxed">
      Anti-tarnish, waterproof jewellery designed for real life — gold &amp; silver-plated pieces that
      stay bright through every shower, workout and everyday moment.
    </p>
  );
  const ctas = (
    <div className="flex flex-wrap items-center gap-4">
      <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
        Shop the collection
        <ArrowRight className="w-4 h-4" />
      </Link>
      <Link href="/shop?sort=newest" className="btn-secondary">
        New arrivals
      </Link>
    </div>
  );
  const chips = (
    <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
      {CHIPS.map(({ label, Icon }) => (
        <span key={label} className="inline-flex items-center gap-2 text-xs font-medium text-ink-soft">
          <Icon className="w-4 h-4 text-metal" />
          {label}
        </span>
      ))}
    </div>
  );

  return (
    <section className="relative w-full overflow-hidden bg-canvas">
      {/* Background: supplied image, else styled gradient composition */}
      <div className="absolute inset-0">
        {HERO_IMAGE ? (
          <Image src={HERO_IMAGE} alt="SatvaStones anti-tarnish jewellery" fill priority sizes="100vw" className="object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blush via-canvas to-sage">
            <div className="absolute top-1/4 right-[8%] w-[38vw] h-[38vw] max-w-[520px] max-h-[520px] rounded-full bg-accent/30 blur-3xl" />
            <div className="absolute bottom-0 left-[10%] w-[28vw] h-[28vw] max-w-[380px] max-h-[380px] rounded-full bg-metal-soft/40 blur-3xl" />
          </div>
        )}
        {HERO_IMAGE && (
          <div className="absolute inset-0 bg-gradient-to-r from-canvas via-canvas/70 to-transparent lg:w-3/5" />
        )}
      </div>

      <div className="container-premium relative flex flex-col justify-center min-h-[86vh] py-24">
        {reduce ? (
          <div className="max-w-xl space-y-6">
            {eyebrow}
            {heading}
            {copy}
            {ctas}
            {chips}
          </div>
        ) : (
          <motion.div className="max-w-xl space-y-6" variants={parent} initial="hidden" animate="visible">
            <motion.div variants={child}>{eyebrow}</motion.div>
            <motion.div variants={child}>{heading}</motion.div>
            <motion.div variants={child}>{copy}</motion.div>
            <motion.div variants={child}>{ctas}</motion.div>
            <motion.div variants={child}>{chips}</motion.div>
          </motion.div>
        )}
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2">
        <span className="text-[10px] uppercase tracking-[0.3em] text-ink-mute">Scroll</span>
        <span className="w-px h-8 bg-ink-mute/40 motion-safe:animate-bounce" />
      </div>
    </section>
  );
}
