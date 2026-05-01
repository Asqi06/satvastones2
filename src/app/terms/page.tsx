import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archival Usage Protocol",
  description: "Terms and protocols for interacting with the Satvastones platform.",
};

export default function TermsPage() {
  return (
    <div className="bg-luxury-cream pt-40 pb-32 min-h-screen">
      <div className="container-premium max-w-4xl">
        <div className="mb-24 animate-luxury-fade">
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-6">Governance</p>
          <h1 className="text-5xl lg:text-8xl font-serif text-luxury-brown mb-12">Terms of Service</h1>
          <div className="h-px w-24 bg-luxury-gold"></div>
        </div>

        <div className="space-y-20 text-luxury-brown/60 font-light leading-relaxed tracking-wide animate-luxury-fade luxury-delay-200">
          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Interactions</h2>
            <p>
              By accessing the Satvastones archive, you agree to interact with the platform in good faith and respect all intellectual property pertaining to our artisanal designs.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Acquisition Verification</h2>
            <p>
              Prices and availability are subject to archival adjustments. An order is only confirmed once digital verification and payment authorization are executed.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Design Integrity</h2>
            <p>
              Reproduction of any Satvastones design or digital asset without explicit written consent from our Board of Directors is strictly prohibited.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Jurisdiction</h2>
            <p>
              These protocols are governed by the laws of Bharat. Any disputes will be mediated within the courts of Mumbai.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
