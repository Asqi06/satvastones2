import React, { useState } from 'react';

interface Props {
  context?: 'checkout' | 'contact' | 'signup';
  marketingCheckboxId?: string;
  onMarketingChange?: (checked: boolean) => void;
}

export default function DPDPNotice({
  context = 'checkout',
  marketingCheckboxId = 'dpdp-marketing-optin',
  onMarketingChange
}: Props) {
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [marketingAccepted, setMarketingAccepted] = useState(false);

  const handleMarketingToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setMarketingAccepted(val);
    if (onMarketingChange) onMarketingChange(val);
  };

  return (
    <div className="space-y-3.5 my-4 p-4 bg-rose-50/30 rounded-2xl border border-[#f9d8dc] text-xs text-gray-700">
      
      {/* Language Switcher Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-rose-100/60">
        <div className="flex items-center gap-1.5 font-bold text-gray-900 text-[11px]">
          <svg className="w-3.5 h-3.5 text-[#f2707f]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          <span>DPDP Act 2023 Statutory Collection Notice</span>
        </div>

        {/* 22 Eighth Schedule Indian Languages Toggle: English / Hindi */}
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              lang === 'en' ? 'bg-[#111111] text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              lang === 'hi' ? 'bg-[#111111] text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* Notice Content (Bilingual) */}
      {lang === 'en' ? (
        <div className="space-y-1.5 leading-relaxed">
          <p>
            <strong>What we collect:</strong> Your Full Name, Mobile Phone Number, Delivery Address, and Email ID.
          </p>
          <p>
            <strong>Purpose of processing:</strong> Strictly required to generate statutory GST tax invoices (GSTIN: 24DDAPV4074H1ZF), process secure Razorpay payment, and dispatch your order from our Vapi atelier via BlueDart/Delhivery.
          </p>
          <p className="text-[11px] text-gray-500">
            We never sell your information. Read our full rights framework in our{' '}
            <a href="/privacy-policy" target="_blank" className="text-[#a1505a] font-bold underline">
              Indian Privacy Policy
            </a>{' '}
            or exercise your DPDP rights at{' '}
            <a href="/privacy-rights" target="_blank" className="text-[#a1505a] font-bold underline">
              Privacy Portal
            </a>.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5 leading-relaxed font-sans">
          <p>
            <strong>हम क्या जानकारी एकत्र करते हैं:</strong> आपका पूरा नाम, मोबाइल फोन नंबर, डिलीवरी का पता और ईमेल आईडी।
          </p>
          <p>
            <strong>डेटा उपयोग का उद्देश्य:</strong> भारतीय जीएसटी कानून (GSTIN: 24DDAPV4074H1ZF) के तहत कर चालान जारी करने, रेजरपे के माध्यम से सुरक्षित भुगतान पूरा करने, और हमारे वापी (गुजरात) वर्कशॉप से ब्लू डार्ट/डिलिवरी द्वारा आपके आभूषण पार्सल को भेजने के लिए अनिवार्य है।
          </p>
          <p className="text-[11px] text-gray-500">
            हम कभी भी आपका डेटा तीसरे पक्ष को नहीं बेचते हैं। डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट 2023 के तहत हमारी{' '}
            <a href="/privacy-policy" target="_blank" className="text-[#a1505a] font-bold underline">
              गोपनीयता नीति
            </a>{' '}
            पढ़ें या अपने अधिकारों का उपयोग करने के लिए हमारे{' '}
            <a href="/privacy-rights" target="_blank" className="text-[#a1505a] font-bold underline">
              प्राइवेसी पोर्टल
            </a>{' '}
            पर जाएं।
          </p>
        </div>
      )}

      {/* Unbundled, Separate, Non-pre-ticked Marketing Opt-In Checkbox */}
      <div className="pt-2 border-t border-rose-100/60">
        <label className="flex items-start gap-2.5 cursor-pointer select-none">
          <input
            id={marketingCheckboxId}
            name={marketingCheckboxId}
            type="checkbox"
            checked={marketingAccepted}
            onChange={handleMarketingToggle}
            className="mt-0.5 w-4 h-4 rounded border-gray-300 text-[#111111] focus:ring-[#f2707f] cursor-pointer"
          />
          <span className="text-[11px] text-gray-700 leading-tight">
            {lang === 'en' ? (
              <>
                <strong>(Optional)</strong> I agree to receive exclusive festive discounts, anti-tarnish care tips, and preview capsules via WhatsApp, SMS, or Email. (You can withdraw consent anytime with 1 click).
              </>
            ) : (
              <>
                <strong>(वैकल्पिक)</strong> मैं व्हाट्सएप, एसएमएस या ईमेल के माध्यम से विशेष छूट और नए आभूषण संग्रह के अपडेट प्राप्त करने के लिए सहमत हूँ। (आप किसी भी समय इसे रद्द कर सकते हैं)।
              </>
            )}
          </span>
        </label>
      </div>

    </div>
  );
}
