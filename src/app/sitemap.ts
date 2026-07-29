import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://satvastones.in";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now },
    { url: `${baseUrl}/shop`, lastModified: now },
    { url: `${baseUrl}/about`, lastModified: now },
    { url: `${baseUrl}/contact`, lastModified: now },
    { url: `${baseUrl}/blogs`, lastModified: now },
    { url: `${baseUrl}/terms`, lastModified: now },
    { url: `${baseUrl}/privacy`, lastModified: now },
    { url: `${baseUrl}/shipping`, lastModified: now },
    { url: `${baseUrl}/returns`, lastModified: now },
  ];

  let categoryPages: MetadataRoute.Sitemap = [];
  let productPages: MetadataRoute.Sitemap = [];

  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });

    categoryPages = categories.map((cat) => ({
      url: `${baseUrl}/shop/${cat.slug}`,
      lastModified: new Date(cat.updatedAt),
    }));

    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        image: true,
      },
    });

    productPages = products.map((p) => ({
      url: `${baseUrl}/product/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      images: [`https://satvastones.in${p.image}`],
    }));
  } catch (e) {
    console.error("DB unavailable for sitemap generation, using static only", e);
  }

  return [...staticPages, ...categoryPages, ...productPages];
}
