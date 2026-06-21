import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://satvastones.in";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, priority: 1.0, changeFrequency: "daily" },
    { url: `${baseUrl}/products`, priority: 0.9, changeFrequency: "daily" },
    { url: `${baseUrl}/about`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${baseUrl}/contact`, priority: 0.6, changeFrequency: "monthly" },
    { url: `${baseUrl}/blogs`, priority: 0.7, changeFrequency: "weekly" },
    { url: `${baseUrl}/terms`, priority: 0.4, changeFrequency: "monthly" },
    { url: `${baseUrl}/privacy`, priority: 0.4, changeFrequency: "monthly" },
    { url: `${baseUrl}/shipping`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${baseUrl}/returns`, priority: 0.5, changeFrequency: "monthly" },
  ];

  let categoryPages: MetadataRoute.Sitemap = [];
  let productPages: MetadataRoute.Sitemap = [];

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    categoryPages = categories.map((cat) => ({
      url: `${baseUrl}/products/${cat.slug}`,
      priority: 0.8,
      changeFrequency: "weekly" as const,
      lastModified: cat.updatedAt,
    }));

    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        category: { select: { slug: true } },
      },
    });

    productPages = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      priority: 0.8,
      changeFrequency: "weekly" as const,
      lastModified: p.updatedAt,
    }));
  } catch (e) {
    console.log("DB unavailable for sitemap generation, using static only");
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
