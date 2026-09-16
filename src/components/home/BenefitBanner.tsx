import { Sparkles, Droplets, Truck, ShieldCheck, Wallet } from "lucide-react";

const BENEFITS = [
  { label: "Anti-Tarnish", sub: "Keeps its shine", Icon: Sparkles },
  { label: "Waterproof", sub: "Shower & swim ready", Icon: Droplets },
  { label: "Free Shipping", sub: "On orders ₹399+", Icon: Truck },
  { label: "Skin-Safe", sub: "Nickel-free & hypoallergenic", Icon: ShieldCheck },
  { label: "COD Available", sub: "Pay on delivery", Icon: Wallet },
];

export default function BenefitBanner() {
  return (
    <section className="bg-canvas-2 border-b border-line" aria-label="Why shop with SatvaStones">
      <div className="container-premium">
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-4 lg:py-5 divide-line">
          {BENEFITS.map(({ label, sub, Icon }) => (
            <li key={label} className="flex items-center gap-3 px-1">
              <span className="w-9 h-9 rounded-full bg-surface border border-line flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-metal" strokeWidth={1.75} />
              </span>
              <span className="leading-tight">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink">{label}</span>
                <span className="block text-[11px] text-ink-mute">{sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
