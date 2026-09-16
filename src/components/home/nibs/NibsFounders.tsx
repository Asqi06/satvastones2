import Link from "next/link";

export default function NibsFounders() {
  return (
    <section className="bg-canvas/40 py-10 lg:py-14" aria-label="Founders story">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        <div className="rounded-[24px] lg:rounded-[28px] overflow-hidden bg-[#F8D4CB]/60 border border-line/60 grid grid-cols-1 lg:grid-cols-2 gap-0">
          <div className="p-8 sm:p-10 lg:p-14 flex flex-col justify-center text-center lg:text-left">
            <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-ink-mute mb-3">Women-led · Independent</p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] leading-[1.05] tracking-[-0.02em] text-ink">A Studio with Heart</h2>
            <p className="text-sm text-ink-soft leading-relaxed mt-4 max-w-[48ch] mx-auto lg:mx-0">Thanks for supporting our women-led studio — every earring, necklace & ring is quality-checked, anti-tarnish and made for everyday wear.</p>
            <div className="mt-7 flex flex-wrap justify-center lg:justify-start gap-3">
              <Link href="/about" className="inline-flex px-6 py-3 rounded-full bg-ink text-white text-xs font-semibold tracking-[0.14em] uppercase hover:bg-accent-strong transition-colors shadow">Read story</Link>
              <Link href="/shop" className="inline-flex px-6 py-3 rounded-full bg-white border border-line text-xs font-semibold tracking-[0.14em] uppercase text-ink hover:border-ink transition-colors">Shop now</Link>
            </div>
            <p className="text-[11px] text-ink-mute mt-6">* We donate a portion of profits to charity.</p>
          </div>
          <div className="relative min-h-[380px] sm:min-h-[440px] lg:min-h-[520px] bg-white overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1400&auto=format&fit=crop" alt="Founders" className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
