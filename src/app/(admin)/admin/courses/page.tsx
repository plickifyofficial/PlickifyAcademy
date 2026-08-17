import { createClient } from "@/lib/supabase/server";
import { AdminCourseTable } from "@/components/admin/course-table";

export const metadata = { title: "কোর্সসমূহ" };

export default async function AdminCoursesPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: lessons } = await supabase.from("lessons").select("*");

  const lessonsByCourse: Record<string, NonNullable<typeof lessons>[0][]> = {};
  for (const lesson of lessons ?? []) {
    if (lessonsByCourse[lesson.course_id]) {
      lessonsByCourse[lesson.course_id].push(lesson);
    } else {
      lessonsByCourse[lesson.course_id] = [lesson];
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-zinc-900">কোর্সসমূহ</h1>
      <p className="mt-1 text-sm text-zinc-500">
        কোর্স ও লেসন ম্যানেজ করুন
      </p>
      <div className="mt-6">
        <AdminCourseTable
          courses={courses ?? []}
          lessonsByCourse={lessonsByCourse}
        />
      </div>
    </div>
  );
}