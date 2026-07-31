import { prisma } from "@/lib/prisma";

export interface ProductReview {
  id?: string;
  rating: number;
  createdAt: Date;
  comment: string | null;
  user?: { name: string | null; image: string | null } | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice: number | null;
  images: string[];
  material: string | null;
  style: string;
  stock: number;
  sku: string | null;
  weight: number | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewCollection: boolean;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string } | null;
  reviews?: ProductReview[];
  _count?: { reviews: number };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  parentId: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  children?: Category[];
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  author: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const productListInclude = {
  category: { select: { id: true, name: true, slug: true } },
  _count: { select: { reviews: true } },
} as const;

const productDetailInclude = {
  category: { select: { id: true, name: true, slug: true } },
  reviews: {
    select: { id: true, rating: true, createdAt: true, comment: true, user: { select: { name: true, image: true } } },
    orderBy: { createdAt: "desc" as const },
    take: 20,
  },
  _count: { select: { reviews: true } },
} as const;

export async function getAllProducts(): Promise<Product[]> {
  try {
    return await prisma.product.findMany({
      where: { isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        reviews: {
          select: { id: true, rating: true, createdAt: true, comment: true, user: { select: { name: true, image: true } } },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: productDetailInclude,
    });
  } catch {
    return null;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    return await prisma.product.findUnique({
      where: { id },
      include: productDetailInclude,
    });
  } catch {
    return null;
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  try {
    return await prisma.product.findMany({
      where: {
        isActive: true,
        category: { slug: categorySlug },
      },
      include: productListInclude,
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await prisma.category.findMany({
      where: { parentId: null },
      include: { children: true },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  try {
    return await prisma.category.findUnique({
      where: { slug },
      include: { children: true },
    });
  } catch {
    return null;
  }
}

export async function getAllBlogs(): Promise<Blog[]> {
  try {
    return await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getBlogBySlug(slug: string): Promise<Blog | null> {
  try {
    return await prisma.blog.findUnique({
      where: { slug, isPublished: true },
    });
  } catch {
    return null;
  }
}

export async function getFeaturedProducts(limit: number = 8): Promise<Product[]> {
  try {
    return await prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: productListInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getBestSellers(limit: number = 8): Promise<Product[]> {
  try {
    return await prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      include: productListInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export async function getNewCollectionProducts(limit: number = 8): Promise<Product[]> {
  try {
    return await prisma.product.findMany({
      where: { isActive: true, isNewCollection: true },
      include: productListInclude,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  } catch {
    return [];
  }
}

export function getProductUrls(products: Product[]) {
  return products.map((p) => ({
    slug: p.slug,
    images: p.images,
    updatedAt: p.updatedAt,
  }));
}

export function getCategoryUrls(categories: Category[]) {
  const urls: { slug: string; updatedAt: Date }[] = [];
  for (const cat of categories) {
    urls.push({ slug: cat.slug, updatedAt: cat.updatedAt });
    if (cat.children && cat.children.length > 0) {
      for (const child of cat.children) {
        urls.push({ slug: child.slug, updatedAt: child.updatedAt });
      }
    }
  }
  return urls;
}
