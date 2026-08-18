import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { CourseCard } from "@/components/courses/course-card";
import type { OurCoursesContent } from "@/lib/content-schema";

export async function OurCourses({ content }: { content: OurCoursesContent }) {
  const supabase = createAdminClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(content.limit || 6);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("course_id, rating");

  const ratings: Record<string, { avg: number; count: number }> = {};
  for (const r of reviews ?? []) {
    if (!ratings[r.course_id])
      ratings[r.course_id] = { avg: 0, count: 0 };
    ratings[r.course_id].count += 1;
    ratings[r.course_id].avg += r.rating;
  }
  for (const key of Object.keys(ratings)) {
    ratings[key].avg = ratings[key].avg / ratings[key].count;
  }

  return (
    <section className="bg-zinc-50/70 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="text-center" data-aos="fade-up">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
            {content.eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-extrabold text-zinc-900 sm:text-4xl">
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="mx-auto mt-3 max-w-2xl text-zinc-600">
              {content.subtitle}
            </p>
          )}
        </div>

        {(courses ?? []).length > 0 ? (
          <div
            className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            {(courses ?? []).map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                rating={ratings[course.id]?.avg}
                reviewCount={ratings[course.id]?.count}
              />
            ))}
          </div>
        ) : (
          <p className="mt-12 rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-500">
            এখনো কোনো কোর্স পাবলিশ করা হয়নি।
          </p>
        )}

        <div className="mt-10 text-center" data-aos="fade-up">
          <Link
            href={content.viewAllLink || "/courses"}
            className="inline-flex items-center gap-2 rounded-full border border-brand-300 bg-white px-7 py-3 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
          >
            {content.viewAllText}
            <i className="fa-solid fa-arrow-right text-xs" />
          </Link>
        </div>
      </div>
    </section>
  );
}