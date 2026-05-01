import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Damage Policy | SatvaStones",
  description: "SatvaStones does not accept returns or refunds unless the item arrives damaged. Contact support within 48 hours for damaged item replacement.",
};

export default function ReturnsPage() {
  return (
    <div className="bg-luxury-cream pt-40 pb-32 min-h-screen">
      <div className="container-premium max-w-4xl">
        <div className="mb-24 animate-luxury-fade">
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-6">Policy</p>
          <h1 className="text-5xl lg:text-8xl font-serif text-luxury-brown mb-12">Returns & Damage Policy</h1>
          <div className="h-px w-24 bg-luxury-gold"></div>
        </div>

        <div className="space-y-20 text-luxury-brown/60 font-light leading-relaxed tracking-wide animate-luxury-fade luxury-delay-200">
          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">No Returns or Refunds</h2>
            <p>
              SatvaStones does not accept returns, refunds, or cancellations once an order has been placed and confirmed. All sales are final. Please review your order carefully before completing your purchase.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Damaged Items Exception</h2>
            <p>
              If your item arrives damaged or defective, we will provide a replacement. You must contact our support team at curation@satvastones.com within 48 hours of delivery with clear photographs of the damage and your Order Identifier.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Damage Claim Process</h2>
            <p>
              To file a damage claim, email curation@satvastones.com with your Order Identifier, photographs of the damaged item, and photographs of the original packaging. Our team will review your claim and respond within 2-3 business days with a resolution.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Non-Eligible Claims</h2>
            <p>
              Claims submitted after 48 hours of delivery, items showing signs of wear, or damage caused by misuse after delivery will not be eligible for replacement. Colour variations due to screen settings are not considered defects.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
