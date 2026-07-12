import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code, total, items } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Coupon has expired" }, { status: 400 });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }

    let eligibleTotal = total;

    if (items && Array.isArray(items) && items.length > 0) {
      const productIds = items.map((item: { productId: string }) => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, price: true, comparePrice: true },
      });

      const productMap = new Map(products.map((p) => [p.id, p]));

      let nonSaleTotal = 0;
      let hasSaleItems = false;

      for (const item of items) {
        const product = productMap.get(item.productId);
        if (product && product.comparePrice && product.comparePrice > product.price) {
          hasSaleItems = true;
        } else {
          const productPrice = product?.price ?? 0;
          nonSaleTotal += productPrice * (item.quantity ?? 1);
        }
      }

      if (hasSaleItems && nonSaleTotal === 0) {
        return NextResponse.json(
          { error: "Coupons cannot be applied on products already on sale" },
          { status: 400 }
        );
      }

      eligibleTotal = nonSaleTotal;
    }

    if (eligibleTotal < coupon.minOrder) {
      return NextResponse.json(
        { error: `Minimum order amount is ₹${coupon.minOrder}` },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (eligibleTotal * coupon.discountValue) / 100;
    } else {
      discount = Math.min(coupon.discountValue, eligibleTotal);
    }

    discount = Math.min(discount, eligibleTotal);

    return NextResponse.json({ discount, couponId: coupon.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
