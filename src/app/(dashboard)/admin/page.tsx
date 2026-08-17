import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseManager } from "@/components/admin/course-manager";

export const metadata = { title: "অ্যাডমিন প্যানেল" };

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

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
      <h1 className="text-2xl font-bold text-zinc-900">অ্যাডমিন প্যানেল</h1>
      <p className="mt-1 text-sm text-zinc-500">
        কোর্স ও লেসন ম্যানেজ করুন।
      </p>
      <div className="mt-6">
        <CourseManager
          courses={courses ?? []}
          lessonsByCourse={lessonsByCourse}
          adminUserId={user.id}
        />
      </div>
    </div>
  );
}
