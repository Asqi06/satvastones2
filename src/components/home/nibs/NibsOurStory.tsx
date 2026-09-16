import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NibsOurStory() {
  return (
    <section className="grid lg:grid-cols-2 border-y border-line bg-surface" aria-label="Our story">
      <div className="relative min-h-[460px] lg:min-h-[620px]">
        <Image
          src="/about_founder_ananya_1774677692958.png"
          alt="The founder of SatvaStones"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <p className="absolute bottom-6 left-6 font-serif text-2xl italic text-white drop-shadow-md sm:bottom-8 sm:left-8">
          More wearing it. Less saving it.
        </p>
      </div>
      <div className="flex flex-col justify-center px-6 py-16 sm:px-10 lg:px-[clamp(3rem,8vw,9rem)] lg:py-24">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-accent-strong">A note from SatvaStones</p>
        <h2 className="mt-5 font-serif text-4xl leading-[0.95] tracking-[-0.035em] text-ink sm:text-5xl lg:text-6xl">
          Life happens.<br />
          <em className="font-normal text-accent-strong">Keep the gold on.</em>
        </h2>
        <p className="mt-7 max-w-md text-sm leading-7 text-ink-soft">
          Jewellery should be part of the ordinary days too. We curate Korean-inspired pieces with a waterproof, anti-tarnish finish so your favourite details can come along for the ride.
        </p>
        <Link href="/about" className="mt-8 inline-flex items-center gap-3 self-start text-[11px] font-semibold tracking-[0.13em] uppercase text-ink underline decoration-line-strong underline-offset-8 transition-colors hover:text-accent-strong">
          Meet our world <ArrowRight className="w-4 h-4" />
        </Link>
        <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-line pt-6 max-w-md">
          <div>
            <dt className="font-serif text-3xl text-accent-strong">Daily</dt>
            <dd className="mt-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-ink-mute">Wearable shine</dd>
          </div>
          <div>
            <dt className="font-serif text-3xl text-accent-strong">Thoughtful</dt>
            <dd className="mt-1 text-[10px] font-semibold tracking-[0.12em] uppercase text-ink-mute">Gift-ready details</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
