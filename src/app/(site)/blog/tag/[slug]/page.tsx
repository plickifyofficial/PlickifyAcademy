import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getBlogTagBySlug,
  getBlogCategories,
  getBlogSettings,
  getPopularPosts,
  getPostsByTag,
} from "@/lib/content-modules";
import { BlogArchive } from "@/components/blog/blog-archive";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { getBlogTags } = await import("@/lib/content-modules");
  const tags = await getBlogTags();
  return tags.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getBlogTagBySlug(slug);
  if (!tag) return { title: "Tag not found | Plickify Academy" };
  return {
    title: `Tag: ${tag.name} | Plickify Academy Blog`,
    description: tag.description || undefined,
    alternates: { canonical: `/blog/tag/${tag.slug}` },
  };
}

export default async function BlogTagPage({ params }: Props) {
  const { slug } = await params;
  const [tag, posts, categories, popular, settings] = await Promise.all([
    getBlogTagBySlug(slug),
    getPostsByTag(slug),
    getBlogCategories(),
    getPopularPosts(5),
    getBlogSettings(),
  ]);
  if (!tag) notFound();

  return (
    <BlogArchive
      eyebrow="Blog Tag"
      title={`Tag: ${tag.name}`}
      description={tag.description}
      posts={posts}
      categories={categories}
      popular={popular}
      settings={settings}
    />
  );
}