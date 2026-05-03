import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ShoppingBag, ArrowRight, Mail, MapPin, Truck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function OrderSuccessPage() {
  const location = useLocation();
  const order = location.state?.order;

  // Fallback if no order data (e.g. direct URL access)
  if (!order) {
    return (
      <div className="min-h-screen bg-[#F9F6F1] flex flex-col items-center justify-center p-8 text-center">
        <ShoppingBag className="h-12 w-12 text-stone-300 mb-6" />
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-[#3D2B24]">Order History</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-2 mb-8">Visit your account to view recent orders</p>
        <Link to="/" className="bg-[#3D2B24] text-white px-10 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all">
          Back To Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1] pt-20 pb-32">
      <div className="mx-auto max-w-3xl px-4 md:px-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 mb-16"
        >
          <div className="flex justify-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, delay: 0.2 }}
              className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="h-10 w-10 text-green-600" />
            </motion.div>
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-tight text-[#3D2B24]">
              Thank <span className="text-stone-300">You.</span>
            </h1>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-stone-500">
              Your Satvastones order has been received
            </p>
          </div>
        </motion.div>

        {/* Order Details Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-stone-200 rounded-sm shadow-sm overflow-hidden"
        >
          {/* Status Bar */}
          <div className="bg-[#3D2B24] p-6 text-white flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-[8px] uppercase tracking-[0.3em] opacity-60 mb-1">Order Number</p>
              <h3 className="font-accent text-lg font-bold tracking-widest uppercase">#{order.orderId?.slice(-8).toUpperCase() || order._id?.slice(-8).toUpperCase()}</h3>
            </div>
            <div className="text-center md:text-right">
              <p className="text-[8px] uppercase tracking-[0.3em] opacity-60 mb-1">Status</p>
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
                Confirmed
              </span>
            </div>
          </div>

          <div className="p-8 space-y-10">
            {/* Items Summary */}
            <div className="space-y-6">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 border-b border-stone-100 pb-3">Your Selection</h4>
              <div className="space-y-4">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-stone-100 rounded-xs overflow-hidden">
                        <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-stone-900">{item.title}</p>
                        <p className="text-[9px] text-stone-400 uppercase">Qty: {item.qty} • {item.variant || 'Standard'}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-stone-900">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Address & Total */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> Delivery Address
                </h4>
                <div className="text-[10px] text-stone-600 uppercase leading-relaxed font-medium">
                  {order.customer?.name}<br />
                  {order.shippingAddress?.address}<br />
                  {order.shippingAddress?.city}{order.shippingAddress?.pincode ? `, ${order.shippingAddress.pincode}` : ''}
                </div>
              </div>
              <div className="space-y-4 bg-stone-50 p-6 rounded-xs">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-stone-400">
                  <span>Subtotal</span>
                  <span>₹{order.amount - 40}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-stone-400">
                  <span>Shipping</span>
                  <span>{order.paymentMethod === 'COD' ? '₹40 (COD FEE)' : 'FREE'}</span>
                </div>
                <div className="border-t border-stone-200 pt-3 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase text-stone-900 tracking-widest">Total Paid</span>
                  <span className="text-lg font-bold text-stone-900">₹{order.amount}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Next Steps */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="flex flex-col items-center text-center p-6 space-y-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Mail className="h-4 w-4 text-stone-400" />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-stone-900">Email Sent</p>
            <p className="text-[8px] text-stone-500 uppercase leading-relaxed">Check your inbox for the confirmation & invoice.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 space-y-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Truck className="h-4 w-4 text-stone-400" />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-stone-900">Ready to Pack</p>
            <p className="text-[8px] text-stone-500 uppercase leading-relaxed">Our Vapi team is now preparing your aesthetic pieces.</p>
          </div>
          <div className="flex flex-col items-center text-center p-6 space-y-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
              <ArrowRight className="h-4 w-4 text-stone-400" />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-stone-900">Updates</p>
            <p className="text-[8px] text-stone-500 uppercase leading-relaxed">You'll receive a tracking ID as soon as it's shipped.</p>
          </div>
        </motion.div>

        {/* Footer Actions */}
        <div className="mt-16 flex flex-col md:flex-row items-center justify-center gap-6">
          <Link to="/" className="w-full md:w-auto text-center border border-stone-200 px-12 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all">
            Back To Home
          </Link>
          <Link to="/account" className="w-full md:w-auto text-center bg-[#3D2B24] text-white px-12 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl">
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
