import { Link } from 'react-router-dom';
import { Lock, Database, Shield, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <div className="px-4 py-2.5 text-[10px] text-gray-400 border-b border-gray-100">
        <Link to="/" className="hover:text-gray-600">Home</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-medium">Privacy Policy</span>
      </div>

      <div className="bg-[#f79da6] px-4 py-6 text-center">
        <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
        <p className="text-white/80 text-[10px] mt-1">How we protect your data</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3">1. Information We Collect</h2>
          <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
            When you use our website or place an order, we may collect the following information:
          </p>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li>• <strong>Personal Information:</strong> Name, email address, phone number, shipping address</li>
            <li>• <strong>Payment Information:</strong> Processed securely through Razorpay (we do not store card details)</li>
            <li>• <strong>Usage Data:</strong> Pages visited, time spent, browser type, device information</li>
            <li>• <strong>Cookies:</strong> Used to improve your browsing experience and remember your preferences</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">2. How We Use Your Information</h2>
          </div>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li>• To process and fulfill your orders</li>
            <li>• To send order updates, tracking information, and delivery notifications</li>
            <li>• To provide customer support and respond to your queries</li>
            <li>• To improve our website, products, and services</li>
            <li>• To send promotional emails (only if you opt in — you can unsubscribe anytime)</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">3. Data Protection</h2>
          </div>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li>• We use industry-standard SSL encryption to protect your data during transmission</li>
            <li>• Payment processing is handled by Razorpay, an RBI-compliant payment gateway</li>
            <li>• We do not store credit/debit card details on our servers</li>
            <li>• Your personal data is stored securely and access is restricted to authorized personnel only</li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Lock className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">4. Data Sharing</h2>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            We do <strong>not</strong> sell, trade, or rent your personal information to third parties. We only share your data with:
          </p>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed mt-2">
            <li>• <strong>Shipping Partners:</strong> To deliver your orders (name, phone, address)</li>
            <li>• <strong>Payment Gateway:</strong> Razorpay, to process payments securely</li>
            <li>• <strong>Legal Authorities:</strong> If required by law or to protect our rights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3">5. Data Retention</h2>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            We retain your personal data for as long as necessary to fulfill the purposes outlined in this policy, or as required by law. Order data is retained for a minimum of 7 years for tax and legal compliance purposes.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3">6. Your Rights</h2>
          <ul className="space-y-2 text-[11px] text-gray-600 leading-relaxed">
            <li>• You can request access to your personal data</li>
            <li>• You can request correction of inaccurate data</li>
            <li>• You can request deletion of your personal data (subject to legal retention requirements)</li>
            <li>• You can opt out of marketing communications at any time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3">7. Cookies</h2>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            We use cookies to enhance your experience on our website. Cookies help us remember your preferences, analyze site traffic, and personalize content. You can control cookies through your browser settings.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <Mail className="h-4 w-4 text-[#f2707f]" />
            <h2 className="text-sm font-bold text-gray-900">8. Contact Us</h2>
          </div>
          <p className="text-[11px] text-gray-600 leading-relaxed">
            If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mt-3 space-y-1">
            <p className="text-[11px] text-gray-700">• Email: <strong>support@satvastones.in</strong></p>
            <p className="text-[11px] text-gray-700">• WhatsApp: <strong>+91 90167 03180</strong></p>
            <p className="text-[11px] text-gray-700">• Address: Vapi, Gujarat, India</p>
          </div>
        </section>

        <div className="border-t border-gray-100 pt-6 text-center">
          <p className="text-[10px] text-gray-400">
            Last updated: January 2026
          </p>
        </div>
      </div>
    </div>
  );
}
