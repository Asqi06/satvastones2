import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const userId = (session.user as any).id;

    const address = await prisma.address.update({
      where: { id, userId },
      data: body,
    });

    return NextResponse.json({ address });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update address" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;

    await prisma.address.delete({ where: { id, userId } });
    return NextResponse.json({ message: "Address deleted" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete address" }, { status: 500 });
  }
}
