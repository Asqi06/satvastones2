import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return & Damage Policy | SatvaStones — No-Return Jewelry Policy",
  description: "SatvaStones does not accept returns or refunds unless the item arrives damaged. Contact support within 48 hours for damaged item replacement on Korean aesthetic jewelry, earrings, and necklaces.",
  keywords: ["SatvaStones return policy", "jewelry return policy", "no return jewelry India", "damaged item replacement", "anti-tarnish jewelry policy"],
  alternates: { canonical: "https://satvastones.in/returns" },
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
              SatvaStones does not accept returns, refunds, or cancellations once an order has been placed and confirmed. All sales are final. This policy applies to all products in our collection including Korean aesthetic earrings, gold-plated necklaces, anti-tarnish rings, designer bracelets, and ₹99 Sale items.
            </p>
            <p>
              We encourage you to review your order carefully — including product specifications, sizes, and customization details such as name engravings or custom text — before completing your purchase. If you have questions about sizing, material, or styling of our waterproof and anti-tarnish jewelry, please contact our team at support@satvastones.in before placing your order.
            </p>
            <p>
              This no-return policy is standard practice for affordable luxury jewelry retailers in India due to hygiene regulations and the handcrafted nature of our pieces. Each SatvaStones artifact undergoes rigorous quality inspection before dispatch to ensure it meets our exacting standards.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Damaged Items Exception</h2>
            <p>
              If your item arrives damaged or defective, we will provide a free replacement at no additional cost. You must contact our support team at curation@satvastones.com within 48 hours of delivery with clear photographs of the damage and your Order Identifier. Please retain all original packaging materials as they may be required for the claims investigation.
            </p>
            <p>
              Damage includes but is not limited to broken clasps, missing stones, bent metal parts, discolouration upon arrival, or physical breakage sustained during transit. Minor cosmetic variations that occur during the handcrafting process — such as subtle differences in stone placement or metal finish — are not classified as defects and are part of the unique character of artisanal jewelry.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Damage Claim Process</h2>
            <p>
              To file a damage claim for your Korean earrings, western necklace, or any other SatvaStones product, please follow these steps:
            </p>
            <ol className="list-decimal list-inside space-y-4 text-luxury-brown/70">
              <li>Email curation@satvastones.com with the subject line "DAMAGE CLAIM — [Your Order Number]".</li>
              <li>Attach clear, well-lit photographs of the damaged area from multiple angles.</li>
              <li>Include photographs of the original packaging showing any external damage during transit.</li>
              <li>Mention your Order Identifier and the product name.</li>
            </ol>
            <p>
              Our quality assurance team will review your claim and respond within 2-3 business days with a resolution. Approved claims will be processed for a replacement dispatch within 5-7 business days. Shipping costs for replacement items are borne entirely by SatvaStones.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Non-Eligible Claims</h2>
            <p>
              The following situations are not eligible for replacement under our damage policy:
            </p>
            <ul className="list-disc list-inside space-y-3 text-luxury-brown/70">
              <li>Claims submitted after 48 hours of delivery confirmation.</li>
              <li>Items showing signs of wear, scratches, or tarnish after use — though genuine anti-tarnish issues within 30 days of delivery for our guaranteed pieces will be reviewed case by case.</li>
              <li>Damage caused by misuse, accidental drops, exposure to chemicals, or improper storage after delivery.</li>
              <li>Colour variations due to differences in computer monitor, tablet, or mobile screen settings — we strive to represent product colours accurately but cannot guarantee exact screen-to-product colour matching.</li>
              <li>Size preference issues — please refer to our product dimensions listed in each product description before ordering.</li>
            </ul>
            <p>
              SatvaStones reserves the right to reject any claim that does not meet the above criteria or where photographic evidence is insufficient to verify the nature of the damage. In case of disputes, our team will work with you to find a fair resolution.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="text-luxury-brown text-xl font-serif uppercase tracking-widest italic border-b border-luxury-brown/5 pb-4">Order Cancellation Policy</h2>
            <p>
              Orders can be cancelled only within 30 minutes of placement, provided the order has not yet been processed for dispatch. To request a cancellation, please email curation@satvastones.com immediately with your Order Identifier. Orders that have already been packed or dispatched cannot be cancelled under our no-return policy.
            </p>
            <p>
              For COD (Cash on Delivery) orders, cancellation requests will be honoured if made before the package is handed over to our courier partner. Customers who repeatedly place COD orders without accepting delivery may have their COD privileges revoked.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
