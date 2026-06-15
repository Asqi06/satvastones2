import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | SatvaStones — Your Data Protection & Privacy",
  description: "SatvaStones takes your privacy seriously. Learn how we collect, store, and protect your personal information when you shop Korean aesthetic jewelry, gold earrings, and anti-tarnish necklaces at satvastones.in.",
  keywords: ["SatvaStones privacy", "jewelry store privacy policy", "data protection India", "online shopping privacy", "aesthetic jewelry privacy"],
  alternates: { canonical: "https://satvastones.in/privacy" },
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
              We collect and process personal identity data strictly to facilitate your acquisitions. This includes your name, email address, phone number, and physical delivery coordinates — information essential for processing your orders of Korean aesthetic jewelry, anti-tarnish earrings, and gold-plated necklaces.
            </p>
            <p>
              When you create an account on SatvaStones, we securely store your profile details to expedite future checkouts. We do not collect sensitive financial data; all payment transactions for UPI, credit card, debit card, and COD orders are processed through our PCI-compliant payment partners including Razorpay.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Temporal Preservation</h2>
            <p>
              Your data is archived on encrypted repositories and is only accessible by authorized archival personnel. We employ industry-standard SSL encryption, firewalls, and access control protocols to prevent unauthorized access, disclosure, or modification of your personal information.
            </p>
            <p>
              We retain your order history and account details for as long as your account remains active. Order-related data such as shipping addresses and invoice records are preserved for seven years to comply with Indian tax regulations and GST auditing requirements. After this period, all personally identifiable information is permanently anonymized or destroyed.
            </p>
            <p>
              We never trade, sell, or share your private information with third-party marketing entities. Your browsing patterns and purchase history of Korean rings, western bracelets, and minimalist pendants are used solely to curate personalized product recommendations that align with your aesthetic preferences.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Digital Footprints</h2>
            <p>
              We use refined tracking technologies including cookies and pixel tags to enhance your browsing experience and personalize your collection discovery. These technologies help us understand which aesthetic jewelry categories — whether earrings, necklaces, rings, or bracelets — resonate most with our community.
            </p>
            <p>
              Third-party services integrated into our platform, including Cloudinary for image optimization, Google Analytics for traffic analysis, and Razorpay for payment processing, may set their own cookies subject to their respective privacy policies. You may modify cookie preferences within your browser console at any time.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Right to Erasure</h2>
            <p>
              You retain the absolute right to have your data permanently purged from our archives at any moment by contacting our data curator at curation@satvastones.com. Upon verification of your identity, we will delete your account, order history, and all associated personal data within 30 business days, in accordance with the Information Technology Act, 2000 and India's digital personal data protection framework.
            </p>
            <p>
              You also have the right to request a portable copy of your data, correct any inaccuracies in your profile, or restrict processing of your information for specific purposes. To exercise any of these rights, simply reach out to our support team with your request and we will respond within the statutory timeframe.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Policy Refresh Protocol</h2>
            <p>
              This privacy charter may be updated periodically to reflect changes in our data practices, legal obligations, or platform capabilities. We encourage you to review this page regularly. Material changes will be communicated via email or a prominent notice on the SatvaStones website prior to taking effect.
            </p>
            <p>
              If you have any questions about how we handle your personal information while you browse our collection of anti-tarnish jewelry, waterproof earrings, or gold-plated accessories, please contact our data protection officer at hello@satvastones.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
