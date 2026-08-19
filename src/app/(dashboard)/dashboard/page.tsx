import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getContinueLearning,
  getEnrolledCourses,
  getRecentActivity,
  getRecommendedCourses,
  getStudentStats,
  getUpcomingLiveClasses,
  formatDuration,
} from "@/lib/student";
import { formatPrice } from "@/lib/format";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const name = profile?.full_name || user.user_metadata?.full_name || "";
  const firstName = name.split(" ")[0];

  const courses = await getEnrolledCourses(user.id);
  const stats = await getStudentStats(user.id, courses);
  const continueLearning = await getContinueLearning(courses);
  const liveClasses = await getUpcomingLiveClasses(
    user.id,
    courses.map((c) => c.id),
  );
  const activity = await getRecentActivity(
    user.id,
    courses.map((c) => c.id),
  );
  const recommended = await getRecommendedCourses(
    user.id,
    courses.map((c) => c.id),
  );

  const { data: purchases } = await supabase
    .from("product_purchases")
    .select(
      "id, created_at, products(id, name, slug, cover_image, gradient, price)",
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(3);

  const recentProducts = (purchases ?? [])
    .map((p) => p.products as unknown as {
      id: string;
      name: string;
      slug: string;
      cover_image: string | null;
      gradient: string | null;
      price: number;
    } | null)
    .filter(Boolean);

  const isNewStudent = courses.length === 0;
  const overallDone = courses.reduce((s, c) => s + c.doneLessons, 0);
  const overallTotal = courses.reduce((s, c) => s + c.totalLessons, 0);
  const overallPct =
    overallTotal > 0 ? Math.round((overallDone / overallTotal) * 100) : 0;

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-brand-700 via-brand-800 to-brand-900 p-6 text-white sm:p-8">
        <h1 className="text-2xl font-extrabold sm:text-3xl">
          আসসালামু আলাইকুম, {firstName || "Student"}! 👋
        </h1>
        <p className="mt-1.5 text-sm text-brand-100 sm:text-base">
          আজ কী শিখবেন? আপনার learning journey চালিয়ে যান।
        </p>
      </section>

      {isNewStudent ? (
        <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-3xl text-brand-600">
            <i className="fa-solid fa-graduation-cap" />
          </span>
          <h2 className="mt-4 text-xl font-bold text-zinc-900">
            Welcome to Plickify Academy!
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            আপনি এখনো কোনো course-এ enrolled নন। আপনার প্রথম course বেছে নিন এবং
            learning journey শুরু করুন।
          </p>
          <Link
            href="/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-7 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Explore Courses <i className="fa-solid fa-arrow-right" />
          </Link>
        </section>
      ) : null}

      {continueLearning && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900">Continue Learning</h2>
          </div>
          <div className="flex flex-col gap-5 overflow-hidden rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-6">
            <Link
              href={`/dashboard/learn/${continueLearning.course.id}/${continueLearning.lessonId ?? ""}`}
              className="group relative flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 sm:w-72"
            >
              {continueLearning.course.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={continueLearning.course.cover_image}
                  alt={continueLearning.course.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <i className="fa-solid fa-play text-4xl text-white/80" />
              )}
            </Link>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
                {continueLearning.course.title}
              </p>
              {continueLearning.sectionTitle && (
                <p className="mt-2 text-sm text-zinc-500">
                  {continueLearning.moduleIndex !== null
                    ? `Module ${String(continueLearning.moduleIndex + 1).padStart(2, "0")}`
                    : "Module"}{" "}
                  — {continueLearning.sectionTitle}
                </p>
              )}
              <h3 className="mt-1 truncate text-xl font-bold text-zinc-900">
                {continueLearning.lessonTitle ?? "Start your course"}
              </h3>

              <div className="mt-4 max-w-md">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Course Progress</span>
                  <span className="font-semibold text-zinc-800">
                    {continueLearning.course.percent}%
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all"
                    style={{ width: `${continueLearning.course.percent}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-zinc-500">
                  {continueLearning.course.doneLessons}/
                  {continueLearning.course.totalLessons} lessons
                </p>
              </div>

              <Link
                href={`/dashboard/learn/${continueLearning.course.id}/${continueLearning.lessonId ?? ""}`}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <i className="fa-solid fa-play" />
                Continue Learning →
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Enrolled",
            value: `${stats.enrolled} ${stats.enrolled === 1 ? "Course" : "Courses"}`,
            icon: "fa-solid fa-graduation-cap",
          },
          {
            label: "Completed",
            value: `${stats.completed} ${stats.completed === 1 ? "Course" : "Courses"}`,
            icon: "fa-solid fa-circle-check",
          },
          {
            label: "Learning Hours",
            value: stats.learningHours,
            icon: "fa-solid fa-clock",
          },
          {
            label: "Certificates",
            value: String(stats.certificates),
            icon: "fa-solid fa-award",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-lg text-brand-700">
              <i className={s.icon} />
            </div>
            <p className="mt-3 text-xl font-bold text-zinc-900">{s.value}</p>
            <p className="text-sm text-zinc-500">{s.label}</p>
          </div>
        ))}
      </section>

      {courses.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900">My Courses</h2>
            <Link
              href="/dashboard/courses"
              className="text-sm font-medium text-brand-600 hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {courses.slice(0, 3).map((course) => {
              const state =
                course.completed
                  ? "completed"
                  : course.notStarted
                    ? "not-started"
                    : "in-progress";
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
                    {state === "completed" && (
                      <span className="absolute right-3 top-3 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-bold text-white">
                        ✓ Completed
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <Link href={`/dashboard/courses/${course.id}`}>
                      <h3 className="font-bold leading-snug text-zinc-900 hover:text-brand-700">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="mt-1 text-xs text-zinc-500">
                      by {course.instructor}
                    </p>
                    <div className="mt-4">
                      <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
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
                        ? "Review Course"
                        : state === "not-started"
                          ? "Start Course"
                          : "Continue Learning"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {liveClasses.length > 0 && (
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-zinc-900">Upcoming Live Classes</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {liveClasses.map((lc) => (
              <div
                key={lc.id}
                className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-lg text-red-500">
                    <i className="fa-solid fa-video" />
                  </span>
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-600">
                    Upcoming
                  </span>
                </div>
                <h3 className="mt-3 font-bold text-zinc-900">{lc.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">
                  {lc.course?.title}
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  by {lc.instructor} · {lc.duration_minutes} min
                </p>
                {lc.scheduled_at && (
                  <p className="mt-2 text-sm font-semibold text-zinc-700">
                    <i className="fa-solid fa-calendar-days mr-1.5 text-brand-600" />
                    {new Date(lc.scheduled_at).toLocaleDateString("en-US", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                    ,{" "}
                    {new Date(lc.scheduled_at).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                <div className="mt-4 flex-1" />
                <Link
                  href={`/dashboard/courses/${lc.course?.id ?? ""}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  <i className="fa-solid fa-right-to-bracket" /> Join Class
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {activity.length > 0 && (
        <section>
          <div className="mb-3">
            <h2 className="text-lg font-bold text-zinc-900">Recent Activity</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            {activity.map((item, i) => (
              <Link
                key={item.id}
                href={item.link}
                className={`flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-zinc-50 ${
                  i > 0 ? "border-t border-zinc-100" : ""
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm ${
                    item.type === "lesson"
                      ? "bg-green-50 text-green-600"
                      : item.type === "product"
                        ? "bg-brand-50 text-brand-600"
                        : item.type === "certificate"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  <i
                    className={
                      item.type === "lesson"
                        ? "fa-solid fa-circle-check"
                        : item.type === "product"
                          ? "fa-solid fa-download"
                          : item.type === "certificate"
                            ? "fa-solid fa-award"
                            : "fa-solid fa-receipt"
                    }
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-zinc-500">{item.detail}</p>
                </div>
                <span className="shrink-0 text-xs text-zinc-400">
                  {new Date(item.at).toLocaleDateString("en-US", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recommended.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900">Recommended for You</h2>
            <Link href="/courses" className="text-sm font-medium text-brand-600 hover:underline">
              Browse all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {recommended.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="flex aspect-[16/8] items-center justify-center overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800">
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
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-bold leading-snug text-zinc-900">
                    {course.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                    {course.subtitle}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="font-bold text-zinc-900">
                      {formatPrice(course.price)}
                    </span>
                    {course.original_price > course.price && (
                      <span className="text-xs text-zinc-400 line-through">
                        {formatPrice(course.original_price)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentProducts.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900">Your Recent Products</h2>
            <Link href="/dashboard/my-products" className="text-sm font-medium text-brand-600 hover:underline">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {recentProducts.map((product) => (
              <div
                key={product!.id}
                className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br ${
                    product!.gradient || "from-blue-600 to-indigo-600"
                  }`}
                >
                  {product!.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product!.cover_image}
                      alt={product!.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <i className="fa-solid fa-file-lines text-xl text-white/85" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {product!.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatPrice(product!.price)}
                  </p>
                </div>
                <Link
                  href="/dashboard/my-products"
                  className="rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100"
                >
                  Download
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {courses.length > 0 && (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Learning Progress</h2>
              <p className="mt-0.5 text-sm text-zinc-500">
                {overallDone} of {overallTotal} lessons completed across{" "}
                {courses.length} courses
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-brand-700">{overallPct}%</p>
              <div className="mt-1 h-2 w-40 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {courses.slice(0, 5).map((course) => (
              <div key={course.id} className="flex items-center gap-3">
                <span className="w-44 truncate text-xs font-medium text-zinc-600">
                  {course.title}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${course.percent}%` }}
                  />
                </div>
                <span className="w-12 text-right text-xs font-semibold text-zinc-700">
                  {course.percent}%
                </span>
                <span className="hidden w-16 text-right text-[11px] text-zinc-400 sm:block">
                  {formatDuration(course.totalMinutes)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}