import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  try {
    const sales = await prisma.sale.findMany({
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
    console.error("Fetch sales error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sales" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const { title, subtitle, discountPercent, bgColor, type, sortOrder, isActive, productIds } = body;

    const sale = await prisma.$transaction(async (tx) => {
      const createdSale = await tx.sale.create({
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

      if (productIds && productIds.length > 0) {
        // NOTE: createMany is not supported on MongoDB — insert one by one.
        for (const [index, productId] of (productIds as string[]).entries()) {
          await tx.saleProduct.create({
            data: { saleId: createdSale.id, productId, sortOrder: index },
          });
        }
      }

      return createdSale;
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

    return NextResponse.json(saleWithProducts, { status: 201 });
  } catch (error) {
    console.error("Create sale error:", error);
    return NextResponse.json(
      { error: "Failed to create sale" },
      { status: 500 }
    );
  }
}
