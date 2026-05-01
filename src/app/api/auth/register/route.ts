import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/sendgrid";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date(),
      },
    });

    await sendEmail({
      to: email,
      subject: "Welcome to Satvastones!",
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #0f0f0f; color: #ffffff;">
          <h1 style="color: #C9A96E; text-align: center; font-size: 28px; letter-spacing: 3px;">SATVASTONES</h1>
          <p style="color: #C9A96E; text-align: center; font-size: 12px; letter-spacing: 2px; margin-bottom: 40px;">LUXURY KOREAN & WESTERN JEWELLERY</p>
          <div style="background: #1a1a1a; border-radius: 12px; padding: 32px; border: 1px solid #2a2a2a;">
            <h2 style="color: #ffffff; margin-bottom: 16px;">Welcome, ${name}!</h2>
            <p style="color: #9ca3af; line-height: 1.6;">
              Thank you for creating an account with Satvastones. We're delighted to have you join our community of jewellery lovers.
            </p>
            <p style="color: #9ca3af; line-height: 1.6;">
              Explore our curated collection of exquisite Korean and Western jewellery pieces, handcrafted with precision and elegance.
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/products" style="display: inline-block; background: #C9A96E; color: #000000; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 20px;">
              Start Shopping
            </a>
          </div>
          <p style="color: #6b7280; text-align: center; font-size: 12px; margin-top: 32px;">
            &copy; ${new Date().getFullYear()} Satvastones. All rights reserved.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      message: "Account created successfully",
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
