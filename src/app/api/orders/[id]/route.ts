import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendgrid";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { user: true, items: true },
    });

    // Send status update email
    if (order.user.email && status === "SHIPPED") {
      await sendEmail({
        to: order.user.email,
        subject: `Your Order Has Been Shipped - ${order.orderNumber}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f0f0f; color: #ffffff;">
            <h1 style="color: #C9A96E; text-align: center; font-size: 28px; letter-spacing: 3px;">SATVASTONES</h1>
            <div style="background: #1a1a1a; border-radius: 12px; padding: 32px; border: 1px solid #2a2a2a; margin-top: 24px;">
              <h2 style="color: #ffffff;">Your Order Has Been Shipped!</h2>
              <p style="color: #9ca3af;">Order #${order.orderNumber}</p>
              <p style="color: #9ca3af; margin-top: 16px;">Your order is on its way! You can track your order status from your account.</p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders" style="display: inline-block; background: #C9A96E; color: #000000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;">
                Track Order
              </a>
            </div>
          </div>
        `,
      });
    }

    if (order.user.email && status === "DELIVERED") {
      await sendEmail({
        to: order.user.email,
        subject: `Order Delivered - ${order.orderNumber} | Satvastones`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f0f0f; color: #ffffff;">
            <h1 style="color: #C9A96E; text-align: center; font-size: 28px; letter-spacing: 3px;">SATVASTONES</h1>
            <div style="background: #1a1a1a; border-radius: 12px; padding: 32px; border: 1px solid #2a2a2a; margin-top: 24px;">
              <h2 style="color: #ffffff;">Order Delivered!</h2>
              <p style="color: #9ca3af;">Order #${order.orderNumber}</p>
              <p style="color: #9ca3af; margin-top: 16px;">We hope you love your new jewellery! If you have a moment, we'd appreciate a review.</p>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
