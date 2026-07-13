import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SV-${timestamp}-${random}`;
}

export function slugify(text: string, maxLength: number = 0): string {
  let slug = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (maxLength > 0 && slug.length > maxLength) {
    const cut = slug.slice(0, maxLength);
    const lastHyphen = cut.lastIndexOf('-');
    slug = (lastHyphen > 0 ? cut.slice(0, lastHyphen) : cut).replace(/-+$/, '');
  }

  return slug;
}

export async function ensureUniqueSlug(
  baseSlug: string,
  exists: (slug: string) => boolean | Promise<boolean>
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  while (await exists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}
