import { prisma } from "@/lib/prisma";
import clientPromise from "@/lib/mongodb";
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
    { url: `${baseUrl}/shop/99-sale` },
    { url: `${baseUrl}/shop/earrings` },
    { url: `${baseUrl}/shop/necklaces` },
    { url: `${baseUrl}/shop/rings` },
    { url: `${baseUrl}/shop/bracelets` },
    { url: `${baseUrl}/shop/gifts` },
    { url: `${baseUrl}/shop/name-necklace` },
    { url: `${baseUrl}/shop/accessories` },
    { url: `${baseUrl}/shop/pendant` },
    { url: `${baseUrl}/shop/hampers` },
    { url: `${baseUrl}/shop/mothers-day` },
    { url: `${baseUrl}/about` },
    { url: `${baseUrl}/contact` },
    { url: `${baseUrl}/blogs` },
    { url: `${baseUrl}/terms` },
    { url: `${baseUrl}/privacy` },
    { url: `${baseUrl}/shipping` },
    { url: `${baseUrl}/returns` },
    { url: `${baseUrl}/refund` },
    { url: `${baseUrl}/hot-deals` },
  ];

  let categoryPages: MetadataRoute.Sitemap = [];
  let productPages: MetadataRoute.Sitemap = [];
  let blogPages: MetadataRoute.Sitemap = [];

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
      select: { slug: true, updatedAt: true, images: true, image: true },
    });

    productPages = products.map((p) => ({
      url: `${baseUrl}/shop/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      images: [...(p.images || []), p.image].filter(Boolean).map(toAbsoluteImageUrl),
    }));
  } catch (e) {
    console.error("DB unavailable for sitemap generation, using static only", e);
  }

  try {
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
