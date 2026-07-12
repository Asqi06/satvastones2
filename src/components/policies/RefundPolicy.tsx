import { Link } from 'react-router-dom';
import { CreditCard, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-2.5 text-[10px] text-gray-400 border-b border-gray-100">
        <Link to="/" className="hover:text-gray-600">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-medium">Refund Policy</span>
      </div>

      <div className="bg-[#f79da6] px-4 py-6 text-center">
        <h1 className="text-xl font-bold text-white">Refund Policy</h1>
        <p className="text-white/80 text-[10px] mt-1">How refunds work at Satvastones</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">General Refund Policy</h2>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            Due to the nature of our products (affordable jewelry), <strong>all sales are final</strong>. We do not offer refunds for:
          </p>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed mt-3">
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span> Change of mind or no longer wanting the product</li>
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span> Size or fitting issues</li>
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span> Color differences from screen to product</li>
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span> Late delivery (delivery timelines are estimates)</li>
            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">✗</span> Change of mind after 30 minutes of order placement</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">When Refunds Are Granted</h2>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
            Refunds are only issued in the following situations:
          </p>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Product received is damaged, broken, or defective (with unboxing video proof)</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Wrong product delivered</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Order cancelled within 30 minutes (before dispatch)</li>
            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span> Product significantly different from description</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">Refund Process</h2>
          </div>
          <ol className="list-decimal list-inside space-y-3 text-[11px] text-gray-600 leading-relaxed">
            <li>Contact us within <strong>48 hours</strong> of delivery via WhatsApp (+91 90167 03180) or email (support@satvastones.in).</li>
            <li>Provide your order number, photos of the issue, and an <strong>unboxing video</strong>.</li>
            <li>Our team will review your claim within <strong>2–3 business days</strong>.</li>
            <li>If approved, we will offer a <strong>replacement</strong> as the primary resolution.</li>
            <li>If a replacement is not available, a refund will be processed to your original payment method within <strong>5–7 business days</strong>.</li>
          </ol>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">Refund Method & Timeline</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-[11px] text-gray-700">• <strong>UPI/Card/Net Banking:</strong> Refund to original payment method within 5–7 business days</p>
            <p className="text-[11px] text-gray-700">• <strong>COD orders:</strong> Refund via UPI/bank transfer within 7–10 business days (you will need to provide your UPI ID or bank details)</p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">Important Notes</h2>
          </div>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li>• The unboxing video requirement is <strong>mandatory</strong> for all damage/defect claims.</li>
            <li>• Without an unboxing video, we cannot verify the condition of the product at delivery.</li>
            <li>• Refund amounts will be for the product value only. Shipping charges are non-refundable unless the error is from our side.</li>
            <li>• COD shipping charges are non-refundable.</li>
          </ul>
        </section>

        <div className="bg-pink-50 rounded-lg p-4 text-center">
          <p className="text-[10px] text-gray-600">
            For refund queries, contact <strong>support@satvastones.in</strong> or WhatsApp <strong>+91 90167 03180</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
