import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

// Admin-only: list subscribers. The POST below stays public so visitors can subscribe.
export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const subscribers = await prisma.newsletter.findMany({
      orderBy: { subscribedAt: "desc" },
    });
    return NextResponse.json({ subscribers });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch subscribers" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const existing = await prisma.newsletter.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "This email is already subscribed" },
        { status: 400 }
      );
    }

    await prisma.newsletter.create({
      data: { email },
    });

    return NextResponse.json({ message: "Successfully subscribed!" });
  } catch (error) {
    console.error("Newsletter error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
