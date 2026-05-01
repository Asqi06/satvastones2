"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Mumbai",
    rating: 5,
    text: "Absolutely stunning pieces! The Korean earrings I ordered were exactly as shown. The quality is exceptional and the packaging was beautiful.",
    product: "Korean Pearl Drop Earrings",
  },
  {
    name: "Ananya Reddy",
    location: "Hyderabad",
    rating: 5,
    text: "I've been shopping from Satvastones for months now. Their Western collection is unmatched. Every piece feels luxurious.",
    product: "Western Crystal Necklace",
  },
  {
    name: "Meera Patel",
    location: "Ahmedabad",
    rating: 5,
    text: "The traditional Kundan set I bought for my sister's wedding was breathtaking. Everyone complimented it. Will definitely order again!",
    product: "Traditional Kundan Set",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-[#C9A96E] text-sm tracking-[0.3em] uppercase mb-3">
            What Our Customers Say
          </p>
          <h2 className="text-3xl lg:text-4xl font-serif text-white">
            Loved by Thousands
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="bg-[#1a1a1a] rounded-2xl p-8 border border-[#2a2a2a] hover:border-[#C9A96E]/20 transition-colors"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-[#C9A96E] text-[#C9A96E]" />
                ))}
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                &quot;{t.text}&quot;
              </p>
              <div className="border-t border-[#2a2a2a] pt-4">
                <p className="text-white font-medium text-sm">{t.name}</p>
                <p className="text-gray-500 text-xs">{t.location}</p>
                <p className="text-[#C9A96E] text-xs mt-1">Purchased: {t.product}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
