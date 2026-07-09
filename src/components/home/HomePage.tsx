import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Star, Heart, Gift, Package, Store, ChevronRight, Facebook, Instagram, Twitter } from 'lucide-react';

const ASSETS = {
  hero: 'https://images.unsplash.com/photo-1515562141207-7a18b2ce73f3?auto=format&fit=crop&q=80&w=1800',
  bracelet: 'https://images.unsplash.com/photo-1611591437281-460fbbe139a4?auto=format&fit=crop&q=80&w=800',
  charm: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800',
  earrings: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
  ring: 'https://images.unsplash.com/photo-1605100804763-047af5f6f791?auto=format&fit=crop&q=80&w=800',
  necklace: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?auto=format&fit=crop&q=80&w=800',
  layering: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&q=80&w=1000',
  giftBox: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?auto=format&fit=crop&q=80&w=1000',
  darkHairedWoman: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1000',
  stackingRings: 'https://images.unsplash.com/photo-1605100804763-047af5f6f791?auto=format&fit=crop&q=80&w=600',
  charmBead: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=600',
};

const COLLECTIONS = [
  { title: 'BRACELETS', image: ASSETS.bracelet, color: '#fdf2f8' },
  { title: 'CHARMS', image: ASSETS.charm, color: '#faf5ff' },
  { title: 'EARRINGS', image: ASSETS.earrings, color: '#fce7f3' },
  { title: 'RINGS', image: ASSETS.ring, color: '#fff1f2' },
  { title: 'NECKLACES', image: ASSETS.necklace, color: '#fdf4ff' },
];

const TRENDING = [
  { title: 'MIX & MATCH CHARMS', sub: 'DISCOVER THEIR FAVORITES', image: ASSETS.charm },
  { title: 'STACKABLE RINGS', sub: 'SHOP THE LOOK', image: ASSETS.ring },
  { title: 'LAYERED NECKLACES', sub: 'CURATE YOUR SET', image: ASSETS.layering },
  { title: 'LIMITED EDITION PENDANT', sub: 'A STATEMENT PIECE', image: ASSETS.necklace },
];

const DISCOVER_LEFT = [
  { title: 'STORY OF THE STONE', desc: 'Learn about our ethically sourced materials and the journey from mine to masterpiece.', image: ASSETS.stackingRings },
  { title: 'OUR CREATION PROCESS', desc: 'Discover how our artisans bring each piece to life through traditional techniques.', image: ASSETS.earrings },
];

export default function HomePage({ navigateTo }: { navigateTo: (view: string, data?: any) => void }) {
  const [email, setEmail] = useState('');

  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="relative w-full overflow-hidden bg-[#ffffff]">
        <div className="relative mx-auto max-w-[1440px]">
          <div className="relative aspect-[4/3] md:aspect-[21/9] lg:aspect-[3/1] overflow-hidden">
            <img
              src={ASSETS.hero}
              alt="Luxury jewelry collection"
              fetchpriority="high"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <h1 className="font-['Georgia',serif] text-4xl tracking-wide text-white md:text-6xl lg:text-7xl xl:text-8xl" style={{ fontWeight: 400, letterSpacing: '0.05em' }}>
                IGNITE YOUR<br />BRILLIANCE
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-relaxed tracking-wider text-white/80 md:text-base" style={{ fontFamily: "'Inter',sans-serif", fontWeight: 300 }}>
                Find a world of meticulously crafted jewelry that reflects your unique style and celebrates every moment. Explore our curated collections for her.
              </p>
              <p className="mt-2 text-xs tracking-widest text-white/50" style={{ fontFamily: "'Inter',sans-serif" }}>#SatvaAtHome</p>
            </div>
          </div>

          {/* CTA Box */}
          <div className="absolute -bottom-10 left-1/2 z-10 hidden w-full max-w-3xl -translate-x-1/2 bg-white shadow-2xl md:block" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
            <div className="flex items-center justify-between px-8 py-5">
              <div className="text-xs font-semibold tracking-[0.15em] text-[#b76e79]" style={{ fontFamily: "'Inter',sans-serif", textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                Exclusive Offer
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="email"
                  placeholder="JOIN OUR LIST"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-48 border-b border-[#e5e5e5] px-2 py-1.5 text-xs tracking-widest text-[#333] outline-none"
                  style={{ fontFamily: "'Inter',sans-serif", fontWeight: 500, letterSpacing: '0.1em' }}
                />
                <button className="text-[#b76e79] hover:text-[#8a4f58] transition-colors">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#333]" style={{ fontFamily: "'Inter',sans-serif" }}>
                <Star className="h-4 w-4 text-[#b76e79]" fill="#b76e79" />
                GET 15% OFF YOUR FIRST ORDER
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacer for CTA box overlap */}
      <div className="h-12 md:hidden" />
      <div className="hidden h-16 md:block" />

      {/* ===== EXPLORE THE COLLECTIONS ===== */}
      <section className="bg-[#ffffff] py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-12 text-center text-3xl tracking-[0.02em] text-[#222] md:text-4xl lg:text-5xl" style={{ fontFamily: "'Georgia',serif", fontWeight: 400 }}>
            EXPLORE THE COLLECTIONS
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
            {COLLECTIONS.map((item) => (
              <div
                key={item.title}
                onClick={() => navigateTo('shop', { category: item.title.toLowerCase() })}
                className="group cursor-pointer"
              >
                <div className="relative aspect-square overflow-hidden" style={{ backgroundColor: item.color }}>
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                <p className="mt-3 text-center text-[10px] font-semibold tracking-[0.2em] text-[#666]" style={{ fontFamily: "'Inter',sans-serif" }}>
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FIND THE PERFECT GIFT ===== */}
      <section className="bg-[#fafafa] py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-12 text-center text-3xl tracking-[0.02em] text-[#222] md:text-4xl lg:text-5xl" style={{ fontFamily: "'Georgia',serif", fontWeight: 400 }}>
            FIND THE PERFECT GIFT
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="group relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => navigateTo('shop', { category: 'necklaces' })}>
              <img src={ASSETS.layering} alt="For the trendsetter" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-xl font-semibold tracking-wider text-white md:text-2xl" style={{ fontFamily: "'Georgia',serif" }}>FOR THE TRENDSETTER</p>
                <p className="mt-1 text-xs tracking-[0.15em] text-white/70" style={{ fontFamily: "'Inter',sans-serif" }}>SHOP LAYERED NECKLACES</p>
              </div>
            </div>
            <div className="group relative aspect-[4/5] overflow-hidden cursor-pointer" onClick={() => navigateTo('shop', { category: 'gifts' })}>
              <img src={ASSETS.giftBox} alt="Gift boxed earrings" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <p className="text-xl font-semibold tracking-wider text-white md:text-2xl" style={{ fontFamily: "'Georgia',serif" }}>GIFT BOXED EARRINGS</p>
                <p className="mt-1 text-xs tracking-[0.15em] text-white/70" style={{ fontFamily: "'Inter',sans-serif" }}>SHOP THE COLLECTION</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRENDING COLLECTION ===== */}
      <section className="bg-[#ffffff] py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-12 text-center text-3xl tracking-[0.02em] text-[#222] md:text-4xl lg:text-5xl" style={{ fontFamily: "'Georgia',serif", fontWeight: 400 }}>
            TRENDING COLLECTION
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TRENDING.map((item) => (
              <div key={item.title} className="group cursor-pointer" onClick={() => navigateTo('shop')}>
                <div className="relative aspect-square overflow-hidden bg-[#f5f5f5]">
                  <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm font-semibold tracking-[0.05em] text-[#222]" style={{ fontFamily: "'Georgia',serif" }}>{item.title}</p>
                  <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-[#999]" style={{ fontFamily: "'Inter',sans-serif" }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <span key={i} className={`h-2 w-2 rounded-full ${i === 0 ? 'bg-[#222]' : 'bg-[#ddd]'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ===== DISCOVER SATVASTONES ===== */}
      <section className="bg-[#fafafa] py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="flex flex-col gap-6">
              {DISCOVER_LEFT.map((item) => (
                <div key={item.title} className="group relative aspect-[16/10] overflow-hidden cursor-pointer" onClick={() => navigateTo('shop')}>
                  <img src={item.image} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-xl font-semibold tracking-wider text-white md:text-2xl" style={{ fontFamily: "'Georgia',serif" }}>{item.title}</p>
                    <p className="mt-1 text-xs tracking-[0.1em] text-white/70" style={{ fontFamily: "'Inter',sans-serif" }}>{item.desc}</p>
                    <p className="mt-3 text-[10px] font-semibold tracking-[0.2em] text-white underline underline-offset-4" style={{ fontFamily: "'Inter',sans-serif" }}>LEARN MORE</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="group relative aspect-square md:aspect-auto overflow-hidden cursor-pointer" onClick={() => navigateTo('shop')}>
              <img src={ASSETS.darkHairedWoman} alt="Up to 30% off selected styles" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-3xl font-semibold tracking-wider text-white md:text-4xl lg:text-5xl" style={{ fontFamily: "'Georgia',serif" }}>
                  UP TO 30% OFF<br />SELECTED STYLES
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateTo('shop'); }}
                  className="mt-6 bg-white px-8 py-3 text-xs font-semibold tracking-[0.15em] text-[#222] transition-colors hover:bg-[#f0f0f0]"
                  style={{ fontFamily: "'Inter',sans-serif" }}
                >
                  SHOP SALE
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PREMIUM MATERIALS ===== */}
      <section className="bg-[#ffffff] py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
            <div className="relative aspect-square overflow-hidden bg-[#faf5ff]">
              <img src={ASSETS.charmBead} alt="Premium materials" loading="lazy" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="mb-8 text-3xl tracking-[0.02em] text-[#222] md:text-4xl lg:text-5xl" style={{ fontFamily: "'Georgia',serif", fontWeight: 400 }}>
                PREMIUM MATERIALS
              </h2>
              <div className="space-y-6">
                {[
                  { label: 'ECO-FRIENDLY', desc: 'Crafted using 100% recycled gold and silver for a reduced footprint. Learn about our ethical sourcing.' },
                  { label: 'FREE CLEANING', desc: 'Professional-grade cleaning service available at all locations. Contact support for details.' },
                  { label: 'EASY TO CLEAN', desc: 'Simple home care instructions with every purchase to keep your jewelry brilliant.' },
                ].map((item) => (
                  <div key={item.label} className="border-b border-[#eee] pb-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold tracking-[0.1em] text-[#222]" style={{ fontFamily: "'Inter',sans-serif" }}>{item.label}</p>
                      <span className="text-xl text-[#b76e79]">+</span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed tracking-wide text-[#888]" style={{ fontFamily: "'Inter',sans-serif" }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECONDARY CTA ===== */}
      <section className="bg-[#fafafa] py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 bg-white px-8 py-6 shadow-lg md:flex-row" style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.06)' }}>
            <div className="text-xs font-semibold tracking-[0.15em] text-[#b76e79]" style={{ fontFamily: "'Inter',sans-serif", textTransform: 'uppercase' }}>
              Exclusive Offer
            </div>
            <div className="flex items-center gap-3">
              <input
                type="email"
                placeholder="JOIN OUR LIST"
                className="w-40 border-b border-[#e5e5e5] px-2 py-1.5 text-xs tracking-widest text-[#333] outline-none md:w-48"
                style={{ fontFamily: "'Inter',sans-serif", fontWeight: 500, letterSpacing: '0.1em' }}
              />
              <button className="text-[#b76e79] hover:text-[#8a4f58] transition-colors">
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#333]" style={{ fontFamily: "'Inter',sans-serif" }}>
              <Star className="h-4 w-4 text-[#b76e79]" fill="#b76e79" />
              GET 15% OFF YOUR FIRST ORDER
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER VALUE PROPS ===== */}
      <section className="border-y border-[#eee] bg-[#ffffff] py-10">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: Heart, label: 'WISH LIST', desc: 'Create and share curated lists.' },
              { icon: Package, label: 'FAST SHIP ONLINE', desc: 'Trackable, insured, and expedited options.' },
              { icon: Gift, label: 'GIFT BOXED', desc: 'Our signature packaging with every order.' },
              { icon: Store, label: 'STORE FINDER', desc: 'Find a premier location near you.' },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center border border-[#fce7f3] bg-[#fff5f7]">
                  <item.icon className="h-5 w-5 text-[#b76e79]" />
                </div>
                <p className="mt-3 text-[10px] font-semibold tracking-[0.2em] text-[#222]" style={{ fontFamily: "'Inter',sans-serif" }}>{item.label}</p>
                <p className="mt-1 text-[9px] tracking-wide text-[#999]" style={{ fontFamily: "'Inter',sans-serif" }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== JOIN SATVASTONES ===== */}
      <section className="bg-[#fdf2f8] py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <p className="text-3xl tracking-[0.02em] text-[#222] md:text-4xl" style={{ fontFamily: "'Georgia',serif", fontWeight: 400 }}>
                JOIN THE WORLD OF <span className="font-bold">SATVASTONES</span>
              </p>
              <p className="mt-2 text-xs tracking-[0.1em] text-[#888]" style={{ fontFamily: "'Inter',sans-serif" }}>
                Unlock exclusive access to early collections, special events, and personalized offers. Join the list.
              </p>
            </div>
            <button
              onClick={() => navigateTo('contact')}
              className="inline-flex items-center gap-2 bg-[#222] px-8 py-4 text-[10px] font-semibold tracking-[0.2em] text-white transition-colors hover:bg-[#444]"
              style={{ fontFamily: "'Inter',sans-serif" }}
            >
              SIGN UP <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER LINKS ===== */}
      <section className="bg-[#ffffff] py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            {[
              {
                title: 'SHOP',
                links: ['PROMOTIONS', 'CHARMS', 'BRACELETS', 'RINGS', 'COLLECTIONS', 'ENGRAVINGS', 'GIFTS'],
              },
              {
                title: 'CUSTOMER SERVICE',
                links: ['FAQs', 'SHIPPING', 'RETURNS', 'WARRANTY', 'CONTACT US', 'ORDER TRACKING'],
              },
              {
                title: 'OUR SERVICES',
                links: ['CUSTOM ORDERS', 'GIFT CARDS', 'CLEANING SERVICES', 'STORE LOCATOR'],
              },
              {
                title: 'ABOUT SATVASTONES',
                links: ['OUR STORY', 'DESIGN PHILOSOPHY', 'MATERIALS & CRAFT', 'PRESS', 'POLICIES'],
              },
            ].map((col) => (
              <div key={col.title}>
                <p className="mb-5 text-[10px] font-semibold tracking-[0.2em] text-[#222]" style={{ fontFamily: "'Inter',sans-serif" }}>{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        onClick={() => navigateTo('shop')}
                        className="text-[10px] font-medium tracking-[0.05em] text-[#888] transition-colors hover:text-[#222]"
                        style={{ fontFamily: "'Inter',sans-serif" }}
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL + LEGAL ===== */}
      <section className="border-t border-[#eee] bg-[#ffffff] py-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-6">
              {[
                { icon: Facebook, label: 'Facebook' },
                { icon: Twitter, label: 'Twitter' },
                { icon: Instagram, label: 'Instagram' },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.2em] text-[#888] transition-colors hover:text-[#222]"
                  style={{ fontFamily: "'Inter',sans-serif" }}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label.toUpperCase()}
                </button>
              ))}
            </div>
            <p className="text-[9px] font-medium tracking-[0.1em] text-[#aaa]" style={{ fontFamily: "'Inter',sans-serif" }}>
              &copy; {new Date().getFullYear()} SATVASTONES. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
