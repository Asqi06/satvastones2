import { getAdminToken } from './adminStore';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[];
  author: string;
  status: 'published' | 'draft';
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  readTimeMinutes: number;
  publishedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export const BLOG_CATEGORIES = [
  'Styling Guide',
  'Jewellery Care',
  'Materials & Craft',
  'Gifting',
  'Trends & Stories',
  'Behind the Atelier'
] as const;

function adminHeaders(): Record<string, string> {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export async function fetchPublishedBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch('/api/blogs', { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.blogs) ? data.blogs : [];
  } catch {
    return [];
  }
}

export async function fetchBlogBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(`/api/blogs?slug=${encodeURIComponent(slug)}`, {
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.blog || null;
  } catch {
    return null;
  }
}

export async function fetchAllAdminBlogs(): Promise<BlogPost[]> {
  try {
    const res = await fetch('/api/blogs?all=1', {
      credentials: 'include',
      headers: adminHeaders()
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.blogs) ? data.blogs : [];
  } catch {
    return [];
  }
}

export async function saveAdminBlog(
  blog: Partial<BlogPost> & { title: string; content: string }
): Promise<{ ok: boolean; blog?: BlogPost; error?: string }> {
  try {
    const res = await fetch('/api/blogs', {
      method: 'POST',
      credentials: 'include',
      headers: adminHeaders(),
      body: JSON.stringify({ blog })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      return { ok: false, error: data?.error || `HTTP ${res.status}` };
    }
    return { ok: true, blog: data.blog };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error while saving article.' };
  }
}

export async function deleteAdminBlog(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/blogs?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: adminHeaders()
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data?.success) {
      return { ok: false, error: data?.error || `HTTP ${res.status}` };
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: err?.message || 'Network error while deleting article.' };
  }
}
