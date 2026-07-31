import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ShoppingCart,
  CreditCard,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";

export default async function AnalyticsPage() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const stats = {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    totalCustomers: 0,
    newCustomersThisMonth: 0,
    revenueByMonth: [] as { month: string; revenue: number; orders: number }[],
    ordersByStatus: [] as { status: string; count: number }[],
    topProducts: [] as { name: string; count: number; revenue: number }[],
    revenueByPaymentStatus: [] as { status: string; total: number }[],
  };

  try {
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      newCustomersThisMonth,
      ordersByStatus,
      revenueByPaymentStatus,
      recentOrders,
      topProductsRaw,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { finalAmount: true },
        where: { paymentStatus: "PAID" },
      }),
      prisma.order.count(),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.user.count({
        where: { role: "CUSTOMER", createdAt: { gte: thisMonthStart } },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      prisma.order.groupBy({
        by: ["paymentStatus"],
        _sum: { finalAmount: true },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { finalAmount: true, createdAt: true },
      }),
      prisma.orderItem.groupBy({
        by: ["productId"],
        _count: { id: true },
        _sum: { price: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
    ]);

    const revenue = totalRevenue._sum.finalAmount || 0;
    stats.totalRevenue = revenue;
    stats.totalOrders = totalOrders;
    stats.averageOrderValue = totalOrders > 0 ? revenue / totalOrders : 0;
    stats.totalCustomers = totalCustomers;
    stats.newCustomersThisMonth = newCustomersThisMonth;

    stats.ordersByStatus = ordersByStatus.map((s) => ({
      status: s.status,
      count: s._count.id,
    }));

    stats.revenueByPaymentStatus = revenueByPaymentStatus
      .map((s) => ({ status: s.paymentStatus, total: s._sum.finalAmount || 0 }))
      .filter((s) => s.total > 0)
      .sort((a, b) => b.total - a.total);

    // Build monthly revenue from raw orders
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyData: Record<string, { revenue: number; orders: number }> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyData[key] = { revenue: 0, orders: 0 };
    }

    for (const order of recentOrders) {
      const d = new Date(order.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (monthlyData[key]) {
        monthlyData[key].revenue += order.finalAmount;
        monthlyData[key].orders += 1;
      }
    }

    stats.revenueByMonth = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      orders: data.orders,
    }));

    // Top products
    const productIds = topProductsRaw.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p.name]));

    stats.topProducts = topProductsRaw.map((p) => ({
      name: productMap.get(p.productId) || "Unknown",
      count: p._count.id,
      revenue: p._sum.price || 0,
    }));
  } catch (e) {
    console.log("Analytics query failed, using defaults.");
  }

  const maxMonthlyRevenue = Math.max(...stats.revenueByMonth.map((m) => m.revenue), 1);
  const maxTopProductCount = Math.max(...stats.topProducts.map((p) => p.count), 1);

  const paymentStatusColors: Record<string, string> = {
    PAID: "bg-emerald-500",
    PENDING: "bg-amber-500",
    FAILED: "bg-red-500",
    REFUNDED: "bg-gray-400",
  };

  const paymentStatusIcons: Record<string, typeof DollarSign> = {
    PAID: CheckCircle,
    PENDING: Clock,
    FAILED: XCircle,
    REFUNDED: RotateCcw,
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Intelligence</p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Analytics</h1>
        </div>
        <div className="flex items-center gap-4 bg-white px-6 py-3 border border-luxury-brown/5 shadow-sm">
          <BarChart3 className="w-4 h-4 text-luxury-gold" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-luxury-brown/40 font-bold">
            Last 6 Months Overview
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: formatPrice(stats.totalRevenue), icon: DollarSign, sub: "Paid orders only" },
          { label: "Total Orders", value: stats.totalOrders.toString(), icon: ShoppingCart, sub: `${stats.averageOrderValue > 0 ? formatPrice(stats.averageOrderValue) : "—"} avg value` },
          { label: "Total Customers", value: stats.totalCustomers.toString(), icon: Users, sub: `+${stats.newCustomersThisMonth} this month` },
          { label: "Active Products", value: stats.topProducts.length.toString(), icon: Package, sub: "Tracked in orders" },
        ].map((card) => (
          <div
            key={card.label}
            className="group bg-white p-8 border border-luxury-brown/5 hover:border-luxury-gold/30 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-lg relative"
          >
            <div className="absolute top-0 right-0 w-20 h-20 bg-luxury-gold/5 blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-luxury-gold/10 transition-all" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 flex items-center justify-center border border-luxury-brown/10 group-hover:border-luxury-gold/30 transition-all">
                <card.icon className="w-4 h-4 text-luxury-gold" />
              </div>
            </div>
            <p className="text-3xl font-serif text-luxury-brown mb-2 group-hover:text-luxury-gold transition-colors">
              {card.value}
            </p>
            <p className="text-[9px] tracking-[0.3em] uppercase text-luxury-brown/50 font-bold mb-1">{card.label}</p>
            <p className="text-[9px] text-luxury-brown/30 italic font-medium">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue by Month */}
      <div className="bg-white border border-luxury-brown/5 shadow-sm">
        <div className="p-8 border-b border-luxury-brown/5 flex items-center justify-between">
          <div>
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-luxury-brown/60 font-bold">Revenue Trends</h2>
            <p className="text-[9px] text-luxury-brown/30 mt-1 italic">Monthly revenue from paid orders</p>
          </div>
          <TrendingUp className="w-4 h-4 text-luxury-gold" />
        </div>
        <div className="p-8">
          {stats.revenueByMonth.length > 0 ? (
            <div className="space-y-4">
              {stats.revenueByMonth.map((month) => {
                const percentage = maxMonthlyRevenue > 0 ? (month.revenue / maxMonthlyRevenue) * 100 : 0;
                return (
                  <div key={month.month} className="group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] tracking-[0.2em] uppercase text-luxury-brown/60 font-bold w-24">
                        {month.month}
                      </span>
                      <div className="flex items-center gap-6">
                        <span className="text-[9px] text-luxury-brown/30 font-bold">
                          {month.orders} order{month.orders !== 1 ? "s" : ""}
                        </span>
                        <span className="text-sm font-serif text-luxury-brown group-hover:text-luxury-gold transition-colors w-28 text-right">
                          {formatPrice(month.revenue)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-luxury-cream/50 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-luxury-gold/60 to-luxury-gold transition-all duration-700 group-hover:from-luxury-gold group-hover:to-luxury-brown"
                        style={{ width: `${Math.max(percentage, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-luxury-brown/10 text-xs tracking-[0.5em] uppercase font-bold">No Revenue Data</p>
            </div>
          )}
        </div>
      </div>

      {/* Two Column: Top Products + Orders by Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products */}
        <div className="bg-white border border-luxury-brown/5 shadow-sm">
          <div className="p-8 border-b border-luxury-brown/5 flex items-center justify-between">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-luxury-brown/60 font-bold">Top Products</h2>
            <Package className="w-4 h-4 text-luxury-gold" />
          </div>
          <div className="divide-y divide-luxury-brown/5">
            {stats.topProducts.length > 0 ? (
              stats.topProducts.map((product, i) => {
                const percentage = maxTopProductCount > 0 ? (product.count / maxTopProductCount) * 100 : 0;
                return (
                  <div key={i} className="p-6 group hover:bg-luxury-cream/20 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <span className="text-[9px] text-luxury-brown/20 font-bold w-6 text-center">
                          #{i + 1}
                        </span>
                        <span className="text-sm text-luxury-brown font-bold tracking-tight group-hover:text-luxury-gold transition-colors">
                          {product.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-[9px] text-luxury-brown/30 font-bold">
                          {product.count} sold
                        </span>
                        <span className="text-sm font-serif text-luxury-gold w-24 text-right">
                          {formatPrice(product.revenue)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1 bg-luxury-cream/50 overflow-hidden ml-10">
                      <div
                        className="h-full bg-luxury-gold/40 transition-all duration-700"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-20 text-center">
                <p className="text-luxury-brown/10 text-xs tracking-[0.5em] uppercase font-bold">No Product Data</p>
              </div>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white border border-luxury-brown/5 shadow-sm">
          <div className="p-8 border-b border-luxury-brown/5 flex items-center justify-between">
            <h2 className="text-[10px] tracking-[0.3em] uppercase text-luxury-brown/60 font-bold">Orders by Status</h2>
            <BarChart3 className="w-4 h-4 text-luxury-gold" />
          </div>
          <div className="p-8">
            {stats.ordersByStatus.length > 0 ? (
              <div className="space-y-5">
                {stats.ordersByStatus
                  .sort((a, b) => b.count - a.count)
                  .map((item) => {
                    const maxCount = Math.max(...stats.ordersByStatus.map((s) => s.count), 1);
                    const percentage = (item.count / maxCount) * 100;
                    return (
                      <div key={item.status}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] tracking-[0.2em] uppercase text-luxury-brown/60 font-bold">
                            {item.status}
                          </span>
                          <span className="text-sm font-serif text-luxury-brown">{item.count}</span>
                        </div>
                        <div className="w-full h-2 bg-luxury-cream/50 overflow-hidden">
                          <div
                            className="h-full bg-luxury-brown/20 transition-all duration-700 group-hover:bg-luxury-gold/40"
                            style={{ width: `${Math.max(percentage, 3)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-luxury-brown/10 text-xs tracking-[0.5em] uppercase font-bold">No Orders Yet</p>
              </div>
            )}
          </div>

          {/* Revenue by Payment Status */}
          <div className="border-t border-luxury-brown/5 p-8">
            <h3 className="text-[9px] tracking-[0.3em] uppercase text-luxury-brown/40 font-bold mb-6">
              Revenue by Payment Status
            </h3>
            {stats.revenueByPaymentStatus.length > 0 ? (
              <div className="space-y-4">
                {stats.revenueByPaymentStatus.map((item) => {
                  const Icon = paymentStatusIcons[item.status] || CreditCard;
                  const barColor = paymentStatusColors[item.status] || "bg-gray-400";
                  const maxPayment = Math.max(...stats.revenueByPaymentStatus.map((s) => s.total), 1);
                  const pct = (item.total / maxPayment) * 100;
                  return (
                    <div key={item.status} className="group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3 h-3 text-luxury-brown/30" />
                          <span className="text-[9px] tracking-[0.2em] uppercase text-luxury-brown/60 font-bold">
                            {item.status}
                          </span>
                        </div>
                        <span className="text-sm font-serif text-luxury-brown">{formatPrice(item.total)}</span>
                      </div>
                      <div className="w-full h-1.5 bg-luxury-cream/50 overflow-hidden">
                        <div
                          className={`h-full ${barColor} transition-all duration-700`}
                          style={{ width: `${Math.max(pct, 3)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-luxury-brown/10 text-[10px] tracking-[0.3em] uppercase font-bold text-center py-6">
                No Payment Data
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
