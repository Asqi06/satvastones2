import { Link } from 'react-router-dom';
import { FileText, Shield, CreditCard, AlertTriangle } from 'lucide-react';

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-2.5 text-[10px] text-gray-400 border-b border-gray-100">
        <Link to="/" className="hover:text-gray-600">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-medium">Terms & Conditions</span>
      </div>

      <div className="bg-[#f79da6] px-4 py-6 text-center">
        <h1 className="text-xl font-bold text-white">Terms & Conditions</h1>
        <p className="text-white/80 text-[10px] mt-1">Please read these terms carefully</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3">1. Acceptance of Terms</h2>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            By accessing or using the Satvastones website (satvastones.in) and placing an order, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our website.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3">2. Products & Pricing</h2>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li>• All product images are for illustration purposes. Actual products may have minor variations due to the handcrafted nature of jewelry.</li>
            <li>• Prices are in Indian Rupees (INR) and include all applicable taxes unless stated otherwise.</li>
            <li>• We reserve the right to modify prices without prior notice. However, confirmed orders will not be affected by price changes.</li>
            <li>• Product availability is subject to stock. We may discontinue products without notice.</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">3. Payment & Orders</h2>
          </div>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li>• We accept UPI (GPay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Cash on Delivery (COD).</li>
            <li>• COD orders may incur additional shipping charges (₹40–₹95) based on location.</li>
            <li>• Prepaid/UPI orders above ₹399 qualify for free shipping.</li>
            <li>• Orders can be cancelled within 30 minutes of placement, provided they haven't been dispatched.</li>
            <li>• We reserve the right to cancel orders that appear fraudulent or suspicious.</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">4. Shipping & Delivery</h2>
          </div>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li>• Orders are dispatched from Vapi, Gujarat within 24–48 hours of payment verification.</li>
            <li>• Delivery timelines: 2–4 days (metro), 3–6 days (tier 2/3), 5–8 days (remote/NE).</li>
            <li>• Delivery timelines are estimates and may vary due to unforeseen circumstances.</li>
            <li>• Please refer to our <Link to="/shipping" className="text-[#f2707f] font-bold underline">Shipping Policy</Link> for complete details.</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">5. Returns & Exchanges</h2>
          </div>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li>• All sales are final. We do not accept returns for change of mind.</li>
            <li>• Returns are only accepted for products received in damaged or defective condition.</li>
            <li>• An unboxing video is mandatory for all damage claims.</li>
            <li>• Claims must be raised within 48 hours of delivery.</li>
            <li>• Please refer to our <Link to="/returns" className="text-[#f2707f] font-bold underline">Return & Exchange Policy</Link> for complete details.</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">6. Limitation of Liability</h2>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Satvastones shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or website. Our total liability shall not exceed the amount paid for the product in question.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3">7. Intellectual Property</h2>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            All content on this website including images, logos, text, and designs are the property of Satvastones and protected under applicable intellectual property laws. Unauthorized reproduction or use is prohibited.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3">8. Governing Law</h2>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            These Terms & Conditions are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Vapi, Gujarat.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3">9. Changes to Terms</h2>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            We reserve the right to update these Terms & Conditions at any time. Changes will be effective upon posting on this page. Continued use of our website constitutes acceptance of the updated terms.
          </p>
        </section>

        <div className="border-t border-gray-100 pt-6 text-center">
          <p className="text-[10px] text-gray-400">
            Last updated: January 2026 | For questions, contact <strong>support@satvastones.in</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
