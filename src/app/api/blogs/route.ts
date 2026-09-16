import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

function slugify(value: string) {
  return String(value)
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ blogs });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
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
      title,
      slug,
      excerpt,
      content,
      image,
      author,
      metaTitle,
      metaDescription,
      isPublished,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const finalSlug = slug ? slugify(slug) : slugify(title);

    const existing = await prisma.blog.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json(
        { error: "A post with this slug already exists" },
        { status: 409 }
      );
    }

    const published = Boolean(isPublished);

    const blog = await prisma.blog.create({
      data: {
        title,
        slug: finalSlug,
        excerpt: excerpt || null,
        content,
        image: image || null,
        author: author || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        isPublished: published,
        publishedAt: published ? new Date() : null,
      },
    });

    return NextResponse.json(blog, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
