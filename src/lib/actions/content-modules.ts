"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { contentModuleTag } from "@/lib/content-modules";

type DbClient = Awaited<ReturnType<typeof createClient>>;

const PAGES = ["homepage", "courses", "products", "about", "contact", "global"] as const;
const PRESET_COLORS = [
  "bg-blue-600",
  "bg-violet-600",
  "bg-emerald-600",
  "bg-rose-500",
  "bg-amber-500",
  "bg-cyan-600",
  "bg-fuchsia-600",
  "bg-slate-700",
  "bg-indigo-600",
  "bg-orange-500",
];

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

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/admin");
  return supabase;
}

function invalidate(...paths: string[]) {
  updateTag(contentModuleTag);
  for (const p of paths) revalidatePath(p);
}

async function moveRow(
  supabase: DbClient,
  table: "categories" | "faqs" | "testimonials",
  id: string,
  direction: "up" | "down",
) {
  const { data: rows } = await supabase
    .from(table)
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (!rows) return;
  const idx = rows.findIndex((r: { id: string }) => r.id === id);
  if (idx === -1) return;
  const target = direction === "up" ? idx - 1 : idx + 1;
  if (target < 0 || target >= rows.length) return;
  await supabase
    .from(table)
    .update({ sort_order: rows[target].sort_order })
    .eq("id", rows[idx].id);
  await supabase
    .from(table)
    .update({ sort_order: rows[idx].sort_order })
    .eq("id", rows[target].id);
}

// ============================================================
// TESTIMONIALS
// ============================================================
export async function createTestimonial(formData: FormData) {
  const supabase = await requireAdmin();
  const name = clean(String(formData.get("name") ?? "")).slice(0, 100);
  if (!name) return { error: "Name is required." };
  const role = clean(String(formData.get("role") ?? "")).slice(0, 120);
  const course = clean(String(formData.get("course") ?? "")).slice(0, 120);
  const quote = clean(String(formData.get("quote") ?? "")).slice(0, 1000);
  if (!quote) return { error: "Quote is required." };
  const rating = Math.max(1, Math.min(5, Number(formData.get("rating")) || 5));
  const initials = clean(String(formData.get("initials") ?? "")).slice(0, 4);
  const color = PRESET_COLORS.includes(String(formData.get("color")))
    ? String(formData.get("color"))
    : "bg-blue-600";
  const avatar = clean(String(formData.get("avatar") ?? "")).slice(0, 500);
  const is_published = formData.get("is_published") === "on";
  const is_featured = formData.get("is_featured") === "on";

  const { count } = await supabase
    .from("testimonials")
    .select("id", { count: "exact", head: true });
  const { error } = await supabase.from("testimonials").insert({
    name,
    role,
    course,
    quote,
    rating,
    initials,
    color,
    avatar: avatar || null,
    is_published,
    is_featured,
    sort_order: (count ?? 0) + 1,
  });
  if (error) return { error: error.message };
  invalidate("/admin/testimonials");
  return { success: true };
}

export async function updateTestimonial(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id." };
  const name = clean(String(formData.get("name") ?? "")).slice(0, 100);
  if (!name) return { error: "Name is required." };
  const role = clean(String(formData.get("role") ?? "")).slice(0, 120);
  const course = clean(String(formData.get("course") ?? "")).slice(0, 120);
  const quote = clean(String(formData.get("quote") ?? "")).slice(0, 1000);
  if (!quote) return { error: "Quote is required." };
  const rating = Math.max(1, Math.min(5, Number(formData.get("rating")) || 5));
  const initials = clean(String(formData.get("initials") ?? "")).slice(0, 4);
  const color = PRESET_COLORS.includes(String(formData.get("color")))
    ? String(formData.get("color"))
    : "bg-blue-600";
  const avatar = clean(String(formData.get("avatar") ?? "")).slice(0, 500);
  const is_published = formData.get("is_published") === "on";
  const is_featured = formData.get("is_featured") === "on";

  const { error } = await supabase
    .from("testimonials")
    .update({
      name,
      role,
      course,
      quote,
      rating,
      initials,
      color,
      avatar: avatar || null,
      is_published,
      is_featured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/testimonials");
  return { success: true };
}

export async function deleteTestimonial(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/testimonials");
  return { success: true };
}

export async function toggleTestimonial(id: string, field: "is_published" | "is_featured") {
  const supabase = await requireAdmin();
  const { data: row } = await supabase
    .from("testimonials")
    .select(field)
    .eq("id", id)
    .single();
  const rowData = row as { is_published?: boolean; is_featured?: boolean };
  const current =
    field === "is_published" ? rowData.is_published : rowData.is_featured;
  if (typeof current !== "boolean") return { error: "Not found." };
  const { error } = await supabase
    .from("testimonials")
    .update({ [field]: !current, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/testimonials");
  return { success: true };
}

export async function moveTestimonial(id: string, direction: "up" | "down") {
  const supabase = await requireAdmin();
  await moveRow(supabase, "testimonials", id, direction);
  invalidate("/admin/testimonials");
  return { success: true };
}

// ============================================================
// FAQS
// ============================================================
export async function createFaq(formData: FormData) {
  const supabase = await requireAdmin();
  const question = clean(String(formData.get("question") ?? "")).slice(0, 300);
  if (!question) return { error: "Question is required." };
  const answer = clean(String(formData.get("answer") ?? "")).slice(0, 3000);
  if (!answer) return { error: "Answer is required." };
  const page = PAGES.includes(formData.get("page") as never)
    ? String(formData.get("page"))
    : "homepage";
  const is_published = formData.get("is_published") === "on";

  const { count } = await supabase
    .from("faqs")
    .select("id", { count: "exact", head: true })
    .eq("page", page);
  const { error } = await supabase.from("faqs").insert({
    question,
    answer,
    page,
    is_published,
    sort_order: (count ?? 0) + 1,
  });
  if (error) return { error: error.message };
  invalidate("/admin/faqs");
  return { success: true };
}

export async function updateFaq(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id." };
  const question = clean(String(formData.get("question") ?? "")).slice(0, 300);
  if (!question) return { error: "Question is required." };
  const answer = clean(String(formData.get("answer") ?? "")).slice(0, 3000);
  if (!answer) return { error: "Answer is required." };
  const page = PAGES.includes(formData.get("page") as never)
    ? String(formData.get("page"))
    : "homepage";
  const is_published = formData.get("is_published") === "on";

  const { error } = await supabase
    .from("faqs")
    .update({
      question,
      answer,
      page,
      is_published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/faqs");
  return { success: true };
}

export async function deleteFaq(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("faqs").delete().eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/faqs");
  return { success: true };
}

export async function toggleFaq(id: string) {
  const supabase = await requireAdmin();
  const { data: row } = await supabase
    .from("faqs")
    .select("is_published")
    .eq("id", id)
    .single();
  if (!row) return { error: "Not found." };
  const { error } = await supabase
    .from("faqs")
    .update({ is_published: !row.is_published, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/faqs");
  return { success: true };
}

export async function moveFaq(id: string, direction: "up" | "down") {
  const supabase = await requireAdmin();
  await moveRow(supabase, "faqs", id, direction);
  invalidate("/admin/faqs");
  return { success: true };
}

// ============================================================
// CATEGORIES
// ============================================================
export async function createCategory(formData: FormData) {
  const supabase = await requireAdmin();
  const name = clean(String(formData.get("name") ?? "")).slice(0, 100);
  if (!name) return { error: "Name is required." };
  const type = formData.get("type") === "product" ? "product" : "course";
  const slugRaw = clean(String(formData.get("slug") ?? ""));
  const slug = slugify(slugRaw || name);
  if (!slug) return { error: "Invalid slug." };
  const icon = clean(String(formData.get("icon") ?? "")).slice(0, 100) || "fa-solid fa-tag";
  const description = clean(String(formData.get("description") ?? "")).slice(0, 500);
  const image = clean(String(formData.get("image") ?? "")).slice(0, 500);
  const is_published = formData.get("is_published") === "on";

  const { count } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("type", type);
  const { error } = await supabase.from("categories").insert({
    type,
    name,
    slug,
    icon,
    description: description || null,
    image: image || null,
    is_published,
    sort_order: (count ?? 0) + 1,
  });
  if (error) return { error: error.message };
  invalidate("/admin/categories");
  return { success: true };
}

export async function updateCategory(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id." };
  const name = clean(String(formData.get("name") ?? "")).slice(0, 100);
  if (!name) return { error: "Name is required." };
  const slug = slugify(clean(String(formData.get("slug") ?? "")).slice(0, 80));
  if (!slug) return { error: "Invalid slug." };
  const icon = clean(String(formData.get("icon") ?? "")).slice(0, 100) || "fa-solid fa-tag";
  const description = clean(String(formData.get("description") ?? "")).slice(0, 500);
  const image = clean(String(formData.get("image") ?? "")).slice(0, 500);
  const is_published = formData.get("is_published") === "on";

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug,
      icon,
      description: description || null,
      image: image || null,
      is_published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/categories");
  return { success: true };
}

export async function toggleCategory(id: string) {
  const supabase = await requireAdmin();
  const { data: row } = await supabase
    .from("categories")
    .select("is_published")
    .eq("id", id)
    .single();
  if (!row) return { error: "Not found." };
  const { error } = await supabase
    .from("categories")
    .update({ is_published: !row.is_published, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/categories");
  return { success: true };
}

export async function moveCategory(id: string, direction: "up" | "down") {
  const supabase = await requireAdmin();
  await moveRow(supabase, "categories", id, direction);
  invalidate("/admin/categories");
  return { success: true };
}
