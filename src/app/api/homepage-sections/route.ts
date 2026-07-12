import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const sections = await prisma.homepageSection.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          orderBy: { sortOrder: "asc" },
          include: { product: true },
        },
      },
    });
    return NextResponse.json(sections);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch homepage sections" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, sortOrder, isActive, productIds } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const section = await prisma.homepageSection.create({
      data: {
        title,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true,
        ...(productIds &&
          productIds.length > 0 && {
            products: {
              create: productIds.map(
                (item: { productId: string; sortOrder?: number; badge?: string }) => ({
                  productId: item.productId,
                  sortOrder: item.sortOrder ?? 0,
                  badge: item.badge ?? null,
                })
              ),
            },
          }),
      },
      include: {
        products: {
          orderBy: { sortOrder: "asc" },
          include: { product: true },
        },
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create homepage section" },
      { status: 500 }
    );
  }
}
