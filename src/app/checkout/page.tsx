"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { MapPin, ShoppingBag, Lock, ArrowLeft, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, getTotal, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");

  const [newAddress, setNewAddress] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  useEffect(() => {
    if (session?.user) {
      fetchAddresses();
    }
  }, [session]);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      const data = await res.json();
      setAddresses(data.addresses || []);
      const defaultAddr = data.addresses?.find((a: any) => a.isDefault);
      if (defaultAddr) setSelectedAddress(defaultAddr.id);
    } catch (error) {
      console.error("Failed to fetch addresses");
    }
  };

  const subtotal = getTotal();
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping - discount;

  const applyCoupon = async () => {
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, total: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error);
      } else {
        setDiscount(data.discount);
      }
    } catch {
      setCouponError("Failed to apply coupon");
    }
  };

  const handlePayment = async () => {
    if (!selectedAddress && !showNewAddress) {
      alert("Please select or add a shipping address");
      return;
    }

    if (showNewAddress && (!newAddress.name || !newAddress.phone || !newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.postalCode)) {
      alert("Please fill in all address fields");
      return;
    }

    setLoading(true);

    try {
      let addressId = selectedAddress;

      if (showNewAddress) {
        const addrRes = await fetch("/api/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAddress),
        });
        const addrData = await addrRes.json();
        addressId = addrData.address.id;
      }

      const orderRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
          shippingAddressId: addressId,
          totalAmount: subtotal,
          discountAmount: discount,
          shippingAmount: shipping,
          finalAmount: total,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert(orderData.error || "Failed to create order");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: total * 100,
        currency: "INR",
        name: "Satvastones",
        description: "Exquisite Luxury Selection",
        order_id: orderData.razorpayOrderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: orderData.orderId,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              clearCart();
              router.push(`/order-confirmation/${orderData.orderId}`);
            } else {
              alert("Payment verification failed");
            }
          } catch {
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#D4AF37",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-luxury-black flex flex-col items-center justify-center pt-20">
        <h1 className="text-4xl font-serif text-white mb-8">The Repository is empty</h1>
        <Link href="/products" className="luxury-button">
          Seek Elegance
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-luxury-cream min-h-screen pt-32 pb-20">
      <div className="container-premium">
        <div className="flex items-center gap-4 mb-20">
          <Link href="/cart" className="text-luxury-brown/30 hover:text-luxury-brown transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="heading-xl font-serif text-luxury-brown">Acquisition</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
          {/* Main Flow - 7 cols */}
          <div className="lg:col-span-7 space-y-20">
            {/* 1. Address */}
            <section className="animate-luxury-fade">
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-luxury-brown/5">
                <span className="w-8 h-8 rounded-full border border-luxury-gold text-luxury-gold flex items-center justify-center text-[10px] font-bold">1</span>
                <h2 className="text-2xl font-serif text-luxury-brown">Consignment Details</h2>
              </div>

              <div className="space-y-6">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => { setSelectedAddress(addr.id); setShowNewAddress(false); }}
                    className={`p-8 border transition-all cursor-pointer group relative overflow-hidden ${
                      selectedAddress === addr.id && !showNewAddress 
                        ? "border-luxury-gold bg-luxury-gold/5" 
                        : "border-luxury-brown/5 bg-white hover:border-luxury-brown/20"
                    }`}
                  >
                    <div className="flex justify-between items-start relative z-10">
                      <div>
                        <p className="text-luxury-brown font-serif text-lg mb-2">{addr.name}</p>
                        <p className="text-luxury-brown/40 text-sm leading-relaxed max-w-sm">
                          {addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p className="text-luxury-brown/30 text-[10px] tracking-widest uppercase mt-4 font-bold">{addr.phone}</p>
                      </div>
                      {selectedAddress === addr.id && !showNewAddress && (
                        <Check className="w-5 h-5 text-luxury-gold" />
                      )}
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => { setShowNewAddress(true); setSelectedAddress(""); }}
                  className={`w-full p-8 border-2 border-dashed transition-all text-center ${
                    showNewAddress 
                      ? "border-luxury-gold bg-luxury-gold/5 text-luxury-gold" 
                      : "border-white/5 text-white/20 hover:border-white/20 hover:text-white/40"
                  }`}
                >
                  <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-inherit">+ New Consignment Address</span>
                </button>

                {showNewAddress && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 border border-luxury-brown/10 bg-white animate-luxury-fade">
                    <input
                      placeholder="Full Name"
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      className="luxury-input md:col-span-2"
                    />
                     <input
                      placeholder="Phone Number"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="luxury-input md:col-span-2"
                    />
                    <input
                      placeholder="Address Line 1"
                      value={newAddress.line1}
                      onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                      className="luxury-input md:col-span-2"
                    />
                    <input
                      placeholder="Address Line 2 (Optional)"
                      value={newAddress.line2}
                      onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                      className="luxury-input md:col-span-2"
                    />
                    <input
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="luxury-input"
                    />
                    <input
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="luxury-input"
                    />
                    <input
                      placeholder="Postal Code"
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="luxury-input"
                    />
                    <input
                      placeholder="Country"
                      value={newAddress.country}
                      disabled
                      className="luxury-input opacity-50"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* 2. Order Review */}
            <section className="animate-luxury-fade delay-200">
               <div className="flex items-center gap-4 mb-10 pb-6 border-b border-luxury-brown/5">
                <span className="w-8 h-8 rounded-full border border-luxury-brown/10 text-luxury-brown/30 flex items-center justify-center text-[10px] font-bold">2</span>
                <h2 className="text-2xl font-serif text-luxury-brown">Repository Review</h2>
              </div>

              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-6 items-center p-6 border border-luxury-brown/5 bg-white group">
                    <div className="w-20 h-24 relative bg-luxury-cream overflow-hidden flex-shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-luxury-brown font-serif text-lg mb-1">{item.name}</p>
                      <p className="text-luxury-brown/30 text-[10px] tracking-widest uppercase font-bold">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-luxury-brown font-bold text-sm">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Summary - 5 cols */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 animate-luxury-fade delay-300">
            <div className="p-10 border border-luxury-brown/5 bg-white shadow-sm">
              <h2 className="text-2xl font-serif text-luxury-brown mb-10">Valuation</h2>

              {/* Coupon */}
              <div className="mb-10">
                <div className="flex gap-4">
                  <input
                    placeholder="Privilege Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="luxury-input flex-1"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-8 border border-luxury-brown text-luxury-brown text-[10px] tracking-widest uppercase font-bold hover:bg-luxury-brown hover:text-white transition-all"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-red-400 text-[10px] mt-2 tracking-widest uppercase font-bold">{couponError}</p>}
                {discount > 0 && <p className="text-luxury-gold text-[10px] mt-2 tracking-widest uppercase font-bold">Privilege applied: {formatPrice(discount)}</p>}
              </div>

              <div className="space-y-6 text-sm mb-12 border-b border-luxury-brown/5 pb-12">
                <div className="flex justify-between items-center">
                  <span className="text-luxury-brown/30 tracking-widest uppercase text-[10px] font-bold">Sub-Valuation</span>
                  <span className="text-luxury-brown font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-luxury-brown/30">
                  <span className="tracking-widest uppercase text-[10px] font-bold">Consignment Fee</span>
                  <span className={shipping === 0 ? "text-luxury-gold font-bold" : ""}>
                    {shipping === 0 ? "COMPLIMENTARY" : formatPrice(shipping)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-luxury-gold">
                    <span className="tracking-widest uppercase text-[10px] font-bold">Privilege Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-6">
                  <span className="text-luxury-brown font-serif text-xl">Final Valuation</span>
                  <span className="text-3xl font-serif text-luxury-gold">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full h-16 bg-luxury-brown text-white text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-luxury-gold transition-all duration-500 flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {loading ? "Authorizing..." : (
                  <>
                    <Lock className="w-4 h-4" />
                    Complete Acquisition
                  </>
                )}
              </button>

              <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
                <p className="text-[8px] tracking-[0.3em] uppercase font-bold text-luxury-brown">Razorpay Secured</p>
                <div className="w-1 h-1 bg-luxury-brown rounded-full"></div>
                <p className="text-[8px] tracking-[0.3em] uppercase font-bold text-luxury-brown">Identity Protected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
