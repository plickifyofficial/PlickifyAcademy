import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "My Courses" };

export default async function MyCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select("*, courses(*)")
    .eq("user_id", user.id);

  const courseIds = (enrollments ?? []).map((e) => e.course_id);
  const courseCounts: Record<string, number> = {};

  if (courseIds.length > 0) {
    const { data: lessons } = await supabase
      .from("lessons")
      .select("id, course_id")
      .in("course_id", courseIds);
    for (const lesson of lessons ?? []) {
      courseCounts[lesson.course_id] = (courseCounts[lesson.course_id] ?? 0) + 1;
    }
  }

  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("lesson_id, lessons(course_id)")
    .eq("user_id", user.id);

  const perCourse: Record<string, number> = {};
  for (const row of progressRows ?? []) {
    const l = row.lessons as unknown as { course_id: string } | null;
    if (!l) continue;
    perCourse[l.course_id] = (perCourse[l.course_id] ?? 0) + 1;
  }

  const resumeIds: Record<string, string> = {};
  if (courseIds.length > 0) {
    const { data: states } = await supabase
      .from("user_course_state")
      .select("course_id, last_lesson_id")
      .eq("user_id", user.id)
      .in("course_id", courseIds);
    for (const s of states ?? []) {
      if (s.last_lesson_id) resumeIds[s.course_id] = s.last_lesson_id;
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">My Courses</h1>
      <p className="mt-1 text-sm text-zinc-500">
        The courses you are enrolled in
      </p>

      {enrollments && enrollments.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {(enrollments ?? [])
            .filter((e) => e.courses)
            .map((enrollment) => {
              const course = enrollment.courses as unknown as {
                id: string;
                title: string;
                slug: string;
                description: string | null;
                cover_image: string | null;
              };
            const done = perCourse[course.id] ?? 0;
            const total = courseCounts[course.id] ?? 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            const resumeLessonId = resumeIds[course.id] ?? null;
            const courseHref = `/dashboard/courses/${course.id}`;
            const continueHref =
              resumeLessonId && pct > 0 && pct < 100
                ? `/dashboard/courses/${course.id}/lessons/${resumeLessonId}`
                : courseHref;

            return (
              <div
                key={enrollment.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative h-36 overflow-hidden bg-gradient-to-br from-brand-500 to-purple-600">
                  {course.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.cover_image}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                      {course.title.charAt(0)}
                    </div>
                  )}
                  {pct === 100 && (
                    <span className="absolute right-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                      <i className="fa-solid fa-check mr-1" />Completed
                    </span>
                  )}
                  <span className="absolute bottom-2 right-3 rounded-full bg-black/50 px-2.5 py-1 text-xs font-semibold text-white">
                    {pct}% complete
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-zinc-900">{course.title}</h3>
                  {course.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                      {course.description}
                    </p>
                  )}
                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-brand-600 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-medium text-zinc-500">
                      {done}/{total} lessons completed
                    </p>
                  </div>
                  <Link
                    href={continueHref}
                    className="mt-4 block rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    {pct === 0
                      ? "Start Course"
                      : pct === 100
                        ? "Review Course"
                        : "Continue Learning"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
          <p className="text-zinc-600">You haven't enrolled in any courses yet.</p>
          <Link
            href="/courses"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Browse Courses
          </Link>
        </div>
      )}
    </div>
  );
}