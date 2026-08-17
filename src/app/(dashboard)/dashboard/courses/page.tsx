import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "à¦†à¦®à¦¾à¦° à¦•à§‹à¦°à§à¦¸" };

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
    const cid = (row.lessons as unknown as { course_id: string }).course_id;
    perCourse[cid] = (perCourse[cid] ?? 0) + 1;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">à¦†à¦®à¦¾à¦° à¦•à§‹à¦°à§à¦¸</h1>
      <p className="mt-1 text-sm text-zinc-500">
        à¦†à¦ªà¦¨à¦¿ à¦¯à§‡à¦¸à¦¬ à¦•à§‹à¦°à§à¦¸à§‡ à¦à¦¨à¦°à§‹à¦² à¦•à¦°à§‡à¦›à§‡à¦¨
      </p>

      {enrollments && enrollments.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {enrollments.map((enrollment) => {
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

            return (
              <div
                key={enrollment.id}
                className="overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-md"
              >
                <div className="relative flex h-36 items-center justify-center bg-gradient-to-br from-brand-500 to-purple-600 text-4xl font-bold text-white">
                  {course.title.charAt(0)}
                  {pct === 100 && (
                    <span className="absolute right-3 top-3 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                      <i className="fa-solid fa-check mr-1" />à¦¸à¦®à§à¦ªà¦¨à§à¦¨
                    </span>
                  )}
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
                      {pct}% à¦¸à¦®à§à¦ªà¦¨à§à¦¨ ({done}/{total} à¦²à§‡à¦¸à¦¨)
                    </p>
                  </div>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="mt-4 block rounded-lg bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-brand-700"
                  >
                    {pct === 0 ? "à¦¶à§à¦°à§ à¦•à¦°à§à¦¨" : pct === 100 ? "à¦°à¦¿à¦­à¦¿à¦‰ à¦•à¦°à§à¦¨" : "à¦šà¦¾à¦²à¦¿à¦¯à¦¼à§‡ à¦¯à¦¾à¦¨"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
          <p className="text-zinc-600">à¦à¦–à¦¨à§‹ à¦•à§‹à¦¨à§‹ à¦•à§‹à¦°à§à¦¸à§‡ à¦à¦¨à¦°à§‹à¦² à¦•à¦°à¦¾ à¦¹à¦¯à¦¼à¦¨à¦¿à¥¤</p>
          <Link
            href="/courses"
            className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            à¦•à§‹à¦°à§à¦¸ à¦¬à§à¦°à¦¾à¦‰à¦œ à¦•à¦°à§à¦¨
          </Link>
        </div>
      )}
    </div>
  );
}