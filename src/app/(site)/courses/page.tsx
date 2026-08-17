import { createAdminClient } from "@/lib/supabase/admin";
import { CourseCard } from "@/components/courses/course-card";

export const metadata = { title: "কোর্সসমূহ" };

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
    <main className="mx-auto max-w-6xl flex-1 px-4 py-12">
      <h1 className="text-3xl font-bold text-zinc-900" data-aos="fade-up">সব কোর্স</h1>
      <p className="mt-2 text-zinc-600" data-aos="fade-up" data-aos-delay="50">
        নিজের পছন্দের কোর্স বেছে নিন এবং শেখা শুরু করুন।
      </p>

      {courses && courses.length > 0 ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-aos="fade-up" data-aos-delay="100">
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
        <p className="mt-8 rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center text-zinc-500">
          এখনো কোনো কোর্স পাবলিশ করা হয়নি।
        </p>
      )}
    </main>
  );
}
