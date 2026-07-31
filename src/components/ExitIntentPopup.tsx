import React, { useState, useEffect } from 'react';
import { X, Gift, User, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ExitIntentPopup({ currentUser }: { currentUser?: any }) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (currentUser) return;
    const alreadyShown = localStorage.getItem('welcome_popup_shown');
    if (alreadyShown) return;

    const timer = setTimeout(() => {
      setShow(true);
      localStorage.setItem('welcome_popup_shown', 'true');
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentUser]);

  if (!show || dismissed || currentUser) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDismissed(true)}>
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button onClick={() => setDismissed(true)} className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center hover:bg-gray-100" aria-label="Close">
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* Pink Header */}
        <div className="bg-[#f2707f] px-6 py-7 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-white text-xl font-bold">Welcome to Satvastones!</h2>
          <p className="text-white/80 text-xs mt-1">You're going to love our jewelry</p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-center">
          <div className="bg-pink-50 rounded-xl p-5 mb-5">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Exclusive Member Offer</p>
            <p className="text-4xl font-bold text-[#f2707f]">20% OFF</p>
            <p className="text-xs text-gray-600 mt-1.5">on your first order</p>
          </div>

          <p className="text-xs text-gray-600 mb-5 leading-relaxed">
            Sign in or create an account to unlock your <span className="font-bold text-gray-800">20% welcome discount</span>. No code needed — discount auto-applies at checkout!
          </p>

          <button
            onClick={() => {
              setDismissed(true);
              navigate('/account');
            }}
            className="w-full py-3.5 bg-[#f2707f] hover:bg-[#d4535f] text-white text-sm font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Login & Claim 20% OFF
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="w-full py-2.5 text-[11px] text-gray-400 hover:text-gray-600 mt-2 transition-colors"
          >
            Maybe later
          </button>

          <p className="text-[9px] text-gray-400 mt-4">Valid for new users. One-time use. T&Cs apply.</p>
        </div>
      </div>
    </div>
  );
}
