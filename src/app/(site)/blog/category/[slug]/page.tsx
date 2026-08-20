import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getBlogCategoryBySlug,
  getBlogCategories,
  getBlogSettings,
  getPopularPosts,
  getPostsByCategory,
} from "@/lib/content-modules";
import { BlogArchive } from "@/components/blog/blog-archive";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const categories = await getBlogCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getBlogCategoryBySlug(slug);
  if (!category) return { title: "Category not found | Plickify Academy" };
  return {
    title: category.seo_title || `${category.name} | Plickify Academy Blog`,
    description: category.meta_description || category.description || undefined,
    alternates: { canonical: `/blog/category/${category.slug}` },
  };
}

export default async function BlogCategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, posts, categories, popular, settings] = await Promise.all([
    getBlogCategoryBySlug(slug),
    getPostsByCategory(slug),
    getBlogCategories(),
    getPopularPosts(5),
    getBlogSettings(),
  ]);
  if (!category) notFound();

  return (
    <BlogArchive
      eyebrow="Blog Category"
      title={category.name}
      description={category.description}
      posts={posts}
      categories={categories}
      popular={popular}
      settings={settings}
    />
  );
}