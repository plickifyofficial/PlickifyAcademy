"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requireAdmin() {
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

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return supabase;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
];

async function uploadCoverImage(file: File): Promise<string> {
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `course-${Date.now()}.${ext}`;
  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("course-images")
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) throw new Error(error.message);

  const { data } = admin.storage.from("course-images").getPublicUrl(path);
  return data.publicUrl;
}

async function resolveCoverImage(formData: FormData, fallback: string | null) {
  const file = formData.get("cover_image_file");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_SIZE)
      throw new Error("কভার ইমেজ 5MB-এর মধ্যে হতে হবে");
    if (!ALLOWED_IMAGE_MIME.includes(file.type))
      throw new Error("PNG/JPG/WebP/SVG ইমেজ দিন");
    return uploadCoverImage(file);
  }
  const url = String(formData.get("cover_image")).trim();
  return url || fallback;
}

export async function createCourse(formData: FormData) {
  const supabase = await requireAdmin();

  const title = String(formData.get("title")).trim();
  const slug = String(formData.get("slug")).trim();
  const description = String(formData.get("description")).trim();
  const price = Number(formData.get("price")) || 0;
  const level = String(formData.get("level")) || "beginner";
  const cover_image = await resolveCoverImage(formData, null);

  await supabase.from("courses").insert({
    title,
    slug,
    description,
    price,
    level,
    cover_image,
    is_published: formData.get("is_published") === "on",
  });

  revalidatePath("/admin");
  revalidatePath("/courses");
}

export async function updateCourse(formData: FormData) {
  const supabase = await requireAdmin();

  const id = String(formData.get("id"));
  const title = String(formData.get("title")).trim();
  const slug = String(formData.get("slug")).trim();
  const description = String(formData.get("description")).trim();
  const price = Number(formData.get("price")) || 0;
  const level = String(formData.get("level")) || "beginner";
  const cover_image = await resolveCoverImage(formData, null);

  await supabase
    .from("courses")
    .update({
      title,
      slug,
      description,
      price,
      level,
      cover_image,
      is_published: formData.get("is_published") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/courses");
}

export async function deleteCourse(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));

  await supabase.from("lessons").delete().eq("course_id", id);
  await supabase.from("enrollments").delete().eq("course_id", id);
  await supabase.from("courses").delete().eq("id", id);

  revalidatePath("/admin");
  revalidatePath("/courses");
}

export async function createLesson(formData: FormData) {
  const supabase = await requireAdmin();

  const courseId = String(formData.get("course_id"));
  const title = String(formData.get("title")).trim();
  const slug = String(formData.get("slug")).trim();
  const description = String(formData.get("description")).trim();
  const video_url = String(formData.get("video_url")).trim() || null;
  const content = String(formData.get("content")).trim() || null;
  const duration_minutes = Number(formData.get("duration_minutes")) || 0;
  const is_free = formData.get("is_free") === "on";
  const order = Number(formData.get("order")) || 0;

  await supabase.from("lessons").insert({
    course_id: courseId,
    title,
    slug,
    description,
    video_url,
    content,
    duration_minutes,
    is_free,
    order,
  });

  revalidatePath("/admin");
}

export async function deleteLesson(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));

  await supabase.from("lessons").delete().eq("id", id);

  revalidatePath("/admin");
}

export async function setUserRole(formData: FormData) {
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

  if (profile?.role !== "admin") redirect("/dashboard");

  const userId = String(formData.get("user_id"));
  const role = String(formData.get("role"));

  if (role !== "admin" && role !== "student") return;

  await supabase.from("profiles").update({ role }).eq("id", userId);

  revalidatePath("/admin/students");
}