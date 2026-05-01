import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import UpdateOrderStatus from "./UpdateOrderStatus";

export default async function AdminOrdersPage() {
  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.log("DB not ready");
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-400",
    CONFIRMED: "bg-blue-500/10 text-blue-400",
    PROCESSING: "bg-purple-500/10 text-purple-400",
    SHIPPED: "bg-indigo-500/10 text-indigo-400",
    DELIVERED: "bg-green-500/10 text-green-400",
    CANCELLED: "bg-red-500/10 text-red-400",
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Transactions</p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Orders</h1>
        </div>
      </div>

      <div className="bg-white border border-luxury-brown/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-luxury-brown/5 bg-luxury-cream/30">
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Order</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Customer</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Items</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Total</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Payment</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Status</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-brown/5">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-luxury-cream/20 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-luxury-gold font-serif text-sm tracking-tight">{order.orderNumber}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-luxury-brown text-sm font-bold tracking-tight">{order.user?.name || "Guest"}</p>
                    <p className="text-luxury-brown/60 text-[10px] tracking-widest uppercase font-bold">{order.user?.email}</p>
                  </td>
                  <td className="px-8 py-6 text-luxury-brown/60 text-[10px] tracking-widest uppercase font-bold">{order.items.length} items</td>
                  <td className="px-8 py-6 text-luxury-brown text-sm font-bold">
                    {formatPrice(order.finalAmount)}
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`text-[9px] px-3 py-1 border tracking-[0.2em] font-bold uppercase transition-colors ${
                        order.paymentStatus === "PAID"
                          ? "border-emerald-500/30 text-emerald-600 bg-emerald-50"
                          : "border-amber-500/30 text-amber-600 bg-amber-50"
                      }`}
                    >
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <UpdateOrderStatus
                      orderId={order.id}
                      currentStatus={order.status}
                    />
                  </td>
                  <td className="px-8 py-6 text-luxury-brown/60 text-[10px] tracking-widest uppercase font-bold">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="py-32 text-center">
              <p className="text-luxury-brown/40 text-xs tracking-[0.5em] uppercase font-bold">Archive currently vacant</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
