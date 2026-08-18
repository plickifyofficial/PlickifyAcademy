import { createAdminClient } from "@/lib/supabase/admin";
import { CourseCard } from "@/components/courses/course-card";
import { PageHero } from "@/components/home/page-hero";

export const metadata = { title: "কোর্সসমূহ | Plickify Academy" };

export const revalidate = 60;

export default async function CoursesPage() {
  const supabase = createAdminClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

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
    <main className="flex-1">
      <PageHero
        eyebrow="All Courses"
        title="সব কোর্স"
        subtitle="নিজের পছন্দের কোর্স বেছে নিন এবং শেখা শুরু করুন — সব কোর্সে লাইভ সাপোর্ট ও সার্টিফিকেট।"
      />

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        {courses && courses.length > 0 ? (
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            data-aos="fade-up"
          >
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                rating={ratings[course.id]?.avg}
                reviewCount={ratings[course.id]?.count}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-12 text-center">
            <p className="text-zinc-600">এখনো কোনো কোর্স পাবলিশ করা হয়নি।</p>
          </div>
        )}
      </section>
    </main>
  );
}
