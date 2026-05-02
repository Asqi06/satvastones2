import React, { useState } from 'react';
import { CreditCard, Truck, ShieldCheck, Zap, ArrowLeft, ArrowRight, Wallet } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CheckoutPage({ 
  cart, 
  currentUser,
  onBack, 
  onComplete,
  onLoginRedirect,
  calculateShipping
}: { 
  cart: any[], 
  currentUser: any,
  onBack: () => void, 
  onComplete: () => void,
  onLoginRedirect: () => void,
  calculateShipping: (pincode: string, subtotal: number) => number
}) {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCodDialog, setShowCodDialog] = useState(false);
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('checkout_form');
    return saved ? JSON.parse(saved) : {
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      pincode: ''
    };
  });

  React.useEffect(() => {
    localStorage.setItem('checkout_form', JSON.stringify(formData));
  }, [formData]);
  
  const subtotal = cart.reduce((acc, item) => {
    // Ensure price is a clean number even if it's a string with symbols
    const price = typeof item.price === 'string' 
      ? parseFloat(item.price.replace(/[^0-9.]/g, '')) 
      : (item.price || 0);
    return acc + (price * (item.qty || 1));
  }, 0);
  const shipping = calculateShipping(formData.pincode, subtotal);
  
  // COD Charges Logic
  const calculateCodCharge = () => {
    if (paymentMethod !== 'cod') return 0;
    if (formData.pincode.startsWith('396')) return 0; // Local
    if (formData.pincode.startsWith('3')) return 20; // Gujarat
    return 45; // Other
  };
  
  const codCharge = calculateCodCharge();
  const total = subtotal + shipping + codCharge;

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
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
        const orderDetails = {
          customer: formData,
          items: cart,
          amount: total,
          paymentMethod: 'COD'
        };
        const res = await fetch(`${API_URL}/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            razorpay_order_id: 'COD_'+Date.now(), 
            razorpay_payment_id: 'COD', 
            razorpay_signature: 'COD', 
            orderDetails 
          })
        });

        if (res.ok) {
          onComplete();
        } else {
          alert('Failed to place COD order. Please try again.');
          setIsProcessing(false);
        }
        return;
      }

      // Razorpay Flow
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const orderRes = await fetch(`${API_URL}/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: total })
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create order on server');
      }

      const orderData = await orderRes.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_your_key",
        amount: orderData.amount,
        currency: "INR",
        name: "SATVASTONES",
        description: "Jewelry Purchase",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`${API_URL}/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...response,
                orderDetails: {
                  customer: formData,
                  items: cart,
                  amount: total,
                  paymentMethod: 'Razorpay'
                }
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.status === 'success') {
              onComplete();
            } else {
              alert('Payment verification failed');
              setIsProcessing(false);
            }
          } catch (err) {
            alert('Error verifying payment');
            setIsProcessing(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: "#000000"
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false);
          }
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      alert('An unexpected error occurred. Please check your connection.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-black transition-colors mb-12"
        >
          <ArrowLeft className="h-3 w-3" /> Back to Bag
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-stone-900 mb-8 flex items-center gap-3">
                <Truck className="h-5 w-5 text-stone-400" /> Shipping Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border-b border-stone-200 py-3 text-sm focus:border-black outline-hidden" 
                    placeholder="NAME" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Phone Number</label>
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border-b border-stone-200 py-3 text-sm focus:border-black outline-hidden" 
                    placeholder="NUMBER" 
                  />
                </div>
                <div className="col-span-full space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Street Address</label>
                  <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full border-b border-stone-200 py-3 text-sm focus:border-black outline-hidden" 
                    placeholder="ADDRESS" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border-b border-stone-200 py-3 text-sm focus:border-black outline-hidden" 
                    placeholder="EMAIL" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">Pincode</label>
                  <input 
                    type="text" 
                    value={formData.pincode}
                    onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                    className="w-full border-b border-stone-200 py-3 text-sm focus:border-black outline-hidden" 
                    placeholder="ZIP CODE" 
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-stone-900 mb-8 flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-stone-400" /> Payment Method
              </h2>
              
              <div className="space-y-4">
                <button 
                  onClick={() => setPaymentMethod('upi')}
                  className={`w-full flex items-center justify-between border p-6 transition-all ${paymentMethod === 'upi' ? 'border-black bg-stone-50' : 'border-stone-200 hover:border-stone-400'}`}
                >
                  <div className="flex items-center gap-4">
                    <Wallet className={`h-5 w-5 ${paymentMethod === 'upi' ? 'text-stone-900' : 'text-stone-300'}`} />
                    <div className="text-left">
                      <p className="text-xs font-bold uppercase tracking-widest text-stone-900">Razorpay (UPI / Cards / NetBanking)</p>
                      <p className="text-[9px] text-green-600 font-bold uppercase mt-1">Recommended • Secure & Instant</p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'upi' ? 'border-black bg-black shadow-[inset_0_0_0_2px_white]' : 'border-stone-200'}`} />
                </button>

                <button 
                  onClick={() => {
                    setPaymentMethod('cod');
                    if (formData.pincode && !formData.pincode.startsWith('396')) {
                      setShowCodDialog(true);
                    }
                  }}
                  className={`w-full flex items-center justify-between border p-6 transition-all ${paymentMethod === 'cod' ? 'border-black bg-stone-50' : 'border-stone-200 hover:border-stone-400'}`}
                >
                  <div className="flex items-center gap-4">
                    <Truck className={`h-5 w-5 ${paymentMethod === 'cod' ? 'text-stone-900' : 'text-stone-300'}`} />
                    <div className="text-left">
                      <p className="text-xs font-bold uppercase tracking-widest text-stone-900">Cash on Delivery</p>
                      <p className="text-[9px] text-stone-400 uppercase mt-1">
                        {formData.pincode.startsWith('396') ? 'Free Delivery locally' : `Starts at ₹${calculateCodCharge()}`}
                      </p>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${paymentMethod === 'cod' ? 'border-black bg-black shadow-[inset_0_0_0_2px_white]' : 'border-stone-200'}`} />
                </button>
              </div>

              <div className="mt-8 bg-stone-50 p-6 border-l-4 border-stone-900">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-stone-900 mt-1 shrink-0" />
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-900">Payment & Return Policy</p>
                    <p className="text-[10px] text-stone-500 uppercase leading-relaxed tracking-tight">
                      To keep our aesthetic collections affordable for everyone, we primarily promote digital payments. 
                      <span className="text-stone-900 font-bold"> UPI is our most cost-effective and cheap method to pay.</span> 
                      We only accept COD with a small <span className="text-stone-900 font-bold">₹40 platform charge</span> added to the total.
                    </p>
                    <p className="text-[10px] text-red-600 font-bold uppercase mt-2 tracking-widest">
                      Final Sale: No Refunds, Cancellations or Returns.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-stone-50 p-8 md:p-10 sticky top-28">
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-stone-900 mb-8">Order Overview</h2>
              
              <div className="max-h-[300px] overflow-y-auto no-scrollbar mb-8 space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-white shrink-0 overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 py-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-tight text-stone-900">{item.title}</h4>
                      <p className="text-[9px] text-stone-400 uppercase mt-1">QTY: {item.qty || 1} • {item.style || 'Standard'}</p>
                      <p className="text-[10px] font-bold text-stone-900 mt-2">₹{item.price * (item.qty || 1)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-stone-200 pt-6 mb-8">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-stone-500">
                  <span>Subtotal</span>
                  <span className="text-stone-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-stone-500">
                  <span>Shipping</span>
                  <span className="text-stone-900">
                    {shipping === 0 ? (formData.pincode.startsWith('396') ? 'FREE (LOCAL)' : 'FREE') : `₹${shipping}`}
                  </span>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-stone-900">
                    <span>COD Charge</span>
                    <span>₹40</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold uppercase tracking-tight text-stone-900 pt-4 border-t border-stone-200 mt-4">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>

              <button 
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 disabled:bg-stone-400 transition-all flex items-center justify-center gap-3"
              >
                {isProcessing ? 'Processing...' : 'Place Order'} <ShieldCheck className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COD Info Dialog */}
      {showCodDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm p-8 shadow-2xl space-y-6">
            <div className="space-y-2">
              <h3 className="font-display text-xl font-bold uppercase tracking-tight text-stone-900">COD Shipping Note</h3>
              <p className="text-[10px] text-stone-500 uppercase tracking-widest leading-loose">
                Cash on Delivery charges apply based on your distance from our Vapi hub. 
                <br /><br />
                • Local (Vapi/Gunjan): <span className="text-green-600 font-bold">FREE</span>
                <br />
                • Within Gujarat: <span className="text-stone-900 font-bold">₹20</span>
                <br />
                • Outside Gujarat: <span className="text-stone-900 font-bold">₹45</span>
              </p>
            </div>
            <button 
              onClick={() => setShowCodDialog(false)}
              className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-stone-800 transition-all"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
