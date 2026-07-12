import React from 'react';
import { X, Minus, Plus, Truck, Gift, Package } from 'lucide-react';

export default function CartPage({
  cart,
  allProducts = [],
  onUpdateQty,
  onRemove,
  onAddToCart,
  onCheckout,
  onContinueShopping
}: {
  cart: any[],
  allProducts?: any[];
  onUpdateQty: (id: number, delta: number) => void,
  onRemove: (id: number) => void,
  onAddToCart?: (item: any) => void,
  onCheckout: () => void,
  onContinueShopping: () => void
}) {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.qty || 1)), 0);
  const freeShippingThreshold = 399;
  const freeGiftThreshold = 699;
  const freeOrganizerThreshold = 999;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const amountToFreeGift = Math.max(0, freeGiftThreshold - subtotal);
  const amountToFreeOrganizer = Math.max(0, freeOrganizerThreshold - subtotal);

  const progressPct = Math.min(100, (subtotal / freeOrganizerThreshold) * 100);

  const upsellProducts = allProducts
    .filter(p => !cart.find(c => (c._id || c.id) === (p._id || p.id)))
    .slice(0, 4);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 bg-[#f2707f] px-4 py-3 flex items-center justify-between">
          <h1 className="text-white text-sm font-bold">Cart</h1>
          <button onClick={onContinueShopping} className="text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex flex-col items-center justify-center px-4 py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Package className="h-7 w-7 text-gray-300" />
          </div>
          <p className="text-sm text-gray-500 mb-4">Your cart is empty</p>
          <button onClick={onContinueShopping} className="bg-[#f2707f] text-white px-8 py-3 rounded-lg text-xs font-bold uppercase tracking-wider">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#f2707f] px-4 py-3 flex items-center justify-between">
        <h1 className="text-white text-sm font-bold">Cart</h1>
        <button onClick={onContinueShopping} className="text-white"><X className="h-5 w-5" /></button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Discount Notice */}
        <div className="bg-pink-50 px-4 py-2.5 text-center">
          <p className="text-[10px] font-bold text-[#d4535f]">Discount will applied at checkout</p>
        </div>

        {/* Free Shipping Progress */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="bg-pink-50 rounded-lg p-3">
            {amountToFreeShipping > 0 ? (
              <p className="text-[10px] font-bold text-gray-800 text-center mb-2">
                Add ₹{amountToFreeShipping} more to get Free Shipping on this order
              </p>
            ) : (
              <p className="text-[10px] font-bold text-green-600 text-center mb-2">
                You've unlocked Free Shipping!
              </p>
            )}
            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-[#f2707f] rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            {/* Milestones */}
            <div className="flex justify-between text-[8px] text-gray-500 relative">
              <div className="flex flex-col items-center" style={{ position: 'absolute', left: `${(freeShippingThreshold / freeOrganizerThreshold) * 100}%`, transform: 'translateX(-50%)' }}>
                <Truck className={`h-3 w-3 mb-0.5 ${subtotal >= freeShippingThreshold ? 'text-[#f2707f]' : 'text-gray-400'}`} />
                <span className={`whitespace-nowrap ${subtotal >= freeShippingThreshold ? 'text-[#f2707f] font-bold' : ''}`}>Free Shipping on ₹399</span>
              </div>
              <div className="flex flex-col items-center" style={{ position: 'absolute', left: `${(freeGiftThreshold / freeOrganizerThreshold) * 100}%`, transform: 'translateX(-50%)' }}>
                <Gift className={`h-3 w-3 mb-0.5 ${subtotal >= freeGiftThreshold ? 'text-[#f2707f]' : 'text-gray-400'}`} />
                <span className={`whitespace-nowrap ${subtotal >= freeGiftThreshold ? 'text-[#f2707f] font-bold' : ''}`}>Free Gift on ₹699</span>
              </div>
              <div className="flex flex-col items-center" style={{ position: 'absolute', left: '100%', transform: 'translateX(-50%)' }}>
                <Package className={`h-3 w-3 mb-0.5 ${subtotal >= freeOrganizerThreshold ? 'text-[#f2707f]' : 'text-gray-400'}`} />
                <span className={`whitespace-nowrap ${subtotal >= freeOrganizerThreshold ? 'text-[#f2707f] font-bold' : ''}`}>Free Organizer on ₹999</span>
              </div>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="px-4">
          {cart.map((item) => (
            <div key={item.id} className="flex gap-3 py-4 border-b border-gray-100">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-800 leading-tight">{item.title}</h3>
                  {item.variant && <p className="text-[9px] text-gray-400 mt-0.5">{item.variant}</p>}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-gray-200 rounded-md">
                    <button onClick={() => onUpdateQty(item.id, -1)} className="px-2 py-1.5 hover:bg-gray-50">
                      <Minus className="h-3 w-3 text-gray-500" />
                    </button>
                    <span className="px-3 text-xs font-bold">{item.qty || 1}</span>
                    <button onClick={() => onUpdateQty(item.id, 1)} className="px-2 py-1.5 hover:bg-gray-50">
                      <Plus className="h-3 w-3 text-gray-500" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">₹ {item.price * (item.qty || 1)}</span>
                    <button onClick={() => onRemove(item.id)} className="text-gray-400 hover:text-red-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* You May Also Like */}
        {upsellProducts.length > 0 && (
          <div className="px-4 py-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-800 mb-3">You may also like ...</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {upsellProducts.map((product) => {
                const pid = product._id || product.id;
                const inCart = cart.find(c => (c._id || c.id) === pid);
                return (
                  <div key={pid} className="flex-shrink-0 w-28 bg-white border border-gray-100 rounded-lg overflow-hidden">
                    <div className="aspect-square bg-gray-50">
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-2">
                      <p className="text-[9px] text-gray-600 truncate">{product.title}</p>
                      <p className="text-[10px] font-bold text-[#f2707f] mt-0.5">₹ {product.price}</p>
                      <button
                        onClick={() => {
                          if (!inCart && onAddToCart) {
                            onAddToCart(product);
                          }
                        }}
                        className="w-full mt-1.5 py-1.5 text-[8px] font-bold uppercase tracking-wider rounded-md border border-[#f2707f] text-[#f2707f] hover:bg-[#f2707f] hover:text-white transition-colors"
                      >
                        {inCart ? 'ADDED' : 'ADD'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between z-40">
        <div>
          <span className="text-lg font-bold text-gray-900">₹ {subtotal}</span>
        </div>
        <button
          onClick={onCheckout}
          className="bg-[#f2707f] hover:bg-[#d4535f] text-white px-8 py-3 rounded-lg text-sm font-bold uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          BUY NOW
        </button>
      </div>
    </div>
  );
}
