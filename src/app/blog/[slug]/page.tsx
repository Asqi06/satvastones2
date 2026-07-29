import { notFound } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const client = await clientPromise;
  const blog = await client.db().collection("blogs").findOne({ slug });

  if (!blog) return { title: "Blog Not Found" };

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    alternates: { canonical: `https://satvastones.in/blog/${slug}` },
  };
}

export default async function BlogPage({ params }: Props) {
  const { slug } = await params;
  const client = await clientPromise;
  const blog = await client.db().collection("blogs").findOne({ slug });

  if (!blog || !blog.isPublished) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{blog.title}</h1>
      {blog.excerpt && <p className="text-lg text-gray-600 mb-6">{blog.excerpt}</p>}
      {blog.content && (
        <div
          className="prose lg:prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
      )}
    </article>
  );
}
