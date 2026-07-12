import { Link } from 'react-router-dom';
import { Truck, Package, MapPin, CreditCard, Clock, Shield } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-2.5 text-[10px] text-gray-400 border-b border-gray-100">
        <Link to="/" className="hover:text-gray-600">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-medium">Shipping Policy</span>
      </div>

      <div className="bg-[#f79da6] px-4 py-6 text-center">
        <h1 className="text-xl font-bold text-white">Shipping Policy</h1>
        <p className="text-white/80 text-[10px] mt-1">All about how we deliver your jewelry</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">Our Location</h2>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            All orders are processed and dispatched from our operations center in <strong>Vapi, Gujarat, India</strong>. We ship across India via trusted courier partners including Delhivery, Shiprocket, and India Post.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Truck className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">Free Shipping (Prepaid / UPI)</h2>
          </div>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li>• Free shipping on all prepaid/UPI orders above <strong>₹399</strong>.</li>
            <li>• Orders below ₹399 incur a flat shipping charge based on your pincode zone (₹20–₹75).</li>
            <li>• We strongly encourage paying via UPI (GPay, PhonePe, Paytm) to save on shipping charges.</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">Cash on Delivery (COD)</h2>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
            COD is available across most pincodes in India. However, COD orders <strong>do not qualify for free shipping</strong>. Additional COD charges apply based on distance from our Vapi hub:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 space-y-1.5">
            <p className="text-[11px] text-gray-700">• Local (Vapi / Gujarat): <strong>₹40</strong></p>
            <p className="text-[11px] text-gray-700">• Rest of Gujarat: <strong>₹50</strong></p>
            <p className="text-[11px] text-gray-700">• Maharashtra: <strong>₹65</strong></p>
            <p className="text-[11px] text-gray-700">• North / Central India: <strong>₹80</strong></p>
            <p className="text-[11px] text-gray-700">• South / East / NE India: <strong>₹95</strong></p>
          </div>
          <p className="text-[10px] text-[#f2707f] font-bold mt-3">
            Save ₹40–₹95 by choosing UPI payment instead of COD!
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">Delivery Timelines</h2>
          </div>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[11px] font-bold text-gray-800">Metro Cities (Mumbai, Delhi, Bangalore, etc.)</p>
              <p className="text-[10px] text-gray-500">2–4 business days from dispatch</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[11px] font-bold text-gray-800">Tier 2 & 3 Cities</p>
              <p className="text-[10px] text-gray-500">3–6 business days from dispatch</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[11px] font-bold text-gray-800">Remote & North-East Areas</p>
              <p className="text-[10px] text-gray-500">5–8 business days from dispatch</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-3">
            Orders are dispatched within 24–48 hours of payment verification. During sales or festive seasons, dispatch may take up to 4 business days.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Package className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">Order Tracking</h2>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Once your order is dispatched, you will receive a tracking number via SMS/WhatsApp. You can track your order from the <Link to="/account" className="text-[#f2707f] font-bold underline">My Account</Link> page.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">Shipping Damage</h2>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            All orders are packed securely. If your package arrives damaged, please contact us at <strong>support@satvastones.in</strong> or WhatsApp us at <strong>+91 90167 03180</strong> within 48 hours with an unboxing video and photos. We will arrange a free replacement.
          </p>
        </section>

        <div className="border-t border-gray-100 pt-6 text-center">
          <p className="text-[10px] text-gray-400">
            For any shipping queries, contact us at <strong>support@satvastones.in</strong> or WhatsApp <strong>+91 90167 03180</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
