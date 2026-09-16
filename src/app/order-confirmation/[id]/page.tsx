import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Order Confirmed`,
    description: "Your order has been confirmed.",
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";
import { CheckCircle, Package, MapPin, CreditCard } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();

  let order: any = null;
  try {
    order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        shippingAddress: true,
      },
    });
  } catch (e) {
    console.log("DB not ready");
  }

  if (!order) notFound();
  if (session?.user && (session.user as any).id !== order.userId) notFound();

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)] min-h-screen">
      <div className="editorial-container max-w-3xl py-12 lg:py-16">
        {/* Celebration Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[var(--white)] rounded-full flex items-center justify-center mx-auto mb-6 border border-[var(--line)] shadow-sm">
            <CheckCircle className="w-10 h-10 text-[var(--olive)]" />
          </div>
          <div className="eyebrow">Thank you for your order</div>
          <h1 className="font-serif font-normal tracking-[-0.03em] text-[var(--ink)] text-4xl lg:text-6xl mt-2 mb-4">
            Order <em className="text-[var(--olive)]">confirmed.</em>
          </h1>
          <p className="text-[var(--muted)] text-[13px] leading-relaxed max-w-md mx-auto">
            Your jewellery is being thoughtfully packed in gift-ready boxes and prepared for dispatch within 24 hours.
          </p>
        </div>

        {/* Receipt Box */}
        <div className="bg-[var(--white)] border border-[var(--line)] shadow-sm overflow-hidden">
          {/* Header Row */}
          <div className="p-6 sm:p-8 border-b border-[var(--line)] bg-[var(--paper)]/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-[10px] tracking-wider uppercase text-[var(--muted)] font-semibold mb-1">Order Reference</p>
                <p className="text-[var(--olive)] font-mono font-medium text-xl tracking-tight">{order.orderNumber}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] tracking-wider uppercase text-[var(--muted)] font-semibold mb-1">Date Placed</p>
                <p className="text-[var(--ink)] text-sm font-medium">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Items Column */}
            <div className="p-6 sm:p-8 border-b md:border-b-0 md:border-r border-[var(--line)]">
              <h2 className="text-[11px] font-semibold text-[var(--ink)] tracking-widest uppercase mb-6 flex items-center gap-2">
                <Package className="w-4 h-4 text-[var(--olive)]" />
                Items ({order.items.length})
              </h2>
              <div className="space-y-5">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 group">
                    <div className="w-14 h-18 bg-[#e7e1d7] overflow-hidden shrink-0 border border-[var(--line)]">
                      {item.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[var(--ink)] text-[13px] font-medium truncate">{item.name}</p>
                      <p className="text-[var(--muted)] text-[10px] tracking-wider uppercase mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-[var(--ink)] font-medium text-[13px]">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Details Column */}
            <div className="divide-y divide-[var(--line)]">
              {/* Shipping Address */}
              <div className="p-6 sm:p-8">
                <h2 className="text-[11px] font-semibold text-[var(--ink)] tracking-widest uppercase mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--olive)]" />
                  Delivery Destination
                </h2>
                <p className="text-[var(--ink)] font-medium text-[14px] mb-1">{order.shippingAddress?.name}</p>
                <p className="text-[var(--muted)] text-[12px] leading-relaxed">
                  {order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                </p>
                <p className="text-[var(--muted)] text-[11px] font-mono mt-2">Mobile: {order.shippingAddress?.phone}</p>
              </div>

              {/* Payment Summary */}
              <div className="p-6 sm:p-8 bg-[var(--paper)]/40">
                <h2 className="text-[11px] font-semibold text-[var(--ink)] tracking-widest uppercase mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[var(--olive)]" />
                  Payment Summary ({order.paymentMethod === "COD" ? "Cash on Delivery" : "Online via Razorpay"})
                </h2>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Subtotal</span>
                    <span className="text-[var(--ink)]">{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Shipping</span>
                    <span className={order.shippingAmount === 0 ? "text-[var(--olive)] font-medium" : "text-[var(--ink)]"}>
                      {order.shippingAmount === 0 ? "Complimentary" : formatPrice(order.shippingAmount)}
                    </span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-[var(--olive)]">
                      <span>Discount</span>
                      <span>-{formatPrice(order.discountAmount)}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-[var(--line)] flex justify-between items-baseline">
                    <span className="font-medium text-[13px]">Total Paid / Due</span>
                    <span className="text-[var(--olive)] font-serif text-2xl">{formatPrice(order.finalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="button text-center justify-center !py-3.5 !px-8"
          >
            Continue Shopping
          </Link>
          <Link
            href="/account/orders"
            className="inline-flex items-center justify-center px-8 py-3.5 border border-[var(--line)] bg-[var(--white)] text-[var(--ink)] text-[11px] font-semibold tracking-wider uppercase hover:border-[var(--ink)] transition-colors text-center"
          >
            View Your Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
