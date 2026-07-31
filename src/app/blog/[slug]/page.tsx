import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getBlog(slug: string) {
  try {
    return await prisma.blog.findUnique({
      where: { slug, isPublished: true },
    });
  } catch (e) {
    console.error("DB unavailable for blog", e);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) return { title: "Blog Not Found" };

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt || undefined,
    alternates: { canonical: `https://satvastones.in/blog/${slug}` },
    openGraph: {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt || undefined,
      images: blog.image ? [blog.image] : [],
    },
  };
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://satvastones.in/",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Journal",
        "item": "https://satvastones.in/blog",
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": blog.title,
        "item": `https://satvastones.in/blog/${blog.slug}`,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": blog.title,
    "description": blog.excerpt || undefined,
    "image": blog.image || undefined,
    "datePublished": blog.publishedAt
      ? new Date(blog.publishedAt).toISOString()
      : new Date(blog.createdAt).toISOString(),
    "dateModified": new Date(blog.updatedAt).toISOString(),
    "author": {
      "@type": "Person",
      "name": blog.author || "SatvaStones",
    },
    "publisher": {
      "@type": "Organization",
      "name": "SatvaStones",
      "logo": {
        "@type": "ImageObject",
        "url": "https://satvastones.in/logo.png",
      },
    },
    "mainEntityOfPage": `https://satvastones.in/blog/${blog.slug}`,
  };

  return (
    <div className="bg-[var(--luxury-cream)] min-h-screen pt-[120px] lg:pt-[140px] pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      <div className="container-premium max-w-4xl mx-auto px-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 label-sm text-[var(--luxury-brown)]/50 hover:text-[var(--luxury-brown)] transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Journal
        </Link>

        <article className="bg-white border border-[var(--luxury-border)] shadow-sm">
          {blog.image && (
            <div className="relative w-full aspect-[16/9]">
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}

          <div className="p-8 lg:p-14">
            <p className="label-sm text-[var(--luxury-gold)] mb-4">
              {blog.author ? `${blog.author} · ` : ""}
              {blog.publishedAt
                ? new Date(blog.publishedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "SatvaStones Journal"}
            </p>
            <h1 className="heading-section text-[var(--luxury-brown)] mb-8 leading-tight">
              {blog.title}
            </h1>
            {blog.excerpt && (
              <p className="text-[var(--luxury-brown)]/60 italic mb-8 border-l-2 border-[var(--luxury-gold)] pl-6">
                {blog.excerpt}
              </p>
            )}
            <div
              className="prose lg:prose-lg max-w-none text-[var(--luxury-brown)]/80 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>
        </article>
      </div>
    </div>
  );
}
