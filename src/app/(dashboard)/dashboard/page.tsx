import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "à¦¡à§à¦¯à¦¾à¦¶à¦¬à§‹à¦°à§à¦¡" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name || user.user_metadata?.full_name || "Student";
  const firstName = name.split(" ")[0];

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

  let totalDone = 0;
  let totalAvailable = 0;
  const perCourse: Record<string, { done: number; total: number }> = {};

  for (const row of progressRows ?? []) {
    totalDone++;
    const cid = (row.lessons as unknown as { course_id: string }).course_id;
    perCourse[cid] ??= { done: 0, total: 0 };
    perCourse[cid].done++;
  }
  for (const cid of courseIds) {
    perCourse[cid] ??= { done: 0, total: 0 };
    perCourse[cid].total = courseCounts[cid] ?? 0;
    totalAvailable += courseCounts[cid] ?? 0;
  }

  const totalPct =
    totalAvailable > 0 ? Math.round((totalDone / totalAvailable) * 100) : 0;

  const completedCourses = Object.values(perCourse).filter(
    (c) => c.total > 0 && c.done >= c.total,
  ).length;
  const inProgress = enrollments?.length ?? 0;

  const stats = [
    { label: "à¦à¦¨à¦°à§‹à¦²à§à¦¡ à¦•à§‹à¦°à§à¦¸", value: enrollments?.length ?? 0, icon: "fa-solid fa-graduation-cap", color: "bg-brand-50 text-brand-600" },
    { label: "à¦šà¦²à¦®à¦¾à¦¨ à¦•à§‹à¦°à§à¦¸", value: inProgress - completedCourses, icon: "fa-solid fa-book-open", color: "bg-amber-50 text-amber-600" },
    { label: "à¦¸à¦®à§à¦ªà¦¨à§à¦¨ à¦•à§‹à¦°à§à¦¸", value: completedCourses, icon: "fa-solid fa-circle-check", color: "bg-green-50 text-green-600" },
    { label: "à¦¸à¦¾à¦®à¦—à§à¦°à¦¿à¦• à¦…à¦—à§à¦°à¦—à¦¤à¦¿", value: `${totalPct}%`, icon: "fa-solid fa-chart-line", color: "bg-purple-50 text-purple-600" },
  ];

  return (
    <div>
      <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-purple-700 p-6 text-white sm:p-8">
        <h1 className="text-2xl font-bold">
          à¦¸à§à¦¬à¦¾à¦—à¦¤à¦®, {firstName}!
        </h1>
        <p className="mt-1 text-brand-100">
          à¦†à¦œà¦“ à¦¶à§‡à¦–à¦¾ à¦šà¦¾à¦²à¦¿à¦¯à¦¼à§‡ à¦¯à¦¾à¦¨à¥¤ à¦†à¦ªà¦¨à¦¾à¦° à¦…à¦—à§à¦°à¦—à¦¤à¦¿ à¦¦à§‡à¦–à§à¦¨ à¦¨à¦¿à¦šà§‡à¥¤
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-zinc-200 bg-white p-5"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${s.color}`}>
              <i className={s.icon} />
            </div>
            <p className="mt-3 text-2xl font-bold text-zinc-900">{s.value}</p>
            <p className="text-sm text-zinc-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">à¦†à¦®à¦¾à¦° à¦•à§‹à¦°à§à¦¸</h2>
          <Link
            href="/dashboard/courses"
            className="text-sm font-medium text-brand-600 hover:underline"
          >
            à¦¸à¦¬ à¦¦à§‡à¦–à§à¦¨ â†’
          </Link>
        </div>

        {enrollments && enrollments.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {enrollments.slice(0, 3).map((enrollment) => {
              const course = enrollment.courses as unknown as {
                id: string;
                title: string;
                slug: string;
              };
              const pc = perCourse[course.id] ?? { done: 0, total: 0 };
              const pct = pc.total > 0 ? Math.round((pc.done / pc.total) * 100) : 0;

              return (
                <Link
                  key={enrollment.id}
                  href={`/courses/${course.slug}`}
                  className="rounded-2xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-xl font-bold text-white">
                    {course.title.charAt(0)}
                  </div>
                  <h3 className="mt-3 font-semibold text-zinc-900">
                    {course.title}
                  </h3>
                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-brand-600 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-medium text-zinc-500">
                      {pct}% à¦¸à¦®à§à¦ªà¦¨à§à¦¨ ({pc.done}/{pc.total} à¦²à§‡à¦¸à¦¨)
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
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
    </div>
  );
}