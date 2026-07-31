import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

const baseUrl = "https://satvastones.in";

function toAbsoluteImageUrl(image: string) {
  if (!image) return "";
  return image.startsWith("http") ? image : `${baseUrl}${image}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl },
    { url: `${baseUrl}/shop` },
    { url: `${baseUrl}/about` },
    { url: `${baseUrl}/blog` },
    { url: `${baseUrl}/terms` },
    { url: `${baseUrl}/privacy` },
    { url: `${baseUrl}/shipping` },
    { url: `${baseUrl}/returns` },
  ];

  let categoryPages: MetadataRoute.Sitemap = [];
  let productPages: MetadataRoute.Sitemap = [];
  let blogPages: MetadataRoute.Sitemap = [];

  try {
    const categories = await prisma.category.findMany({
      select: { slug: true, updatedAt: true },
    });

    categoryPages = categories.map((cat) => ({
      url: `${baseUrl}/shop/${cat.slug}`,
      lastModified: new Date(cat.updatedAt),
    }));

    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true, images: true },
    });

    productPages = products.map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      images: (p.images || []).filter(Boolean).map(toAbsoluteImageUrl),
    }));
  } catch (e) {
    console.error("DB unavailable for sitemap generation, using static only", e);
  }

  try {
    const blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true, createdAt: true },
    });

    blogPages = blogs.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: new Date(b.updatedAt || b.createdAt || new Date()),
    }));
  } catch (e) {
    console.error("DB unavailable for blog sitemap, using static only", e);
  }

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages];
}
