import { prisma } from "@/lib/prisma";
import clientPromise from "@/lib/mongodb";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://satvastones.in";

  // 1. Static Pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/products`, lastModified: new Date() },
    { url: `${baseUrl}/about`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    { url: `${baseUrl}/blogs`, lastModified: new Date() },
    { url: `${baseUrl}/terms`, lastModified: new Date() },
    { url: `${baseUrl}/privacy`, lastModified: new Date() },
    { url: `${baseUrl}/shipping`, lastModified: new Date() },
    { url: `${baseUrl}/returns`, lastModified: new Date() },
  ];

  let categoryPages: MetadataRoute.Sitemap = [];
  let productPages: MetadataRoute.Sitemap = [];
  let blogPages: MetadataRoute.Sitemap = [];

  try {
    // 2. Dynamic Categories (Pointing to Vite SPA /shop/[slug] routes)
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    categoryPages = categories.map((cat) => ({
      url: `${baseUrl}/shop/${cat.slug}`,
      lastModified: new Date(cat.updatedAt),
    }));

    // 3. Dynamic Products (Next.js Pages)
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    productPages = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt),
    }));
  } catch (e) {
    console.error("DB unavailable for sitemap generation, using static only", e);
  }

  try {
    // 4. Dynamic Blog Posts (MongoDB via native driver)
    const client = await clientPromise;
    const db = client.db();
    const blogs = await db
      .collection("blogs")
      .find({ isPublished: true })
      .project({ slug: 1, updatedAt: 1, createdAt: 1 })
      .toArray();

    blogPages = blogs.map((b) => ({
      url: `${baseUrl}/blog/${b.slug}`,
      lastModified: new Date(b.updatedAt || b.createdAt || new Date()),
    }));
  } catch (e) {
    console.error("MongoDB unavailable for blog sitemap, using static only", e);
  }

  return [...staticPages, ...categoryPages, ...productPages, ...blogPages];
}
