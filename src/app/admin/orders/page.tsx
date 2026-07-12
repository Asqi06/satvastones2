import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/constants";
import UpdateOrderStatus from "./UpdateOrderStatus";

const STATUS_TABS = ["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400",
  CONFIRMED: "bg-blue-500/10 text-blue-400",
  PROCESSING: "bg-purple-500/10 text-purple-400",
  SHIPPED: "bg-indigo-500/10 text-indigo-400",
  DELIVERED: "bg-green-500/10 text-green-400",
  CANCELLED: "bg-red-500/10 text-red-400",
};

type PageProps = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeStatus = params.status?.toUpperCase() || "ALL";
  const searchQuery = params.q?.trim() || "";

  const where: any = {};

  if (activeStatus !== "ALL") {
    where.status = activeStatus;
  }

  if (searchQuery) {
    where.OR = [
      { orderNumber: { contains: searchQuery, mode: "insensitive" } },
      { user: { name: { contains: searchQuery, mode: "insensitive" } } },
      { user: { email: { contains: searchQuery, mode: "insensitive" } } },
    ];
  }

  let orders: any[] = [];
  let totalCount = 0;
  let totalRevenue = 0;
  let pendingCount = 0;
  let statusCounts: Record<string, number> = {};

  try {
    const [ordersResult, counts, revenue, pending] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          items: true,
          coupon: { select: { code: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.order.aggregate({ _sum: { finalAmount: true }, where: { status: { not: "CANCELLED" } } }),
      prisma.order.count({ where: { status: "PENDING" } }),
    ]);

    orders = ordersResult;
    totalCount = orders.length;
    totalRevenue = revenue._sum.finalAmount || 0;
    pendingCount = pending;

    counts.forEach((c) => {
      statusCounts[c.status] = c._count.id;
    });
  } catch (e) {
    console.log("DB not ready");
  }

  const allCount = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Transactions</p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Orders</h1>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-luxury-brown/5 p-6 shadow-sm">
          <p className="text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] font-bold mb-2">Total Orders</p>
          <p className="text-3xl font-serif text-luxury-brown">{allCount}</p>
        </div>
        <div className="bg-white border border-luxury-brown/5 p-6 shadow-sm">
          <p className="text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] font-bold mb-2">Revenue</p>
          <p className="text-3xl font-serif text-luxury-brown">{formatPrice(totalRevenue)}</p>
        </div>
        <div className="bg-white border border-luxury-brown/5 p-6 shadow-sm">
          <p className="text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] font-bold mb-2">Pending Orders</p>
          <p className="text-3xl font-serif text-luxury-brown">{pendingCount}</p>
        </div>
      </div>

      {/* Search Bar */}
      <form>
        <div className="relative">
          <input
            type="text"
            name="q"
            defaultValue={searchQuery}
            placeholder="Search by order number, customer name or email..."
            className="w-full bg-white border border-luxury-brown/10 px-6 py-4 text-sm text-luxury-brown placeholder:text-luxury-brown/30 focus:outline-none focus:border-luxury-gold/50 transition-colors"
          />
          {activeStatus !== "ALL" && <input type="hidden" name="status" value={activeStatus} />}
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-luxury-brown/40 hover:text-luxury-gold transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
        </div>
      </form>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((status) => {
          const count = status === "ALL" ? allCount : (statusCounts[status] || 0);
          const isActive = activeStatus === status;
          const href = status === "ALL" ? (searchQuery ? `?q=${searchQuery}` : "?") : `?status=${status}${searchQuery ? `&q=${searchQuery}` : ""}`;
          return (
            <a
              key={status}
              href={href}
              className={`text-[10px] px-4 py-2 border font-bold uppercase tracking-[0.2em] transition-colors ${
                isActive
                  ? "bg-luxury-brown text-white border-luxury-brown"
                  : "bg-white text-luxury-brown/60 border-luxury-brown/10 hover:border-luxury-gold/50 hover:text-luxury-gold"
              }`}
            >
              {ORDER_STATUS_LABELS[status] || status}
              <span className={`ml-2 ${isActive ? "text-white/70" : "text-luxury-brown/30"}`}>{count}</span>
            </a>
          );
        })}
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-luxury-brown/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-luxury-brown/5 bg-luxury-cream/30">
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Order</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Customer</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Items</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Total</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Coupon</th>
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
                    {order.couponCode ? (
                      <span className="text-[10px] px-3 py-1 border border-luxury-gold/30 text-luxury-gold bg-luxury-gold/5 font-bold uppercase tracking-[0.2em]">
                        {order.couponCode}
                      </span>
                    ) : (
                      <span className="text-luxury-brown/20 text-[9px] tracking-[0.2em] uppercase font-bold">—</span>
                    )}
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
              <p className="text-luxury-brown/40 text-xs tracking-[0.5em] uppercase font-bold">
                {searchQuery ? "No orders match your search" : "Archive currently vacant"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
