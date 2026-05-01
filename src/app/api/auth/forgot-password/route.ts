import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendgrid";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "If an account exists, a reset link has been sent" },
        { status: 200 }
      );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashedToken,
        expires: expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}&email=${email}`;

    await sendEmail({
      to: email,
      subject: "Reset Your Password - Satvastones",
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f0f0f; color: #ffffff;">
          <h1 style="color: #C9A96E; text-align: center; font-size: 28px; letter-spacing: 3px;">SATVASTONES</h1>
          <div style="background: #1a1a1a; border-radius: 12px; padding: 32px; border: 1px solid #2a2a2a;">
            <h2 style="color: #ffffff; margin-bottom: 16px;">Reset Your Password</h2>
            <p style="color: #9ca3af; line-height: 1.6;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            <a href="${resetUrl}" style="display: inline-block; background: #C9A96E; color: #000000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;">
              Reset Password
            </a>
            <p style="color: #6b7280; font-size: 12px; margin-top: 24px;">
              This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
            </p>
          </div>
          <p style="color: #6b7280; text-align: center; font-size: 12px; margin-top: 32px;">
            &copy; ${new Date().getFullYear()} Satvastones. All rights reserved.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "If an account exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
