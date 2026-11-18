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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPreferencesOpen(false);
    };
    window.addEventListener('satvastones:open_cookie_preferences', handleReopen);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('satvastones:open_cookie_preferences', handleReopen);
      window.removeEventListener('keydown', handleKeyDown);
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
      {/* 1. MAIN BANNER: Equal prominence, no dark patterns, and it never blocks the buy box */}
      {isOpen && !isPreferencesOpen && (
        <div
          role="region"
          aria-label="Digital Personal Data Protection Consent Banner"
          className="fixed bottom-[4.5rem] left-4 right-4 z-[9999] border border-[#e0d7c9] bg-[#fbf9f5] p-4 shadow-[0_18px_50px_rgba(20,17,15,0.18)] sm:bottom-5 sm:left-5 sm:right-auto sm:max-w-[340px]"
        >
          <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#8d3f3d]">
            Your privacy, your choice
          </p>
          <p className="mt-1.5 text-[11.5px] leading-[1.6] text-[#4a443f]">
            Essential cookies power your bag, payments and GST invoices. Optional analytics stay off until you consent, under India's{' '}
            <strong className="font-medium text-[#14110f]">DPDP Act, 2023</strong>. We never sell your data.
          </p>
          <p className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[9.5px] text-[#6f675f]">
            <a href="/privacy-policy" className="underline decoration-[#d8c3a6] underline-offset-2 hover:text-[#14110f]">
              Privacy policy
            </a>
            <a href="/grievance-redressal" className="underline decoration-[#d8c3a6] underline-offset-2 hover:text-[#14110f]">
              Grievance officer
            </a>
          </p>

          <div className="mt-3 grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={handleAcceptAll}
              className="h-8 cursor-pointer bg-[#14110f] text-[8.5px] font-medium uppercase tracking-[0.1em] text-[#f6f1e8] transition-colors hover:bg-[#8d3f3d]"
            >
              Accept all
            </button>
            <button
              type="button"
              onClick={handleRejectAll}
              className="h-8 cursor-pointer border border-[#cfc5b6] bg-transparent text-[8.5px] font-medium uppercase tracking-[0.1em] text-[#14110f] transition-colors hover:bg-[#f1ece3]"
            >
              Reject all
            </button>
            <button
              type="button"
              onClick={() => setIsPreferencesOpen(true)}
              className="h-8 cursor-pointer border border-[#cfc5b6] bg-transparent text-[8.5px] font-medium uppercase tracking-[0.1em] text-[#14110f] transition-colors hover:bg-[#f1ece3]"
            >
              Preferences
            </button>
          </div>
        </div>
      )}

      {/* 2. GRANULAR PREFERENCES MODAL */}
      {isPreferencesOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-pref-title"
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#14110f]/70 p-4 backdrop-blur-sm"
          onClick={() => setIsPreferencesOpen(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden border border-[#e5ded3] bg-[#fbf9f5] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-[#e5ded3] px-5 py-4 sm:px-6">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-[#c5a059]">
                  Granular consent controls
                </p>
                <h2 id="cookie-pref-title" className="font-display mt-1 text-[1.5rem] leading-none text-[#14110f]">
                  Cookie &amp; privacy preferences
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPreferencesOpen(false)}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center border border-[#d8d0c4] text-[#6f675f] transition-colors hover:border-[#14110f] hover:text-[#14110f]"
                aria-label="Close preferences modal"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-3 overflow-y-auto px-5 py-5 text-[11.5px] leading-relaxed text-[#4a443f] sm:px-6">
              <p>
                Under <strong className="font-medium text-[#14110f]">Rules 3 and 4 of the Digital Personal Data Protection Rules, 2025</strong>, you control what is processed on your device. Toggle each category below.
              </p>

              {/* Category 1: Strictly Necessary (Locked) */}
              <div className="border border-[#e5ded3] bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11.5px] font-medium text-[#14110f]">Strictly necessary</span>
                  <span className="border border-[#e5ded3] bg-[#f4efe7] px-2 py-0.5 text-[8px] uppercase tracking-[0.14em] text-[#6f675f]">
                    Always active
                  </span>
                </div>
                <p className="mt-1.5 text-[10.5px] leading-relaxed text-[#8a8279]">
                  Required for bag persistence, CSRF security, Razorpay checkout authorisation and GST invoice generation. Cannot be switched off.
                </p>
              </div>

              {/* Category 2: Analytics */}
              <div className="border border-[#e5ded3] bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="block text-[11.5px] font-medium text-[#14110f]">Analytics &amp; performance</span>
                    <span className="mt-1 block text-[10.5px] leading-relaxed text-[#8a8279]">
                      Aggregated, privacy-safe metrics on site speed and checkout reliability.
                    </span>
                  </div>
                  <label className="relative mt-0.5 inline-flex shrink-0 cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={analytics}
                      onChange={(e) => setAnalytics(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="h-5 w-10 border border-[#cfc5b6] bg-[#f1ece3] transition-colors peer-checked:border-[#14110f] peer-checked:bg-[#14110f] peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#14110f]"></span>
                    <span className="pointer-events-none absolute left-[3px] top-[3px] h-[14px] w-[14px] bg-white transition-transform peer-checked:translate-x-5"></span>
                  </label>
                </div>
              </div>

              {/* Category 3: Marketing */}
              <div className="border border-[#e5ded3] bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="block text-[11.5px] font-medium text-[#14110f]">Marketing &amp; re-targeting</span>
                    <span className="mt-1 block text-[10.5px] leading-relaxed text-[#8a8279]">
                      Used only with consent, for festive offers and styling capsules on Meta and Google.
                    </span>
                  </div>
                  <label className="relative mt-0.5 inline-flex shrink-0 cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={marketing}
                      onChange={(e) => setMarketing(e.target.checked)}
                      className="peer sr-only"
                    />
                    <span className="h-5 w-10 border border-[#cfc5b6] bg-[#f1ece3] transition-colors peer-checked:border-[#14110f] peer-checked:bg-[#14110f] peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#14110f]"></span>
                    <span className="pointer-events-none absolute left-[3px] top-[3px] h-[14px] w-[14px] bg-white transition-transform peer-checked:translate-x-5"></span>
                  </label>
                </div>
              </div>

              <div className="border-l-2 border-[#c5a059] bg-[#faf3e6] px-3.5 py-3 text-[10.5px] leading-relaxed text-[#6b4a1c]">
                <strong className="font-medium text-[#6b4a1c]">Proof of consent:</strong> your choices generate a tamper-evident audit record in our edge database, retained for one year per Indian DPDP rules. You can change or revoke consent any time via the Cookie Preferences link in the footer.
              </div>
            </div>

            {/* Modal Footer Actions (Equal Prominence) */}
            <div className="flex flex-col items-center justify-between gap-2.5 border-t border-[#e5ded3] bg-[#f4efe7] px-5 py-4 sm:flex-row sm:px-6">
              <button
                type="button"
                onClick={handleRejectAll}
                className="w-full cursor-pointer border border-[#14110f] px-4 py-2.5 text-[9px] uppercase tracking-[0.14em] text-[#14110f] transition-colors hover:bg-[#fbf9f5] sm:w-auto"
              >
                Reject all optional
              </button>

              <div className="flex w-full items-center gap-2 sm:w-auto">
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="w-full cursor-pointer border border-[#cfc5b6] bg-white px-4 py-2.5 text-[9px] uppercase tracking-[0.14em] text-[#14110f] transition-colors hover:border-[#14110f] sm:w-auto"
                >
                  Accept all
                </button>
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="w-full cursor-pointer bg-[#14110f] px-5 py-2.5 text-[9px] uppercase tracking-[0.14em] text-[#f6f1e8] transition-colors hover:bg-[#8d3f3d] sm:w-auto"
                >
                  Save choices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
