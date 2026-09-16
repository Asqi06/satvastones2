import { Lock, ShieldCheck, Truck, Sparkles, Banknote } from "lucide-react";

const securityBadges = [
  { icon: Lock, text: "Secure checkout" },
  { icon: ShieldCheck, text: "Razorpay secured" },
  { icon: Sparkles, text: "Gift-ready packaging" },
  { icon: Truck, text: "Free shipping over Rs. 399" },
  { icon: Banknote, text: "Cash on Delivery" },
];

export default function PaymentSecurityBadges() {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-center gap-x-6 gap-y-3 flex-wrap border-y border-[var(--line)] py-5">
        {securityBadges.map((badge, i) => (
          <div key={i} className="flex items-center gap-2 text-[11px] text-[var(--muted)]">
            <badge.icon className="w-4 h-4 text-[var(--olive)]" strokeWidth={1.5} />
            <span>{badge.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
