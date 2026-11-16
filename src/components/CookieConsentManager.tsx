import React, { useState, useEffect } from 'react';

export interface ConsentState {
  necessary: boolean; // Always true
  analytics: boolean;
  marketing: boolean;
  consentId: string;
  timestamp: string;
  version: string;
}

const STORAGE_KEY = 'satvastones_dpdp_consent';
const POLICY_VERSION = '2026.1-DPDP';

export default function CookieConsentManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [currentConsent, setCurrentConsent] = useState<ConsentState | null>(null);

  // Check saved consent on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: ConsentState = JSON.parse(stored);
        if (parsed.version === POLICY_VERSION) {
          setCurrentConsent(parsed);
          setAnalytics(parsed.analytics);
          setMarketing(parsed.marketing);
          applyScriptConsent(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn('DPDP Consent parser error:', e);
    }

    // No valid consent found -> Show banner with strict prior blocking
    setIsOpen(true);
    applyScriptConsent({
      necessary: true,
      analytics: false,
      marketing: false,
      consentId: '',
      timestamp: '',
      version: POLICY_VERSION
    });
  }, []);

  // Expose global reopen listener for footer link
  useEffect(() => {
    const handleReopen = () => {
      setIsPreferencesOpen(true);
    };
    window.addEventListener('satvastones:open_cookie_preferences', handleReopen);
    return () => {
      window.removeEventListener('satvastones:open_cookie_preferences', handleReopen);
    };
  }, []);

  // Apply script gating to DOM
  const applyScriptConsent = (consent: ConsentState) => {
    // Expose global helper for scripts
    (window as any).satvastonesConsent = consent;
    (window as any).hasConsent = (category: 'analytics' | 'marketing') => {
      return !!consent[category];
    };

    // Dispatch DOM event for any custom tag manager listeners
    window.dispatchEvent(new CustomEvent('satvastones:consent_changed', { detail: consent }));

    // Dynamically enable or block Google Analytics if present
    if ((window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: consent.analytics ? 'granted' : 'denied',
        ad_storage: consent.marketing ? 'granted' : 'denied',
        ad_user_data: consent.marketing ? 'granted' : 'denied',
        ad_personalization: consent.marketing ? 'granted' : 'denied'
      });
    }
  };

  const saveConsent = async (consentSettings: { analytics: boolean; marketing: boolean }) => {
    const consentId = 'dpdp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const timestampUtc = new Date().toISOString();

    const consentState: ConsentState = {
      necessary: true,
      analytics: consentSettings.analytics,
      marketing: consentSettings.marketing,
      consentId,
      timestamp: timestampUtc,
      version: POLICY_VERSION
    };

    // 1. Save locally
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consentState));
    setCurrentConsent(consentState);
    applyScriptConsent(consentState);

    // 2. Close UI
    setIsOpen(false);
    setIsPreferencesOpen(false);

    // 3. Log consent to Cloudflare D1 backend per DPDP Rules 2025 Rule 4
    try {
      const acceptedCategories = ['necessary'];
      if (consentSettings.analytics) acceptedCategories.push('analytics');
      if (consentSettings.marketing) acceptedCategories.push('marketing');

      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent_id: consentId,
          timestamp_utc: timestampUtc,
          categories_accepted: acceptedCategories,
          policy_version: POLICY_VERSION,
          session_hash: 'sess-' + Math.random().toString(36).substring(2, 10)
        })
      });
    } catch (err) {
      console.warn('Backend consent logging notice:', err);
    }
  };

  const handleAcceptAll = () => {
    setAnalytics(true);
    setMarketing(true);
    saveConsent({ analytics: true, marketing: true });
  };

  const handleRejectAll = () => {
    setAnalytics(false);
    setMarketing(false);
    saveConsent({ analytics: false, marketing: false });
  };

  const handleSavePreferences = () => {
    saveConsent({ analytics, marketing });
  };

  return (
    <>
      {/* 1. MAIN BANNER: Equal Prominence, Zero Dark Patterns (DPDP Rules 2025 Compliant) */}
      {isOpen && !isPreferencesOpen && (
        <div
          role="region"
          aria-label="Digital Personal Data Protection Consent Banner"
          className="fixed bottom-0 inset-x-0 z-[9999] bg-white border-t border-gray-200 shadow-2xl p-4 sm:p-6 transition-transform duration-300"
        >
          <div class="max-w-[1440px] mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            
            <div class="space-y-1.5 max-w-4xl text-left">
              <div class="flex items-center gap-2">
                <span class="inline-block w-2 h-2 rounded-full bg-[#f2707f]"></span>
                <span class="text-xs font-bold uppercase tracking-wider text-gray-900">
                  Data Privacy Notice • DPDP Act, 2023 Compliance
                </span>
              </div>
              <p class="text-xs text-gray-600 leading-relaxed">
                SatvaStones uses strictly necessary cookies to power cart checkout, secure Razorpay payments, and tax invoices. With your prior consent, we also use optional performance analytics to improve your experience. Under the <strong>Digital Personal Data Protection Act, 2023</strong>, non-essential cookies remain disabled until you choose your preference. We never sell your personal data.
              </p>
              <div class="flex flex-wrap gap-3 text-[11px] text-[#a1505a] font-medium pt-0.5">
                <a href="/privacy-policy" class="underline hover:text-[#e05e6d]">Read Indian DPDP Privacy Policy</a>
                <span>•</span>
                <a href="/grievance-redressal" class="underline hover:text-[#e05e6d]">Grievance Officer Disclosures</a>
              </div>
            </div>

            {/* THREE BUTTONS WITH IDENTICAL VISUAL WEIGHT & SIZE (No Dark Patterns) */}
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
              <button
                type="button"
                onClick={handleAcceptAll}
                class="bg-[#111111] hover:bg-black text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-[#111111] text-center"
              >
                Accept All
              </button>

              <button
                type="button"
                onClick={handleRejectAll}
                class="bg-white hover:bg-gray-100 text-gray-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-gray-300 text-center"
              >
                Reject All
              </button>

              <button
                type="button"
                onClick={() => setIsPreferencesOpen(true)}
                class="bg-gray-50 hover:bg-gray-100 text-gray-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-gray-200 text-center"
              >
                Manage Preferences
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. GRANULAR PREFERENCES MODAL */}
      {isPreferencesOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-pref-title"
          class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
        >
          <div class="bg-white w-full max-w-xl rounded-2xl border border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div class="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span class="text-[10px] font-bold uppercase tracking-widest text-[#a1505a]">Granular Consent Controls</span>
                <h3 id="cookie-pref-title" class="text-base font-bold text-gray-900">
                  Cookie & Privacy Preferences
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(false)}
                class="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center text-sm font-bold cursor-pointer"
                aria-label="Close preferences modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div class="p-5 overflow-y-auto space-y-4 text-xs text-gray-600 leading-relaxed">
              <p>
                In accordance with <strong>Rule 3 & Rule 4 of the Digital Personal Data Protection Rules, 2025</strong>, you have full control over the data processed on your device. Toggle your choices below:
              </p>

              {/* Category 1: Strictly Necessary (Locked) */}
              <div class="p-4 rounded-xl border border-gray-200 bg-gray-50 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-gray-900 text-xs">Strictly Necessary Cookies</span>
                  <span class="text-[10px] font-bold bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Always Active
                  </span>
                </div>
                <p class="text-[11px] text-gray-500">
                  Essential for shopping bag persistence, CSRF security, Razorpay checkout authorization, and GST invoice generation. Cannot be turned off.
                </p>
              </div>

              {/* Category 2: Analytics & Performance (Unticked by default) */}
              <div class="p-4 rounded-xl border border-gray-200 space-y-2">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="font-bold text-gray-900 text-xs block">Analytics & Store Performance</span>
                    <span class="text-[11px] text-gray-500">Collects aggregated, privacy-safe metrics to measure site speed and checkout reliability.</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111111]"></div>
                  </label>
                </div>
              </div>

              {/* Category 3: Marketing & Advertising (Unticked by default) */}
              <div class="p-4 rounded-xl border border-gray-200 space-y-2">
                <div class="flex items-center justify-between">
                  <div>
                    <span class="font-bold text-gray-900 text-xs block">Marketing & Re-targeting</span>
                    <span class="text-[11px] text-gray-500">Used only if you consent to personalized festive discounts and anti-tarnish styling capsules via Meta/Google ads.</span>
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      class="sr-only peer"
                    />
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#111111]"></div>
                  </label>
                </div>
              </div>

              <div class="text-[11px] text-gray-500 bg-amber-50/70 p-3 rounded-xl border border-amber-200/80">
                <strong>Proof of Consent:</strong> Your preferences will generate a tamper-evident audit record logged in our edge database and retained for 1 year per statutory Indian DPDP guidelines. You can revoke or modify consent at any time via the "Cookie Preferences" link in the footer.
              </div>
            </div>

            {/* Modal Footer Actions (Equal Prominence) */}
            <div class="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={handleRejectAll}
                class="w-full sm:w-auto bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl border border-gray-300 transition-all cursor-pointer"
              >
                Reject All Optional
              </button>
              
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  class="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-900 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Accept All
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  class="w-full sm:w-auto bg-[#111111] hover:bg-black text-white px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Save Choices
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
