import React, { useState, useEffect } from 'react';
import { getOrders, getSiteSettings, type AdminOrder } from '../stores/adminStore';

interface RealPurchase {
  id: string;
  customerName: string;
  city: string;
  item: string;
  time: string;
  img: string;
}

function formatRelativeTime(isoString: string): string {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    if (isNaN(diffMs) || diffMs < 0) return 'Just recently';
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return 'Recently';
  } catch {
    return 'Recently';
  }
}

function maskName(fullName: string): string {
  if (!fullName) return 'Verified Patron';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

export default function SocialProofToast() {
  const [realPurchases, setRealPurchases] = useState<RealPurchase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Load and subscribe strictly to REAL verified orders
  useEffect(() => {
    // Check if user previously dismissed in this session
    try {
      if (sessionStorage.getItem('satvastones_toast_dismissed') === 'true') {
        setDismissed(true);
        return;
      }
    } catch {}

    const loadRealPurchases = () => {
      try {
        const settings = getSiteSettings();
        if (settings.enableSocialProofToast === false) {
          setRealPurchases([]);
          return;
        }

        const orders: AdminOrder[] = getOrders();
        // Filter strictly for real paid orders with valid product items
        const validOrders = orders.filter(
          (o) => o.paymentStatus === 'PAID' && o.items && o.items.length > 0 && o.items[0]?.name
        );

        if (validOrders.length === 0) {
          // If NO real verified orders exist, do NOT show fake simulation!
          setRealPurchases([]);
          return;
        }

        const mapped: RealPurchase[] = validOrders.map((ord) => ({
          id: ord.id || ord.orderNumber,
          customerName: maskName(ord.customerName),
          city: ord.city || 'India',
          item: ord.items[0].name,
          time: formatRelativeTime(ord.createdAt),
          img: ord.items[0].image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=150&q=80'
        }));

        setRealPurchases(mapped);
      } catch (err) {
        console.warn('Error loading real purchases for social proof:', err);
        setRealPurchases([]);
      }
    };

    loadRealPurchases();

    // Listen to real new order placement event from checkout
    const handleNewOrder = () => {
      loadRealPurchases();
    };
    window.addEventListener('satvastones:new_order', handleNewOrder);
    window.addEventListener('storage', handleNewOrder);

    return () => {
      window.removeEventListener('satvastones:new_order', handleNewOrder);
      window.removeEventListener('storage', handleNewOrder);
    };
  }, []);

  // Timer loop: Only active if real purchases exist and user hasn't dismissed
  useEffect(() => {
    if (dismissed || realPurchases.length === 0) {
      setIsVisible(false);
      return;
    }

    // Initial delay before showing real purchase toast
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    // Rotate through real orders every 14 seconds
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % realPurchases.length);
        setIsVisible(true);
      }, 1000);
    }, 14000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [dismissed, realPurchases.length]);

  const handleDismiss = () => {
    setDismissed(true);
    setIsVisible(false);
    try {
      sessionStorage.setItem('satvastones_toast_dismissed', 'true');
    } catch {}
  };

  // If no real purchases exist or dismissed, render nothing (no fake toasts)
  if (dismissed || realPurchases.length === 0) return null;

  const current = realPurchases[currentIndex % realPurchases.length];
  if (!current) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-20 lg:bottom-6 left-3 sm:left-6 z-40 max-w-xs sm:max-w-sm transition-all duration-500 ease-out transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
      }`}
    >
      <div className="bg-white/95 border border-[#f9d8dc] shadow-xl rounded-[18px] p-3 flex items-center gap-3 backdrop-blur-md">
        <img
          src={current.img}
          alt={current.item}
          width="44"
          height="52"
          className="w-11 h-13 object-cover rounded-[10px] bg-gray-50 border border-gray-100 shrink-0"
        />
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 text-[9.5px] uppercase font-extrabold tracking-wider text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Verified Order • {current.city}</span>
          </div>
          <p className="text-xs font-bold text-gray-900 truncate mt-0.5" title={current.item}>
            {current.item}
          </p>
          <p className="text-[10px] text-gray-500">
            {current.time} • 18K Gold PVD (Vapi Atelier)
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-700 p-1 rounded-full cursor-pointer transition-colors"
          title="Dismiss verified order notifications"
          aria-label="Dismiss notification"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
