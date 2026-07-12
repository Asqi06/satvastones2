import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  Activity,
  Plus,
  ClipboardList,
  Image,
  Tag,
  AlertTriangle,
  Star,
  Sparkles,
  LayoutTemplate,
  Clock,
  BarChart3,
} from "lucide-react";
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
    activeSales: 0,
    bestSellers: 0,
    newCollection: 0,
    activeBanners: 0,
    revenueByStatus: [] as { status: string; total: number }[],
  };

  try {
    const [
      totalRevenue,
      totalOrders,
      totalCustomers,
      totalProducts,
      recentOrders,
      pendingOrders,
      lowStockProducts,
      activeSales,
      bestSellers,
      newCollection,
      activeBanners,
      revenueByStatus,
    ] = await Promise.all([
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
      prisma.sale.count({ where: { isActive: true } }),
      prisma.product.count({ where: { isBestSeller: true, isActive: true } }),
      prisma.product.count({ where: { isNewCollection: true, isActive: true } }),
      prisma.banner.count({ where: { isActive: true } }),
      prisma.order.groupBy({
        by: ["status"],
        _sum: { finalAmount: true },
        where: { paymentStatus: "PAID" },
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
      activeSales,
      bestSellers,
      newCollection,
      activeBanners,
      revenueByStatus: revenueByStatus
        .map((r) => ({ status: r.status, total: r._sum.finalAmount || 0 }))
        .sort((a, b) => b.total - a.total),
    };
  } catch (e) {
    console.log("Database connectivity delayed.");
  }

  const statCards = [
    {
      label: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      sub: "Net paid collection",
      icon: DollarSign,
      color: "text-[var(--luxury-gold)]",
      borderColor: "border-[var(--luxury-gold)]",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      sub: `${stats.pendingOrders} pending attention`,
      icon: ShoppingBag,
      color: "text-[var(--luxury-brown)]",
      borderColor: "border-[var(--luxury-brown)]",
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers.toString(),
      sub: "Registered patrons",
      icon: Users,
      color: "text-[var(--luxury-brown)]",
      borderColor: "border-[var(--luxury-brown)]",
    },
    {
      label: "Total Products",
      value: stats.totalProducts.toString(),
      sub: `${stats.lowStockProducts.length} low stock alerts`,
      icon: Package,
      color: stats.lowStockProducts.length > 0 ? "text-red-500" : "text-[var(--luxury-brown)]",
      borderColor: stats.lowStockProducts.length > 0 ? "border-red-500" : "border-[var(--luxury-brown)]",
    },
  ];

  const quickActions = [
    { label: "Create Product", href: "/admin/products/new", icon: Plus },
    { label: "Pending Orders", href: "/admin/orders?status=PENDING", icon: ClipboardList },
    { label: "Manage Banners", href: "/admin/banners", icon: Image },
    { label: "Manage Sales", href: "/admin/sales", icon: Tag },
  ];

  const statusColors: Record<string, string> = {
    PENDING: "border-amber-500/30 text-amber-500 bg-amber-500/5",
    CONFIRMED: "border-blue-500/30 text-blue-500 bg-blue-500/5",
    PROCESSING: "border-purple-500/30 text-purple-500 bg-purple-500/5",
    SHIPPED: "border-indigo-500/30 text-indigo-500 bg-indigo-500/5",
    DELIVERED: "border-emerald-500/30 text-emerald-500 bg-emerald-500/5",
    CANCELLED: "border-red-500/30 text-red-500 bg-red-500/5",
    REFUNDED: "border-gray-500/30 text-gray-500 bg-gray-500/5",
  };

  return (
    <div className="min-h-screen bg-[var(--luxury-cream)] p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-[var(--luxury-border)] pb-12">
          <div>
            <p className="text-[var(--luxury-gold)] text-[10px] tracking-[0.5em] uppercase font-bold mb-6">
              Analytical Intelligence
            </p>
            <h1 className="text-5xl lg:text-7xl font-serif text-[var(--luxury-brown)]">Boardroom</h1>
          </div>
          <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-full border border-[var(--luxury-border)] shadow-sm">
            <Activity className="w-4 h-4 text-[var(--luxury-gold)] animate-pulse" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--luxury-brown)]/40 font-bold">
              Telemetry Live
            </span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {statCards.map((stat) => (
            <div
              key={stat.label}
              className="group relative bg-white p-10 border border-[var(--luxury-border)] hover:border-[var(--luxury-gold)] transition-all duration-700 overflow-hidden shadow-sm hover:shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 group-hover:text-[var(--luxury-gold)] transition-all duration-700 translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div className="flex items-center gap-4 mb-8">
                <div
                  className={`w-12 h-12 flex items-center justify-center border ${stat.borderColor}/10 group-hover:border-[var(--luxury-gold)] transition-all duration-700 ${stat.color}`}
                >
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-4xl font-serif text-[var(--luxury-brown)] mb-4 group-hover:text-[var(--luxury-gold)] transition-all">
                {stat.value}
              </p>
              <p className="text-[10px] tracking-[0.3em] uppercase text-[var(--luxury-brown)]/60 font-bold group-hover:text-[var(--luxury-brown)] transition-all">
                {stat.label}
              </p>
              <p className="text-[9px] text-[var(--luxury-brown)]/40 mt-3 font-medium tracking-wide italic">
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-[var(--luxury-border)] shadow-sm p-8">
          <h2 className="text-[10px] tracking-[0.3em] uppercase text-[var(--luxury-brown)]/60 font-bold mb-8">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="group flex flex-col items-center gap-4 p-6 border border-[var(--luxury-border)] hover:border-[var(--luxury-gold)] hover:shadow-lg transition-all duration-500"
              >
                <div className="w-12 h-12 flex items-center justify-center border border-[var(--luxury-border)] group-hover:border-[var(--luxury-gold)] group-hover:bg-[var(--luxury-gold)]/5 transition-all duration-500">
                  <action.icon className="w-5 h-5 text-[var(--luxury-brown)] group-hover:text-[var(--luxury-gold)] transition-colors" />
                </div>
                <span className="text-[10px] tracking-[0.2em] uppercase text-[var(--luxury-brown)]/60 font-bold group-hover:text-[var(--luxury-brown)] transition-colors text-center">
                  {action.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Highlighted Pending Orders */}
        {stats.pendingOrders > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-8 flex items-center gap-6 shadow-sm">
            <div className="w-14 h-14 flex items-center justify-center bg-amber-100 border border-amber-200">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 tracking-wide">
                {stats.pendingOrders} Order{stats.pendingOrders !== 1 ? "s" : ""} Awaiting Confirmation
              </p>
              <p className="text-xs text-amber-600 mt-1">
                These orders require your immediate attention to maintain customer satisfaction.
              </p>
            </div>
            <Link
              href="/admin/orders?status=PENDING"
              className="text-[9px] tracking-[0.2em] uppercase text-amber-700 font-bold hover:text-amber-900 transition-colors flex items-center gap-3 bg-white px-6 py-3 border border-amber-200 hover:border-amber-400"
            >
              Review
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Middle Row: Sales, Best Sellers, New Collection, Banners */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="bg-white p-8 border border-[var(--luxury-border)] shadow-sm group hover:border-[var(--luxury-gold)] transition-all duration-500">
            <div className="w-10 h-10 flex items-center justify-center border border-[var(--luxury-border)] mb-6 group-hover:border-[var(--luxury-gold)] transition-all">
              <Tag className="w-4 h-4 text-[var(--luxury-gold)]" />
            </div>
            <p className="text-3xl font-serif text-[var(--luxury-brown)] mb-2">{stats.activeSales}</p>
            <p className="text-[9px] tracking-[0.2em] uppercase text-[var(--luxury-brown)]/50 font-bold">Active Sales</p>
          </div>
          <div className="bg-white p-8 border border-[var(--luxury-border)] shadow-sm group hover:border-[var(--luxury-gold)] transition-all duration-500">
            <div className="w-10 h-10 flex items-center justify-center border border-[var(--luxury-border)] mb-6 group-hover:border-[var(--luxury-gold)] transition-all">
              <Star className="w-4 h-4 text-[var(--luxury-gold)]" />
            </div>
            <p className="text-3xl font-serif text-[var(--luxury-brown)] mb-2">{stats.bestSellers}</p>
            <p className="text-[9px] tracking-[0.2em] uppercase text-[var(--luxury-brown)]/50 font-bold">Best Sellers</p>
          </div>
          <div className="bg-white p-8 border border-[var(--luxury-border)] shadow-sm group hover:border-[var(--luxury-gold)] transition-all duration-500">
            <div className="w-10 h-10 flex items-center justify-center border border-[var(--luxury-border)] mb-6 group-hover:border-[var(--luxury-gold)] transition-all">
              <Sparkles className="w-4 h-4 text-[var(--luxury-gold)]" />
            </div>
            <p className="text-3xl font-serif text-[var(--luxury-brown)] mb-2">{stats.newCollection}</p>
            <p className="text-[9px] tracking-[0.2em] uppercase text-[var(--luxury-brown)]/50 font-bold">New Collection</p>
          </div>
          <div className="bg-white p-8 border border-[var(--luxury-border)] shadow-sm group hover:border-[var(--luxury-gold)] transition-all duration-500">
            <div className="w-10 h-10 flex items-center justify-center border border-[var(--luxury-border)] mb-6 group-hover:border-[var(--luxury-gold)] transition-all">
              <LayoutTemplate className="w-4 h-4 text-[var(--luxury-gold)]" />
            </div>
            <p className="text-3xl font-serif text-[var(--luxury-brown)] mb-2">{stats.activeBanners}</p>
            <p className="text-[9px] tracking-[0.2em] uppercase text-[var(--luxury-brown)]/50 font-bold">Active Banners</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white border border-[var(--luxury-border)] shadow-sm">
            <div className="p-8 flex items-center justify-between border-b border-[var(--luxury-border)]">
              <h2 className="text-[10px] tracking-[0.3em] uppercase text-[var(--luxury-brown)]/60 font-bold">
                Recent Transactions
              </h2>
              <Link
                href="/admin/orders"
                className="text-[9px] tracking-[0.2em] uppercase text-[var(--luxury-gold)] font-bold hover:text-[var(--luxury-brown)] transition-colors flex items-center gap-3"
              >
                View All
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--luxury-border)]">
                    <th className="text-left p-6 text-[9px] tracking-[0.2em] uppercase text-[var(--luxury-brown)]/40 font-bold">
                      Order
                    </th>
                    <th className="text-left p-6 text-[9px] tracking-[0.2em] uppercase text-[var(--luxury-brown)]/40 font-bold">
                      Customer
                    </th>
                    <th className="text-left p-6 text-[9px] tracking-[0.2em] uppercase text-[var(--luxury-brown)]/40 font-bold hidden sm:table-cell">
                      Date
                    </th>
                    <th className="text-right p-6 text-[9px] tracking-[0.2em] uppercase text-[var(--luxury-brown)]/40 font-bold">
                      Amount
                    </th>
                    <th className="text-right p-6 text-[9px] tracking-[0.2em] uppercase text-[var(--luxury-brown)]/40 font-bold">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--luxury-border)]">
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[var(--luxury-cream)]/20 transition-colors group">
                      <td className="p-6">
                        <span className="text-[var(--luxury-brown)] text-sm font-serif group-hover:text-[var(--luxury-gold)] transition-colors">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[var(--luxury-cream)] border border-[var(--luxury-border)] flex items-center justify-center font-serif text-sm text-[var(--luxury-brown)]/40 group-hover:border-[var(--luxury-gold)] group-hover:text-[var(--luxury-gold)] transition-all">
                            {order.user?.name?.charAt(0) || "P"}
                          </div>
                          <span className="text-[var(--luxury-brown)]/60 text-xs tracking-wide">
                            {order.user?.name || order.user?.email}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 hidden sm:table-cell">
                        <span className="text-[var(--luxury-brown)]/40 text-[10px] tracking-widest uppercase font-bold">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <span className="text-[var(--luxury-brown)] text-sm font-serif">
                          {formatPrice(order.finalAmount)}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <span
                          className={`text-[9px] tracking-[0.2em] uppercase font-bold px-4 py-2 border inline-block ${
                            statusColors[order.status] || "border-[var(--luxury-border)] text-[var(--luxury-brown)]/40 bg-[var(--luxury-cream)]"
                          }`}
                        >
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {stats.recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-24 text-center">
                        <p className="text-[var(--luxury-brown)]/10 text-xs tracking-[0.4em] uppercase font-bold">
                          No Records in Archive
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Revenue by Status */}
            <div className="bg-white border border-[var(--luxury-border)] shadow-sm">
              <div className="p-8 flex items-center justify-between border-b border-[var(--luxury-border)]">
                <h2 className="text-[10px] tracking-[0.3em] uppercase text-[var(--luxury-brown)]/60 font-bold">
                  Revenue by Status
                </h2>
                <BarChart3 className="w-4 h-4 text-[var(--luxury-gold)]" />
              </div>
              <div className="divide-y divide-[var(--luxury-border)]">
                {stats.revenueByStatus.length > 0 ? (
                  stats.revenueByStatus.map((item) => {
                    const maxRevenue = stats.revenueByStatus[0]?.total || 1;
                    const percentage = Math.round((item.total / maxRevenue) * 100);
                    return (
                      <div key={item.status} className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[9px] tracking-[0.2em] uppercase text-[var(--luxury-brown)]/60 font-bold">
                            {ORDER_STATUS_LABELS[item.status] || item.status}
                          </span>
                          <span className="text-sm font-serif text-[var(--luxury-brown)]">
                            {formatPrice(item.total)}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[var(--luxury-cream)]">
                          <div
                            className="h-full bg-[var(--luxury-gold)] transition-all duration-700"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-20 text-center">
                    <p className="text-[var(--luxury-brown)]/10 text-xs tracking-[0.4em] uppercase font-bold">
                      No Revenue Data
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white border border-[var(--luxury-border)] shadow-sm flex flex-col">
              <div className="p-8 flex items-center justify-between border-b border-[var(--luxury-border)]">
                <h2 className="text-[10px] tracking-[0.3em] uppercase text-[var(--luxury-brown)]/60 font-bold">
                  Low Stock Alert
                </h2>
                <Link
                  href="/admin/products"
                  className="text-[9px] tracking-[0.2em] uppercase text-[var(--luxury-gold)] font-bold hover:text-[var(--luxury-brown)] transition-colors flex items-center gap-3"
                >
                  Restock
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="divide-y divide-[var(--luxury-border)] flex-1">
                {stats.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="p-6 flex items-center justify-between hover:bg-[var(--luxury-cream)]/20 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle
                        className={`w-3.5 h-3.5 ${
                          product.stock === 0 ? "text-red-500" : "text-[var(--luxury-gold)]"
                        }`}
                      />
                      <p className="text-[var(--luxury-brown)]/60 text-xs font-bold tracking-widest uppercase group-hover:text-[var(--luxury-brown)] transition-colors">
                        {product.name}
                      </p>
                    </div>
                    <span
                      className={`text-[9px] tracking-[0.2em] uppercase font-bold px-4 py-2 border ${
                        product.stock === 0
                          ? "border-red-500/30 text-red-600 bg-red-50"
                          : "border-[var(--luxury-gold)]/30 text-[var(--luxury-gold)] bg-[var(--luxury-gold)]/5"
                      }`}
                    >
                      {product.stock === 0 ? "Exhausted" : `${product.stock} Left`}
                    </span>
                  </div>
                ))}
                {stats.lowStockProducts.length === 0 && (
                  <div className="p-20 text-center">
                    <p className="text-[var(--luxury-brown)]/10 text-xs tracking-[0.4em] uppercase font-bold">
                      Inventory Stable
                    </p>
                  </div>
                )}
              </div>
              <div className="p-6 bg-[var(--luxury-cream)]/10 border-t border-[var(--luxury-border)]">
                <p className="text-[9px] text-[var(--luxury-brown)]/50 italic font-medium leading-relaxed">
                  Real-time monitoring of product availability across all channels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
