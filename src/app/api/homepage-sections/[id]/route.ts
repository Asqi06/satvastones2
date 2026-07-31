import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const section = await prisma.homepageSection.findUnique({
      where: { id: id },
      include: {
        products: {
          orderBy: { sortOrder: "asc" },
          include: { product: true },
        },
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Homepage section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch homepage section" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await request.json();
    const { title, sortOrder, isActive, productIds } = body;

    const section = await prisma.$transaction(async (tx) => {
      const updated = await tx.homepageSection.update({
        where: { id: id },
        data: {
          ...(title !== undefined && { title }),
          ...(sortOrder !== undefined && { sortOrder }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      if (productIds !== undefined) {
        await tx.homepageSectionProduct.deleteMany({
          where: { sectionId: id },
        });

        if (productIds.length > 0) {
          await tx.homepageSectionProduct.createMany({
            data: productIds.map(
              (item: { productId: string; sortOrder?: number; badge?: string }) => ({
                sectionId: id,
                productId: item.productId,
                sortOrder: item.sortOrder ?? 0,
                badge: item.badge ?? null,
              })
            ),
          });
        }
      }

      return tx.homepageSection.findUnique({
        where: { id: id },
        include: {
          products: {
            orderBy: { sortOrder: "asc" },
            include: { product: true },
          },
        },
      });
    });

    return NextResponse.json(section);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update homepage section" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const existing = await prisma.homepageSection.findUnique({
      where: { id: id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Homepage section not found" },
        { status: 404 }
      );
    }

    await prisma.homepageSection.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Homepage section deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete homepage section" },
      { status: 500 }
    );
  }
}
