import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendgrid";

export async function POST(request: Request) {
  try {
    const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } =
      await request.json();

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: razorpayPaymentId,
        paymentStatus: "PAID",
        status: "CONFIRMED",
      },
      include: {
        user: true,
        items: true,
        shippingAddress: true,
      },
    });

    // Send order confirmation email
    if (order.user.email) {
      const itemsHtml = order.items
        .map(
          (item) => `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #2a2a2a; color: #ffffff;">${item.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #2a2a2a; color: #9ca3af; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #2a2a2a; color: #C9A96E; text-align: right;">₹${item.price * item.quantity}</td>
          </tr>
        `
        )
        .join("");

      await sendEmail({
        to: order.user.email,
        subject: `Order Confirmed - ${order.orderNumber} | Satvastones`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f0f0f; color: #ffffff;">
            <h1 style="color: #C9A96E; text-align: center; font-size: 28px; letter-spacing: 3px;">SATVASTONES</h1>
            <div style="background: #1a1a1a; border-radius: 12px; padding: 32px; border: 1px solid #2a2a2a; margin-top: 24px;">
              <h2 style="color: #ffffff; margin-bottom: 8px;">Order Confirmed!</h2>
              <p style="color: #9ca3af;">Order #${order.orderNumber}</p>
              <table style="width: 100%; margin-top: 24px; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 1px solid #2a2a2a;">
                    <th style="padding: 12px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase;">Item</th>
                    <th style="padding: 12px; text-align: center; color: #6b7280; font-size: 12px; text-transform: uppercase;">Qty</th>
                    <th style="padding: 12px; text-align: right; color: #6b7280; font-size: 12px; text-transform: uppercase;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #2a2a2a; text-align: right;">
                <p style="color: #9ca3af; font-size: 14px;">Total: <span style="color: #C9A96E; font-size: 18px; font-weight: bold;">₹${order.finalAmount}</span></p>
              </div>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/order-confirmation/${order.id}" style="display: inline-block; background: #C9A96E; color: #000000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 24px;">
                View Order
              </a>
            </div>
            <p style="color: #6b7280; text-align: center; font-size: 12px; margin-top: 32px;">
              &copy; ${new Date().getFullYear()} Satvastones. All rights reserved.
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
