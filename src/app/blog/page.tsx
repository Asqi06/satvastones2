import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SatvaStones Journal — Jewellery Stories, Trends & Care Guides",
  description:
    "Read the SatvaStones Journal for jewellery trends, styling guides, care tips, and stories behind our handcrafted pieces.",
  alternates: { canonical: "https://satvastones.in/blog" },
};

export default async function BlogIndexPage() {
  let blogs: {
    slug: string;
    title: string;
    excerpt: string | null;
    image: string | null;
    author: string | null;
    publishedAt: Date | null;
  }[] = [];

  try {
    blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: [{ publishedAt: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      select: { slug: true, title: true, excerpt: true, image: true, author: true, publishedAt: true },
    });
  } catch (e) {
    console.error("DB unavailable for blog index", e);
  }

  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: blogs.map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://satvastones.in/blog/${b.slug}`,
    })),
  };

  return (
    <div className="bg-[var(--luxury-cream)] min-h-screen pt-[120px] lg:pt-[140px] pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }}
      />

      <div className="container-premium max-w-5xl mx-auto px-4">
        <header className="mb-12 text-center">
          <p className="label-sm text-[var(--luxury-gold)] mb-3">Stories & Guides</p>
          <h1 className="heading-section text-[var(--luxury-brown)]">SatvaStones Journal</h1>
        </header>

        {blogs.length === 0 ? (
          <p className="text-center text-[var(--luxury-brown)]/60">
            New stories are being written. Please visit again soon.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((b) => (
              <Link
                key={b.slug}
                href={`/blog/${b.slug}`}
                className="group bg-white border border-[var(--luxury-border)] shadow-sm hover:shadow-md transition-shadow"
              >
                <article>
                  {b.image && (
                    <div className="relative w-full aspect-[16/9] overflow-hidden">
                      <Image
                        src={b.image}
                        alt={b.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="label-sm text-[var(--luxury-gold)] mb-2">
                      {b.publishedAt
                        ? new Date(b.publishedAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : b.author || "SatvaStones Journal"}
                    </p>
                    <h2 className="heading-card text-[var(--luxury-brown)] mb-2 leading-snug group-hover:text-[var(--luxury-gold)] transition-colors">
                      {b.title}
                    </h2>
                    {b.excerpt && (
                      <p className="text-sm text-[var(--luxury-brown)]/60 leading-relaxed line-clamp-3">
                        {b.excerpt}
                      </p>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
