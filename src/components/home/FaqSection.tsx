"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface Faq {
  _id: string;
  question: string;
  answer: string;
}

export default function FaqSection({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 lg:py-14" style={{ background: '#f79da6' }}>
      <div className="mx-auto max-w-3xl px-3 sm:px-4 md:px-8">
        <h2 className="font-heading text-lg sm:text-xl lg:text-3xl font-bold text-center text-gray-900 mb-4 sm:mb-6 lg:mb-10 italic">
          FAQ
        </h2>
        
        <div className="space-y-2 sm:space-y-2.5 lg:space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq._id}
              className="bg-white rounded-lg lg:rounded-xl overflow-hidden border border-[#f2707f]/30"
            >
              <button
                onClick={() => setOpenId(openId === faq._id ? null : faq._id)}
                className="w-full flex items-center justify-between p-3 sm:p-4 lg:p-5 text-left"
              >
                <span className="text-xs sm:text-sm font-medium text-gray-900 pr-3 lg:pr-4">
                  {faq.question}
                </span>
                {openId === faq._id ? (
                  <Minus className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4535f] flex-shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4535f] flex-shrink-0" />
                )}
              </button>
              {openId === faq._id && (
                <div className="px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 lg:pb-5">
                  <p className="text-[11px] sm:text-xs lg:text-sm text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
