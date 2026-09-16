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
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      select: { slug: true, title: true, excerpt: true, image: true, author: true, publishedAt: true },
    });
  } catch (e) {
    console.error("DB unavailable for blog index", e);
  }

  const listJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": "https://satvastones.in/blog#blog",
    name: "SatvaStones Journal — Jewellery Stories, Trends & Care Guides",
    description:
      "Jewellery trends, Korean styling guides, anti-tarnish care tips and gifting stories from SatvaStones.",
    url: "https://satvastones.in/blog",
    blogPost: blogs.map((b) => ({
      "@type": "BlogPosting",
      headline: b.title,
      description: b.excerpt || undefined,
      image: b.image || undefined,
      url: `https://satvastones.in/blog/${b.slug}`,
      datePublished: b.publishedAt ? new Date(b.publishedAt).toISOString() : undefined,
      author: {
        "@type": "Person",
        name: b.author || "SatvaStones",
      },
      publisher: {
        "@type": "Organization",
        name: "SatvaStones",
        logo: {
          "@type": "ImageObject",
          url: "https://satvastones.in/logo.png",
        },
      },
    })),
  };

  return (
    <div className="bg-[var(--paper)] text-[var(--ink)] min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listJsonLd) }}
      />

      <div className="editorial-container max-w-5xl py-10 lg:py-14">
        <header className="mb-12 text-center">
          <p className="eyebrow text-[var(--olive)] mb-3">Stories & Guides</p>
          <h1 className="font-serif font-normal tracking-[-0.03em] text-[var(--ink)] text-4xl lg:text-6xl">SatvaStones Journal</h1>
        </header>

        {blogs.length === 0 ? (
          <p className="text-center text-[var(--muted)]">
            New stories are being written. Please visit again soon.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((b) => (
              <Link
                key={b.slug}
                href={`/blog/${b.slug}`}
                className="group bg-[var(--white)] border border-[var(--line)] transition-colors hover:border-[var(--olive)]"
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
                    <p className="eyebrow text-[var(--olive)] mb-2">
                      {b.publishedAt
                        ? new Date(b.publishedAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : b.author || "SatvaStones Journal"}
                    </p>
                    <h2 className="font-serif font-normal tracking-[-0.03em] text-[var(--ink)] text-xl mb-2 leading-snug group-hover:text-[var(--olive)] transition-colors">
                      {b.title}
                    </h2>
                    {b.excerpt && (
                      <p className="text-sm text-[var(--muted)] leading-relaxed line-clamp-3">
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
