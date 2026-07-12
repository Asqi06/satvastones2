import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const trends = await prisma.trend.findMany({
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
      { error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, image, sortOrder, isActive, productIds } = body;

    if (!title || !image) {
      return NextResponse.json(
        { error: "Title and image are required" },
        { status: 400 }
      );
    }

    const trend = await prisma.trend.create({
      data: {
        title,
        image,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        products: productIds?.length
          ? {
              create: productIds.map((productId: string, index: number) => ({
                productId,
                sortOrder: index,
              })),
            }
          : undefined,
      },
      include: {
        products: {
          include: { product: { select: { id: true, name: true, price: true, images: true } } },
        },
      },
    });

    return NextResponse.json(trend, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create trend" },
      { status: 500 }
    );
  }
}
