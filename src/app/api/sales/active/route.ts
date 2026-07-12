import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json({ sales });
  } catch (error) {
    console.error("Fetch active sales error:", error);
    return NextResponse.json(
      { error: "Failed to fetch active sales" },
      { status: 500 }
    );
  }
}
