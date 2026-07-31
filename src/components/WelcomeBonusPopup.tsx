import React, { useState } from 'react';
import { X, Gift, PartyPopper, Copy, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WelcomeBonusPopup({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const couponCode = 'THANK10';

  const handleCopy = () => {
    navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden relative animate-bounce-in" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button onClick={onClose} className="absolute top-3 right-3 z-10 w-7 h-7 rounded-full bg-white/80 flex items-center justify-center hover:bg-gray-100" aria-label="Close">
          <X className="h-4 w-4 text-gray-600" />
        </button>

        {/* Celebration Header */}
        <div className="bg-gradient-to-r from-[#f2707f] to-[#d4535f] px-6 py-8 text-center relative overflow-hidden">
          {/* Confetti-like dots */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-4 w-2 h-2 bg-white rounded-full" />
            <div className="absolute top-6 right-8 w-1.5 h-1.5 bg-white rounded-full" />
            <div className="absolute top-10 left-8 w-2.5 h-2.5 bg-white rounded-full" />
            <div className="absolute bottom-4 right-4 w-2 h-2 bg-white rounded-full" />
            <div className="absolute bottom-8 left-12 w-1.5 h-1.5 bg-white rounded-full" />
            <div className="absolute top-3 right-12 w-2 h-2 bg-white/60 rounded-full" />
          </div>

          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <PartyPopper className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-white text-xl font-bold">Welcome to the Family! 🎉</h2>
          <p className="text-white/80 text-xs mt-1">You're now part of the Satvastones community</p>
        </div>

        {/* Body */}
        <div className="px-6 py-6 text-center">
          <div className="bg-pink-50 rounded-xl p-5 mb-5 border-2 border-dashed border-[#f2707f]">
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-1">🎁 Your Welcome Gift</p>
            <p className="text-3xl font-bold text-[#f2707f]">10% OFF</p>
            <p className="text-xs text-gray-600 mt-1">on your first order</p>
          </div>

          <p className="text-xs text-gray-600 mb-4 leading-relaxed">
            Use code <span className="font-bold text-gray-800">{couponCode}</span> at checkout to save on your purchase. 
            We've already applied it to your account — it'll auto-apply when you check out!
          </p>

          <div className="flex items-center justify-center gap-2 mb-5">
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 flex items-center gap-3">
              <span className="text-sm font-bold text-gray-800 tracking-widest">{couponCode}</span>
              <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-gray-200 transition-colors">
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <button
            onClick={() => { onClose(); navigate('/shop'); }}
            className="w-full py-3 bg-[#f2707f] hover:bg-[#d4535f] text-white text-sm font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
          >
            <Gift className="h-4 w-4" />
            Start Shopping
          </button>

          <p className="text-[9px] text-gray-400 mt-4">Valid for first order only. Cannot be combined with other offers.</p>
        </div>
      </div>
    </div>
  );
}
