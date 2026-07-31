import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const user = await prisma.user.findUnique({
      where: { referralCode: code.toUpperCase() },
      select: { id: true, name: true, email: true, referralCode: true, referralCommissions: true, referredById: true },
    });

    if (!user) {
      return NextResponse.json({ valid: false, error: "Invalid referral code" }, { status: 404 });
    }

    const referrer = user.referredById
      ? await prisma.user.findUnique({
          where: { id: user.referredById },
          select: { name: true, referralCode: true },
        })
      : null;

    return NextResponse.json({
      valid: true,
      referralCode: user.referralCode,
      referralCommissions: user.referralCommissions || 0,
      referredBy: referrer?.name || null,
    });
  }

  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      referralCode: true,
      referralCommissions: true,
      referredById: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const referredCount = await prisma.user.count({
    where: { referredById: userId },
  });

  return NextResponse.json({
    referralCode: user.referralCode,
    referralCommissions: user.referralCommissions || 0,
    referredCount,
  });
}
