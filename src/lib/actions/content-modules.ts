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
  table: "categories" | "faqs" | "testimonials" | "batches" | "instructors",
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

// ============================================================
// BATCHES
// ============================================================
const BATCH_STATUSES = ["open", "upcoming", "ongoing", "closed"];

function parseFeatures(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => clean(s))
    .filter(Boolean)
    .slice(0, 20);
}

export async function createBatch(formData: FormData) {
  const supabase = await requireAdmin();
  const title = clean(String(formData.get("title") ?? "")).slice(0, 150);
  if (!title) return { error: "Title is required." };
  const course_id = clean(String(formData.get("course_id") ?? "")) || null;
  const description = clean(String(formData.get("description") ?? "")).slice(0, 2000);
  const start_date = clean(String(formData.get("start_date") ?? "")) || null;
  const duration = clean(String(formData.get("duration") ?? "")).slice(0, 80);
  const schedule = clean(String(formData.get("schedule") ?? "")).slice(0, 120);
  const class_count = Math.max(0, Number(formData.get("class_count")) || 0);
  const seats_total = Math.max(1, Number(formData.get("seats_total")) || 1);
  const seats_filled = Math.max(0, Number(formData.get("seats_filled")) || 0);
  const price = Math.max(0, Number(formData.get("price")) || 0);
  const old_price = Math.max(0, Number(formData.get("old_price")) || 0);
  const status = BATCH_STATUSES.includes(String(formData.get("status")))
    ? String(formData.get("status"))
    : "open";
  const is_featured = formData.get("is_featured") === "on";
  const is_published = formData.get("is_published") === "on";
  const meeting_info = clean(String(formData.get("meeting_info") ?? "")).slice(0, 500);
  const features = parseFeatures(String(formData.get("features") ?? ""));

  const { count } = await supabase
    .from("batches")
    .select("id", { count: "exact", head: true });
  const { error } = await supabase.from("batches").insert({
    course_id,
    title,
    description,
    start_date,
    duration,
    schedule,
    class_count,
    seats_total,
    seats_filled,
    price,
    old_price,
    status,
    is_featured,
    is_published,
    meeting_info,
    features,
    sort_order: (count ?? 0) + 1,
  });
  if (error) return { error: error.message };
  invalidate("/admin/batches", "/live-batch");
  return { success: true };
}

export async function updateBatch(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id." };
  const title = clean(String(formData.get("title") ?? "")).slice(0, 150);
  if (!title) return { error: "Title is required." };
  const course_id = clean(String(formData.get("course_id") ?? "")) || null;
  const description = clean(String(formData.get("description") ?? "")).slice(0, 2000);
  const start_date = clean(String(formData.get("start_date") ?? "")) || null;
  const duration = clean(String(formData.get("duration") ?? "")).slice(0, 80);
  const schedule = clean(String(formData.get("schedule") ?? "")).slice(0, 120);
  const class_count = Math.max(0, Number(formData.get("class_count")) || 0);
  const seats_total = Math.max(1, Number(formData.get("seats_total")) || 1);
  const seats_filled = Math.max(0, Number(formData.get("seats_filled")) || 0);
  const price = Math.max(0, Number(formData.get("price")) || 0);
  const old_price = Math.max(0, Number(formData.get("old_price")) || 0);
  const status = BATCH_STATUSES.includes(String(formData.get("status")))
    ? String(formData.get("status"))
    : "open";
  const is_featured = formData.get("is_featured") === "on";
  const is_published = formData.get("is_published") === "on";
  const meeting_info = clean(String(formData.get("meeting_info") ?? "")).slice(0, 500);
  const features = parseFeatures(String(formData.get("features") ?? ""));

  const { error } = await supabase
    .from("batches")
    .update({
      course_id,
      title,
      description,
      start_date,
      duration,
      schedule,
      class_count,
      seats_total,
      seats_filled,
      price,
      old_price,
      status,
      is_featured,
      is_published,
      meeting_info,
      features,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/batches", "/live-batch");
  return { success: true };
}

export async function deleteBatch(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("batches").delete().eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/batches", "/live-batch");
  return { success: true };
}

export async function toggleBatch(id: string, field: "is_published" | "is_featured") {
  const supabase = await requireAdmin();
  const { data: row } = await supabase
    .from("batches")
    .select(field)
    .eq("id", id)
    .single();
  const rowData = row as { is_published?: boolean; is_featured?: boolean };
  const current =
    field === "is_published" ? rowData.is_published : rowData.is_featured;
  if (typeof current !== "boolean") return { error: "Not found." };
  const { error } = await supabase
    .from("batches")
    .update({ [field]: !current, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/batches", "/live-batch");
  return { success: true };
}

export async function moveBatch(id: string, direction: "up" | "down") {
  const supabase = await requireAdmin();
  await moveRow(supabase, "batches", id, direction);
  invalidate("/admin/batches", "/live-batch");
  return { success: true };
}

// ============================================================
// INSTRUCTORS
// ============================================================
export async function createInstructor(formData: FormData) {
  const supabase = await requireAdmin();
  const name = clean(String(formData.get("name") ?? "")).slice(0, 150);
  if (!name) return { error: "Name is required." };
  const slug = slugify(clean(String(formData.get("slug") ?? "")).slice(0, 80)) || slugify(name);
  const role = clean(String(formData.get("role") ?? "")).slice(0, 150);
  const bio = clean(String(formData.get("bio") ?? "")).slice(0, 3000);
  const photo = clean(String(formData.get("photo") ?? "")).slice(0, 500);
  const initials = clean(String(formData.get("initials") ?? "")).slice(0, 4);
  const color = PRESET_COLORS.includes(String(formData.get("color")))
    ? String(formData.get("color"))
    : "bg-blue-600";
  const expertise = parseFeatures(String(formData.get("expertise") ?? ""));
  const facebook = clean(String(formData.get("facebook") ?? "")).slice(0, 300);
  const youtube = clean(String(formData.get("youtube") ?? "")).slice(0, 300);
  const linkedin = clean(String(formData.get("linkedin") ?? "")).slice(0, 300);
  const instagram = clean(String(formData.get("instagram") ?? "")).slice(0, 300);
  const is_featured = formData.get("is_featured") === "on";
  const is_published = formData.get("is_published") === "on";

  const { count } = await supabase
    .from("instructors")
    .select("id", { count: "exact", head: true });
  const { error } = await supabase.from("instructors").insert({
    name,
    slug,
    role,
    bio,
    photo: photo || null,
    initials,
    color,
    expertise,
    facebook,
    youtube,
    linkedin,
    instagram,
    is_featured,
    is_published,
    sort_order: (count ?? 0) + 1,
  });
  if (error) return { error: error.message };
  invalidate("/admin/instructors", "/about");
  return { success: true };
}

export async function updateInstructor(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing id." };
  const name = clean(String(formData.get("name") ?? "")).slice(0, 150);
  if (!name) return { error: "Name is required." };
  const slug = slugify(clean(String(formData.get("slug") ?? "")).slice(0, 80)) || slugify(name);
  const role = clean(String(formData.get("role") ?? "")).slice(0, 150);
  const bio = clean(String(formData.get("bio") ?? "")).slice(0, 3000);
  const photo = clean(String(formData.get("photo") ?? "")).slice(0, 500);
  const initials = clean(String(formData.get("initials") ?? "")).slice(0, 4);
  const color = PRESET_COLORS.includes(String(formData.get("color")))
    ? String(formData.get("color"))
    : "bg-blue-600";
  const expertise = parseFeatures(String(formData.get("expertise") ?? ""));
  const facebook = clean(String(formData.get("facebook") ?? "")).slice(0, 300);
  const youtube = clean(String(formData.get("youtube") ?? "")).slice(0, 300);
  const linkedin = clean(String(formData.get("linkedin") ?? "")).slice(0, 300);
  const instagram = clean(String(formData.get("instagram") ?? "")).slice(0, 300);
  const is_featured = formData.get("is_featured") === "on";
  const is_published = formData.get("is_published") === "on";

  const { error } = await supabase
    .from("instructors")
    .update({
      name,
      slug,
      role,
      bio,
      photo: photo || null,
      initials,
      color,
      expertise,
      facebook,
      youtube,
      linkedin,
      instagram,
      is_featured,
      is_published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/instructors", "/about");
  return { success: true };
}

export async function deleteInstructor(id: string) {
  const supabase = await requireAdmin();
  const { error } = await supabase.from("instructors").delete().eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/instructors", "/about");
  return { success: true };
}

export async function toggleInstructor(id: string, field: "is_published" | "is_featured") {
  const supabase = await requireAdmin();
  const { data: row } = await supabase
    .from("instructors")
    .select(field)
    .eq("id", id)
    .single();
  const rowData = row as { is_published?: boolean; is_featured?: boolean };
  const current =
    field === "is_published" ? rowData.is_published : rowData.is_featured;
  if (typeof current !== "boolean") return { error: "Not found." };
  const { error } = await supabase
    .from("instructors")
    .update({ [field]: !current, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  invalidate("/admin/instructors", "/about");
  return { success: true };
}

export async function moveInstructor(id: string, direction: "up" | "down") {
  const supabase = await requireAdmin();
  await moveRow(supabase, "instructors", id, direction);
  invalidate("/admin/instructors", "/about");
  return { success: true };
}
