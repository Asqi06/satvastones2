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
    <div className="border border-[#ded5c7] bg-[#fbf9f5] p-4 text-[10.5px] leading-relaxed text-[#5f5851]">
      {/* Language switcher */}
      <div className="flex items-center justify-between gap-3 border-b border-[#e5ded3] pb-2.5">
        <span className="flex items-center gap-1.5 text-[9px] font-medium uppercase tracking-[0.14em] text-[#14110f]">
          <svg
            className="h-3.5 w-3.5 text-[#c5a059]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.6}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
            />
          </svg>
          DPDP Act 2023 · collection notice
        </span>

        <div className="flex shrink-0 border border-[#d8d0c4] bg-white p-0.5 text-[9px] uppercase tracking-[0.08em]">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`cursor-pointer px-2 py-0.5 transition-colors ${
              lang === 'en' ? 'bg-[#14110f] text-[#f6f1e8]' : 'text-[#6f675f] hover:text-[#14110f]'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang('hi')}
            className={`cursor-pointer px-2 py-0.5 transition-colors ${
              lang === 'hi' ? 'bg-[#14110f] text-[#f6f1e8]' : 'text-[#6f675f] hover:text-[#14110f]'
            }`}
          >
            हिन्दी
          </button>
        </div>
      </div>

      {/* Bilingual notice */}
      {lang === 'en' ? (
        <div className="mt-2.5 space-y-1.5">
          <p>
            <strong className="font-medium text-[#14110f]">What we collect:</strong> your full name, mobile number, delivery address and email ID.
          </p>
          <p>
            <strong className="font-medium text-[#14110f]">Why:</strong> strictly to issue a statutory GST invoice (GSTIN 24DDAPV4074H1ZF), process secure Razorpay payment, and dispatch your order from Vapi via BlueDart or Delhivery.
          </p>
          <p className="text-[10px] text-[#8a8279]">
            We never sell your data. Read the{' '}
            <a href="/privacy-policy" className="underline decoration-[#d8c3a6] underline-offset-2 text-[#14110f]">
              privacy policy
            </a>{' '}
            or use the{' '}
            <a href="/privacy-rights" className="underline decoration-[#d8c3a6] underline-offset-2 text-[#14110f]">
              privacy portal
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="mt-2.5 space-y-1.5">
          <p>
            <strong className="font-medium text-[#14110f]">हम क्या जानकारी एकत्र करते हैं:</strong> आपका पूरा नाम, मोबाइल फोन नंबर, डिलीवरी का पता और ईमेल आईडी।
          </p>
          <p>
            <strong className="font-medium text-[#14110f]">डेटा उपयोग का उद्देश्य:</strong> भारतीय जीएसटी कानून (GSTIN 24DDAPV4074H1ZF) के तहत कर चालान जारी करने, रेजरपे से सुरक्षित भुगतान पूरा करने, और वापी (गुजरात) से ब्लू डार्ट/डिलीवरी द्वारा आपका पार्सल भेजने के लिए अनिवार्य है।
          </p>
          <p className="text-[10px] text-[#8a8279]">
            हम आपका डेटा कभी नहीं बेचते।{' '}
            <a href="/privacy-policy" className="underline decoration-[#d8c3a6] underline-offset-2 text-[#14110f]">
              गोपनीयता नीति
            </a>{' '}
            पढ़ें या{' '}
            <a href="/privacy-rights" className="underline decoration-[#d8c3a6] underline-offset-2 text-[#14110f]">
              प्राइवेसी पोर्टल
            </a>{' '}
            पर जाएं।
          </p>
        </div>
      )}

      {/* Unbundled marketing opt-in */}
      <div className="mt-3 border-t border-[#e5ded3] pt-2.5">
        <label className="flex cursor-pointer select-none items-start gap-2.5">
          <input
            id={marketingCheckboxId}
            name={marketingCheckboxId}
            type="checkbox"
            checked={marketingAccepted}
            onChange={handleMarketingToggle}
            className="mt-0.5 h-3.5 w-3.5 shrink-0 cursor-pointer accent-[#14110f]"
          />
          <span className="text-[10px] leading-relaxed text-[#6f675f]">
            {lang === 'en' ? (
              <>
                <strong className="font-medium text-[#14110f]">Optional.</strong> Send me festive offers, care tips and new capsule previews on WhatsApp, SMS or email. Withdraw anytime in one click.
              </>
            ) : (
              <>
                <strong className="font-medium text-[#14110f]">वैकल्पिक।</strong> मुझे व्हाट्सएप, एसएमएस या ईमेल पर छूट, देखभाल सुझाव और नए संग्रह के अपडेट भेजें। कभी भी रद्द कर सकते हैं।
              </>
            )}
          </span>
        </label>
      </div>
    </div>
  );
}
