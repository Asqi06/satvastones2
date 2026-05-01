import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, ArrowUpRight, Activity } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  let stats = {
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    recentOrders: [] as any[],
    pendingOrders: 0,
    lowStockProducts: [] as any[],
  };

  try {
    const [totalRevenue, totalOrders, totalCustomers, totalProducts, recentOrders, pendingOrders, lowStockProducts] =
      await Promise.all([
        prisma.order.aggregate({
          _sum: { finalAmount: true },
          where: { paymentStatus: "PAID" },
        }),
        prisma.order.count(),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.product.count(),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, email: true } }, items: true },
        }),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.product.findMany({
          where: { stock: { lte: 5 }, isActive: true },
          take: 5,
          select: { id: true, name: true, stock: true, slug: true },
        }),
      ]);

    stats = {
      totalRevenue: totalRevenue._sum.finalAmount || 0,
      totalOrders,
      totalCustomers,
      totalProducts,
      recentOrders,
      pendingOrders,
      lowStockProducts,
    };
  } catch (e) {
    console.log("Database connectivity delayed.");
  }

  const statCards = [
    {
      label: "Revenue Yield",
      value: formatPrice(stats.totalRevenue),
      sub: "Net collection",
      icon: DollarSign,
      color: "text-luxury-gold",
    },
    {
      label: "Active Orders",
      value: stats.totalOrders.toString(),
      sub: `${stats.pendingOrders} awaiting attention`,
      icon: ShoppingBag,
      color: "text-luxury-brown",
    },
    {
      label: "Known Patrons",
      value: stats.totalCustomers.toString(),
      sub: "Exclusive membership",
      icon: Users,
      color: "text-luxury-brown",
    },
    {
      label: "Artifact Inventory",
      value: stats.totalProducts.toString(),
      sub: `${stats.lowStockProducts.length} at critical depletion`,
      icon: Package,
      color: stats.lowStockProducts.length > 0 ? "text-red-500" : "text-luxury-brown",
    },
  ];

  const statusColors: Record<string, string> = {
    PENDING: "border-amber-500/30 text-amber-500 bg-amber-500/5",
    CONFIRMED: "border-blue-500/30 text-blue-500 bg-blue-500/5",
    PROCESSING: "border-purple-500/30 text-purple-500 bg-purple-500/5",
    SHIPPED: "border-indigo-500/30 text-indigo-500 bg-indigo-500/5",
    DELIVERED: "border-emerald-500/30 text-emerald-500 bg-emerald-500/5",
    CANCELLED: "border-red-500/30 text-red-500 bg-red-500/5",
  };

  return (
    <div className="space-y-16">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-12">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-6">Analytical Intelligence</p>
          <h1 className="text-5xl lg:text-7xl font-serif text-luxury-brown">Boardroom</h1>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-luxury-brown/5 shadow-sm">
          <Activity className="w-4 h-4 text-luxury-gold animate-pulse" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-luxury-brown/40 font-bold">Telemetry Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat, i) => (
          <div
            key={stat.label}
            className="group relative bg-white p-10 border border-luxury-brown/5 hover:border-luxury-gold transition-all duration-700 overflow-hidden shadow-sm hover:shadow-2xl"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:text-luxury-gold transition-all duration-700 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 flex items-center justify-center border border-luxury-brown/5 group-hover:border-luxury-gold transition-all duration-700 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-4xl font-serif text-luxury-brown mb-4 group-hover:text-luxury-gold transition-all">{stat.value}</p>
            <p className="text-[10px] tracking-[0.3em] uppercase text-luxury-brown/60 font-bold group-hover:text-luxury-brown transition-all">{stat.label}</p>
            <p className="text-[9px] text-luxury-brown/40 mt-3 font-medium tracking-wide italic">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-luxury-brown/5 shadow-sm">
          <div className="p-8 flex items-center justify-between border-b border-luxury-brown/5">
            <h2 className="text-xl font-serif text-luxury-brown uppercase tracking-widest text-sm opacity-60">Recent Transactions</h2>
            <Link
              href="/admin/orders"
              className="text-[9px] tracking-[0.2em] uppercase text-luxury-gold font-bold hover:text-luxury-brown transition-colors flex items-center gap-3"
            >
              Examine Archive
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-luxury-brown/5">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-8 hover:bg-luxury-cream/20 transition-colors group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-luxury-cream border border-luxury-brown/10 flex items-center justify-center font-serif text-xl text-luxury-brown/40 group-hover:border-luxury-gold group-hover:text-luxury-gold transition-all">
                    {order.user?.name?.charAt(0) || "P"}
                  </div>
                  <div>
                    <h4 className="text-luxury-brown text-md font-serif mb-1 group-hover:text-luxury-gold transition-colors">{order.orderNumber}</h4>
                    <p className="text-luxury-brown/60 text-[10px] tracking-widest uppercase font-bold">
                      {order.user?.name || order.user?.email} &middot; {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8 justify-between sm:justify-end">
                  <p className="text-luxury-brown text-lg font-serif">{formatPrice(order.finalAmount)}</p>
                  <span
                    className={`text-[9px] tracking-[0.2em] uppercase font-bold px-5 py-2 border transition-colors ${
                      statusColors[order.status] || "border-luxury-brown/10 text-luxury-brown/40 bg-luxury-cream"
                    }`}
                  >
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </div>
            ))}
            {stats.recentOrders.length === 0 && (
              <div className="p-24 text-center">
                <p className="text-luxury-brown/10 text-xs tracking-[0.4em] uppercase font-bold">No Records in Archive</p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white border border-luxury-brown/5 shadow-sm flex flex-col">
          <div className="p-8 flex items-center justify-between border-b border-luxury-brown/5">
            <h2 className="text-xl font-serif text-luxury-brown uppercase tracking-widest text-sm opacity-60">Depletion Alert</h2>
            <Link
              href="/admin/products"
              className="text-[9px] tracking-[0.2em] uppercase text-luxury-gold font-bold hover:text-luxury-brown transition-colors flex items-center gap-3"
            >
              Restock
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-luxury-brown/5 flex-1">
            {stats.lowStockProducts.map((product) => (
              <div key={product.id} className="p-8 flex items-center justify-between hover:bg-luxury-cream/20 transition-colors group">
                <p className="text-luxury-brown/60 text-xs font-bold tracking-widest uppercase group-hover:text-luxury-brown transition-colors">{product.name}</p>
                <span
                  className={`text-[9px] tracking-[0.2em] uppercase font-bold px-4 py-2 border ${
                    product.stock === 0
                      ? "border-red-500/30 text-red-600 bg-red-50"
                      : "border-luxury-gold/30 text-luxury-gold bg-luxury-gold/5"
                  }`}
                >
                  {product.stock === 0 ? "Exhausted" : `${product.stock} Units`}
                </span>
              </div>
            ))}
            {stats.lowStockProducts.length === 0 && (
              <div className="p-20 text-center">
                <p className="text-luxury-brown/10 text-xs tracking-[0.4em] uppercase font-bold">Inventory Stable</p>
              </div>
            )}
          </div>
          <div className="p-8 bg-luxury-cream/10 border-t border-luxury-brown/5">
            <p className="text-[9px] text-luxury-brown/50 italic font-medium leading-relaxed">Intelligence unit monitoring real-time artifact availability across global distribution channels.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
