import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { generateOrderNumber } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { items, shippingAddressId, totalAmount, discountAmount, shippingAmount, finalAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const orderNumber = generateOrderNumber();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(finalAmount * 100),
      currency: "INR",
      receipt: orderNumber,
    });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        totalAmount,
        discountAmount,
        shippingAmount,
        finalAmount,
        shippingAddressId: shippingAddressId || null,
        paymentMethod: "razorpay",
        paymentId: razorpayOrder.id,
        paymentStatus: "PENDING",
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        },
      },
    });

    // Clear cart
    await prisma.cartItem.deleteMany({
      where: {
        cart: { userId },
      },
    });

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
