import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEnrolledCourses, type StudentCourse } from "@/lib/student";
import { cn } from "@/lib/utils";

export const metadata = { title: "My Courses" };

const TABS = [
  { key: "all", label: "All" },
  { key: "in-progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
  { key: "not-started", label: "Not Started" },
];

function courseState(course: StudentCourse): "completed" | "in-progress" | "not-started" {
  if (course.completed) return "completed";
  if (course.notStarted) return "not-started";
  return "in-progress";
}

function lastActivityText(course: StudentCourse): string {
  if (course.lastActivity) {
    return `Last activity ${new Date(course.lastActivity).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    })}`;
  }
  return `Enrolled ${new Date(course.enrolledAt).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })}`;
}

export default async function MyCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = TABS.some((t) => t.key === tab) ? (tab as string) : "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const courses = await getEnrolledCourses(user.id);

  const filtered = courses.filter((c) => {
    const state = courseState(c);
    if (activeTab === "completed") return state === "completed";
    if (activeTab === "in-progress") return state === "in-progress";
    if (activeTab === "not-started") return state === "not-started";
    return true;
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">My Courses</h1>
          <p className="mt-1 text-sm text-zinc-500">
            আপনার সব enrolled course-এর অগ্রগতি এক নজরে
          </p>
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <i className="fa-solid fa-magnifying-glass" /> Explore Courses
        </Link>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-zinc-100 p-1">
        {TABS.map((t) => {
          const count = courses.filter((c) => {
            const s = courseState(c);
            if (t.key === "completed") return s === "completed";
            if (t.key === "in-progress") return s === "in-progress";
            if (t.key === "not-started") return s === "not-started";
            return true;
          }).length;
          const isActive = activeTab === t.key;
          return (
            <Link
              key={t.key}
              href={`/dashboard/courses?tab=${t.key}`}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-zinc-600 hover:text-zinc-900",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-2 py-px text-xs font-bold",
                  isActive ? "bg-brand-50 text-brand-700" : "bg-zinc-200 text-zinc-500",
                )}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-3xl text-brand-600">
            <i className="fa-solid fa-graduation-cap" />
          </span>
          <h2 className="mt-4 text-lg font-bold text-zinc-900">
            {courses.length === 0
              ? "আপনি এখনও কোনো course-এ enrolled নন।"
              : "এই category-এ কোনো course নেই।"}
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-zinc-500">
            {courses.length === 0
              ? "একটি course বেছে নিয়ে আপনার learning journey শুরু করুন।"
              : "অন্য tab-এ গিয়ে দেখুন অথবা নতুন course explore করুন।"}
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Explore Courses <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => {
            const state = courseState(course);
            return (
              <div
                key={course.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Link
                  href={`/dashboard/courses/${course.id}`}
                  className="relative flex aspect-[16/8] items-center justify-center overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800"
                >
                  {course.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.cover_image}
                      alt={course.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <span className="text-4xl font-black text-white">
                      {course.title.charAt(0)}
                    </span>
                  )}
                  <span
                    className={cn(
                      "absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold text-white",
                      state === "completed"
                        ? "bg-green-500"
                        : state === "in-progress"
                          ? "bg-brand-600"
                          : "bg-zinc-700",
                    )}
                  >
                    {state === "completed"
                      ? "✓ Completed"
                      : state === "in-progress"
                        ? `${course.percent}% Complete`
                        : "Not Started"}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-5">
                  <Link href={`/dashboard/courses/${course.id}`}>
                    <h3 className="font-bold leading-snug text-zinc-900 hover:text-brand-700">
                      {course.title}
                    </h3>
                  </Link>
                  <p className="mt-1 text-xs text-zinc-500">by {course.instructor}</p>

                  <div className="mt-4">
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          state === "completed"
                            ? "bg-green-500"
                            : "bg-gradient-to-r from-brand-500 to-brand-700",
                        )}
                        style={{ width: `${course.percent}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                      <span>
                        {course.doneLessons}/{course.totalLessons} lessons
                      </span>
                      <span className="font-semibold text-zinc-700">
                        {course.percent}%
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-zinc-400">{lastActivityText(course)}</p>

                  <div className="mt-4 flex-1" />
                  <Link
                    href={
                      state === "completed"
                        ? `/dashboard/courses/${course.id}`
                        : `/dashboard/learn/${course.id}/${course.lastLessonId ?? ""}`
                    }
                    className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                  >
                    {state === "completed"
                      ? "View Course"
                      : state === "not-started"
                        ? "Start Course"
                        : "Continue Learning"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}