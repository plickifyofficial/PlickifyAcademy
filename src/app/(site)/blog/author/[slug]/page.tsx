import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getBlogAuthorBySlug,
  getBlogCategories,
  getBlogSettings,
  getPopularPosts,
  getPostsByAuthor,
} from "@/lib/content-modules";
import { BlogArchive } from "@/components/blog/blog-archive";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { getBlogAuthors } = await import("@/lib/content-modules");
  const authors = await getBlogAuthors();
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getBlogAuthorBySlug(slug);
  if (!author) return { title: "Author not found | Plickify Academy" };
  return {
    title: `${author.name} | Plickify Academy Blog`,
    description: author.bio || undefined,
    alternates: { canonical: `/blog/author/${author.slug}` },
  };
}

export default async function BlogAuthorPage({ params }: Props) {
  const { slug } = await params;
  const [author, posts, categories, popular, settings] = await Promise.all([
    getBlogAuthorBySlug(slug),
    getPostsByAuthor(slug),
    getBlogCategories(),
    getPopularPosts(5),
    getBlogSettings(),
  ]);
  if (!author) notFound();

  return (
    <BlogArchive
      eyebrow="Blog Author"
      title={author.name}
      description={author.bio}
      author={author}
      posts={posts}
      categories={categories}
      popular={popular}
      settings={settings}
    />
  );
}