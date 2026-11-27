import React, { useEffect, useState } from 'react';

const POPUP_STATE_KEY = 'satvastones_welcome_popup_v1';
const CUST_TOKEN_KEY = 'satva_customer_token';
const CUST_USER_KEY = 'satva_customer_user';
const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const CONSENT_STATEMENT =
  'I consent to Satvastones Jewellery registering my WhatsApp number and sending promotional offers, new drops, and styling updates via WhatsApp. I understand I can withdraw consent at any time.';

interface CustomerUser {
  id?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
}

type Step = 'auth' | 'whatsapp' | 'done';
type AuthMode = 'register' | 'login';

interface ResultState {
  promoConsent: boolean;
  eligibleForCoupon: boolean;
  alreadyOrdered: boolean;
  couponCode: string | null;
  whatsappNumber: string;
  message: string;
}

export default function WelcomeOfferPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('auth');
  const [authMode, setAuthMode] = useState<AuthMode>('register');

  // Auth + WhatsApp fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [promoConsent, setPromoConsent] = useState(false);

  const [signedInUser, setSignedInUser] = useState<CustomerUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<ResultState | null>(null);
  const [copied, setCopied] = useState(false);

  const getStoredAuth = (): { token: string | null; user: CustomerUser | null } => {
    try {
      const token = localStorage.getItem(CUST_TOKEN_KEY);
      const rawUser = localStorage.getItem(CUST_USER_KEY);
      const user = rawUser ? JSON.parse(rawUser) : null;
      return { token, user };
    } catch {
      return { token: null, user: null };
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Expose manual trigger if any page/banner wants to open the welcome offer
    const handleManualOpen = () => {
      const { token, user } = getStoredAuth();
      if (token && user) {
        setSignedInUser(user);
        setWhatsappNumber((prev) => prev || String(user.phone || '').replace(/[^0-9]/g, '').slice(-10));
        setStep('whatsapp');
      } else {
        setStep('auth');
      }
      setError('');
      setIsOpen(true);
    };
    window.addEventListener('satvastones:open_welcome_offer', handleManualOpen);

    // Do not auto-open on sensitive, auth, legal, or error routes
    const path = window.location.pathname;
    if (
      path.startsWith('/admin') ||
      path.startsWith('/checkout') ||
      path.startsWith('/account') ||
      path.startsWith('/privacy') ||
      path.startsWith('/404')
    ) {
      return () => window.removeEventListener('satvastones:open_welcome_offer', handleManualOpen);
    }

    // Check first-visit / cooldown state
    try {
      const rawState = localStorage.getItem(POPUP_STATE_KEY);
      if (rawState) {
        const parsed = JSON.parse(rawState);
        if (parsed?.status === 'claimed') {
          return () => window.removeEventListener('satvastones:open_welcome_offer', handleManualOpen);
        }
        if (parsed?.status === 'dismissed' && Date.now() - Number(parsed.at || 0) < DISMISS_COOLDOWN_MS) {
          return () => window.removeEventListener('satvastones:open_welcome_offer', handleManualOpen);
        }
      }
    } catch {
      /* ignore malformed storage */
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (cancelled) return;
      const { token, user } = getStoredAuth();

      if (token && user) {
        // Check if this signed-in customer already registered their WhatsApp preference
        try {
          const res = await fetch('/api/whatsapp-leads?me=1', {
            headers: { Authorization: `Bearer ${token}` },
            credentials: 'include'
          });
          const data = await res.json();
          if (cancelled) return;
          if (data?.lead) {
            localStorage.setItem(
              POPUP_STATE_KEY,
              JSON.stringify({ status: 'claimed', at: Date.now(), couponCode: data.lead.couponCode })
            );
            return;
          }
        } catch {
          /* fall through and allow prompt */
        }
        setSignedInUser(user);
        setWhatsappNumber(String(user.phone || '').replace(/[^0-9]/g, '').slice(-10));
        setStep('whatsapp');
      } else {
        setStep('auth');
      }

      if (!cancelled) setIsOpen(true);
    }, 3500);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener('satvastones:open_welcome_offer', handleManualOpen);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleDismiss();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, step]);

  const markDismissed = () => {
    try {
      const existing = localStorage.getItem(POPUP_STATE_KEY);
      if (existing && JSON.parse(existing)?.status === 'claimed') return;
    } catch {
      /* ignore */
    }
    try {
      localStorage.setItem(POPUP_STATE_KEY, JSON.stringify({ status: 'dismissed', at: Date.now() }));
    } catch {
      /* ignore */
    }
  };

  const handleDismiss = () => {
    if (step !== 'done') markDismissed();
    setIsOpen(false);
  };

  const persistWelcomeCouponToCart = (code: string) => {
    try {
      localStorage.setItem(
        'satvastones_applied_coupon',
        JSON.stringify({
          code,
          discountPaise: 0,
          discountPercent: 15,
          freeShipping: true,
          description: '15% OFF + Free Express Delivery on your first purchase'
        })
      );
      window.dispatchEvent(new CustomEvent('satvastones:coupon_applied', { detail: { code } }));
    } catch {
      /* ignore */
    }
  };

  const registerWhatsappLead = async (
    token: string,
    number: string,
    consent: boolean,
    name: string,
    userEmail: string
  ) => {
    const res = await fetch('/api/whatsapp-leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      credentials: 'include',
      body: JSON.stringify({
        whatsappNumber: number,
        promoConsent: consent,
        fullName: name,
        email: userEmail,
        consentText: CONSENT_STATEMENT,
        source: 'welcome_popup'
      })
    });
    const data = await res.json();
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || 'Could not save your WhatsApp preference. Please try again.');
    }

    if (data.eligibleForCoupon && data.couponCode) {
      persistWelcomeCouponToCart(data.couponCode);
    }

    try {
      localStorage.setItem(
        POPUP_STATE_KEY,
        JSON.stringify({
          status: 'claimed',
          at: Date.now(),
          promoConsent: Boolean(data.promoConsent),
          couponCode: data.couponCode || null
        })
      );
    } catch {
      /* ignore */
    }

    setResult({
      promoConsent: Boolean(data.promoConsent),
      eligibleForCoupon: Boolean(data.eligibleForCoupon),
      alreadyOrdered: Boolean(data.alreadyOrdered),
      couponCode: data.couponCode || null,
      whatsappNumber: data.whatsappNumber || number,
      message: data.message || ''
    });
    setStep('done');
  };

  const handleRegisterAndClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanWa = whatsappNumber.replace(/[^0-9]/g, '').slice(-10);
    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanWa)) {
      setError('Please enter a valid 10-digit Indian WhatsApp number.');
      return;
    }
    if (password.trim().length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      const regRes = await fetch('/api/customer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: cleanWa,
          password: password.trim()
        })
      });
      const regData = await regRes.json();

      if (!regRes.ok || !regData?.success || !regData?.token) {
        if (regRes.status === 409) {
          setError('An account with this email or mobile already exists. Switch to "Sign in" above to continue.');
          setLoginIdentifier(email.trim() || cleanWa);
        } else {
          setError(regData?.error || 'Registration failed. Please check your details.');
        }
        return;
      }

      localStorage.setItem(CUST_TOKEN_KEY, regData.token);
      localStorage.setItem(CUST_USER_KEY, JSON.stringify(regData.customer));
      setSignedInUser(regData.customer);

      await registerWhatsappLead(
        regData.token,
        cleanWa,
        promoConsent,
        regData.customer?.fullName || fullName.trim(),
        regData.customer?.email || email.trim()
      );
    } catch (err: any) {
      setError(err?.message || 'Unable to connect right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setError('Enter your email or mobile number and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/customer/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          identifier: loginIdentifier.trim(),
          password: loginPassword.trim()
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.success || !data?.token) {
        setError(data?.error || 'Invalid credentials. Please try again.');
        return;
      }

      localStorage.setItem(CUST_TOKEN_KEY, data.token);
      localStorage.setItem(CUST_USER_KEY, JSON.stringify(data.customer));
      setSignedInUser(data.customer);
      setWhatsappNumber(String(data.customer?.phone || '').replace(/[^0-9]/g, '').slice(-10));
      setStep('whatsapp');
    } catch {
      setError('Network error while signing in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsappSubmit = async (e: React.FormEvent, overrideConsent?: boolean) => {
    e.preventDefault();
    setError('');

    const { token, user } = getStoredAuth();
    if (!token) {
      setStep('auth');
      setError('Please sign in first to register your WhatsApp number.');
      return;
    }

    const cleanWa = whatsappNumber.replace(/[^0-9]/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanWa)) {
      setError('Please enter a valid 10-digit Indian WhatsApp number.');
      return;
    }

    const consentValue = typeof overrideConsent === 'boolean' ? overrideConsent : promoConsent;
    setLoading(true);
    try {
      await registerWhatsappLead(
        token,
        cleanWa,
        consentValue,
        user?.fullName || user?.name || fullName,
        user?.email || email
      );
    } catch (err: any) {
      setError(err?.message || 'Unable to save WhatsApp preference.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!result?.couponCode) return;
    try {
      await navigator.clipboard.writeText(result.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-offer-heading"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#14110f]/75 p-3 backdrop-blur-xs sm:p-5"
      onClick={handleDismiss}
    >
      <div
        className="relative grid max-h-[92vh] w-full max-w-[780px] overflow-y-auto border border-[#d8d0c4] bg-[#fbf9f5] text-[#14110f] shadow-2xl sm:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
      >
        {/* Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close welcome offer"
          className="absolute right-3 top-3 z-20 flex h-8 w-8 cursor-pointer items-center justify-center border border-[#d8d0c4] bg-[#fbf9f5]/95 text-[#6f675f] transition-colors hover:border-[#14110f] hover:text-[#14110f]"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Left Editorial Brand Panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#14110f] p-6 text-[#f6f1e8] sm:col-span-5 sm:p-7">
          <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#c5a059]/15 blur-2xl" />
          <div className="relative">
            <p className="text-[9px] font-medium uppercase tracking-[0.24em] text-[#e3c98d]">
              First-order privilege
            </p>
            <h2
              id="welcome-offer-heading"
              className="font-display mt-3 text-[2rem] leading-[1.02] tracking-[-0.02em] text-[#fbf9f5] sm:text-[2.35rem]"
            >
              15% off &amp; free delivery.
            </h2>
            <p className="mt-3 text-[12px] leading-relaxed text-white/70">
              Sign in or create your Satvastones account and opt in on WhatsApp to unlock your welcome code on your first order.
            </p>
          </div>

          <div className="relative mt-6 space-y-2.5 border-t border-white/15 pt-5 text-[10.5px] text-white/80">
            <div className="flex items-center gap-2.5">
              <span className="text-[#c5a059]" aria-hidden="true">✦</span>
              <span><strong className="font-medium text-white">15% OFF</strong> your entire first bag</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#c5a059]" aria-hidden="true">✦</span>
              <span><strong className="font-medium text-white">Free express delivery</strong> (even under ₹499)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#c5a059]" aria-hidden="true">✦</span>
              <span>18K gold PVD · 316L waterproof steel</span>
            </div>
          </div>

          <p className="relative mt-5 text-[9.5px] leading-relaxed text-white/45">
            Your WhatsApp consent choice is recorded under India's DPDP Act, 2023. Withdraw anytime.
          </p>
        </div>

        {/* Right Interactive Form Panel */}
        <div className="flex flex-col justify-center p-5 sm:col-span-7 sm:p-7">
          {error && (
            <div
              role="alert"
              className="mb-4 border-l-2 border-[#8d3f3d] bg-[#f8eeee] px-3.5 py-2.5 text-[11px] leading-relaxed text-[#8d3f3d]"
            >
              {error}
            </div>
          )}

          {/* STEP 1: REGISTER OR SIGN IN */}
          {step === 'auth' && (
            <div>
              <div className="mb-4 flex border-b border-[#e5ded3]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setError('');
                  }}
                  className={`flex-1 cursor-pointer border-b-2 pb-2.5 text-[10px] font-medium uppercase tracking-[0.16em] transition-colors ${
                    authMode === 'register'
                      ? 'border-[#14110f] text-[#14110f]'
                      : 'border-transparent text-[#8a8279] hover:text-[#14110f]'
                  }`}
                >
                  New customer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setError('');
                  }}
                  className={`flex-1 cursor-pointer border-b-2 pb-2.5 text-[10px] font-medium uppercase tracking-[0.16em] transition-colors ${
                    authMode === 'login'
                      ? 'border-[#14110f] text-[#14110f]'
                      : 'border-transparent text-[#8a8279] hover:text-[#14110f]'
                  }`}
                >
                  Already have an account
                </button>
              </div>

              {authMode === 'register' ? (
                <form onSubmit={handleRegisterAndClaim} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="wo-name" className="mb-1 block text-[9px] uppercase tracking-[0.15em] text-[#6f675f]">
                        Full name *
                      </label>
                      <input
                        id="wo-name"
                        type="text"
                        required
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Priya Sharma"
                        className="h-9 w-full border border-[#d8d0c4] bg-white px-3 text-[12px] text-[#14110f] placeholder:text-[#9a938b] focus:border-[#14110f] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="wo-email" className="mb-1 block text-[9px] uppercase tracking-[0.15em] text-[#6f675f]">
                        Email address *
                      </label>
                      <input
                        id="wo-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="priya@gmail.com"
                        className="h-9 w-full border border-[#d8d0c4] bg-white px-3 text-[12px] text-[#14110f] placeholder:text-[#9a938b] focus:border-[#14110f] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="wo-wa" className="mb-1 block text-[9px] uppercase tracking-[0.15em] text-[#6f675f]">
                        WhatsApp number *
                      </label>
                      <div className="flex">
                        <span className="flex h-9 items-center border border-r-0 border-[#d8d0c4] bg-[#f4efe7] px-2.5 text-[11px] font-medium text-[#5f5851]">
                          +91
                        </span>
                        <input
                          id="wo-wa"
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          required
                          autoComplete="tel-national"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                          placeholder="9876543210"
                          className="h-9 w-full border border-[#d8d0c4] bg-white px-3 text-[12px] text-[#14110f] placeholder:text-[#9a938b] focus:border-[#14110f] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="wo-pwd" className="mb-1 block text-[9px] uppercase tracking-[0.15em] text-[#6f675f]">
                        Create password *
                      </label>
                      <input
                        id="wo-pwd"
                        type="password"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="h-9 w-full border border-[#d8d0c4] bg-white px-3 text-[12px] text-[#14110f] placeholder:text-[#9a938b] focus:border-[#14110f] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Explicit DPDP WhatsApp Promotional Consent Checkbox */}
                  <label className="flex cursor-pointer items-start gap-2.5 border border-[#e5ded3] bg-[#f4efe7]/70 p-3 text-[11px] leading-relaxed text-[#4a443f]">
                    <input
                      type="checkbox"
                      checked={promoConsent}
                      onChange={(e) => setPromoConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#14110f]"
                    />
                    <span>
                      <strong className="font-medium text-[#14110f]">
                        Yes, send me promotional offers &amp; new drops on WhatsApp.
                      </strong>{' '}
                      Consent is required to unlock the <strong className="font-medium text-[#14110f]">15% OFF + Free Delivery</strong> code. Your choice (Yes/No) is stored per our{' '}
                      <a href="/privacy-policy" className="underline decoration-[#c5a059] underline-offset-2 hover:text-[#14110f]">
                        Privacy Policy
                      </a>.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 bg-[#14110f] px-5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#f6f1e8] transition-colors hover:bg-[#8d3f3d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading
                      ? 'Registering…'
                      : promoConsent
                        ? 'Unlock 15% off + free delivery →'
                        : 'Create account (without promo messages) →'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-3.5">
                  <div>
                    <label htmlFor="wo-login-id" className="mb-1 block text-[9px] uppercase tracking-[0.15em] text-[#6f675f]">
                      Email or mobile number *
                    </label>
                    <input
                      id="wo-login-id"
                      type="text"
                      required
                      autoComplete="username"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="priya@gmail.com or 9876543210"
                      className="h-10 w-full border border-[#d8d0c4] bg-white px-3 text-[12px] text-[#14110f] placeholder:text-[#9a938b] focus:border-[#14110f] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="wo-login-pwd" className="mb-1 block text-[9px] uppercase tracking-[0.15em] text-[#6f675f]">
                      Password *
                    </label>
                    <input
                      id="wo-login-pwd"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-10 w-full border border-[#d8d0c4] bg-white px-3 text-[12px] text-[#14110f] placeholder:text-[#9a938b] focus:border-[#14110f] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 bg-[#14110f] px-5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#f6f1e8] transition-colors hover:bg-[#8d3f3d] disabled:opacity-60"
                  >
                    {loading ? 'Signing in…' : 'Sign in & continue →'}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={handleDismiss}
                className="mt-3.5 block w-full cursor-pointer text-center text-[10px] uppercase tracking-[0.14em] text-[#8a8279] underline decoration-[#d8d0c4] underline-offset-4 transition-colors hover:text-[#14110f]"
              >
                No thanks, continue browsing
              </button>
            </div>
          )}

          {/* STEP 2: SIGNED-IN CUSTOMER WHATSAPP + CONSENT */}
          {step === 'whatsapp' && (
            <form onSubmit={handleWhatsappSubmit} className="space-y-4">
              <div>
                <p className="text-[9.5px] font-medium uppercase tracking-[0.18em] text-[#2f7d5a]">
                  ✓ Signed in as {signedInUser?.fullName || signedInUser?.name || signedInUser?.email || 'Member'}
                </p>
                <h3 className="font-display mt-1.5 text-[1.6rem] leading-tight text-[#14110f]">
                  Confirm your WhatsApp number.
                </h3>
                <p className="mt-1 text-[11.5px] leading-relaxed text-[#5f5851]">
                  Enter your WhatsApp number and choose whether you'd like promotional updates from Satvastones.
                </p>
              </div>

              <div>
                <label htmlFor="wo-wa-step2" className="mb-1 block text-[9px] uppercase tracking-[0.15em] text-[#6f675f]">
                  WhatsApp mobile number *
                </label>
                <div className="flex">
                  <span className="flex h-10 items-center border border-r-0 border-[#d8d0c4] bg-[#f4efe7] px-3 text-[11.5px] font-medium text-[#5f5851]">
                    +91
                  </span>
                  <input
                    id="wo-wa-step2"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    required
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    placeholder="9876543210"
                    className="h-10 w-full border border-[#d8d0c4] bg-white px-3 text-[12.5px] text-[#14110f] placeholder:text-[#9a938b] focus:border-[#14110f] focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-2.5 border border-[#e5ded3] bg-[#f4efe7]/70 p-3 text-[11px] leading-relaxed text-[#4a443f]">
                <input
                  type="checkbox"
                  checked={promoConsent}
                  onChange={(e) => setPromoConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-[#14110f]"
                />
                <span>
                  <strong className="font-medium text-[#14110f]">
                    Yes, I consent to receive promotional offers, new drops &amp; styling alerts on WhatsApp.
                  </strong>{' '}
                  Required to unlock <strong className="font-medium text-[#14110f]">15% OFF + Free Delivery</strong> on your first purchase.
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 bg-[#14110f] px-5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#f6f1e8] transition-colors hover:bg-[#8d3f3d] disabled:opacity-60"
              >
                {loading
                  ? 'Saving preference…'
                  : promoConsent
                    ? 'Unlock 15% off + free delivery →'
                    : 'Save WhatsApp (Do not send promos) →'}
              </button>
            </form>
          )}

          {/* STEP 3: UNLOCKED OR PREFERENCE RECORDED */}
          {step === 'done' && result && (
            <div className="space-y-4">
              {result.eligibleForCoupon && result.couponCode ? (
                <>
                  <p className="text-[9.5px] font-medium uppercase tracking-[0.2em] text-[#2f7d5a]">
                    ✓ Welcome privilege unlocked
                  </p>
                  <h3 className="font-display text-[1.9rem] leading-[1.05] text-[#14110f]">
                    15% off + free delivery is yours.
                  </h3>
                  <p className="text-[12px] leading-relaxed text-[#5f5851]">
                    We've registered <strong className="font-medium text-[#14110f]">+91 {result.whatsappNumber}</strong> with your WhatsApp promotional consent and automatically saved your welcome code to your bag.
                  </p>

                  <div className="flex items-center justify-between gap-3 border border-[#c5a059] bg-[#f4efe7] px-4 py-3.5">
                    <div>
                      <p className="text-[8.5px] uppercase tracking-[0.2em] text-[#8a8279]">First-purchase code</p>
                      <p className="mt-0.5 font-mono text-lg font-semibold tracking-[0.14em] text-[#14110f]">
                        {result.couponCode}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="cursor-pointer border border-[#14110f] bg-[#14110f] px-4 py-2 text-[9.5px] font-medium uppercase tracking-[0.14em] text-[#f6f1e8] transition-colors hover:bg-[#8d3f3d] hover:border-[#8d3f3d]"
                    >
                      {copied ? 'Copied ✓' : 'Copy code'}
                    </button>
                  </div>

                  <p className="text-[11px] text-[#2f7d5a]">
                    ✦ Applied automatically — add any piece to your bag to see 15% OFF &amp; ₹0 shipping.
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 bg-[#14110f] px-5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#f6f1e8] transition-colors hover:bg-[#8d3f3d]"
                  >
                    Start shopping →
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[9.5px] font-medium uppercase tracking-[0.2em] text-[#8d3f3d]">
                    Preference recorded
                  </p>
                  <h3 className="font-display text-[1.65rem] leading-tight text-[#14110f]">
                    {result.promoConsent
                      ? 'Your WhatsApp is registered.'
                      : 'Promotional messages turned off.'}
                  </h3>
                  <p className="text-[12px] leading-relaxed text-[#5f5851]">{result.message}</p>

                  {!result.promoConsent && !result.alreadyOrdered && (
                    <button
                      type="button"
                      disabled={loading}
                      onClick={(e) => {
                        setPromoConsent(true);
                        handleWhatsappSubmit(e as any, true);
                      }}
                      className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 border border-[#14110f] bg-white px-4 text-[10px] font-medium uppercase tracking-[0.14em] text-[#14110f] transition-colors hover:bg-[#14110f] hover:text-[#f6f1e8]"
                    >
                      {loading ? 'Updating…' : 'Enable WhatsApp promos & unlock 15% OFF →'}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 bg-[#14110f] px-5 text-[10px] font-medium uppercase tracking-[0.16em] text-[#f6f1e8] transition-colors hover:bg-[#8d3f3d]"
                  >
                    Continue shopping →
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
