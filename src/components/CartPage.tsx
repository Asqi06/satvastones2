import React from 'react';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function CartPage({ 
  cart, 
  onUpdateQty, 
  onRemove, 
  onCheckout, 
  onContinueShopping 
}: { 
  cart: any[], 
  onUpdateQty: (id: number, delta: number) => void,
  onRemove: (id: number) => void,
  onCheckout: () => void,
  onContinueShopping: () => void
}) {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
  const shipping = subtotal > 399 ? 0 : 49;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="h-8 w-8 text-stone-300" />
        </div>
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-stone-900 mb-2">Your Bag is Empty</h2>
        <p className="text-stone-500 text-xs uppercase tracking-widest mb-8 text-center max-w-xs leading-loose">
          Looks like you haven't added anything to your aesthetic collection yet.
        </p>
        <button 
          onClick={onContinueShopping}
          className="bg-black text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h1 className="font-display text-4xl md:text-6xl font-bold uppercase tracking-tight text-stone-900 mb-12">
          Your <span className="text-stone-400">Shopping Bag</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-8">
            <div className="hidden md:grid grid-cols-12 pb-4 border-b border-stone-200 text-[10px] font-bold uppercase tracking-widest text-stone-400">
              <div className="col-span-6">Product</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {cart.map((item) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 items-center gap-6 pb-8 border-b border-stone-100">
                <div className="col-span-6 flex gap-6">
                  <div className="w-24 h-32 md:w-32 md:h-40 shrink-0 bg-stone-50 overflow-hidden">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center gap-1">
                    <h3 className="font-accent text-sm font-bold uppercase tracking-tight text-stone-900">{item.title}</h3>
                    <p className="text-[10px] text-stone-400 uppercase tracking-widest">{item.style || 'Standard Polish'}</p>
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="mt-4 flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  </div>
                </div>

                <div className="col-span-2 flex justify-center">
                  <div className="flex items-center border border-stone-200">
                    <button 
                      onClick={() => onUpdateQty(item.id, -1)}
                      className="px-3 py-2 text-stone-500 hover:text-stone-900"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.qty || 1}</span>
                    <button 
                      onClick={() => onUpdateQty(item.id, 1)}
                      className="px-3 py-2 text-stone-500 hover:text-stone-900"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="col-span-2 text-right hidden md:block">
                  <span className="text-sm font-bold text-stone-900">₹{item.price}</span>
                </div>

                <div className="col-span-2 text-right">
                  <span className="text-sm font-bold text-stone-900">₹{item.price * (item.qty || 1)}</span>
                </div>
              </div>
            ))}

            <button 
              onClick={onContinueShopping}
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-black transition-colors"
            >
              <ArrowLeft className="h-3 w-3" /> Continue Shopping
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="bg-stone-50 p-8 md:p-10 sticky top-28">
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-stone-900 mb-8 pb-4 border-b border-stone-200">Summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-stone-500">
                  <span>Subtotal</span>
                  <span className="text-stone-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-stone-500">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600' : 'text-stone-900'}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-[9px] text-stone-400 uppercase leading-relaxed italic">
                    Add ₹{400 - subtotal} more for Free Shipping
                  </p>
                )}
              </div>

              <div className="flex justify-between text-lg font-bold uppercase tracking-tight text-stone-900 border-t border-stone-200 pt-6 mb-10">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <button 
                onClick={onCheckout}
                className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all flex items-center justify-center gap-3"
              >
                Checkout Now <ArrowRight className="h-4 w-4" />
              </button>

              <div className="mt-8 space-y-4">
                <p className="text-[9px] text-stone-400 uppercase text-center leading-loose tracking-widest">
                  Secure Payment with SSL Encryption
                </p>
                <div className="flex justify-center gap-4 opacity-30 grayscale">
                   {/* Payment icons placeholder */}
                   <div className="w-10 h-6 bg-stone-300 rounded-sm"></div>
                   <div className="w-10 h-6 bg-stone-300 rounded-sm"></div>
                   <div className="w-10 h-6 bg-stone-300 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
