"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return supabase;
}

export async function createCourse(formData: FormData) {
  const supabase = await requireAdmin();

  const title = String(formData.get("title")).trim();
  const slug = String(formData.get("slug")).trim();
  const description = String(formData.get("description")).trim();
  const price = Number(formData.get("price")) || 0;
  const level = String(formData.get("level")) || "beginner";
  const cover_image = String(formData.get("cover_image")).trim() || null;

  const { error } = await supabase.from("courses").insert({
    title,
    slug,
    description,
    price,
    level,
    cover_image,
    is_published: formData.get("is_published") === "on",
  });

  if (error) return { error: error.message };
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
  const cover_image = String(formData.get("cover_image")).trim() || null;

  const { error } = await supabase
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

  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/courses");
}

export async function deleteCourse(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));

  await supabase.from("lessons").delete().eq("course_id", id);
  await supabase.from("enrollments").delete().eq("course_id", id);
  const { error } = await supabase.from("courses").delete().eq("id", id);

  if (error) return { error: error.message };
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

  const { error } = await supabase.from("lessons").insert({
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

  if (error) return { error: error.message };
  revalidatePath("/admin");
}

export async function deleteLesson(formData: FormData) {
  const supabase = await requireAdmin();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("lessons").delete().eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin");
}

export async function makeAdmin(formData: FormData) {
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

  if (profile?.role !== "admin") return { error: "Forbidden" };

  const userId = String(formData.get("user_id"));
  await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId);

  revalidatePath("/admin");
  return { success: true };
}
