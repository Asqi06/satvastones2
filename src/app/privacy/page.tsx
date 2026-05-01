import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Data Curation Protocol",
  description: "Protocols for managing and protecting your private information.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-luxury-cream pt-40 pb-32 min-h-screen">
      <div className="container-premium max-w-4xl">
        <div className="mb-24 animate-luxury-fade">
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-6">Confidentiality</p>
          <h1 className="text-5xl lg:text-8xl font-serif text-luxury-brown mb-12">Privacy Policy</h1>
          <div className="h-px w-24 bg-luxury-gold"></div>
        </div>

        <div className="space-y-20 text-luxury-brown/60 font-light leading-relaxed tracking-wide animate-luxury-fade luxury-delay-200">
          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Identity Curation</h2>
            <p>
              We collect and process personal identity data strictly to facilitate your acquisitions. This includes your designation, digital address, and physical coordinates for delivery. 
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Temporal Preservation</h2>
            <p>
              Your data is archived on encrypted repositories and is only accessible by authorized archival personnel. We never trade or share your private information with external entities.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Digital Footprints</h2>
            <p>
              We use refined tracking technologies to enhance your browsing experience and personalize your collection discovery. You may modify these preferences within your browser console.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Right to Erasure</h2>
            <p>
              You retain the absolute right to have your data permanently purged from our archives at any moment by contacting our data curator.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
