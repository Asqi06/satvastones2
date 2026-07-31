import { Lock, ShieldCheck, Award, Truck, RefreshCw, Banknote } from "lucide-react";

const securityBadges = [
  { icon: Lock, text: "256-bit SSL Encrypted" },
  { icon: ShieldCheck, text: "Razorpay Secured" },
  { icon: Award, text: "BIS Hallmark Certified" },
  { icon: Truck, text: "Insured Delivery" },
  { icon: RefreshCw, text: "30-Day Returns" },
  { icon: Banknote, text: "Cash on Delivery" },
];

export default function PaymentSecurityBadges() {
  return (
    <div className="mt-8">
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {securityBadges.map((badge, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-luxury-brown/70">
            <badge.icon className="w-4 h-4 text-luxury-gold" />
            <span>{badge.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}