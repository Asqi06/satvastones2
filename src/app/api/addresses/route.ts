import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    const address = await prisma.address.create({
      data: { ...body, userId },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create address" }, { status: 500 });
  }
}
