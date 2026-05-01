import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code, total } = await request.json();

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

    if (total < coupon.minOrder) {
      return NextResponse.json(
        { error: `Minimum order amount is ₹${coupon.minOrder}` },
        { status: 400 }
      );
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (total * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    discount = Math.min(discount, total);

    return NextResponse.json({ discount, couponId: coupon.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 });
  }
}
