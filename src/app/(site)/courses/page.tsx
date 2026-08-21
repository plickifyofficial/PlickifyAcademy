import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { CoursesBrowser } from "@/components/courses/courses-browser";
import { getCategories, getPublishedFaqs } from "@/lib/content-modules";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/courses", {
    title: "Courses | Plickify Academy",
  });
}

export const revalidate = 60;

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const initialQuery = q?.trim() ?? "";

  const supabase = createAdminClient();

  const [{ data: courses }, { data: reviews }, { data: lessons }, { data: enrollments }, { data: liveClasses }, { data: products }, { data: profiles }, categories, faqItems] =
    await Promise.all([
      supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .eq("visibility", "public"),
      supabase.from("reviews").select("course_id, rating"),
      supabase.from("lessons").select("course_id, duration_minutes"),
      supabase.from("enrollments").select("course_id"),
      supabase.from("live_classes").select("course_id"),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      getCategories("course"),
      getPublishedFaqs("courses"),
    ]);

  const lessonCounts: Record<string, number> = {};
  const lessonMinutes: Record<string, number> = {};
  for (const l of lessons ?? []) {
    lessonCounts[l.course_id] = (lessonCounts[l.course_id] ?? 0) + 1;
    lessonMinutes[l.course_id] =
      (lessonMinutes[l.course_id] ?? 0) + Number(l.duration_minutes ?? 0);
  }

  const enrollmentCounts: Record<string, number> = {};
  for (const e of enrollments ?? []) {
    enrollmentCounts[e.course_id] = (enrollmentCounts[e.course_id] ?? 0) + 1;
  }

  const liveCourseIds = new Set((liveClasses ?? []).map((l) => l.course_id));

  const ratingMap: Record<string, { sum: number; count: number }> = {};
  for (const r of reviews ?? []) {
    if (!ratingMap[r.course_id]) ratingMap[r.course_id] = { sum: 0, count: 0 };
    ratingMap[r.course_id].sum += r.rating;
    ratingMap[r.course_id].count += 1;
  }

  const creatorIds = [
    ...new Set(
      (courses ?? []).map((c) => c.created_by).filter(Boolean),
    ),
  ] as string[];
  const { data: instructorProfiles } =
    creatorIds.length > 0
      ? await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", creatorIds)
      : { data: [] };
  const instructorName = (id: string | null) =>
    instructorProfiles?.find((p) => p.id === id)?.full_name ||
    "Plickify Academy";

  const items = (courses ?? []).map((c) => {
    const rating = ratingMap[c.id];
    return {
      id: c.id,
      title: c.title,
      slug: c.slug,
      description: c.description ?? "",
      subtitle: c.subtitle ?? "",
      category: c.category ?? "",
      language: c.language ?? "Bengali",
      price: Number(c.price),
      original_price: Number(c.original_price ?? 0),
      level: c.level ?? "",
      is_featured: !!c.is_featured,
      certificate: !!c.certificate,
      tags: c.tags ?? [],
      cover_image: c.cover_image,
      created_at: c.created_at,
      hasLive: liveCourseIds.has(c.id),
      lessonCount: lessonCounts[c.id] ?? 0,
      totalMinutes: lessonMinutes[c.id] ?? 0,
      instructor: instructorName(c.created_by),
      ratingAvg: rating ? rating.sum / rating.count : 0,
      reviewCount: rating?.count ?? 0,
      enrollmentCount: enrollmentCounts[c.id] ?? 0,
    };
  });

  const ratingValues = items.map((i) => i.ratingAvg).filter((v) => v > 0);
  const avgRating =
    ratingValues.length > 0
      ? ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length
      : 0;

  const stats = {
    courses: items.length,
    students: profiles?.length ?? 0,
    resources: products?.length ?? 0,
    rating: avgRating,
  };

  return (
    <CoursesBrowser
      initialCourses={items}
      initialQuery={initialQuery}
      stats={stats}
      categories={categories.map((c) => ({
        name: c.name,
        slug: c.slug,
        icon: c.icon ?? "fa-solid fa-tag",
        desc: c.description ?? "",
      }))}
      faqItems={faqItems.map((f) => ({ q: f.question, a: f.answer }))}
    />
  );
}