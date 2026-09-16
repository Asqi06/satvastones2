import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: {
          include: { user: { select: { id: true, name: true, image: true } } },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    const body = await request.json();
    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        price: parseFloat(body.price),
        comparePrice: body.comparePrice ? parseFloat(body.comparePrice) : null,
        images: body.images || [],
        material: body.material,
        style: body.style,
        stock: parseInt(body.stock),
        sku: body.sku || null,
        weight: body.weight ? parseFloat(body.weight) : null,
        categoryId: body.categoryId,
        isFeatured: body.isFeatured,
        isBestSeller: body.isBestSeller ?? false,
        isNewCollection: body.isNewCollection ?? false,
        isActive: body.isActive,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        focusKeywords: body.focusKeywords || null,
        seoContent: body.seoContent || null,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    // MongoDB uses NoAction relations (no DB-level cascades) — clean up
    // dependents explicitly, and keep blocking deletion of ordered products
    // (Postgres previously enforced this via Restrict).
    const orderRef = await prisma.orderItem.findFirst({ where: { productId: id } });
    if (orderRef) {
      return NextResponse.json(
        { error: "Cannot delete a product that has been ordered" },
        { status: 400 }
      );
    }
    await Promise.all([
      prisma.review.deleteMany({ where: { productId: id } }),
      prisma.cartItem.deleteMany({ where: { productId: id } }),
      prisma.wishlist.deleteMany({ where: { productId: id } }),
      prisma.trendProduct.deleteMany({ where: { productId: id } }),
      prisma.saleProduct.deleteMany({ where: { productId: id } }),
      prisma.homepageSectionProduct.deleteMany({ where: { productId: id } }),
    ]);
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
