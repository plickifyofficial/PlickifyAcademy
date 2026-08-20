"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { contentModuleTag } from "@/lib/content-modules";
import { sanitizeHtml, toPlainText } from "@/lib/rte";

type DbClient = Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>;

function clean(value: string) {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function boolOn(formData: FormData, key: string) {
  return formData.get(key) === "on";
}

function readTags(formData: FormData) {
  return String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function readIds(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

function invalidate() {
  updateTag(contentModuleTag);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
}

async function uniqueSlug(
  supabase: DbClient,
  table: string,
  base: string,
): Promise<string> {
  const { data } = await supabase
    .from(table as "blog_posts")
    .select("slug")
    .eq("slug", base)
    .maybeSingle();
  if (!data) return base;
  return `${base}-${Date.now().toString(36)}`;
}

async function syncPostTags(supabase: DbClient, postId: string, tags: string[]) {
  const admin = createAdminClient();
  await admin.from("blog_post_tags").delete().eq("post_id", postId);
  for (const name of tags) {
    const slug = slugify(name) || `tag-${Date.now().toString(36)}`;
    const { data: existing } = await supabase
      .from("blog_tags")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    let tagId: string | undefined = existing?.id;
    if (!tagId) {
      const { data: created, error } = await admin
        .from("blog_tags")
        .insert({ name: name.slice(0, 80), slug })
        .select("id")
        .single();
      if (error) continue;
      tagId = created?.id;
    }
    if (tagId) {
      await admin
        .from("blog_post_tags")
        .upsert({ post_id: postId, tag_id: tagId }, { onConflict: "post_id,tag_id" });
    }
  }
}

async function saveRevision(
  supabase: DbClient,
  postId: string,
  previous: { title?: string; excerpt?: string; body?: string },
) {
  if (!previous.title && !previous.excerpt && !previous.body) return;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const admin = createAdminClient();
  await admin.from("blog_post_revisions").insert({
    post_id: postId,
    title: previous.title ?? null,
    excerpt: previous.excerpt ?? null,
    body: previous.body ?? null,
    created_by: user?.id ?? null,
  });
}

export async function createPost(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const title = clean(String(formData.get("title") ?? "")).slice(0, 200);
  if (!title) return { error: "Title is required." };

  const baseSlug = clean(String(formData.get("slug") ?? "")) || slugify(title);
  if (!baseSlug) return { error: "Could not create a slug." };
  const slug = await uniqueSlug(supabase, "blog_posts", baseSlug.slice(0, 120));

  const statusRaw = String(formData.get("status") ?? "draft");
  const status =
    statusRaw === "scheduled" || statusRaw === "published" ? statusRaw : "draft";
  const published = status === "published";
  const scheduledRaw = clean(String(formData.get("scheduled_at") ?? ""));
  const now = new Date().toISOString();
  const scheduledAt = status === "scheduled" && scheduledRaw ? scheduledRaw : null;

  const tags = readTags(formData);
  const { data: inserted, error } = await supabase
    .from("blog_posts")
    .insert({
      title,
      slug,
      excerpt: toPlainText(String(formData.get("excerpt") ?? "")).slice(0, 500),
      body: sanitizeHtml(String(formData.get("body") ?? "")),
      cover_image: clean(String(formData.get("cover_image") ?? "")) || null,
      author_name: clean(String(formData.get("author_name") ?? "")).slice(0, 100),
      author_role: clean(String(formData.get("author_role") ?? "")).slice(0, 100),
      author_id: clean(String(formData.get("author_id") ?? "")) || null,
      category_id: clean(String(formData.get("category_id") ?? "")) || null,
      tags,
      reading_time: clean(String(formData.get("reading_time") ?? "")).slice(0, 20),
      is_featured: boolOn(formData, "is_featured"),
      is_popular: boolOn(formData, "is_popular"),
      is_trending: boolOn(formData, "is_trending"),
      is_editors_pick: boolOn(formData, "is_editors_pick"),
      is_published: published,
      status,
      scheduled_at: scheduledAt,
      seo_title: clean(String(formData.get("seo_title") ?? "")) || null,
      meta_description: clean(String(formData.get("meta_description") ?? "")) || null,
      og_image: clean(String(formData.get("og_image") ?? "")) || null,
      canonical_url: clean(String(formData.get("canonical_url") ?? "")) || null,
      noindex: boolOn(formData, "noindex"),
      related_course_id: clean(String(formData.get("related_course_id") ?? "")) || null,
      related_product_ids: readIds(String(formData.get("related_product_ids") ?? "")),
      published_at: published ? now : null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  if (inserted?.id) await syncPostTags(supabase, inserted.id, tags);

  invalidate();
  return { success: true };
}

export async function updatePost(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Post ID missing" };

  const title = clean(String(formData.get("title") ?? "")).slice(0, 200);
  if (!title) return { error: "Title is required." };

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("title, excerpt, body, published_at, status, is_published")
    .eq("id", id)
    .single();
  if (!existing) return { error: "Post not found" };

  await saveRevision(supabase, id, {
    title: existing.title,
    excerpt: existing.excerpt,
    body: existing.body,
  });

  const statusRaw = String(formData.get("status") ?? "draft");
  const status =
    statusRaw === "scheduled" || statusRaw === "published" ? statusRaw : "draft";
  const published = status === "published";
  const scheduledRaw = clean(String(formData.get("scheduled_at") ?? ""));
  const scheduledAt = status === "scheduled" && scheduledRaw ? scheduledRaw : null;

  const wasPublished = existing.is_published;
  const publishedAt = published
    ? existing.published_at ?? new Date().toISOString()
    : existing.published_at ?? null;

  const tags = readTags(formData);
  const { error } = await supabase
    .from("blog_posts")
    .update({
      title,
      excerpt: toPlainText(String(formData.get("excerpt") ?? "")).slice(0, 500),
      body: sanitizeHtml(String(formData.get("body") ?? "")),
      cover_image: clean(String(formData.get("cover_image") ?? "")) || null,
      author_name: clean(String(formData.get("author_name") ?? "")).slice(0, 100),
      author_role: clean(String(formData.get("author_role") ?? "")).slice(0, 100),
      author_id: clean(String(formData.get("author_id") ?? "")) || null,
      category_id: clean(String(formData.get("category_id") ?? "")) || null,
      tags,
      reading_time: clean(String(formData.get("reading_time") ?? "")).slice(0, 20),
      is_featured: boolOn(formData, "is_featured"),
      is_popular: boolOn(formData, "is_popular"),
      is_trending: boolOn(formData, "is_trending"),
      is_editors_pick: boolOn(formData, "is_editors_pick"),
      is_published: published,
      status,
      scheduled_at: scheduledAt,
      seo_title: clean(String(formData.get("seo_title") ?? "")) || null,
      meta_description: clean(String(formData.get("meta_description") ?? "")) || null,
      og_image: clean(String(formData.get("og_image") ?? "")) || null,
      canonical_url: clean(String(formData.get("canonical_url") ?? "")) || null,
      noindex: boolOn(formData, "noindex"),
      related_course_id: clean(String(formData.get("related_course_id") ?? "")) || null,
      related_product_ids: readIds(String(formData.get("related_product_ids") ?? "")),
      published_at:
        published && !wasPublished ? new Date().toISOString() : publishedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  await syncPostTags(supabase, id, tags);

  invalidate();
  return { success: true };
}

export async function duplicatePost(
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", id)
    .single();
  if (!post) return { error: "Post not found" };

  const slug = await uniqueSlug(supabase, "blog_posts", `${post.slug}-copy`);
  const { data: created, error } = await supabase
    .from("blog_posts")
    .insert({
      title: `${post.title} (Copy)`,
      slug,
      excerpt: post.excerpt,
      body: post.body,
      cover_image: post.cover_image,
      author_name: post.author_name,
      author_role: post.author_role,
      author_id: post.author_id,
      category_id: post.category_id,
      tags: post.tags ?? [],
      reading_time: post.reading_time,
      is_featured: false,
      is_popular: false,
      is_trending: false,
      is_editors_pick: false,
      is_published: false,
      status: "draft",
      scheduled_at: null,
      seo_title: post.seo_title,
      meta_description: post.meta_description,
      og_image: post.og_image,
      canonical_url: post.canonical_url,
      noindex: post.noindex ?? false,
      related_course_id: post.related_course_id,
      related_product_ids: post.related_product_ids ?? [],
      published_at: null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };

  if (created?.id) await syncPostTags(supabase, created.id, post.tags ?? []);

  invalidate();
  return { success: true };
}

export async function restoreRevision(
  postId: string,
  revisionId: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const { data: revision } = await supabase
    .from("blog_post_revisions")
    .select("title, excerpt, body")
    .eq("id", revisionId)
    .single();
  if (!revision) return { error: "Revision not found" };

  const { data: existing } = await supabase
    .from("blog_posts")
    .select("title, excerpt, body")
    .eq("id", postId)
    .single();
  if (existing) {
    await saveRevision(supabase, postId, {
      title: existing.title,
      excerpt: existing.excerpt,
      body: existing.body,
    });
  }

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title: revision.title ?? existing?.title ?? "",
      excerpt: revision.excerpt ?? existing?.excerpt ?? "",
      body: revision.body ?? existing?.body ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", postId);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function deletePostRevision(
  revisionId: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("blog_post_revisions")
    .delete()
    .eq("id", revisionId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function recordView(
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  const admin = createAdminClient();
  const { error } = await admin.rpc("increment_blog_view", { post_id: id });
  if (error) return { error: error.message };
  return { success: true };
}

export async function deletePost(
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function togglePost(
  id: string,
  field:
    | "is_published"
    | "is_featured"
    | "is_popular"
    | "is_trending"
    | "is_editors_pick",
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("is_published, published_at")
    .eq("id", id)
    .single();
  if (!post) return { error: "Post not found" };

  const { data: current } = await supabase
    .from("blog_posts")
    .select(field)
    .eq("id", id)
    .single();
  const next = !(current as Record<string, boolean> | null)?.[field];
  const update: Record<string, unknown> = { [field]: next };
  if (field === "is_published" && next && !post.published_at) {
    update.published_at = new Date().toISOString();
  }
  update.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("blog_posts")
    .update(update)
    .eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

// ------------------------------------------------------------------
// Categories
// ------------------------------------------------------------------

export async function createBlogCategory(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const name = clean(String(formData.get("name") ?? "")).slice(0, 100);
  if (!name) return { error: "Name is required." };
  const baseSlug = clean(String(formData.get("slug") ?? "")) || slugify(name);
  if (!baseSlug) return { error: "Could not create a slug." };
  const slug = await uniqueSlug(supabase, "blog_categories", baseSlug.slice(0, 80));

  const { error } = await supabase.from("blog_categories").insert({
    name,
    slug,
    description: clean(String(formData.get("description") ?? "")) || null,
    image: clean(String(formData.get("image") ?? "")) || null,
    icon: clean(String(formData.get("icon") ?? "")) || null,
    seo_title: clean(String(formData.get("seo_title") ?? "")) || null,
    meta_description: clean(String(formData.get("meta_description") ?? "")) || null,
    is_active: boolOn(formData, "is_active"),
    sort_order: Number(formData.get("sort_order") ?? 0) || 0,
  });
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function updateBlogCategory(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = clean(String(formData.get("name") ?? "")).slice(0, 100);
  if (!id || !name) return { error: "Missing name or id" };

  const { error } = await supabase
    .from("blog_categories")
    .update({
      name,
      slug: clean(String(formData.get("slug") ?? "")) || slugify(name),
      description: clean(String(formData.get("description") ?? "")) || null,
      image: clean(String(formData.get("image") ?? "")) || null,
      icon: clean(String(formData.get("icon") ?? "")) || null,
      seo_title: clean(String(formData.get("seo_title") ?? "")) || null,
      meta_description: clean(String(formData.get("meta_description") ?? "")) || null,
      is_active: boolOn(formData, "is_active"),
      sort_order: Number(formData.get("sort_order") ?? 0) || 0,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function deleteBlogCategory(
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("blog_categories")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  invalidate();
  return { success: true };
}

// ------------------------------------------------------------------
// Tags
// ------------------------------------------------------------------

export async function createBlogTag(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const name = clean(String(formData.get("name") ?? "")).slice(0, 80);
  if (!name) return { error: "Name is required." };
  const baseSlug = clean(String(formData.get("slug") ?? "")) || slugify(name);
  if (!baseSlug) return { error: "Could not create a slug." };
  const slug = await uniqueSlug(supabase, "blog_tags", baseSlug.slice(0, 80));

  const { error } = await supabase.from("blog_tags").insert({
    name,
    slug,
    description: clean(String(formData.get("description") ?? "")) || null,
  });
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function updateBlogTag(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = clean(String(formData.get("name") ?? "")).slice(0, 80);
  if (!id || !name) return { error: "Missing name or id" };

  const { error } = await supabase
    .from("blog_tags")
    .update({
      name,
      slug: clean(String(formData.get("slug") ?? "")) || slugify(name),
      description: clean(String(formData.get("description") ?? "")) || null,
    })
    .eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function deleteBlogTag(
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("blog_tags")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  invalidate();
  return { success: true };
}

// ------------------------------------------------------------------
// Authors
// ------------------------------------------------------------------

function parseSocials(formData: FormData): Record<string, string> {
  const socials: Record<string, string> = {};
  for (const key of ["facebook", "youtube", "linkedin", "instagram", "x"]) {
    const value = clean(String(formData.get(key) ?? ""));
    if (value) socials[key] = value;
  }
  return socials;
}

export async function createBlogAuthor(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const name = clean(String(formData.get("name") ?? "")).slice(0, 100);
  if (!name) return { error: "Name is required." };
  const baseSlug = clean(String(formData.get("slug") ?? "")) || slugify(name);
  if (!baseSlug) return { error: "Could not create a slug." };
  const slug = await uniqueSlug(supabase, "blog_authors", baseSlug.slice(0, 80));

  const { error } = await supabase.from("blog_authors").insert({
    name,
    slug,
    photo: clean(String(formData.get("photo") ?? "")) || null,
    bio: clean(String(formData.get("bio") ?? "")) || null,
    role: clean(String(formData.get("role") ?? "")) || null,
    expertise: readTags(formData),
    socials: parseSocials(formData),
  });
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function updateBlogAuthor(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = clean(String(formData.get("name") ?? "")).slice(0, 100);
  if (!id || !name) return { error: "Missing name or id" };

  const { error } = await supabase
    .from("blog_authors")
    .update({
      name,
      slug: clean(String(formData.get("slug") ?? "")) || slugify(name),
      photo: clean(String(formData.get("photo") ?? "")) || null,
      bio: clean(String(formData.get("bio") ?? "")) || null,
      role: clean(String(formData.get("role") ?? "")) || null,
      expertise: readTags(formData),
      socials: parseSocials(formData),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  invalidate();
  return { success: true };
}

export async function deleteBlogAuthor(
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("blog_authors")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  invalidate();
  return { success: true };
}

// ------------------------------------------------------------------
// Comments
// ------------------------------------------------------------------

export async function addBlogComment(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const postId = clean(String(formData.get("post_id") ?? ""));
  const body = clean(String(formData.get("body") ?? ""));
  const parentId = clean(String(formData.get("parent_id") ?? "")) || null;
  if (!postId || !body) return { error: "Missing required fields." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = clean(String(formData.get("name") ?? ""));
  let email = clean(String(formData.get("email") ?? ""));
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .maybeSingle();
    name = name || profile?.full_name || user.email?.split("@")[0] || "Student";
    email = email || profile?.email || user.email || "";
  }
  if (!name) return { error: "Name is required." };

  const { error } = await supabase.from("blog_comments").insert({
    post_id: postId,
    user_id: user?.id ?? null,
    parent_id: parentId,
    name: name.slice(0, 100),
    email: email.slice(0, 200) || null,
    body: body.slice(0, 2000),
    status: "pending",
  });
  if (error) return { error: error.message };

  revalidatePath(`/blog/`);
  return { success: true };
}

export async function moderateBlogComment(
  id: string,
  status: "approved" | "rejected" | "spam",
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("blog_comments")
    .update({ status })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/blog/comments");
  revalidatePath("/blog");
  return { success: true };
}

export async function deleteBlogComment(
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("blog_comments")
    .delete()
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/blog/comments");
  revalidatePath("/blog");
  return { success: true };
}

export async function reportBlogComment(
  id: string,
): Promise<{ error?: string; success?: boolean }> {
  const admin = createAdminClient();
  const { data: comment } = await admin
    .from("blog_comments")
    .select("report_count")
    .eq("id", id)
    .single();
  const reportCount = (comment?.report_count ?? 0) + 1;
  const { error } = await admin
    .from("blog_comments")
    .update({ report_count: reportCount, is_reported: true })
    .eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function likeBlogComment(
  id: string,
  like: boolean,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to like comments." };

  const admin = createAdminClient();
  if (like) {
    const { error } = await supabase
      .from("blog_comment_likes")
      .upsert({ comment_id: id, user_id: user.id }, { onConflict: "comment_id,user_id" });
    if (error) return { error: error.message };
    const { data: comment } = await admin
      .from("blog_comments")
      .select("likes")
      .eq("id", id)
      .single();
    await admin
      .from("blog_comments")
      .update({ likes: (comment?.likes ?? 0) + 1 })
      .eq("id", id);
  } else {
    const { error } = await supabase
      .from("blog_comment_likes")
      .delete()
      .eq("comment_id", id)
      .eq("user_id", user.id);
    if (error) return { error: error.message };
    const { data: comment } = await admin
      .from("blog_comments")
      .select("likes")
      .eq("id", id)
      .single();
    await admin
      .from("blog_comments")
      .update({ likes: Math.max(0, (comment?.likes ?? 1) - 1) })
      .eq("id", id);
  }
  return { success: true };
}

// ------------------------------------------------------------------
// Feedback (was this helpful?)
// ------------------------------------------------------------------

export async function saveBlogFeedback(
  postId: string,
  helpful: boolean,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in to give feedback." };

  const { error } = await supabase
    .from("blog_post_feedback")
    .upsert(
      { post_id: postId, user_id: user.id, helpful },
      { onConflict: "post_id,user_id" },
    );
  if (error) return { error: error.message };
  return { success: true };
}

// ------------------------------------------------------------------
// Search analytics + settings
// ------------------------------------------------------------------

export async function logBlogSearch(
  term: string,
  resultsCount: number,
): Promise<void> {
  const admin = createAdminClient();
  await admin.from("blog_search_logs").insert({
    term: term.slice(0, 120),
    results_count: resultsCount,
  });
}

export async function saveBlogSettings(
  value: string,
): Promise<{ error?: string; success?: boolean }> {
  await requireAdmin();
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return { error: "Invalid settings JSON." };
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from("site_content")
    .upsert(
      { key: "blog.settings", value: parsed, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );
  if (error) return { error: error.message };
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { success: true };
}