import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
  badge?: string;
}

const FAQS: FAQItem[] = [
  {
    question: 'Will Satvastones jewellery really never turn my skin green or black?',
    badge: 'Zero Green Skin',
    answer:
      'Yes, 100% guaranteed. Traditional fashion jewellery turns skin green because it is made from cheap brass or copper alloys that react with human sweat to form copper carbonate. Satvastones uses certified hypoallergenic 316L medical stainless steel with a molecular 18K vacuum gold PVD coating. It is completely nickel-free, lead-free, and biologically inert.'
  },
  {
    question: 'Can I wear this jewellery in the daily shower, gym, or swimming pool?',
    badge: '100% Waterproof',
    answer:
      'Yes! Our jewellery is engineered specifically for everyday Indian living. You can wear your chains, rings, and huggies into hot morning showers, heavy gym sweat sessions, and humid monsoon weather without ever taking them off. After swimming in chlorinated pools or the sea, simply rinse with tap water and pat dry.'
  },
  {
    question: 'How fast is delivery, and how does Cash on Delivery (COD) work?',
    badge: '24–48h Dispatch',
    answer:
      'Every order is hand-inspected and dispatched from our Vapi atelier in Gujarat within 24–48 hours via express air couriers (BlueDart & Delhivery). Typical delivery takes 2 to 4 business days. We offer both secure online payment via Razorpay (UPI, Credit/Debit Cards) and Cash on Delivery (COD) with a nominal ₹25 processing fee.'
  },
  {
    question: 'What if the ring or bracelet size doesn’t fit when I receive it?',
    badge: 'Hassle-Free Exchange',
    answer:
      'We offer an interactive screen ring sizer directly on our website to ensure a perfect fit before ordering. In the rare case that your size is off, we offer a hassle-free 7-day size exchange. Reach out to our concierge team on WhatsApp at +91 90167 03180 or support@satvastones.in and we will assist you immediately.'
  },
  {
    question: 'Is this a legally registered brand with official GST invoices?',
    badge: 'Legal & Transparent',
    answer:
      'Yes. Satvastones Fine Jewellery operates as an authentic Indian enterprise under registered proprietor Anirudh A Verma (GSTIN: 24DDAPV4074H1ZF). Every order includes an official GST tax invoice under HSN code 7117 with 3% statutory precious/imitation metal GST fully declared.'
  }
];

export default function HomeFAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8d3f3d] bg-[#f4efe7] px-3.5 py-1 border border-[#e5ded3]">
            <span className="text-[#c5a059]">✦</span>
            <span>CUSTOMER CONCIERGE &amp; CLARITY</span>
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl font-normal text-[#171513] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[#6e6863]">
            Everything you need to know about our anti-tarnish metallurgy, delivery timelines, and care.
          </p>
        </div>

        {/* Accordion Container (shadcn style) */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`border  transition-all duration-200 overflow-hidden ${
                  isOpen ? 'bg-[#faf8f5] border-[#c5a059]/60 ' : 'bg-white border-[#e5ded3] hover:border-[#dfd8cf]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <span className="text-xs sm:text-sm font-semibold text-[#171513] text-left leading-snug">
                      {faq.question}
                    </span>
                    {faq.badge && (
                      <span className="hidden sm:inline-block text-[9px] font-bold uppercase tracking-wider text-[#8d3f3d] bg-[#f4efe7] px-2 py-0.5 border border-[#e5ded3] shrink-0">
                        {faq.badge}
                      </span>
                    )}
                  </div>
                  <div
                    className={`w-6 h-6  flex items-center justify-center shrink-0 border transition-transform duration-200 ${
                      isOpen
                        ? 'bg-[#171513] text-white border-[#171513] rotate-180'
                        : 'bg-[#faf8f5] text-[#171513] border-[#e5ded3]'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-[#4a443f] leading-relaxed border-t border-[#e5ded3]/60 animate-in fade-in duration-200">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Help Desk Footer Callout */}
        <div className="p-4 bg-[#f4efe7] border border-[#e5ded3] flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <h4 className="text-xs font-bold text-[#171513]">Still have a specific query or custom sizing question?</h4>
            <p className="text-[11px] text-[#6e6863]">Our Vapi jewellery concierge is available on WhatsApp daily from 10 AM to 8 PM IST.</p>
          </div>
          <a
            href="https://wa.me/919016703180?text=Hi%20Satvastones,%20I%20have%20a%20question%20about%20your%20jewellery"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-2 text-xs font-bold transition-all hover:shadow-sm shrink-0"
          >
            <span>Chat on WhatsApp</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>

      </div>
    </section>
  );
}
