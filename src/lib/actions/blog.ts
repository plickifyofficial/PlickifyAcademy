"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireAdmin } from "@/lib/actions/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { contentModuleTag } from "@/lib/content-modules";

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

function readTags(formData: FormData) {
  return String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function invalidate() {
  updateTag(contentModuleTag);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/sitemap.xml");
}

async function uniqueSlug(
  supabase: DbClient,
  base: string,
): Promise<string> {
  const { data } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("slug", base)
    .maybeSingle();
  if (!data) return base;
  return `${base}-${Date.now().toString(36)}`;
}

export async function createPost(
  formData: FormData,
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const title = clean(String(formData.get("title") ?? "")).slice(0, 200);
  if (!title) return { error: "Title is required." };

  const baseSlug = clean(String(formData.get("slug") ?? "")) || slugify(title);
  if (!baseSlug) return { error: "Could not create a slug." };
  const slug = await uniqueSlug(supabase, baseSlug.slice(0, 120));

  const published = formData.get("is_published") === "on";
  const now = new Date().toISOString();

  const { error } = await supabase.from("blog_posts").insert({
    title,
    slug,
    excerpt: clean(String(formData.get("excerpt") ?? "")).slice(0, 500),
    body: String(formData.get("body") ?? ""),
    cover_image: clean(String(formData.get("cover_image") ?? "")) || null,
    author_name: clean(String(formData.get("author_name") ?? "")).slice(0, 100),
    author_role: clean(String(formData.get("author_role") ?? "")).slice(0, 100),
    tags: readTags(formData),
    reading_time: clean(String(formData.get("reading_time") ?? "")).slice(0, 20),
    is_featured: formData.get("is_featured") === "on",
    is_published: published,
    published_at: published ? now : null,
  });
  if (error) return { error: error.message };

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

  const published = formData.get("is_published") === "on";
  const { data: existing } = await supabase
    .from("blog_posts")
    .select("published_at")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("blog_posts")
    .update({
      title,
      excerpt: clean(String(formData.get("excerpt") ?? "")).slice(0, 500),
      body: String(formData.get("body") ?? ""),
      cover_image: clean(String(formData.get("cover_image") ?? "")) || null,
      author_name: clean(String(formData.get("author_name") ?? "")).slice(0, 100),
      author_role: clean(String(formData.get("author_role") ?? "")).slice(0, 100),
      tags: readTags(formData),
      reading_time: clean(String(formData.get("reading_time") ?? "")).slice(0, 20),
      is_featured: formData.get("is_featured") === "on",
      is_published: published,
      published_at:
        published && !existing?.published_at
          ? new Date().toISOString()
          : published
            ? existing?.published_at
            : existing?.published_at ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };

  invalidate();
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
  field: "is_published" | "is_featured",
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await requireAdmin();
  const { data: post } = await supabase
    .from("blog_posts")
    .select("is_published, is_featured, published_at")
    .eq("id", id)
    .single();
  if (!post) return { error: "Post not found" };

  const next = !post[field];
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