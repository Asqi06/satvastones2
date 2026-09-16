import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { id } = await params;
    // MongoDB uses NoAction relations (no DB-level SetNull/Restrict) —
    // detach child categories and keep blocking deletion while products exist.
    const productRef = await prisma.product.findFirst({ where: { categoryId: id } });
    if (productRef) {
      return NextResponse.json(
        { error: "Cannot delete a category that still has products" },
        { status: 400 }
      );
    }
    await prisma.category.updateMany({
      where: { parentId: id },
      data: { parentId: null },
    });
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Category deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
