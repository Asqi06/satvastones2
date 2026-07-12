import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const review = await prisma.customerReview.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Customer review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch customer review" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, rating, title, comment, sortOrder, isActive } = body;

    const review = await prisma.customerReview.update({
      where: { id },
      data: {
        name,
        rating,
        title,
        comment,
        sortOrder,
        isActive,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update customer review" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await prisma.customerReview.delete({
      where: { id },
    });

    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete customer review" },
      { status: 500 }
    );
  }
}
