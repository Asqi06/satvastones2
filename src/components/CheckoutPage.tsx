import React, { useState, useEffect } from 'react';
import { CreditCard, Truck, ShieldCheck, Zap, ArrowLeft, Wallet, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { analytics } from '../utils/analytics';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function isSaleProduct(product: any): boolean {
  if (product.isNinetyNine) return true;
  if (product.oldPrice && product.oldPrice > product.price) return true;
  return false;
}

export default function CheckoutPage({
  cart,
  currentUser,
  onBack,
  onComplete,
  onLoginRedirect,
  calculateShipping,
  cmsData
}: {
  cart: any[],
  currentUser: any,
  onBack: () => void,
  onComplete: (order: any) => void,
  onLoginRedirect: () => void,
  calculateShipping: (pincode: string, subtotal: number, paymentMethod: string) => number,
  cmsData?: any
}) {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  // Auto-apply THANK10 welcome coupon for logged-in users
  useEffect(() => {
    if (!currentUser || localStorage.getItem('welcome_bonus_used')) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/coupons/validate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: 'THANK10', email: currentUser.email })
        });
        const data = await res.json();
        if (data.valid) {
          setActiveCoupon(data.coupon);
          setCouponCode('THANK10');
          localStorage.setItem('welcome_bonus_used', 'true');
        }
      } catch {}
    })();
  }, [currentUser]);
  const [showCodDialog, setShowCodDialog] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('checkout_form');
    return saved ? JSON.parse(saved) : { name: '', email: '', phone: '', address: '', city: '', pincode: '' };
  });

  useEffect(() => {
    analytics.trackCustom('checkout_start', { itemCount: cart.length, total: cart.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0) });
  }, []);

  React.useEffect(() => {
    localStorage.setItem('checkout_form', JSON.stringify(formData));
  }, [formData]);

  const subtotal = cart.reduce((acc, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : (item.price || 0);
    return acc + (price * (item.qty || 1));
  }, 0);

  // Calculate subtotal of NON-sale items only (for coupon discount)
  const nonSaleSubtotal = cart.reduce((acc, item) => {
    const product = cmsData?.products?.find((p: any) => (p._id || p.id) === (item._id || item.id));
    const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : (item.price || 0);
    if (!isSaleProduct(product) && !isSaleProduct(item)) {
      return acc + (price * (item.qty || 1));
    }
    return acc;
  }, 0);

  const shipping = calculateShipping(formData.pincode, subtotal, paymentMethod);
  const discountAmount = activeCoupon ? Math.round((nonSaleSubtotal * activeCoupon.discount) / 100) : 0;
  const total = Math.round(subtotal + shipping - discountAmount);

  const applyCoupon = async () => {
    const code = couponCode.toUpperCase();
    if (!code) return;
    setCouponError('');
    if (!currentUser) {
      setCouponError('Please login to use a coupon code');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, email: currentUser.email })
      });
      const data = await res.json();
      if (data.valid) {
        setActiveCoupon(data.coupon);
      } else {
        setCouponError(data.error || 'Invalid or expired code');
        setActiveCoupon(null);
      }
    } catch {
      setCouponError('Failed to validate coupon');
      setActiveCoupon(null);
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.address) {
      alert('Please fill all shipping details');
      return;
    }
    if (!currentUser) {
      localStorage.setItem('checkout_pending', 'true');
      onLoginRedirect();
      return;
    }
    setIsProcessing(true);
    try {
      if (paymentMethod === 'cod') {
        const orderDetails = { customer: formData, items: cart, amount: total, paymentMethod: 'COD', couponCode: activeCoupon?.code || null, discountAmount };
        const res = await fetch(`${API_URL}/verify-payment`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ razorpay_order_id: 'COD_' + Date.now(), razorpay_payment_id: 'COD', razorpay_signature: 'COD', orderDetails })
        });
        if (res.ok) { const data = await res.json(); onComplete(data.order); }
        else { alert('Failed to place COD order.'); setIsProcessing(false); }
        return;
      }
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) { alert('Razorpay SDK failed to load.'); setIsProcessing(false); return; }
      const orderRes = await fetch(`${API_URL}/create-order`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: total }) });
      if (!orderRes.ok) throw new Error('Failed to create order');
      const orderData = await orderRes.json();
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_your_key",
        amount: orderData.amount, currency: "INR", name: "SATVASTONES", description: "Jewelry Purchase",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`${API_URL}/verify-payment`, {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, orderDetails: { customer: formData, items: cart, amount: total, paymentMethod: 'Razorpay', couponCode: activeCoupon?.code || null, discountAmount } })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.status === 'success') onComplete(verifyData.order);
            else { alert('Payment verification failed'); setIsProcessing(false); }
          } catch (err) { alert('Error verifying payment'); setIsProcessing(false); }
        },
        prefill: { name: formData.name, email: formData.email, contact: formData.phone.replace(/[^0-9]/g, '') },
        theme: { color: "#f2707f" },
        modal: { ondismiss: () => setIsProcessing(false) }
      };
      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred.');
      setIsProcessing(false);
    }
  };

  const isShippingValid = formData.name && formData.phone && formData.address && formData.pincode;

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="px-4 py-2.5 text-[10px] text-gray-400 border-b border-gray-100">
        <Link to="/" className="hover:text-gray-600">Home</Link>
        <span className="mx-1">/</span>
        <Link to="/cart" className="hover:text-gray-600">Cart</Link>
        <span className="mx-1">/</span>
        <span className="text-gray-700 font-medium">Checkout</span>
      </div>

      {/* Header */}
      <div className="bg-[#f2707f] px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-white text-xs font-bold">{'<'} Back</button>
        <h1 className="text-white text-sm font-bold">Checkout</h1>
        <div className="w-16" />
      </div>

      {/* Progress Steps */}
      <div className="px-4 py-4 bg-pink-50">
        <div className="flex items-center justify-center gap-2">
          <div className={`flex items-center gap-1.5 ${step === 'shipping' ? 'text-[#f2707f]' : 'text-green-600'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 'shipping' ? 'bg-[#f2707f] text-white' : 'bg-green-500 text-white'}`}>
              {step === 'shipping' ? '1' : <Check className="h-3 w-3" />}
            </div>
            <span className="text-[10px] font-bold uppercase">Shipping</span>
          </div>
          <div className="w-8 h-px bg-gray-300" />
          <div className={`flex items-center gap-1.5 ${step === 'payment' ? 'text-[#f2707f]' : 'text-gray-400'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step === 'payment' ? 'bg-[#f2707f] text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
            <span className="text-[10px] font-bold uppercase">Payment</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left — Form */}
          <div className="md:w-[55%]">
            {step === 'shipping' && (
              <div className="space-y-4">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Truck className="h-4 w-4 text-gray-400" /> Shipping Details</h2>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name *" className="w-full border border-gray-200 p-3 text-sm rounded-lg focus:border-[#f2707f] outline-none" />
                <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Phone Number *" className="w-full border border-gray-200 p-3 text-sm rounded-lg focus:border-[#f2707f] outline-none" />
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Email Address" className="w-full border border-gray-200 p-3 text-sm rounded-lg focus:border-[#f2707f] outline-none" />
                <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street Address *" rows={2} className="w-full border border-gray-200 p-3 text-sm rounded-lg focus:border-[#f2707f] outline-none resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City" className="w-full border border-gray-200 p-3 text-sm rounded-lg focus:border-[#f2707f] outline-none" />
                  <input type="text" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} placeholder="Pincode *" className="w-full border border-gray-200 p-3 text-sm rounded-lg focus:border-[#f2707f] outline-none" />
                </div>
                <button onClick={() => isShippingValid && setStep('payment')} disabled={!isShippingValid}
                  className={`w-full py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all ${isShippingValid ? 'bg-[#f2707f] hover:bg-[#d4535f] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  Continue to Payment
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep('shipping')} className="text-[10px] font-bold text-gray-500 uppercase">{'<'} Back to Shipping</button>
                </div>
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2"><CreditCard className="h-4 w-4 text-gray-400" /> Payment Method</h2>

                <button onClick={() => setPaymentMethod('upi')}
                  className={`w-full flex items-center justify-between border p-4 rounded-lg transition-all ${paymentMethod === 'upi' ? 'border-[#f2707f] bg-pink-50' : 'border-gray-200 hover:border-gray-400'}`}>
                  <div className="flex items-center gap-3">
                    <Wallet className={`h-4 w-4 ${paymentMethod === 'upi' ? 'text-[#f2707f]' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-900">UPI / Cards / NetBanking</p>
                      <p className="text-[9px] text-green-600 font-bold mt-0.5">Recommended</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'upi' ? 'border-[#f2707f] bg-[#f2707f] shadow-[inset_0_0_0_2px_white]' : 'border-gray-300'}`} />
                </button>

                <button onClick={() => { setPaymentMethod('cod'); if (formData.pincode && !formData.pincode.startsWith('396')) setShowCodDialog(true); }}
                  className={`w-full flex items-center justify-between border p-4 rounded-lg transition-all ${paymentMethod === 'cod' ? 'border-[#f2707f] bg-pink-50' : 'border-gray-200 hover:border-gray-400'}`}>
                  <div className="flex items-center gap-3">
                    <Truck className={`h-4 w-4 ${paymentMethod === 'cod' ? 'text-[#f2707f]' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <p className="text-xs font-bold text-gray-900">Cash on Delivery</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">Pay on delivery</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'cod' ? 'border-[#f2707f] bg-[#f2707f] shadow-[inset_0_0_0_2px_white]' : 'border-gray-300'}`} />
                </button>

                <div className="bg-pink-50 rounded-lg p-3 flex items-start gap-2">
                  <Zap className="h-4 w-4 text-[#f2707f] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-800">Free shipping on prepaid orders above ₹399</p>
                    <p className="text-[9px] text-gray-500 mt-0.5">Save more with UPI — COD charges ₹40–₹95 extra.</p>
                  </div>
                </div>

                <button onClick={handlePlaceOrder} disabled={isProcessing}
                  className="w-full py-3.5 rounded-lg text-sm font-bold uppercase tracking-wider bg-[#f2707f] hover:bg-[#d4535f] text-white transition-all disabled:bg-gray-300 flex items-center justify-center gap-2">
                  {isProcessing ? 'Processing...' : 'Place Order'} <ShieldCheck className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Right — Order Summary */}
          <div className="md:w-[45%]">
            <div className="bg-gray-50 rounded-xl p-4 sticky top-28">
              <h2 className="text-sm font-bold text-gray-900 mb-3">Order Summary</h2>
              <div className="max-h-48 overflow-y-auto no-scrollbar space-y-3 mb-3">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 bg-white rounded-lg overflow-hidden shrink-0">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[10px] font-bold text-gray-800 truncate">{item.title}</h4>
                      <p className="text-[9px] text-gray-400">QTY: {item.qty || 1}</p>
                      <p className="text-[10px] font-bold text-gray-900">₹{item.price * (item.qty || 1)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-3">
                <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code"
                  className="flex-1 border border-gray-200 p-2 text-[10px] font-bold rounded-lg bg-white outline-none focus:border-[#f2707f]" />
                <button onClick={applyCoupon} className="bg-gray-900 text-white px-3 py-2 text-[9px] font-bold rounded-lg uppercase">Apply</button>
              </div>
              {couponError && <p className="text-[9px] text-red-500 font-bold mb-2">{couponError}</p>}
              {activeCoupon && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-2 mb-3 flex justify-between items-center">
                  <span className="text-[9px] text-green-700 font-bold">{activeCoupon.code} APPLIED (-{activeCoupon.discount}% on regular items)</span>
                  <button onClick={() => { setActiveCoupon(null); setCouponCode(''); }} className="text-green-700 font-bold text-xs">×</button>
                </div>
              )}

              <div className="space-y-2 border-t border-gray-200 pt-3">
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Subtotal</span><span className="font-bold text-gray-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>Shipping</span><span className={`font-bold ${shipping === 0 ? 'text-green-600' : 'text-gray-800'}`}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                </div>
                {activeCoupon && (
                  <div className="flex justify-between text-[10px] text-green-600 font-bold">
                    <span>Discount</span><span>-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
                  <span>Total</span><span>₹{total}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COD Dialog */}
      {showCodDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm p-6 rounded-xl shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-gray-900">COD Shipping Charges</h3>
            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 leading-relaxed">
                Cash on Delivery charges apply based on distance from our Vapi, Gujarat hub:
              </p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                <p className="text-[10px] text-gray-600">• Local (Vapi/Gujarat): <span className="font-bold">₹40</span></p>
                <p className="text-[10px] text-gray-600">• Maharashtra: <span className="font-bold">₹55</span></p>
                <p className="text-[10px] text-gray-600">• North/Central India: <span className="font-bold">₹65</span></p>
                <p className="text-[10px] text-gray-600">• South/East/NE India: <span className="font-bold">₹85–₹95</span></p>
              </div>
              <div className="bg-green-50 rounded-lg p-3 flex items-start gap-2">
                <Zap className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                <p className="text-[10px] text-green-700 font-bold leading-relaxed">
                  Pay via UPI and save ₹40–₹95! UPI shipping starts at just ₹20 and is FREE above ₹399.
                </p>
              </div>
            </div>
            <button onClick={() => setShowCodDialog(false)} className="w-full py-3 bg-[#f2707f] text-white rounded-lg text-xs font-bold uppercase">I Understand</button>
          </div>
        </div>
      )}
    </div>
  );
}
