import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const style = searchParams.get("style");
    const material = searchParams.get("material");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const isFeatured = searchParams.get("isFeatured");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    const where: any = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }

    if (style) {
      where.style = style;
    }

    if (material) {
      where.material = material;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (search) {
      // NOTE: `mode: "insensitive"` is not supported on MongoDB — contains is case-sensitive.
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { material: { contains: search } },
      ];
    }

    if (isFeatured === "true") {
      where.isFeatured = true;
    }

    const orderBy: any = {};
    switch (sort) {
      case "price-asc":
        orderBy.price = "asc";
        break;
      case "price-desc":
        orderBy.price = "desc";
        break;
      case "best-selling":
        orderBy.orderItems = { _count: "desc" };
        break;
      default:
        orderBy.createdAt = "desc";
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const body = await request.json();
    const {
      name,
      description,
      price,
      comparePrice,
      images,
      material,
      style,
      stock,
      sku,
      weight,
      categoryId,
      isFeatured,
      isBestSeller,
      isNewCollection,
      isActive,
      metaTitle,
      metaDescription,
      focusKeywords,
      seoContent,
    } = body;

    const baseSlug = String(name || "")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const slug = body.slug
      ? String(body.slug).trim()
      : `${baseSlug}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        images: images || [],
        material,
        style: style || "WESTERN",
        stock: parseInt(stock) || 0,
        sku: sku || null,
        weight: weight ? parseFloat(weight) : null,
        categoryId,
        isFeatured: isFeatured || false,
        isBestSeller: isBestSeller || false,
        isNewCollection: isNewCollection || false,
        isActive: isActive !== false,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        focusKeywords: focusKeywords || null,
        seoContent: seoContent || null,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
