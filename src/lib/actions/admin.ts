"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/actions/notifications";

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

export async function requireCourseEditor(courseId?: string) {
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

  if (profile?.role === "admin") return supabase;

  if (profile?.role !== "instructor") redirect("/dashboard");

  if (courseId) {
    const { data: course } = await supabase
      .from("courses")
      .select("created_by")
      .eq("id", courseId)
      .single();
    if (!course || course.created_by !== user.id) redirect("/dashboard");
  }

  return supabase;
}

async function courseIdFor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  id: string,
): Promise<string> {
  const { data, error } = await supabase
    .from(table as "lessons")
    .select("course_id")
    .eq("id", id)
    .single();
  if (error || !data) throw new Error("Item not found");
  return (data as unknown as { course_id: string }).course_id;
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

  if (error) throw new Error(`Image upload failed: ${error.message}`);

  const { data } = admin.storage.from("course-images").getPublicUrl(path);
  return data.publicUrl;
}

async function resolveCoverImage(formData: FormData, fallback: string | null) {
  const file = formData.get("cover_image_file");
  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_IMAGE_SIZE)
      throw new Error("Cover image must be within 5MB");
    if (!ALLOWED_IMAGE_MIME.includes(file.type))
      throw new Error("Please provide a PNG/JPG/WebP/SVG image");
    return uploadCoverImage(file);
  }
  const url = String(formData.get("cover_image")).trim();
  return url || fallback;
}

function optStr(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (!v) return null;
  const s = String(v).trim();
  return s || null;
}

function tagsFrom(formData: FormData): string[] {
  return optStr(formData, "tags")
    ?.split(",")
    .map((t) => t.trim())
    .filter(Boolean) ?? [];
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const s = String(value)
    .replace(/[০-৯]/g, (d) => String("০১২৩৪৫৬৭৮৯".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[,\s৳]/g, "")
    .trim();
  if (!s) return 0;
  const n = Number(s);
  return isNaN(n) ? 0 : n;
}

export async function createCourse(formData: FormData) {
  const supabase = await requireCourseEditor();

  const title = String(formData.get("title")).trim();
  const slug = String(formData.get("slug")).trim();
  if (!title || !slug) throw new Error("Please provide a title and slug");

  const description = String(formData.get("description")).trim();
  const price = toNumber(formData.get("price"));
  const original_price = toNumber(formData.get("original_price"));
  const level = String(formData.get("level")) || "beginner";
  const cover_image = await resolveCoverImage(formData, null);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: created, error } = await supabase
    .from("courses")
    .insert({
      title,
      slug,
      description,
      subtitle: optStr(formData, "subtitle"),
      category: optStr(formData, "category"),
      language: optStr(formData, "language"),
      original_price,
      level,
      cover_image,
      tags: tagsFrom(formData),
      is_featured: formData.get("is_featured") === "on",
      certificate: formData.getAll("certificate").includes("on"),
      visibility: formData.get("visibility") === "private" ? "private" : "public",
      promo_video_url: optStr(formData, "promo_video_url"),
      promo_video_embed: optStr(formData, "promo_video_embed"),
      created_by: user?.id,
      is_published: formData.get("is_published") === "on",
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  if (created) {
    await supabase.from("course_sections").insert({
      course_id: created.id,
      title: "Course Content",
      position: 0,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/courses");
  revalidatePath("/courses");
}

export async function updateCourse(formData: FormData) {
  const supabase = await requireCourseEditor(String(formData.get("id")));

  const id = String(formData.get("id"));
  const title = String(formData.get("title")).trim();
  const slug = String(formData.get("slug")).trim();
  if (!id || !title || !slug) throw new Error("শিরোনাম ও Slug দিন");

  const description = String(formData.get("description")).trim();
  const price = toNumber(formData.get("price"));
  const original_price = toNumber(formData.get("original_price"));
  const level = String(formData.get("level")) || "beginner";
  const cover_image = await resolveCoverImage(formData, null);

  const { error } = await supabase
    .from("courses")
    .update({
      title,
      slug,
      description,
      subtitle: optStr(formData, "subtitle"),
      category: optStr(formData, "category"),
      language: optStr(formData, "language"),
      original_price,
      level,
      cover_image,
      tags: tagsFrom(formData),
      is_featured: formData.get("is_featured") === "on",
      certificate: formData.getAll("certificate").includes("on"),
      visibility: formData.get("visibility") === "private" ? "private" : "public",
      promo_video_url: optStr(formData, "promo_video_url"),
      promo_video_embed: optStr(formData, "promo_video_embed"),
      is_published: formData.get("is_published") === "on",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/courses");
}

export async function deleteCourse(formData: FormData) {
  const supabase = await requireCourseEditor(String(formData.get("id")));
  const id = String(formData.get("id"));
  if (!id) throw new Error("Course ID missing");

  const { error: lerr } = await supabase
    .from("lessons")
    .delete()
    .eq("course_id", id);
  if (lerr) throw new Error(lerr.message);

  const { error: eerr } = await supabase
    .from("enrollments")
    .delete()
    .eq("course_id", id);
  if (eerr) throw new Error(eerr.message);

  const { error } = await supabase.from("courses").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath("/courses");
}

export async function createLesson(formData: FormData) {
  const supabase = await requireCourseEditor(String(formData.get("course_id")));

  const courseId = String(formData.get("course_id"));
  const title = String(formData.get("title")).trim();
  const slug = String(formData.get("slug")).trim();
  if (!courseId || !title || !slug) throw new Error("শিরোনাম ও Slug দিন");

  const description = String(formData.get("description")).trim();
  const video_url = String(formData.get("video_url")).trim() || null;
  const content = String(formData.get("content")).trim() || null;
  const duration_minutes = toNumber(formData.get("duration_minutes"));
  const is_free = formData.get("is_free") === "on";
  const order = toNumber(formData.get("order"));

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

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function deleteLesson(formData: FormData) {
  const id = String(formData.get("id"));
  if (!id) throw new Error("Lesson ID missing");

  const supabase = await createClient();
  await requireCourseEditor(await courseIdFor(supabase, "lessons", id));

  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function createSection(formData: FormData) {
  const supabase = await requireCourseEditor(String(formData.get("course_id")));

  const courseId = String(formData.get("course_id"));
  const title = String(formData.get("title")).trim();
  if (!courseId || !title) throw new Error("Please provide a section name");

  const { data: last } = await supabase
    .from("course_sections")
    .select("position")
    .eq("course_id", courseId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("course_sections").insert({
    course_id: courseId,
    title,
    position: (last?.position ?? 0) + 1,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function updateSection(formData: FormData) {
  const id = String(formData.get("id"));
  const title = String(formData.get("title")).trim();
  if (!id || !title) throw new Error("সেকশনের নাম দিন");

  const supabase = await createClient();
  await requireCourseEditor(await courseIdFor(supabase, "course_sections", id));

  const { error } = await supabase
    .from("course_sections")
    .update({ title })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function deleteSection(formData: FormData) {
  const id = String(formData.get("id"));
  if (!id) throw new Error("Section ID missing");

  const supabase = await createClient();
  await requireCourseEditor(await courseIdFor(supabase, "course_sections", id));

  const { error } = await supabase.from("course_sections").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function moveSection(formData: FormData) {
  const courseId = String(formData.get("course_id"));
  const supabase = await requireCourseEditor(courseId);
  const id = String(formData.get("id"));
  const direction = toNumber(formData.get("direction"));
  if (!id || !courseId || direction === 0) return;

  const { data: sections } = await supabase
    .from("course_sections")
    .select("id, position")
    .eq("course_id", courseId)
    .order("position", { ascending: true });

  if (!sections) return;
  const idx = sections.findIndex((s) => s.id === id);
  const target = idx + direction;
  if (idx < 0 || target < 0 || target >= sections.length) return;

  const a = sections[idx];
  const b = sections[target];

  const { error } = await supabase.from("course_sections").update({ position: b.position }).eq("id", a.id);
  if (error) throw new Error(error.message);
  const { error: e2 } = await supabase.from("course_sections").update({ position: a.position }).eq("id", b.id);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin");
}

export async function createTopic(formData: FormData) {
  const supabase = await requireCourseEditor(String(formData.get("course_id")));

  const courseId = String(formData.get("course_id"));
  const sectionId = String(formData.get("section_id"));
  const title = String(formData.get("title")).trim();
  const slug = String(formData.get("slug")).trim();
  const type = String(formData.get("type")) || "lesson";
  if (!courseId || !sectionId || !title || !slug) throw new Error("Please provide a title, slug and section");

  const { data: last } = await supabase
    .from("lessons")
    .select("order")
    .eq("section_id", sectionId)
    .order("order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("lessons").insert({
    course_id: courseId,
    section_id: sectionId,
    type,
    title,
    slug,
    description: optStr(formData, "description"),
    video_url: optStr(formData, "video_url"),
    video_embed: optStr(formData, "video_embed"),
    content: optStr(formData, "content"),
    duration_minutes: toNumber(formData.get("duration_minutes")),
    is_free: formData.get("is_free") === "on",
    pass_percent: toNumber(formData.get("pass_percent")) || 60,
    release_days: toNumber(formData.get("release_days")),
    order: (last?.order ?? 0) + 1,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function updateTopic(formData: FormData) {
  const id = String(formData.get("id"));
  const title = String(formData.get("title")).trim();
  const slug = String(formData.get("slug")).trim();
  if (!id || !title || !slug) throw new Error("শিরোনাম ও Slug দিন");

  const supabase = await createClient();
  await requireCourseEditor(await courseIdFor(supabase, "lessons", id));

  const { error } = await supabase
    .from("lessons")
    .update({
      title,
      slug,
      type: String(formData.get("type")) || "lesson",
      description: optStr(formData, "description"),
      video_url: optStr(formData, "video_url"),
      video_embed: optStr(formData, "video_embed"),
      content: optStr(formData, "content"),
      duration_minutes: toNumber(formData.get("duration_minutes")),
      is_free: formData.get("is_free") === "on",
      pass_percent: toNumber(formData.get("pass_percent")) || 60,
      release_days: toNumber(formData.get("release_days")),
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function deleteTopic(formData: FormData) {
  const id = String(formData.get("id"));
  if (!id) throw new Error("Topic ID missing");

  const supabase = await createClient();
  await requireCourseEditor(await courseIdFor(supabase, "lessons", id));

  const { error } = await supabase.from("lessons").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function moveTopic(formData: FormData) {
  const sectionId = String(formData.get("section_id"));
  const supabase = await createClient();
  await requireCourseEditor(await courseIdFor(supabase, "course_sections", sectionId));

  const id = String(formData.get("id"));
  const direction = toNumber(formData.get("direction"));
  if (!id || !sectionId || direction === 0) return;

  const { data: topics } = await supabase
    .from("lessons")
    .select("id, order")
    .eq("section_id", sectionId)
    .order("order", { ascending: true });

  if (!topics) return;
  const idx = topics.findIndex((t) => t.id === id);
  const target = idx + direction;
  if (idx < 0 || target < 0 || target >= topics.length) return;

  const a = topics[idx];
  const b = topics[target];

  const { error } = await supabase.from("lessons").update({ order: b.order }).eq("id", a.id);
  if (error) throw new Error(error.message);
  const { error: e2 } = await supabase.from("lessons").update({ order: a.order }).eq("id", b.id);
  if (e2) throw new Error(e2.message);

  revalidatePath("/admin");
}

export async function createQuizQuestion(formData: FormData) {
  const lessonId = String(formData.get("lesson_id"));
  const supabase = await createClient();
  await requireCourseEditor(await courseIdFor(supabase, "lessons", lessonId));

  const question = String(formData.get("question")).trim();
  if (!lessonId || !question) throw new Error("Please write a question");

  const options = String(formData.get("options"))
    .split("\n")
    .map((o) => o.trim())
    .filter(Boolean);
  if (options.length < 2) throw new Error("Please provide at least 2 options");

  const correctIndex = toNumber(formData.get("correct_index"));
  if (correctIndex >= options.length)
    throw new Error("The correct answer index is invalid");

  const { data: last } = await supabase
    .from("quiz_questions")
    .select("position")
    .eq("lesson_id", lessonId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { error } = await supabase.from("quiz_questions").insert({
    lesson_id: lessonId,
    question,
    options,
    correct_index: correctIndex,
    explanation: String(formData.get("explanation")).trim() || null,
    position: (last?.position ?? 0) + 1,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function updateQuizQuestion(formData: FormData) {
  const id = String(formData.get("id"));
  const question = String(formData.get("question")).trim();
  if (!id || !question) throw new Error("Please write a question");

  const supabase = await createClient();
  const { data: quiz } = await supabase
    .from("quiz_questions")
    .select("lesson_id")
    .eq("id", id)
    .single();
  if (!quiz) throw new Error("Question not found");
  await requireCourseEditor(await courseIdFor(supabase, "lessons", quiz.lesson_id));

  const options = String(formData.get("options"))
    .split("\n")
    .map((o) => o.trim())
    .filter(Boolean);
  if (options.length < 2) throw new Error("Please provide at least 2 options");

  const correctIndex = toNumber(formData.get("correct_index"));
  if (correctIndex >= options.length)
    throw new Error("The correct answer index is invalid");

  const { error } = await supabase
    .from("quiz_questions")
    .update({
      question,
      options,
      correct_index: correctIndex,
      explanation: String(formData.get("explanation")).trim() || null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function deleteQuizQuestion(formData: FormData) {
  const id = String(formData.get("id"));
  if (!id) throw new Error("Question ID missing");

  const supabase = await createClient();
  const { data: quiz } = await supabase
    .from("quiz_questions")
    .select("lesson_id")
    .eq("id", id)
    .single();
  if (!quiz) throw new Error("Question not found");
  await requireCourseEditor(await courseIdFor(supabase, "lessons", quiz.lesson_id));

  const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function createAnnouncement(formData: FormData) {
  const courseId = String(formData.get("course_id"));
  const supabase = await requireCourseEditor(courseId);
  const title = String(formData.get("title")).trim();
  if (!courseId || !title) throw new Error("Please provide a title");

  const { error } = await supabase.from("course_announcements").insert({
    course_id: courseId,
    title,
    body: String(formData.get("body")).trim() || null,
  });
  if (error) throw new Error(error.message);

  const { data: enrolled } = await supabase
    .from("enrollments")
    .select("user_id")
    .eq("course_id", courseId);

  for (const e of enrolled ?? []) {
    await createNotification(
      e.user_id,
      "New announcement 📢",
      `"${title}" — A new announcement was added to the course.`,
      `/courses/${await slugOf(supabase, courseId)}`,
    );
  }

  revalidatePath("/admin");
  revalidatePath(`/courses/${await slugOf(supabase, courseId)}`);
}

export async function deleteAnnouncement(formData: FormData) {
  const id = String(formData.get("id"));
  if (!id) throw new Error("ID missing");

  const supabase = await createClient();

  const { data: ann } = await supabase
    .from("course_announcements")
    .select("course_id")
    .eq("id", id)
    .single();

  if (ann) await requireCourseEditor(ann.course_id);

  const { error } = await supabase
    .from("course_announcements")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);

  if (ann) revalidatePath(`/courses/${await slugOf(supabase, ann.course_id)}`);
  revalidatePath("/admin");
}

async function slugOf(
  supabase: Awaited<ReturnType<typeof createClient>> | ReturnType<typeof createAdminClient>,
  courseId: string,
): Promise<string> {
  const { data } = await supabase
    .from("courses")
    .select("slug")
    .eq("id", courseId)
    .single();
  return data?.slug ?? "";
}

export async function createLiveClass(formData: FormData) {
  const courseId = String(formData.get("course_id"));
  const supabase = await requireCourseEditor(courseId);
  const title = String(formData.get("title")).trim();
  if (!courseId || !title) throw new Error("Please provide a title");

  const { error } = await supabase.from("live_classes").insert({
    course_id: courseId,
    title,
    description: String(formData.get("description")).trim() || null,
    scheduled_at: String(formData.get("scheduled_at") || "").trim() || null,
    duration_minutes: toNumber(formData.get("duration_minutes")) || 60,
    meeting_url: String(formData.get("meeting_url")).trim() || null,
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function deleteLiveClass(formData: FormData) {
  const id = String(formData.get("id"));
  if (!id) throw new Error("Class ID missing");

  const supabase = await createClient();
  await requireCourseEditor(await courseIdFor(supabase, "live_classes", id));

  const { error } = await supabase.from("live_classes").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
}

export async function enrollStudent(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();

  try {
    const courseId = String(formData.get("course_id"));
    const email = String(formData.get("email")).trim().toLowerCase();
    if (!courseId || !email) throw new Error("Please provide a course and email");

    const { data: user } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (!user) return { error: "No user exists with this email" };

    const { data: course } = await admin
      .from("courses")
      .select("title")
      .eq("id", courseId)
      .single();

    const { data: existing } = await admin
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();
    if (existing) return { error: "This student is already enrolled in this course" };

    const { error } = await admin.from("enrollments").insert({
      user_id: user.id,
      course_id: courseId,
    });
    if (error) return { error: error.message };

    if (course) {
      try {
        await createNotification(
          user.id,
          "Enrolled in a course 🎉",
          `You have been enrolled in the "${course.title}" course.`,
          `/courses/${await slugOf(admin, courseId)}`,
        );
      } catch {
        // notification is non-critical
      }
    }

    revalidatePath("/admin/enrollments");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not enroll" };
  }
}

export async function unenrollStudent(
  formData: FormData,
): Promise<{ error?: string }> {
  await requireAdmin();
  const admin = createAdminClient();
  try {
    const id = String(formData.get("id"));
    if (!id) return { error: "Enrollment ID missing" };

    const { error } = await admin.from("enrollments").delete().eq("id", id);
    if (error) return { error: error.message };

    revalidatePath("/admin/enrollments");
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not unenroll" };
  }
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

  if (role !== "admin" && role !== "student" && role !== "instructor")
    throw new Error("Invalid role");

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/students");
}