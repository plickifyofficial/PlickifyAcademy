import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSiteContent } from "@/lib/site-content";
import { blogSettingsDefaults } from "@/lib/content-schema";
import type {
  Batch,
  BlogAuthor,
  BlogCategory,
  BlogComment,
  BlogPost,
  BlogSettings,
  BlogTag,
  Category,
  Faq,
  Instructor,
  Testimonial,
} from "@/lib/types";

export const contentModuleTag = "content-modules";

export async function readPublishedTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(24);
    if (error) return [];
    return (data ?? []) as Testimonial[];
  } catch {
    return [];
  }
}

export async function readPublishedFaqs(
  page: Faq["page"],
): Promise<Pick<Faq, "question" | "answer">[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("question, answer")
      .eq("page", page)
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data ?? []) as Pick<Faq, "question" | "answer">[];
  } catch {
    return [];
  }
}

export async function readCategories(type: Category["type"]): Promise<Category[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("type", type)
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data ?? []) as Category[];
  } catch {
    return [];
  }
}

export async function readPublishedBatches(): Promise<Batch[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("batches")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data ?? []) as Batch[];
  } catch {
    return [];
  }
}

export async function readPublishedInstructors(): Promise<Instructor[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("instructors")
      .select("*")
      .eq("is_published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data ?? []) as Instructor[];
  } catch {
    return [];
  }
}

export const getPublishedTestimonials = unstable_cache(
  readPublishedTestimonials,
  ["content-modules-testimonials"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getPublishedFaqs = unstable_cache(
  async (page: Faq["page"]) => readPublishedFaqs(page),
  ["content-modules-faqs"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getCategories = unstable_cache(
  async (type: Category["type"]) => readCategories(type),
  ["content-modules-categories"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getPublishedBatches = unstable_cache(
  readPublishedBatches,
  ["content-modules-batches"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getPublishedInstructors = unstable_cache(
  readPublishedInstructors,
  ["content-modules-instructors"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export async function readPublishedPosts(): Promise<BlogPost[]> {
  try {
    const supabase = createAdminClient();
    await supabase.rpc("flush_scheduled_posts");
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return [];
    return (data ?? []) as BlogPost[];
  } catch {
    return [];
  }
}

export async function readPostBySlug(
  slug: string,
): Promise<BlogPost | null> {
  try {
    const supabase = createAdminClient();
    await supabase.rpc("flush_scheduled_posts");
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error || !data) return null;
    return data as BlogPost;
  } catch {
    return null;
  }
}

export async function readBlogCategories(): Promise<BlogCategory[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("blog_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data ?? []) as BlogCategory[];
  } catch {
    return [];
  }
}

export async function readBlogTags(): Promise<BlogTag[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("blog_tags")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) return [];
    return (data ?? []) as BlogTag[];
  } catch {
    return [];
  }
}

export async function readBlogAuthors(): Promise<BlogAuthor[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("blog_authors")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) return [];
    return (data ?? []) as BlogAuthor[];
  } catch {
    return [];
  }
}

export async function readPostsByCategory(
  slug: string,
): Promise<BlogPost[]> {
  try {
    const supabase = createAdminClient();
    await supabase.rpc("flush_scheduled_posts");
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, blog_categories!inner(slug)")
      .eq("is_published", true)
      .eq("blog_categories.slug", slug)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return [];
    return (data ?? []) as BlogPost[];
  } catch {
    return [];
  }
}

export async function readPostsByTag(slug: string): Promise<BlogPost[]> {
  try {
    const supabase = createAdminClient();
    await supabase.rpc("flush_scheduled_posts");
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, blog_post_tags!inner(blog_tags!inner(slug))")
      .eq("is_published", true)
      .eq("blog_post_tags.blog_tags.slug", slug)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return [];
    return (data ?? []) as BlogPost[];
  } catch {
    return [];
  }
}

export async function readPostsByAuthor(slug: string): Promise<BlogPost[]> {
  try {
    const supabase = createAdminClient();
    await supabase.rpc("flush_scheduled_posts");
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*, blog_authors!inner(slug)")
      .eq("is_published", true)
      .eq("blog_authors.slug", slug)
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) return [];
    return (data ?? []) as BlogPost[];
  } catch {
    return [];
  }
}

export async function readPopularPosts(limit = 5): Promise<BlogPost[]> {
  try {
    const supabase = createAdminClient();
    await supabase.rpc("flush_scheduled_posts");
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .order("view_count", { ascending: false, nullsFirst: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);
    if (error) return [];
    return (data ?? []) as BlogPost[];
  } catch {
    return [];
  }
}

export async function readPostTagsForPosts(
  postIds: string[],
): Promise<Record<string, BlogTag[]>> {
  if (postIds.length === 0) return {};
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("blog_post_tags")
      .select("post_id, blog_tags(*)")
      .in("post_id", postIds);
    if (error) return {};
    const map: Record<string, BlogTag[]> = {};
    for (const row of data ?? []) {
      const tag = (row as unknown as { blog_tags: BlogTag }).blog_tags;
      if (!tag) continue;
      (map[row.post_id] ??= []).push(tag);
    }
    return map;
  } catch {
    return {};
  }
}

export const getPublishedPosts = unstable_cache(
  readPublishedPosts,
  ["content-modules-posts"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getPostBySlug = unstable_cache(
  async (slug: string) => readPostBySlug(slug),
  ["content-modules-post"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getBlogCategories = unstable_cache(
  readBlogCategories,
  ["content-modules-blog-categories"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getBlogTags = unstable_cache(
  readBlogTags,
  ["content-modules-blog-tags"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getBlogAuthors = unstable_cache(
  readBlogAuthors,
  ["content-modules-blog-authors"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export async function readBlogCategoryBySlug(
  slug: string,
): Promise<BlogCategory | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("blog_categories")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error || !data) return null;
    return data as BlogCategory;
  } catch {
    return null;
  }
}

export async function readBlogTagBySlug(slug: string): Promise<BlogTag | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("blog_tags")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data as BlogTag;
  } catch {
    return null;
  }
}

export async function readBlogAuthorBySlug(
  slug: string,
): Promise<BlogAuthor | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("blog_authors")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    return data as BlogAuthor;
  } catch {
    return null;
  }
}

export const getBlogCategoryBySlug = unstable_cache(
  async (slug: string) => readBlogCategoryBySlug(slug),
  ["content-modules-blog-category"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getBlogTagBySlug = unstable_cache(
  async (slug: string) => readBlogTagBySlug(slug),
  ["content-modules-blog-tag"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export async function readBlogAuthorById(id: string): Promise<BlogAuthor | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("blog_authors")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return null;
    return data as BlogAuthor;
  } catch {
    return null;
  }
}

export const getBlogAuthorById = unstable_cache(
  async (id: string) => readBlogAuthorById(id),
  ["content-modules-blog-author-id"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getBlogAuthorBySlug = unstable_cache(
  async (slug: string) => readBlogAuthorBySlug(slug),
  ["content-modules-blog-author"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getPostsByCategory = unstable_cache(
  async (slug: string) => readPostsByCategory(slug),
  ["content-modules-posts-category"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getPostsByTag = unstable_cache(
  async (slug: string) => readPostsByTag(slug),
  ["content-modules-posts-tag"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getPostsByAuthor = unstable_cache(
  async (slug: string) => readPostsByAuthor(slug),
  ["content-modules-posts-author"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getPopularPosts = unstable_cache(
  async (limit = 5) => readPopularPosts(limit),
  ["content-modules-posts-popular"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getPostTagsForPosts = unstable_cache(
  async (postIds: string[]) => readPostTagsForPosts(postIds),
  ["content-modules-posts-tags-map"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export const getBlogSettings = unstable_cache(
  async (): Promise<BlogSettings> =>
    getSiteContent<BlogSettings>(
      "blog.settings",
      blogSettingsDefaults as unknown as BlogSettings,
    ),
  ["site-content-blog-settings"],
  { revalidate: 60 },
);

export async function readCommentCounts(
  postIds: string[],
): Promise<Record<string, number>> {
  if (postIds.length === 0) return {};
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("blog_comments")
      .select("post_id")
      .in("post_id", postIds)
      .eq("status", "approved");
    if (error) return {};
    const map: Record<string, number> = {};
    for (const row of data ?? []) {
      map[row.post_id] = (map[row.post_id] ?? 0) + 1;
    }
    return map;
  } catch {
    return {};
  }
}

export const getCommentCounts = unstable_cache(
  async (postIds: string[]) => readCommentCounts(postIds),
  ["content-modules-comment-counts"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export async function readApprovedComments(postId: string): Promise<BlogComment[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("blog_comments")
      .select("*")
      .eq("post_id", postId)
      .eq("status", "approved")
      .order("created_at", { ascending: true })
      .limit(500);
    if (error) return [];
    return (data ?? []) as BlogComment[];
  } catch {
    return [];
  }
}

export const getApprovedComments = unstable_cache(
  async (postId: string) => readApprovedComments(postId),
  ["content-modules-comments"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export async function readLikedCommentIds(userId: string): Promise<string[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("blog_comment_likes")
      .select("comment_id")
      .eq("user_id", userId)
      .limit(500);
    if (error) return [];
    return (data ?? []).map((r) => r.comment_id);
  } catch {
    return [];
  }
}

export async function readRelatedPosts(post: BlogPost): Promise<BlogPost[]> {
  try {
    const supabase = createAdminClient();
    await supabase.rpc("flush_scheduled_posts");
    const categoryFilter = post.category_id
      ? supabase.from("blog_posts").select("*").eq("is_published", true)
      : null;
    void categoryFilter;
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("is_published", true)
      .neq("id", post.id)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(20);
    if (error) return [];
    const list = (data ?? []) as BlogPost[];
    const postTags = new Set(post.tags ?? []);
    const scored = list
      .map((p) => {
        let score = 0;
        if (p.category_id && p.category_id === post.category_id) score += 3;
        const overlap = (p.tags ?? []).filter((t) => postTags.has(t)).length;
        score += overlap;
        return { p, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.p);
    if (scored.length >= 3) return scored.slice(0, 3);
    const fill = list.filter((p) => !scored.includes(p));
    return [...scored, ...fill].slice(0, 3);
  } catch {
    return [];
  }
}

export const getRelatedPosts = unstable_cache(
  async (post: BlogPost) => readRelatedPosts(post),
  ["content-modules-posts-related"],
  { revalidate: 60, tags: [contentModuleTag] },
);

export async function readPrevNextPosts(
  post: BlogPost,
): Promise<{ prev: BlogPost | null; next: BlogPost | null }> {
  try {
    const supabase = createAdminClient();
    await supabase.rpc("flush_scheduled_posts");
    const base = post.published_at ?? post.created_at;
    const [prevRes, nextRes] = await Promise.all([
      supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .lt("published_at", base)
        .order("published_at", { ascending: false })
        .limit(1),
      supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .gt("published_at", base)
        .order("published_at", { ascending: true })
        .limit(1),
    ]);
    return {
      prev: (prevRes.data?.[0] as BlogPost) ?? null,
      next: (nextRes.data?.[0] as BlogPost) ?? null,
    };
  } catch {
    return { prev: null, next: null };
  }
}

export const getPrevNextPosts = unstable_cache(
  async (post: BlogPost) => readPrevNextPosts(post),
  ["content-modules-posts-prevnext"],
  { revalidate: 60, tags: [contentModuleTag] },
);
