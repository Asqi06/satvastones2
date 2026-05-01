import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import { Package, ChevronRight, Eye } from "lucide-react";

export default async function OrdersPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.log("DB not ready");
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    CONFIRMED: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    PROCESSING: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    SHIPPED: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    DELIVERED: "bg-green-500/10 text-green-400 border-green-500/20",
    CANCELLED: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="bg-luxury-cream min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16">
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Account Archive</p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Your Collections</h1>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-24 bg-white border border-luxury-brown/5 animate-luxury-fade">
            <Package className="w-16 h-16 text-luxury-brown/10 mx-auto mb-8" />
            <h2 className="text-2xl font-serif text-luxury-brown mb-4">No Acquisitions Yet</h2>
            <p className="text-luxury-brown/40 text-sm tracking-widest uppercase font-bold mb-12">Capture your first masterpiece</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-6 px-12 py-5 bg-luxury-brown text-white text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-luxury-gold transition-all shadow-xl"
            >
              Explore Archive
            </Link>
          </div>
        ) : (
          <div className="space-y-8 animate-luxury-fade">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-luxury-brown/5 overflow-hidden group hover:shadow-2xl transition-all duration-700"
              >
                <div className="p-10">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10 pb-10 border-b border-luxury-brown/5">
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-luxury-brown/30 font-bold mb-2">Protocol Reference</p>
                      <p className="text-luxury-gold font-serif text-xl tracking-tight">{order.orderNumber}</p>
                      <p className="text-luxury-brown/40 text-[9px] tracking-widest uppercase font-bold mt-2">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <p className="text-[9px] tracking-widest uppercase text-luxury-brown/30 font-bold mb-1">Status</p>
                        <span className="text-luxury-brown font-serif text-sm">
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>
                      <div className="w-px h-10 bg-luxury-brown/5 hidden sm:block"></div>
                      <div className="text-right">
                        <p className="text-[9px] tracking-widest uppercase text-luxury-brown/30 font-bold mb-1">Valuation</p>
                        <p className="text-luxury-gold font-serif text-2xl">{formatPrice(order.finalAmount)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
                    <div className="flex items-center gap-4 overflow-x-auto pb-2">
                      {order.items.slice(0, 5).map((item: any) => (
                        <div
                          key={item.id}
                          className="w-16 h-20 bg-luxury-cream overflow-hidden flex-shrink-0 border border-luxury-brown/5"
                        >
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                          )}
                        </div>
                      ))}
                      {order.items.length > 5 && (
                        <div className="w-16 h-20 bg-luxury-cream flex items-center justify-center text-luxury-brown/30 text-[10px] uppercase font-bold border border-luxury-brown/5">
                          +{order.items.length - 5}
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/account/orders/${order.id}`}
                      className="inline-flex items-center gap-4 px-8 py-4 border border-luxury-brown/10 text-luxury-brown text-[10px] font-bold tracking-[0.3em] uppercase hover:bg-luxury-brown hover:text-white transition-all group/btn"
                    >
                      Inspect Details
                      <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
