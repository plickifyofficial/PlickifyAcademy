import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? "https://www.plickifyacademy.com";
  const today = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: today,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: today,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/live-batch`,
      lastModified: today,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/digital-products`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: today,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund`,
      lastModified: today,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const supabase = createAdminClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("slug, updated_at")
    .eq("is_published", true)
    .eq("visibility", "public");

  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at")
    .eq("is_published", true);

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("is_published", true);

  const courseRoutes: MetadataRoute.Sitemap = (courses ?? []).map((c) => ({
    url: `${baseUrl}/courses/${c.slug}`,
    lastModified: c.updated_at ? new Date(c.updated_at) : today,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${baseUrl}/digital-products/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : today,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : today,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const { data: blogCategories } = await supabase
    .from("blog_categories")
    .select("slug")
    .eq("is_active", true);
  const { data: blogTags } = await supabase.from("blog_tags").select("slug");
  const { data: blogAuthors } = await supabase.from("blog_authors").select("slug");

  const categoryRoutes: MetadataRoute.Sitemap = (blogCategories ?? []).map((c) => ({
    url: `${baseUrl}/blog/category/${c.slug}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const tagRoutes: MetadataRoute.Sitemap = (blogTags ?? []).map((t) => ({
    url: `${baseUrl}/blog/tag/${t.slug}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  const authorRoutes: MetadataRoute.Sitemap = (blogAuthors ?? []).map((a) => ({
    url: `${baseUrl}/blog/author/${a.slug}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [
    ...staticRoutes,
    ...courseRoutes,
    ...productRoutes,
    ...postRoutes,
    ...categoryRoutes,
    ...tagRoutes,
    ...authorRoutes,
  ];
}