import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEnrolledCourses } from "@/lib/student";

export const metadata = { title: "Search" };

export default async function DashboardSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const courses = await getEnrolledCourses(user.id);
  const enrolledIds = courses.map((c) => c.id);

  let matchedCourses: typeof courses = [];
  let lessons: {
    id: string;
    title: string;
    course_id: string;
    course_title: string;
  }[] = [];
  let products: {
    id: string;
    name: string;
    slug: string;
    cover_image: string | null;
  }[] = [];

  if (query && query.length >= 2) {
    const pattern = `%${query}%`;

    matchedCourses = courses.filter(
      (c) =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        (c.subtitle ?? "").toLowerCase().includes(query.toLowerCase()),
    );

    if (enrolledIds.length > 0) {
      const { data: rows } = await supabase
        .from("lessons")
        .select("id, title, course_id")
        .in("course_id", enrolledIds)
        .ilike("title", pattern)
        .limit(20);
      const courseTitles = new Map(courses.map((c) => [c.id, c.title]));
      lessons = (rows ?? []).map((l) => ({
        id: l.id,
        title: l.title,
        course_id: l.course_id,
        course_title: courseTitles.get(l.course_id) ?? "",
      }));
    }

    const { data: purchases } = await supabase
      .from("product_purchases")
      .select("id, products(id, name, slug, cover_image)")
      .eq("user_id", user.id)
      .ilike("products.name", pattern)
      .limit(20);

    products = (purchases ?? [])
      .map((p) => p.products as unknown as (typeof products)[number] | null)
      .filter((p): p is (typeof products)[number] => Boolean(p));
  }

  const totalResults = matchedCourses.length + lessons.length + products.length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">Search</h1>
      <p className="mt-1 text-sm text-zinc-500">
        আপনার course, lesson বা resource খুঁজুন
      </p>

      <form action="/dashboard/search" className="mt-5">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="কোর্স, lesson বা resource খুঁজুন..."
            className="h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-sm text-zinc-800 placeholder:text-zinc-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </form>

      {!query ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-2xl text-brand-600">
            <i className="fa-solid fa-magnifying-glass" />
          </span>
          <p className="mt-4 text-sm text-zinc-500">
            উপরে কী খুঁজতে চান তা লিখুন — যেমন Freelancing বা একটি lesson-এর নাম।
          </p>
        </div>
      ) : totalResults === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-2xl text-zinc-400">
            <i className="fa-solid fa-file-magnifying-glass" />
          </span>
          <p className="mt-4 text-sm text-zinc-500">
            {query} — এর সাথে মিল পাওয়া যায়নি। অন্য keyword দিয়ে চেষ্টা করুন।
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {matchedCourses.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-zinc-900">
                Courses <span className="text-zinc-400">({matchedCourses.length})</span>
              </h2>
              <div className="mt-3 space-y-3">
                {matchedCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/dashboard/courses/${course.id}`}
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 text-lg font-bold text-white">
                      {course.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={course.cover_image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        course.title.charAt(0)
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-zinc-900">{course.title}</p>
                      <p className="text-xs text-zinc-500">
                        {course.percent}% complete · {course.doneLessons}/{course.totalLessons} lessons
                      </p>
                    </div>
                    <i className="fa-solid fa-chevron-right text-zinc-300" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {lessons.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-zinc-900">
                Lessons <span className="text-zinc-400">({lessons.length})</span>
              </h2>
              <div className="mt-3 space-y-3">
                {lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/dashboard/learn/${lesson.course_id}/${lesson.id}`}
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-green-50 text-lg text-green-600">
                      <i className="fa-solid fa-circle-play" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-zinc-900">{lesson.title}</p>
                      <p className="text-xs text-zinc-500">{lesson.course_title}</p>
                    </div>
                    <i className="fa-solid fa-chevron-right text-zinc-300" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {products.length > 0 && (
            <section>
              <h2 className="text-base font-bold text-zinc-900">
                Digital Products <span className="text-zinc-400">({products.length})</span>
              </h2>
              <div className="mt-3 space-y-3">
                {products.map((product) => (
                  <Link
                    key={product.id}
                    href="/dashboard/my-products"
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-colors hover:bg-zinc-50"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-lg text-white">
                      {product.cover_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.cover_image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <i className="fa-solid fa-file-lines" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-zinc-900">{product.name}</p>
                      <p className="text-xs text-zinc-500">Purchased product</p>
                    </div>
                    <i className="fa-solid fa-chevron-right text-zinc-300" />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}