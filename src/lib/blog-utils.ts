import type { BlogCategory, BlogPost } from "@/lib/types";

export function clientSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function formatBlogDate(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatBlogDateLong(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatViews(count: number | null) {
  const n = count ?? 0;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K views`;
  return `${n} views`;
}

export type BadgeInfo = { label: string; className: string } | null;

export function badgeFor(post: BlogPost): BadgeInfo {
  if (post.is_editors_pick)
    return { label: "Editor's Pick", className: "bg-violet-600" };
  if (post.is_featured) return { label: "Featured", className: "bg-brand-600" };
  if (post.is_trending) return { label: "Trending", className: "bg-rose-500" };
  if (post.is_popular) return { label: "Popular", className: "bg-amber-500" };
  return null;
}

export function categoryOf(
  post: BlogPost,
  categories: BlogCategory[],
): BlogCategory | undefined {
  if (!post.category_id) return undefined;
  return categories.find((c) => c.id === post.category_id);
}

export function estimateReadingTime(body: string | null): string {
  const text = (body ?? "").replace(/\s+/g, " ").trim();
  if (!text) return "2 min read";
  const words = text.split(" ").length;
  return `${Math.max(2, Math.round(words / 200))} min read`;
}