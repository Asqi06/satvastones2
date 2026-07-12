import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const trend = await prisma.trend.findUnique({
      where: { id: params.id },
      include: {
        products: {
          include: { product: { select: { id: true, name: true, price: true, images: true } } },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!trend) {
      return NextResponse.json(
        { error: "Trend not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(trend);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch trend" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, image, sortOrder, isActive, productIds } = body;

    // If productIds provided, replace all trend products
    if (productIds !== undefined) {
      await prisma.trendProduct.deleteMany({
        where: { trendId: params.id },
      });

      if (productIds.length > 0) {
        await prisma.trendProduct.createMany({
          data: productIds.map((productId: string, index: number) => ({
            trendId: params.id,
            productId,
            sortOrder: index,
          })),
        });
      }
    }

    const trend = await prisma.trend.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(image !== undefined && { image }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        products: {
          include: { product: { select: { id: true, name: true, price: true, images: true } } },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(trend);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update trend" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.trend.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Trend deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete trend" },
      { status: 500 }
    );
  }
}
