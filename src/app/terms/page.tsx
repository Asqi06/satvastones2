import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | SatvaStones — Usage Policies & Guidelines",
  description: "Read the terms and conditions for using SatvaStones. Our policies cover account usage, payments, intellectual property for Korean aesthetic jewelry, and dispute resolution for orders placed at satvastones.in.",
  keywords: ["SatvaStones terms", "jewelry store terms and conditions", "online shopping terms India", "aesthetic jewelry policies", "e-commerce terms of service"],
  alternates: { canonical: "https://satvastones.in/terms" },
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
              By accessing the Satvastones archive at satvastones.in, you agree to interact with the platform in good faith and respect all intellectual property pertaining to our artisanal designs. This website is intended for users who are at least 18 years of age. If you are under 18, you may use SatvaStones only under the supervision of a parent or legal guardian.
            </p>
            <p>
              You agree to provide accurate, current, and complete information during the account registration process and to update such information promptly to keep it accurate. Any account created with falsified information may be suspended or terminated without notice.
            </p>
            <p>
              SatvaStones reserves the right to refuse service, terminate accounts, remove or edit content, or cancel orders at our sole discretion, particularly in cases where fraudulent activity, chargeback abuse, or violation of these terms is suspected.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Acquisition Verification</h2>
            <p>
              Prices and availability are subject to archival adjustments without prior notice. All product listings for Korean aesthetic earrings, gold-plated necklaces, anti-tarnish rings, and designer bracelets are displayed in Indian Rupees (INR) inclusive of applicable taxes unless stated otherwise.
            </p>
            <p>
              An order is only confirmed once digital verification and payment authorization are executed. Until such confirmation, SatvaStones retains the right to reject or cancel any order — including those that have been submitted — if inaccuracies in pricing, product descriptions, or stock availability are discovered. In such cases, you will be notified promptly and receive a full refund for any amounts already charged.
            </p>
            <p>
              Promotional codes, flash sale discounts including our ₹99 Sale, and seasonal offers cannot be combined unless explicitly stated. SatvaStones reserves the right to modify or withdraw any promotion at any time.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Design Integrity</h2>
            <p>
              Reproduction of any Satvastones design or digital asset — including product images, descriptions, logos, and marketing materials — without explicit written consent from our Board of Directors is strictly prohibited. All content featured on this website, including photographs of our anti-tarnish jewelry collection, is protected under the Copyright Act, 1957 of India and international copyright treaties.
            </p>
            <p>
              The SatvaStones name, logo, and taglines are registered trademarks. Unauthorized use of our trademarks or trade dress in connection with any product or service that is not authorized by SatvaStones constitutes trademark infringement and will be pursued to the fullest extent of the law.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Liability & Warranty</h2>
            <p>
              SatvaStones provides its products and services on an "as is" and "as available" basis. While we take every precaution to ensure our anti-tarnish and waterproof jewelry meets the highest quality standards, we do not warrant that the product descriptions, colours, or images are entirely accurate, complete, or error-free. Screen settings and device displays may cause slight variations in colour representation.
            </p>
            <p>
              Our liability for any claim arising from the use of our products or website is limited to the total purchase price of the product in question. SatvaStones shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use any product purchased from our platform.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Jurisdiction & Dispute Resolution</h2>
            <p>
              These protocols are governed by the laws of Bharat (India). Any disputes arising from or relating to these terms, your use of the SatvaStones website, or your purchase of Korean aesthetic jewelry, western minimalist accessories, or any other products from our collection will be mediated within the courts of Mumbai, Maharashtra.
            </p>
            <p>
              Before initiating formal legal proceedings, we encourage you to contact our customer support team at curation@satvastones.com to resolve any concerns amicably. We are committed to addressing all customer grievances within 5-7 business days through our internal dispute resolution process.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
