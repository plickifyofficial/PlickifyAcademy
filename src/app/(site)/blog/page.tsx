import type { Metadata } from "next";
import {
  getBlogCategories,
  getBlogSettings,
  getCommentCounts,
  getPopularPosts,
  getPublishedPosts,
} from "@/lib/content-modules";
import { BlogBrowser } from "@/components/blog/blog-browser";

export const metadata: Metadata = {
  title: "Blog | Plickify Academy",
  description:
    "AI, Freelancing, Design, Digital Marketing এবং Online Income নিয়ে practical guides, tutorials ও insights — Plickify Academy Blog।",
  alternates: { canonical: "/blog" },
};

type Props = {
  searchParams: Promise<{ search?: string; category?: string; sort?: string }>;
};

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams;
  const [posts, categories, popular, settings] = await Promise.all([
    getPublishedPosts(),
    getBlogCategories(),
    getPopularPosts(5),
    getBlogSettings(),
  ]);

  const commentCounts = await getCommentCounts(posts.map((p) => p.id));

  return (
    <BlogBrowser
      posts={posts}
      categories={categories}
      popular={popular}
      commentCounts={commentCounts}
      settings={settings}
      initialQuery={params.search ?? ""}
      initialCategory={params.category ?? "All"}
      initialSort={params.sort ?? "latest"}
    />
  );
}