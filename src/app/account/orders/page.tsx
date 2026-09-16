import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { Package, ChevronRight } from "lucide-react";
import AccountSidebar from "@/components/account/AccountSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders",
  description: "Track and manage your orders.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "text-[#9b6b23] border-[#e7d8b8] bg-[#faf6ec]",
  CONFIRMED: "text-[var(--olive)] border-[var(--line)] bg-[var(--paper)]",
  PROCESSING: "text-[var(--olive)] border-[var(--line)] bg-[var(--paper)]",
  SHIPPED: "text-[var(--olive)] border-[var(--line)] bg-[var(--paper)]",
  DELIVERED: "text-[var(--olive)] border-[var(--olive)] bg-[#eef1e6]",
  CANCELLED: "text-[#9b5144] border-[#e5c9c2] bg-[#faf1ee]",
};

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

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)]">
      <div className="editorial-container py-10 lg:py-14">
        <div className="eyebrow">Track &amp; manage</div>
        <h1 className="font-serif font-normal tracking-[-0.03em] leading-[1.02] text-[clamp(42px,4.3vw,63px)] mt-3 mb-8">
          Your <em className="text-[var(--olive)]">orders.</em>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1">
            <AccountSidebar userName={session?.user?.name} userEmail={session?.user?.email} />
          </div>

          <div className="lg:col-span-3">
            {orders.length === 0 ? (
              <div className="text-center py-20 bg-[var(--white)] border border-[var(--line)]">
                <Package className="w-12 h-12 text-[var(--olive)] mx-auto mb-6 opacity-60" />
                <h2 className="font-serif text-[32px] font-normal mb-3">No orders yet</h2>
                <p className="text-[var(--muted)] text-[11px] uppercase tracking-[0.14em] mb-8">
                  Your little collection starts here
                </p>
                <Link href="/shop" className="button inline-flex">
                  Explore the collection
                  <svg className="w-[19px] h-[19px]"><use href="#i-arrow" /></svg>
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-[var(--white)] border border-[var(--line)] overflow-hidden"
                  >
                    <div className="p-6 lg:p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-[var(--line)]">
                        <div>
                          <p className="text-[10px] tracking-[0.14em] uppercase text-[var(--muted)] mb-1.5">
                            Order {order.orderNumber}
                          </p>
                          <p className="font-serif text-xl">{formatPrice(order.finalAmount)}</p>
                          <p className="text-[var(--muted)] text-[11px] mt-1">{formatDate(order.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`px-3 py-1.5 border text-[10px] uppercase tracking-[0.12em] ${
                              STATUS_STYLES[order.status] || "text-[var(--muted)] border-[var(--line)]"
                            }`}
                          >
                            {ORDER_STATUS_LABELS[order.status] || order.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                        <div className="flex items-center gap-3 overflow-x-auto pb-1">
                          {order.items.slice(0, 5).map((item: any) => (
                            <div
                              key={item.id}
                              className="w-16 h-20 bg-[#e7e1d7] overflow-hidden flex-shrink-0"
                            >
                              {item.image && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              )}
                            </div>
                          ))}
                          {order.items.length > 5 && (
                            <div className="w-16 h-20 bg-[var(--paper)] flex items-center justify-center text-[var(--muted)] text-[11px] border border-[var(--line)] flex-shrink-0">
                              +{order.items.length - 5}
                            </div>
                          )}
                        </div>
                        <Link
                          href={`/order-confirmation/${order.id}`}
                          className="text-link flex-shrink-0"
                        >
                          View details
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
