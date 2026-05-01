import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping Protocol",
  description: "Transit and delivery protocols for your Satvastones artifacts.",
};

export default function ShippingPage() {
  return (
    <div className="bg-luxury-cream pt-40 pb-32 min-h-screen">
      <div className="container-premium max-w-4xl">
        <div className="mb-24 animate-luxury-fade">
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-6">Logistics</p>
          <h1 className="text-5xl lg:text-8xl font-serif text-luxury-brown mb-12">Transit Protocol</h1>
          <div className="h-px w-24 bg-luxury-gold"></div>
        </div>

        <div className="space-y-20 text-luxury-brown/60 font-light leading-relaxed tracking-wide animate-luxury-fade luxury-delay-200">
          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Global Curation</h2>
            <p>
              Every Satvastones artifact is meticulously inspected and packaged at our Mumbai headquarters. We partner with elite global couriers to ensure the integrity of your acquisition during transit.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Temporal Estimates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-luxury-brown/10 pt-12">
              <div className="space-y-4">
                <h3 className="text-luxury-gold text-[10px] font-bold tracking-[0.2em] uppercase">Domestic (Bharat)</h3>
                <p className="text-luxury-brown/80">3 to 5 business days from dispatch.</p>
              </div>
              <div className="space-y-4">
                <h3 className="text-luxury-gold text-[10px] font-bold tracking-[0.2em] uppercase">International</h3>
                <p className="text-luxury-brown/80">7 to 12 business days depending on customs clearance.</p>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Curation Period</h2>
            <p>
              Orders are typically dispatched within 48 hours of verification. During bespoke collection launches, please allow up to 4 business days for artisanal packaging.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Archival Tracking</h2>
            <p>
              Upon dispatch, you will receive a digital identifier to monitor the real-time location of your artifacts. All shipments are fully insured against unforeseen transit events.    
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Returns & Refunds</h2>
            <p>
              All sales are final. We do not accept returns, refunds, or cancellations. If your item arrives damaged, contact curation@satvastones.com within 48 hours of delivery with photographs for a replacement.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
