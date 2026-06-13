import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://satvastones.in";

  let products: { slug: string; updatedAt: Date }[] = [];
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    });
  } catch (e) {
    console.log("DB not ready for sitemap");
  }

  const productUrls = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const staticRoutes = [
    { path: "", priority: 1.0, changeFreq: "daily" as const },
    { path: "/about", priority: 0.8, changeFreq: "monthly" as const },
    { path: "/products", priority: 0.9, changeFreq: "daily" as const },
    { path: "/privacy", priority: 0.4, changeFreq: "monthly" as const },
    { path: "/terms", priority: 0.4, changeFreq: "monthly" as const },
    { path: "/returns", priority: 0.5, changeFreq: "monthly" as const },
    { path: "/shipping", priority: 0.5, changeFreq: "monthly" as const },
  ];

  const staticUrls = staticRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq,
    priority: route.priority,
  }));

  return [...staticUrls, ...productUrls];
}
