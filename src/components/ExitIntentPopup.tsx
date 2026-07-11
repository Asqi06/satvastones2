import React, { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem('exit_popup_shown');
    if (alreadyShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !dismissed) {
        setShow(true);
        localStorage.setItem('exit_popup_shown', 'true');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dismissed && !localStorage.getItem('exit_popup_shown')) {
        setShow(true);
        localStorage.setItem('exit_popup_shown', 'true');
      }
    };

    // Also show after 30 seconds on mobile (no mouse leave on mobile)
    const timer = setTimeout(() => {
      if (!dismissed && !localStorage.getItem('exit_popup_shown')) {
        setShow(true);
        localStorage.setItem('exit_popup_shown', 'true');
      }
    }, 30000);

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(timer);
    };
  }, [dismissed]);

  if (!show || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDismissed(true)}>
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button onClick={() => setDismissed(true)} className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center">
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* Pink Header */}
        <div className="bg-[#f2707f] px-6 py-6 text-center">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-white text-lg font-bold">Wait! Don't Go Empty Handed</h2>
          <p className="text-white/80 text-[11px] mt-1">You're missing out on something special</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 text-center">
          <div className="bg-pink-50 rounded-xl p-4 mb-4">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Your Exclusive Offer</p>
            <p className="text-3xl font-bold text-[#f2707f]">10% OFF</p>
            <p className="text-[10px] text-gray-600 mt-1">on your first order</p>
          </div>

          <p className="text-[11px] text-gray-500 mb-4 leading-relaxed">
            Use code <span className="font-bold text-gray-800">WELCOME10</span> at checkout. We promise you'll love our jewelry!
          </p>

          <button
            onClick={() => {
              navigator.clipboard.writeText('WELCOME10');
              setDismissed(true);
            }}
            className="w-full py-3 bg-[#f2707f] hover:bg-[#d4535f] text-white text-sm font-bold rounded-lg uppercase tracking-wider transition-colors"
          >
            Copy Code & Shop Now
          </button>

          <p className="text-[9px] text-gray-400 mt-3">Valid on all products. No minimum order.</p>
        </div>
      </div>
    </div>
  );
}
