import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const trends = await prisma.trend.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          include: { product: { select: { id: true, name: true, price: true, images: true } } },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(trends);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch active trends" },
      { status: 500 }
    );
  }
}
