import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AdminCustomersPage() {
  let customers: any[] = [];
  try {
    customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: {
        _count: { select: { orders: true } },
        orders: {
          select: { finalAmount: true, paymentStatus: true },
          where: { paymentStatus: "PAID" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.log("DB not ready");
  }

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-luxury-brown/5 pb-10">
        <div>
          <p className="text-luxury-gold text-[10px] tracking-[0.5em] uppercase font-bold mb-4">Patrons</p>
          <h1 className="text-4xl lg:text-6xl font-serif text-luxury-brown">Customers</h1>
        </div>
      </div>

      <div className="bg-white border border-luxury-brown/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-luxury-brown/5 bg-luxury-cream/30">
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Patron</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Digital Address</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Acquisitions</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Total Valuations</th>
                <th className="text-left text-[9px] text-luxury-brown/60 uppercase tracking-[0.3em] px-8 py-6 font-bold">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-brown/5">
              {customers.map((customer) => {
                const totalSpent = customer.orders.reduce(
                  (sum: number, o: any) => sum + o.finalAmount,
                  0
                );
                return (
                  <tr key={customer.id} className="hover:bg-luxury-cream/20 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-full border border-luxury-brown/10 flex items-center justify-center text-luxury-gold bg-luxury-cream font-serif text-xl group-hover:bg-luxury-gold group-hover:text-white transition-all">
                          {customer.name?.charAt(0) || "P"}
                        </div>
                        <span className="text-luxury-brown text-sm font-bold tracking-tight">{customer.name || "Anonymous Patron"}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-luxury-brown/60 text-[10px] tracking-widest uppercase font-bold">{customer.email}</td>
                    <td className="px-8 py-6 text-luxury-brown/80 text-sm font-bold">{customer._count.orders}</td>
                    <td className="px-8 py-6 text-luxury-gold text-lg font-serif">
                       ₹{totalSpent.toLocaleString("en-IN")}
                    </td>
                    <td className="px-8 py-6 text-luxury-brown/60 text-[10px] tracking-widest uppercase font-bold">{formatDate(customer.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {customers.length === 0 && (
            <div className="py-32 text-center">
              <p className="text-luxury-brown/40 text-xs tracking-[0.5em] uppercase font-bold">No patrons yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
