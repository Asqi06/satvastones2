import { Link } from 'react-router-dom';
import { RotateCcw, AlertTriangle, CheckCircle, XCircle, Video } from 'lucide-react';

export default function ReturnExchange() {
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-2.5 text-[10px] text-gray-400 border-b border-gray-100">
        <Link to="/" className="hover:text-gray-600">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-medium">Return & Exchange</span>
      </div>

      <div className="bg-[#f79da6] px-4 py-6 text-center">
        <h1 className="text-xl font-bold text-white">Return & Exchange Policy</h1>
        <p className="text-white/80 text-[10px] mt-1">How we handle returns and exchanges</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">General Return Policy</h2>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            All sales are <strong>final</strong>. We do not accept returns, refunds, or cancellations once an order has been placed and confirmed. This applies to all products including earrings, necklaces, rings, bracelets, and sale items.
          </p>
          <p className="text-[11px] text-gray-600 leading-relaxed mt-2">
            We encourage you to review your order carefully — including product specifications, sizes, and customization details — before completing your purchase.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">Damaged or Defective Items</h2>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
            We only accept returns if the product is received in a <strong>damaged or old/defective condition</strong>. In such cases:
          </p>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li>• You must contact us within <strong>48 hours</strong> of delivery.</li>
            <li>• You must provide an <strong>unboxing video</strong> as proof of the damaged/defective condition at the time of delivery.</li>
            <li>• Contact us via WhatsApp at <strong>+91 90167 03180</strong> or email <strong>support@satvastones.in</strong>.</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Video className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">Unboxing Video Requirement</h2>
          </div>
          <div className="bg-red-50 rounded-lg p-4 space-y-2">
            <p className="text-[11px] text-gray-700 font-bold">
              An unboxing video is MANDATORY for all damage/return claims.
            </p>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Please record a continuous, unedited video from the moment you open the package until you fully inspect the product. This video serves as evidence for our investigation and is required to process your claim.
            </p>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">
            Without a valid unboxing video, we may not be able to process your return/exchange request.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">What We Accept</h2>
          </div>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Products received broken, cracked, or physically damaged</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Wrong product delivered (different from what was ordered)</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Missing items from the order</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Product significantly different from the description/photos</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">What We Don't Accept</h2>
          </div>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span> Change of mind or no longer wanted the product</li>
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span> Size issues (please check dimensions before ordering)</li>
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span> Minor color variations due to screen differences</li>
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span> Damage caused after delivery (drops, water exposure, etc.)</li>
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span> Claims without unboxing video proof</li>
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span> Claims made after 48 hours of delivery</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <RotateCcw className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">Exchange Process</h2>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
            If your return claim is approved, we will send you a replacement product at no additional cost. The replacement will be dispatched within 5–7 business days after claim approval.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li>Contact us via WhatsApp or email with your order details and unboxing video.</li>
            <li>Our team will review the evidence within 2–3 business days.</li>
            <li>If approved, we will dispatch a replacement immediately.</li>
            <li>You do not need to return the damaged item unless specifically requested.</li>
          </ol>
        </section>

        <div className="bg-pink-50 rounded-lg p-4 text-center">
          <p className="text-[10px] text-gray-600">
            For any return or exchange queries, contact us at <strong>support@satvastones.in</strong> or WhatsApp <strong>+91 90167 03180</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
