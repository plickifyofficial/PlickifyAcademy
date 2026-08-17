import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminCourseTable } from "@/components/admin/course-table";

export const metadata = { title: "কোর্সসমূহ" };

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ add?: string }>;
}) {
  const { add } = await searchParams;
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="wp-page-title">কোর্সসমূহ</h1>
          <p className="wp-subtitle">কোর্স ও লেসন ম্যানেজ করুন</p>
        </div>
        <Link
          href="/admin/courses?add=1"
          className="wp-btn wp-btn-primary mb-5"
        >
          <i className="fa-solid fa-plus" /> নতুন কোর্স
        </Link>
      </div>
      <AdminCourseTable
        courses={courses ?? []}
        lessonsByCourse={lessonsByCourse}
        defaultCreating={add === "1"}
      />
    </div>
  );
}