import { prisma } from "@/lib/prisma";
import { formatDate, formatPrice } from "@/lib/utils";
import { Search, Users, TrendingUp, ShoppingCart } from "lucide-react";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const page = parseInt(params.page || "1");
  const pageSize = 20;

  const where = {
    role: "CUSTOMER" as const,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  let customers: any[] = [];
  let totalCount = 0;
  try {
    [customers, totalCount] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        include: {
          _count: { select: { orders: true } },
          orders: {
            select: {
              finalAmount: true,
              paymentStatus: true,
              createdAt: true,
            },
            where: { paymentStatus: "PAID" },
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ]);
  } catch (e) {
    console.log("DB not ready");
  }

  const totalRevenue = customers.reduce((sum, c) => {
    return sum + c.orders.reduce((s: number, o: any) => s + o.finalAmount, 0);
  }, 0);

  const avgOrderValue =
    customers.reduce(
      (sum, c) =>
        sum +
        c.orders.reduce((s: number, o: any) => s + o.finalAmount, 0),
      0
    ) / (customers.reduce((sum, c) => sum + c._count.orders, 0) || 1);

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">
            Patrons
          </p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">
            Customers
          </h1>
        </div>
        <form action="/admin/customers" method="get" className="relative w-full sm:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-brown/40" />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by name or email..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-luxury-brown/10 rounded-none text-sm text-luxury-brown placeholder-luxury-brown/40 focus:outline-none focus:border-luxury-gold transition-colors"
          />
          {search && (
            <a
              href="/admin/customers"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-luxury-brown/40 hover:text-luxury-gold uppercase tracking-widest font-bold"
            >
              Clear
            </a>
          )}
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-luxury-brown/5 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-luxury-cream flex items-center justify-center">
              <Users className="w-5 h-5 text-luxury-gold" />
            </div>
            <p className="text-[10px] text-luxury-brown/60 uppercase tracking-[0.3em] font-bold">
              Total Patrons
            </p>
          </div>
          <p className="text-3xl font-serif text-luxury-brown">{totalCount}</p>
        </div>
        <div className="bg-white border border-luxury-brown/5 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-luxury-cream flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-luxury-gold" />
            </div>
            <p className="text-[10px] text-luxury-brown/60 uppercase tracking-[0.3em] font-bold">
              Total Revenue
            </p>
          </div>
          <p className="text-3xl font-serif text-luxury-gold">
            {formatPrice(totalRevenue)}
          </p>
        </div>
        <div className="bg-white border border-luxury-brown/5 p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-luxury-cream flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-luxury-gold" />
            </div>
            <p className="text-[10px] text-luxury-brown/60 uppercase tracking-[0.3em] font-bold">
              Avg Order Value
            </p>
          </div>
          <p className="text-3xl font-serif text-luxury-brown">
            {formatPrice(avgOrderValue)}
          </p>
        </div>
      </div>

      {search && (
        <p className="text-sm text-luxury-brown/60">
          Showing {customers.length} result{customers.length !== 1 && "s"} for{" "}
          <span className="text-luxury-gold font-bold">"{search}"</span>
        </p>
      )}

      <div className="bg-white border border-luxury-brown/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-luxury-brown/5 bg-luxury-cream/30">
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">
                  Patron
                </th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">
                  Digital Address
                </th>
                <th className="text-center text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">
                  Orders
                </th>
                <th className="text-right text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">
                  Total Valuations
                </th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">
                  Last Order
                </th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">
                  Patron Since
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-brown/5">
              {customers.map((customer) => {
                const totalSpent = customer.orders.reduce(
                  (sum: number, o: any) => sum + o.finalAmount,
                  0
                );
                const lastOrder =
                  customer.orders.length > 0 ? customer.orders[0] : null;
                const initials = customer.name
                  ? customer.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                  : "P";

                return (
                  <tr
                    key={customer.id}
                    className="hover:bg-luxury-cream/20 transition-colors group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-full border border-luxury-brown/10 flex items-center justify-center text-luxury-gold bg-luxury-cream font-serif text-sm font-bold group-hover:bg-luxury-gold group-hover:text-white transition-all">
                          {initials}
                        </div>
                        <div>
                          <p className="text-luxury-brown text-sm font-bold tracking-tight">
                            {customer.name || "Anonymous Patron"}
                          </p>
                          <p className="text-luxury-brown/40 text-[10px] tracking-widest uppercase mt-1">
                            {customer.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-luxury-brown/50 text-[10px] tracking-widest uppercase">
                        {customer.email}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-luxury-cream text-luxury-brown text-sm font-bold">
                        {customer._count.orders}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-luxury-gold text-lg font-serif">
                        {formatPrice(totalSpent)}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      {lastOrder ? (
                        <div>
                          <p className="text-luxury-brown/80 text-sm">
                            {formatDate(lastOrder.createdAt)}
                          </p>
                          <p className="text-luxury-gold text-xs font-bold mt-1">
                            {formatPrice(lastOrder.finalAmount)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-luxury-brown/30 text-xs italic">
                          No orders
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-luxury-brown/60 text-[10px] tracking-widest uppercase">
                        {formatDate(customer.createdAt)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {customers.length === 0 && (
            <div className="py-32 text-center">
              <p className="text-luxury-brown/40 text-xs tracking-[0.5em] uppercase font-bold">
                {search ? "No patrons match your search" : "No patrons yet"}
              </p>
            </div>
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {page > 1 && (
            <a
              href={`/admin/customers?page=${page - 1}${search ? `&search=${search}` : ""}`}
              className="px-4 py-2 border border-luxury-brown/10 text-luxury-brown text-sm hover:bg-luxury-cream transition-colors"
            >
              Previous
            </a>
          )}
          <span className="px-4 py-2 text-sm text-luxury-brown/60">
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a
              href={`/admin/customers?page=${page + 1}${search ? `&search=${search}` : ""}`}
              className="px-4 py-2 border border-luxury-brown/10 text-luxury-brown text-sm hover:bg-luxury-cream transition-colors"
            >
              Next
            </a>
          )}
        </div>
      )}
    </div>
  );
}
