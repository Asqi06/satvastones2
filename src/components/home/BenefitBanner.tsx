"use client";

import { Diamond, ShieldCheck, Gift, Truck, Zap } from "lucide-react";

export default function BenefitBanner() {
  const BENEFITS = [
    { label: "COMPLIMENTARY TRANSIT ABOVE ₹1999", icon: Truck },
    { label: "ARTISANAL HANDCRAFTED", icon: Diamond },
    { label: "BOUTIQUE LUXURY PACKAGING", icon: Gift },
    { label: "EXCLUSIVE HERITAGE OFFERS", icon: Zap },
    { label: "AUTHENTIC PRECIOUS GEMSTONES", icon: ShieldCheck },
  ];

  return (
    <div className="bg-[var(--luxury-accent)] py-6 border-b border-[var(--luxury-border)] overflow-hidden w-full relative group">
      <div className="flex animate-benefits pause-on-hover px-4">
        {/* Sequence A */}
        <div className="flex items-center gap-16 lg:gap-24 whitespace-nowrap pl-16 lg:pl-24">
          {BENEFITS.map((benefit, i) => (
            <div key={i} className="flex items-center gap-4 text-[var(--luxury-brown)] transition-all hover:text-[var(--luxury-gold)] shrink-0 group/item cursor-default">
              <benefit.icon className="w-4 h-4 text-[var(--luxury-gold)] opacity-80 group-hover/item:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="label-sm italic">{benefit.label}</span>
              <span className="text-[var(--luxury-gold)]/30 ml-8 lg:ml-20">✦</span>
            </div>
          ))}
        </div>
        
        {/* Sequence B (Loop) */}
        <div className="flex items-center gap-16 lg:gap-24 whitespace-nowrap pl-16 lg:pl-24">
          {BENEFITS.map((benefit, i) => (
            <div key={i + 10} className="flex items-center gap-4 text-[var(--luxury-brown)] transition-all hover:text-[var(--luxury-gold)] shrink-0 group/item cursor-default">
              <benefit.icon className="w-4 h-4 text-[var(--luxury-gold)] opacity-80 group-hover/item:scale-110 transition-transform" strokeWidth={1.5} />
              <span className="label-sm italic">{benefit.label}</span>
              <span className="text-[var(--luxury-gold)]/30 ml-8 lg:ml-20">✦</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
