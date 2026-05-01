import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ coupons });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        discountType: body.discountType,
        discountValue: body.discountValue,
        minOrder: body.minOrder || 0,
        maxUses: body.maxUses,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json(coupon, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}
