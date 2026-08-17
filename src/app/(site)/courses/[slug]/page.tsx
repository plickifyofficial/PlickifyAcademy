import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { CheckoutButton } from "@/components/checkout/checkout-button";

export const metadata = { title: "কোর্স" };

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!course) {
    notFound();
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .order("order", { ascending: true });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isEnrolled = false;
  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", course.id)
      .maybeSingle();
    isEnrolled = !!enrollment;
  }

  const isFree = course.price === 0;
  const canAccess = isEnrolled || isFree;

  return (
    <main className="flex-1">
      <section className="bg-gradient-to-br from-indigo-600 to-purple-700 py-14 text-white">
        <div className="mx-auto max-w-6xl px-4">
          <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-medium capitalize">
            {course.level}
          </span>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold sm:text-4xl">
            {course.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-indigo-100">
            {course.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <span className="text-3xl font-bold">
              {formatPrice(course.price)}
            </span>
            <span className="text-sm text-indigo-200">
              {lessons?.length ?? 0}টি লেসন
            </span>
            {canAccess ? (
              <Link
                href={`/courses/${course.slug}/lessons/${
                  lessons?.[0]?.id ?? ""
                }`}
                className="rounded-lg bg-white px-6 py-3 font-semibold text-indigo-700 transition-colors hover:bg-indigo-50"
              >
                শেখা শুরু করুন →
              </Link>
            ) : (
              <CheckoutButton
                courseId={course.id}
                price={course.price}
              />
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-2xl font-bold text-zinc-900">
          কোর্স কারিকুলাম
        </h2>
        <div className="mt-6 space-y-3">
          {lessons && lessons.length > 0 ? (
            lessons.map((lesson, idx) => {
              const locked = !canAccess && !lesson.is_free;
              return (
                <div
                  key={lesson.id}
                  className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                    {idx + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-zinc-900">{lesson.title}</p>
                    {lesson.duration_minutes > 0 && (
                      <p className="text-sm text-zinc-500">
                        {lesson.duration_minutes} মিনিট
                      </p>
                    )}
                  </div>
                  {lesson.is_free && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      ফ্রি প্রিভিউ
                    </span>
                  )}
                  {locked ? (
                    <span className="text-zinc-400">🔒</span>
                  ) : (
                    <Link
                      href={`/courses/${course.slug}/lessons/${lesson.id}`}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                    >
                      দেখুন
                    </Link>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-zinc-500">এখনো কোনো লেসন যোগ করা হয়নি।</p>
          )}
        </div>
      </section>
    </main>
  );
}
