import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        products: {
          include: { product: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    return NextResponse.json({ sale });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sale" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, subtitle, discountPercent, bgColor, type, sortOrder, isActive, productIds } = body;

    const existingSale = await prisma.sale.findUnique({ where: { id } });
    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    const sale = await prisma.$transaction(async (tx) => {
      const updatedSale = await tx.sale.update({
        where: { id },
        data: {
          title,
          subtitle: subtitle || null,
          discountPercent: discountPercent ? parseInt(discountPercent) : null,
          bgColor: bgColor || null,
          type: type || "regular",
          sortOrder: sortOrder ? parseInt(sortOrder) : 0,
          isActive: isActive !== false,
        },
      });

      if (productIds !== undefined) {
        await tx.saleProduct.deleteMany({ where: { saleId: id } });

        if (productIds.length > 0) {
          await tx.saleProduct.createMany({
            data: productIds.map((productId: string, index: number) => ({
              saleId: id,
              productId,
              sortOrder: index,
            })),
          });
        }
      }

      return updatedSale;
    });

    const saleWithProducts = await prisma.sale.findUnique({
      where: { id: sale.id },
      include: {
        products: {
          include: { product: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return NextResponse.json(saleWithProducts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update sale" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingSale = await prisma.sale.findUnique({ where: { id } });
    if (!existingSale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    await prisma.sale.delete({ where: { id } });
    return NextResponse.json({ message: "Sale deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete sale" },
      { status: 500 }
    );
  }
}
