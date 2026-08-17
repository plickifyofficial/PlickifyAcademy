import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "ড্যাশবোর্ড" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ payment?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { payment } = await searchParams;

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

  return (
    <div>
      {payment === "success" && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
          🎉 পেমেন্ট সফল হয়েছে! কোর্সটি আপনার ড্যাশবোর্ডে যোগ হয়েছে।
        </div>
      )}

      <h1 className="text-2xl font-bold text-zinc-900">
        আমার কোর্স ({enrollments?.length ?? 0})
      </h1>

      {enrollments && enrollments.length > 0 ? (
        <div className="mt-6 space-y-4">
          {enrollments.map((enrollment) => {
            const course = enrollment.courses as unknown as {
              id: string;
              title: string;
              slug: string;
            };

            const courseProgress =
              progressRows?.filter(
                (row) =>
                  (row.lessons as unknown as { course_id: string })
                    .course_id === course.id,
              ) ?? [];

            const total = courseCounts[course.id] ?? 0;
            const done = courseProgress.length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div
                key={enrollment.id}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:flex-row sm:items-center"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white">
                  {course.title.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-zinc-900">
                    {course.title}
                  </h2>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-2 max-w-xs flex-1 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-zinc-500">
                      {pct}% সম্পন্ন ({done}/{total})
                    </span>
                  </div>
                </div>
                <Link
                  href={`/courses/${course.slug}`}
                  className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  চালিয়ে যান
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
          <p className="text-zinc-600">এখনো কোনো কোর্সে এনরোল করা হয়নি।</p>
          <Link
            href="/courses"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            কোর্স ব্রাউজ করুন
          </Link>
        </div>
      )}
    </div>
  );
}
