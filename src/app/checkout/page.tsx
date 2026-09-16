"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/hooks/useCart";
import { formatPrice } from "@/lib/utils";
import { MapPin, ShoppingBag, Lock, ArrowLeft, ChevronRight, Check } from "lucide-react";
import PaymentSecurityBadges from "./PaymentSecurityBadges";
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
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "COD">("razorpay");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponId, setCouponId] = useState("");
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
      // Pre-fill name and phone if available
      if (session.user.name) {
        setNewAddress((prev) => ({ ...prev, name: session.user.name || "" }));
      }
    }
  }, [session]);

  // THANK10 auto-apply per FIXES.MD
  useEffect(() => {
    if (session?.user && !localStorage.getItem("welcome_bonus_used")) {
      const tryAutoApply = async () => {
        try {
          const res = await fetch("/api/coupons/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              code: "THANK10",
              total: getTotal(),
              items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            }),
          });
          const data = await res.json();
          if (res.ok && data.discount) {
            setCouponCode("THANK10");
            setDiscount(data.discount);
            setCouponId(data.couponId);
            localStorage.setItem("welcome_bonus_used", "true");
          }
        } catch {
          // ignore auto-apply errors
        }
      };
      if (items.length > 0) {
        tryAutoApply();
      }
    }
  }, [session, items]);

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
      else if (data.addresses?.length > 0) setSelectedAddress(data.addresses[0].id);
      else setShowNewAddress(true);
    } catch (error) {
      console.error("Failed to fetch addresses");
      setShowNewAddress(true);
    }
  };

  const subtotal = getTotal();
  // Free shipping over ₹399 (site-wide threshold — see FIXES.MD), else ₹79.
  const shipping = subtotal === 0 || subtotal >= 399 ? 0 : 79;
  const total = Math.max(0, subtotal + shipping - discount);

  const applyCoupon = async () => {
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode,
          total: subtotal,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon code");
      } else {
        setDiscount(data.discount);
        setCouponId(data.couponId);
        window.dispatchEvent(
          new CustomEvent("show-toast", {
            detail: { message: `Coupon ${couponCode} applied! Saved ₹${data.discount}` },
          })
        );
      }
    } catch {
      setCouponError("Failed to apply coupon");
    }
  };

  const handlePayment = async () => {
    if (!session?.user) {
      router.push("/auth/login?callbackUrl=/checkout");
      return;
    }

    if (!selectedAddress && !showNewAddress) {
      alert("Please select or add a shipping address");
      return;
    }

    if (showNewAddress && (!newAddress.name || !newAddress.phone || !newAddress.line1 || !newAddress.city || !newAddress.state || !newAddress.postalCode)) {
      alert("Please fill in all required address fields");
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
          paymentMethod,
          couponId: couponId || undefined,
          couponCode: couponId ? couponCode : undefined,
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok) {
        alert(orderData.error || "Failed to create order");
        setLoading(false);
        return;
      }

      // COD PATH
      if (orderData.isCod || paymentMethod === "COD") {
        clearCart();
        router.push(`/order-confirmation/${orderData.orderId}`);
        return;
      }

      // RAZORPAY PATH
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: Math.round(total * 100),
        currency: "INR",
        name: "SatvaStones",
        description: "Anti-tarnish everyday jewellery",
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
              alert("Payment verification failed. If money was debited, please contact support@satvastones.in");
            }
          } catch {
            alert("Payment verification failed");
          }
        },
        prefill: {
          name: newAddress.name || session?.user?.name || "",
          email: session?.user?.email || "",
          contact: newAddress.phone || "",
        },
        theme: {
          color: "#505a3d",
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
      alert("Something went wrong with the order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-[var(--paper)] text-[var(--ink)]">
        <div className="editorial-container py-16 lg:py-24 flex flex-col items-center justify-center text-center">
          <div className="eyebrow">Nothing to check out</div>
          <h1 className="font-serif font-normal tracking-[-0.03em] text-[clamp(42px,4.3vw,63px)] mt-3 mb-8">
            Your bag is <em className="text-[var(--olive)]">empty.</em>
          </h1>
          <Link href="/shop" className="button inline-flex">
            Find your everyday
            <svg className="w-[19px] h-[19px]"><use href="#i-arrow" /></svg>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)] min-h-[90vh]">
      <div className="editorial-container py-10 lg:py-14">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/cart" aria-label="Back to bag" className="round-arrow bg-[var(--white)]">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="eyebrow">Secure Checkout</div>
            <h1 className="font-serif font-normal tracking-[-0.03em] leading-[1.02] text-[clamp(34px,3.6vw,50px)] mt-1.5">
              Finalize your <em className="text-[var(--olive)]">order.</em>
            </h1>
          </div>
        </div>

        {/* Account Banner if not signed in */}
        {!session?.user && (
          <div className="mb-8 p-4 bg-[var(--white)] border border-[var(--line)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-medium text-[var(--ink)] block">Ordering as a customer?</span>
              <span className="text-[var(--muted)]">Sign in to save addresses, track shipments, and claim your welcome bonus.</span>
            </div>
            <Link
              href="/auth/login?callbackUrl=/checkout"
              className="px-4 py-2 border border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] text-[10px] uppercase tracking-wider font-semibold hover:bg-[var(--paper)] hover:text-[var(--ink)] transition-colors shrink-0"
            >
              Sign In
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Main Checkout Flow - 7 cols */}
          <div className="lg:col-span-7 space-y-8">
            {/* STEP 1: Delivery Address */}
            <section className="bg-[var(--white)] border border-[var(--line)] p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-[var(--line)]">
                <span className="w-7 h-7 rounded-full bg-[var(--olive)] text-[var(--white)] flex items-center justify-center text-[12px] font-medium">1</span>
                <h2 className="font-serif text-[24px] font-normal">Shipping address</h2>
              </div>

              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => { setSelectedAddress(addr.id); setShowNewAddress(false); }}
                    className={`p-5 border transition-all cursor-pointer ${
                      selectedAddress === addr.id && !showNewAddress
                        ? "border-[var(--olive)] bg-[var(--paper)]/50 ring-1 ring-[var(--olive)]"
                        : "border-[var(--line)] bg-[var(--white)] hover:border-[var(--ink)]"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[var(--ink)] font-serif text-[17px] font-normal mb-1">{addr.name}</p>
                        <p className="text-[var(--muted)] text-[13px] leading-relaxed">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p className="text-[var(--muted)] text-[11px] font-mono mt-2">Mobile: {addr.phone}</p>
                      </div>
                      {selectedAddress === addr.id && !showNewAddress && (
                        <div className="w-6 h-6 rounded-full bg-[var(--olive)] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => { setShowNewAddress(true); setSelectedAddress(""); }}
                  className={`w-full p-4 border border-dashed transition-colors text-center cursor-pointer ${
                    showNewAddress
                      ? "border-[var(--olive)] text-[var(--olive)] bg-[var(--paper)]/40"
                      : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--ink)] hover:text-[var(--ink)] bg-transparent"
                  }`}
                >
                  <span className="text-[11px] tracking-wider uppercase font-semibold">+ Enter new delivery address</span>
                </button>

                {showNewAddress && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--line)] mt-4">
                    <input
                      placeholder="Full Name *"
                      required
                      value={newAddress.name}
                      onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                      className="luxury-input sm:col-span-2"
                    />
                    <input
                      placeholder="Phone Number (10 digits) *"
                      required
                      type="tel"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="luxury-input sm:col-span-2"
                    />
                    <input
                      placeholder="Street Address, House/Flat No. *"
                      required
                      value={newAddress.line1}
                      onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                      className="luxury-input sm:col-span-2"
                    />
                    <input
                      placeholder="Apartment, Landmark (Optional)"
                      value={newAddress.line2}
                      onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                      className="luxury-input sm:col-span-2"
                    />
                    <input
                      placeholder="City *"
                      required
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="luxury-input"
                    />
                    <input
                      placeholder="State *"
                      required
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="luxury-input"
                    />
                    <input
                      placeholder="PIN / Postal Code *"
                      required
                      value={newAddress.postalCode}
                      onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                      className="luxury-input"
                    />
                    <input
                      placeholder="Country"
                      value={newAddress.country}
                      disabled
                      className="luxury-input opacity-60 bg-[var(--paper)]"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* STEP 2: Payment Method */}
            <section className="bg-[var(--white)] border border-[var(--line)] p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-[var(--line)]">
                <span className="w-7 h-7 rounded-full bg-[var(--olive)] text-[var(--white)] flex items-center justify-center text-[12px] font-medium">2</span>
                <h2 className="font-serif text-[24px] font-normal">Payment method</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Razorpay Online */}
                <div
                  onClick={() => setPaymentMethod("razorpay")}
                  className={`p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === "razorpay"
                      ? "border-[var(--olive)] bg-[var(--paper)]/50 ring-1 ring-[var(--olive)]"
                      : "border-[var(--line)] bg-[var(--white)] hover:border-[var(--ink)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-medium text-[13px] text-[var(--ink)] block">UPI / Cards / Net Banking</span>
                      <span className="text-[11px] text-[var(--muted)]">Google Pay, PhonePe, Paytm, Cards</span>
                    </div>
                    {paymentMethod === "razorpay" && (
                      <div className="w-5 h-5 rounded-full bg-[var(--olive)] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[var(--olive)] font-medium uppercase tracking-wider">
                    ⚡ Instant dispatch
                  </span>
                </div>

                {/* Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod("COD")}
                  className={`p-5 border transition-all cursor-pointer flex flex-col justify-between ${
                    paymentMethod === "COD"
                      ? "border-[var(--olive)] bg-[var(--paper)]/50 ring-1 ring-[var(--olive)]"
                      : "border-[var(--line)] bg-[var(--white)] hover:border-[var(--ink)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="font-medium text-[13px] text-[var(--ink)] block">Cash on Delivery (COD)</span>
                      <span className="text-[11px] text-[var(--muted)]">Pay cash when package arrives</span>
                    </div>
                    {paymentMethod === "COD" && (
                      <div className="w-5 h-5 rounded-full bg-[var(--olive)] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider">
                    Available across India
                  </span>
                </div>
              </div>
            </section>

            {/* STEP 3: Items in Order */}
            <section className="bg-[var(--white)] border border-[var(--line)] p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-[var(--line)]">
                <span className="w-7 h-7 rounded-full bg-[var(--line)] text-[var(--muted)] flex items-center justify-center text-[12px] font-medium">3</span>
                <h2 className="font-serif text-[24px] font-normal">Order review</h2>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4 items-center p-3.5 border border-[var(--line)] bg-[var(--paper)]/30">
                    <div className="w-14 h-18 relative bg-[#e7e1d7] overflow-hidden shrink-0 border border-[var(--line)]">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--ink)] font-medium text-[13px] truncate">{item.name}</p>
                      <p className="text-[var(--muted)] text-[10px] tracking-wider uppercase mt-0.5">
                        Qty: {item.quantity} · Anti-tarnish
                      </p>
                    </div>
                    <p className="text-[var(--ink)] font-medium text-[13px] shrink-0">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Summary - 5 cols */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="p-7 border border-[var(--line)] bg-[var(--white)] shadow-sm">
              <h2 className="font-serif text-[24px] font-normal mb-6 pb-3 border-b border-[var(--line)]">
                Payment summary
              </h2>

              {/* Coupon Form */}
              <div className="mb-6">
                <div className="flex gap-2">
                  <input
                    placeholder="Coupon code (e.g. THANK10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="luxury-input flex-1 !text-[12px] uppercase"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="px-5 border border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] text-[10px] tracking-wider uppercase font-semibold hover:bg-[var(--paper)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[#9b5144] text-[11px] mt-2">{couponError}</p>}
                {discount > 0 && <p className="text-[var(--olive)] text-[11px] mt-2 font-medium">✓ Coupon applied: -{formatPrice(discount)}</p>}
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3.5 text-sm mb-6 border-b border-[var(--line)] pb-6">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[var(--muted)]">Items Subtotal</span>
                  <span className="text-[var(--ink)] font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[var(--muted)]">Shipping</span>
                  <span className={shipping === 0 ? "text-[var(--olive)] font-medium" : "text-[var(--ink)]"}>
                    {shipping === 0 ? "Complimentary" : formatPrice(shipping)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-[var(--olive)] text-[13px]">
                    <span>Discount</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-4 border-t border-[var(--line)]">
                  <div>
                    <span className="font-serif text-2xl font-normal block">Total</span>
                    <span className="text-[10px] text-[var(--muted)]">Inclusive of all taxes</span>
                  </div>
                  <span className="font-serif text-[28px] text-[var(--olive)] leading-none">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                onClick={handlePayment}
                disabled={loading}
                className="button w-full justify-center !py-4 shadow-sm"
              >
                {loading ? (
                  "Processing order..."
                ) : paymentMethod === "COD" ? (
                  <>
                    <Lock className="w-4 h-4" />
                    Place Order (COD) · {formatPrice(total)}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Pay {formatPrice(total)} via UPI / Card
                  </>
                )}
              </button>

              <PaymentSecurityBadges />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
