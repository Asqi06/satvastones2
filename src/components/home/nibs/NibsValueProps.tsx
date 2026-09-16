import { Truck, Clock, Sparkles, Package } from "lucide-react";

const PROPS = [
  { icon: Truck, title: "Free Delivery", desc: "Above ₹399 across India" },
  { icon: Clock, title: "Express Dispatch", desc: "24–48h with live tracking" },
  { icon: Sparkles, title: "Anti-Tarnish", desc: "Waterproof · skin-safe" },
  { icon: Package, title: "Gift-Ready", desc: "Sustainable & COD available" },
];

export default function NibsValueProps() {
  return (
    <section className="bg-white py-8 lg:py-10 border-y border-line/60" aria-label="Brand guarantees">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {PROPS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex items-center gap-3 sm:gap-4 p-4 rounded-2xl bg-canvas/70 border border-line/60">
                <div className="w-10 h-10 rounded-full bg-surface border border-line flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon className="w-4 h-4 text-metal" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-semibold tracking-wide text-ink leading-none">{item.title}</h3>
                  <p className="text-[11px] text-ink-mute leading-tight mt-1">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
