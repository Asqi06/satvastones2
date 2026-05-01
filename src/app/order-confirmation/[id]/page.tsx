import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
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
    <div className="bg-luxury-cream min-h-screen py-32 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="w-24 h-24 bg-luxury-gold/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-luxury-gold/20 animate-luxury-fade">
            <CheckCircle className="w-12 h-12 text-luxury-gold" />
          </div>
          <h1 className="text-5xl lg:text-7xl font-serif text-luxury-brown mb-6">Confirmed</h1>
          <p className="text-luxury-brown/50 text-base tracking-wide font-light max-w-md mx-auto">
            The curation has been finalized. A digital archive entry has been dispatched to your address.
          </p>
        </div>

        <div className="bg-white border border-luxury-brown/5 overflow-hidden animate-luxury-fade shadow-sm">
          {/* Order Header */}
          <div className="p-10 border-b border-luxury-brown/5 bg-luxury-cream/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8">
              <div>
                <p className="text-[10px] tracking-widest uppercase text-luxury-brown/30 font-bold mb-2">Protocol Reference</p>
                <p className="text-luxury-gold font-serif text-2xl tracking-tight">{order.orderNumber}</p>
              </div>
              <div className="sm:text-right">
                <p className="text-[10px] tracking-widest uppercase text-luxury-brown/30 font-bold mb-2">Date Authorized</p>
                <p className="text-luxury-brown font-serif">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Items */}
            <div className="p-10 border-r border-luxury-brown/5">
              <h3 className="text-[11px] font-bold text-luxury-brown tracking-[0.4em] uppercase mb-10 flex items-center gap-3">
                <Package className="w-4 h-4 text-luxury-gold" />
                Inventory
              </h3>
              <div className="space-y-8">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-6 group">
                    <div className="w-16 h-20 bg-luxury-cream overflow-hidden flex-shrink-0">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-luxury-brown text-sm font-serif truncate">{item.name}</p>
                      <p className="text-luxury-brown/40 text-[9px] tracking-widest uppercase font-bold mt-1">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-luxury-brown font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="divide-y divide-luxury-brown/5">
              {/* Address */}
              <div className="p-10">
                <h3 className="text-[11px] font-bold text-luxury-brown tracking-[0.4em] uppercase mb-6 flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-luxury-gold" />
                  Destination
                </h3>
                <p className="text-luxury-brown font-serif text-lg mb-2">{order.shippingAddress?.name}</p>
                <p className="text-luxury-brown/50 text-sm leading-relaxed font-light">
                  {order.shippingAddress?.line1}{order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
                  {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                </p>
              </div>

              {/* Summary */}
              <div className="p-10 bg-luxury-cream/10">
                <h3 className="text-[11px] font-bold text-luxury-brown tracking-[0.4em] uppercase mb-6 flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-luxury-gold" />
                  Valuation
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between text-luxury-brown/40 uppercase tracking-widest text-[10px] font-bold">
                    <span>Sub-Valuation</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-luxury-brown/40 uppercase tracking-widest text-[10px] font-bold">
                    <span>Transit</span>
                    <span>{order.shippingAmount === 0 ? "Complimentary" : formatPrice(order.shippingAmount)}</span>
                  </div>
                  <div className="pt-6 border-t border-luxury-brown/5 flex justify-between items-end">
                    <span className="text-luxury-brown font-black text-[10px] tracking-[0.4em] uppercase">Finalized</span>
                    <span className="text-luxury-gold font-serif text-3xl">{formatPrice(order.finalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col sm:flex-row gap-6 justify-center">
          <Link
            href="/products"
            className="px-12 py-5 bg-luxury-brown text-white text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-luxury-gold transition-all text-center shadow-xl"
          >
            Return to Archive
          </Link>
          <Link
            href="/account/orders"
            className="px-12 py-5 border border-luxury-brown/10 text-luxury-brown text-[11px] font-bold tracking-[0.4em] uppercase hover:border-luxury-brown transition-all text-center"
          >
            My Collections
          </Link>
        </div>
      </div>
    </div>
  );
}
